<template>
  <div class="h-screen bg-[#fafafa] flex flex-col">
    <div class="h-14 px-6 bg-white border-b border-[#e5e5e5] flex items-center flex-shrink-0">
      <el-page-header @back="$router.push('/home')">
        <template #content>
          <span class="text-lg font-semibold text-[#1a1a1a]">我的内容包</span>
        </template>
      </el-page-header>
      <div class="flex items-center gap-4 text-sm text-[#999]">
        <router-link to="/schedule" class="hover:text-[#1a1a1a] transition-colors">排期管理</router-link>
        <router-link to="/content-list" class="hover:text-[#1a1a1a] transition-colors">创作历史</router-link>
      </div>
    </div>
    
    <div class="flex-1 flex overflow-hidden">
      <PackageListSidebar
        :package-list="packageList"
        :loading="loading"
        :selected-id="selectedPackageId"
        :edit-mode="editMode"
        :batch-mode="batchMode"
        :selected-packages="selectedPackages"
        :filter="filterForm"
        :pagination="pagination"
        @select="handleSelectPackage"
        @filter-change="handleFilterChange"
        @page-change="handlePageChange"
        @enter-batch-mode="enterBatchMode"
        @exit-batch-mode="exitBatchMode"
        @toggle-selection="togglePackageSelection"
        @select-all="handleSelectAll"
        @show-batch-dialog="showBatchScheduleDialog"
      />
      
      <PackageDetail
        :package-data="currentPackage"
        :detail-loading="detailLoading"
        :edit-mode="editMode"
        :edit-form="editForm"
        :edit-loading="editLoading"
        @edit="handleEdit"
        @cancel-edit="cancelEdit"
        @save-edit="handleSaveEdit"
        @remove-content="removeEditContent"
        @remove-image="removeEditImage"
        @add-content="openSelectMaterialDialog('content')"
        @add-image="openSelectMaterialDialog('image')"
        @command="handleCommand"
        @create-schedule="scheduleDialogVisible = true"
        @preview-image="handlePreviewImage"
      />
    </div>
    
    <ScheduleDialog
      v-model:visible="scheduleDialogVisible"
      :package-data="currentPackage"
      :loading="scheduleLoading"
      @confirm="handleSaveSchedule"
    />
    
    <BatchScheduleDialog
      v-model:visible="batchScheduleDialogVisible"
      :selected-packages="selectedPackages"
      :loading="batchScheduleLoading"
      @confirm="handleBatchCreateSchedule"
    />
    
    <SelectMaterialDialog
      v-model:visible="selectMaterialDialogVisible"
      :material-type="selectMaterialType"
      @confirm="handleSelectMaterial"
    />
    
    <ElImageViewer
      v-if="showImageViewer"
      :url-list="[previewImageUrl]"
      @close="showImageViewer = false"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ElImageViewer } from 'element-plus'

import PackageListSidebar from '@/components/package/PackageListSidebar.vue'
import PackageDetail from '@/components/package/PackageDetail.vue'
import ScheduleDialog from '@/components/package/ScheduleDialog.vue'
import BatchScheduleDialog from '@/components/package/BatchScheduleDialog.vue'
import SelectMaterialDialog from '@/components/package/SelectMaterialDialog.vue'

import { getPackageList, getPackageDetail, deletePackage, copyPackage, updatePackage } from '@/api/package'
import { createSchedule, batchCreateSchedule } from '@/api/schedule'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const detailLoading = ref(false)
const packageList = ref([])
const selectedPackageId = ref(null)
const currentPackage = ref(null)

const scheduleDialogVisible = ref(false)
const scheduleLoading = ref(false)

const batchMode = ref(false)
const selectedPackages = ref([])
const batchScheduleDialogVisible = ref(false)
const batchScheduleLoading = ref(false)

const editMode = ref(false)
const editForm = reactive({
  title: '',
  platform: '',
  contentItems: [],
  imageItems: []
})
const editLoading = ref(false)

const selectMaterialDialogVisible = ref(false)
const selectMaterialType = ref('content')

const showImageViewer = ref(false)
const previewImageUrl = ref('')

const filterForm = reactive({
  platform: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const contentItems = computed(() => {
  if (!currentPackage.value?.items) return []
  return currentPackage.value.items.filter(item => item.item_type === 'content')
})

const imageItems = computed(() => {
  if (!currentPackage.value?.items) return []
  return currentPackage.value.items.filter(item => item.item_type === 'image')
})

const loadPackageList = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.page,
      size: pagination.size
    }
    
    if (filterForm.platform) {
      params.platform = filterForm.platform
    }
    if (filterForm.status) {
      params.status = filterForm.status
    }
    
    const res = await getPackageList(params)
    if (res.code === 200) {
      packageList.value = res.data?.list || []
      pagination.total = res.data?.total || 0
      
      if (packageList.value.length > 0 && !selectedPackageId.value) {
        handleSelectPackage(packageList.value[0])
      }
    } else {
      ElMessage.error(res.msg || '查询失败')
    }
  } catch (error) {
    ElMessage.error('查询异常，请稍后重试')
    console.error('查询内容包列表失败：', error)
  } finally {
    loading.value = false
  }
}

const handleSelectPackage = async (item) => {
  selectedPackageId.value = item.id
  await loadPackageDetail(item.id)
}

const loadPackageDetail = async (packageId) => {
  try {
    detailLoading.value = true
    const res = await getPackageDetail(packageId)
    if (res.code === 200) {
      currentPackage.value = res.data
    } else {
      ElMessage.error(res.msg || '获取详情失败')
    }
  } catch (error) {
    ElMessage.error('获取详情失败')
    console.error('获取内容包详情失败：', error)
  } finally {
    detailLoading.value = false
  }
}

const handleFilterChange = (filter) => {
  filterForm.platform = filter.platform
  filterForm.status = filter.status
  pagination.page = 1
  loadPackageList()
}

const handlePageChange = (page) => {
  pagination.page = page.page
  pagination.size = page.size
  loadPackageList()
}

const enterBatchMode = () => {
  batchMode.value = true
  selectedPackages.value = []
}

const exitBatchMode = () => {
  batchMode.value = false
  selectedPackages.value = []
}

const togglePackageSelection = (item) => {
  const index = selectedPackages.value.findIndex(p => p.id === item.id)
  if (index > -1) {
    selectedPackages.value.splice(index, 1)
  } else {
    selectedPackages.value.push(item)
  }
}

const handleSelectAll = (val) => {
  if (val) {
    selectedPackages.value = [...packageList.value]
  } else {
    selectedPackages.value = []
  }
}

const showBatchScheduleDialog = () => {
  batchScheduleDialogVisible.value = true
}

const handleEdit = () => {
  editMode.value = true
  editForm.title = currentPackage.value.title
  editForm.platform = currentPackage.value.platform
  editForm.contentItems = contentItems.value.map(item => ({
    id: item.item_id,
    content: item.content,
    item_type: 'content'
  }))
  editForm.imageItems = imageItems.value.map(item => ({
    id: item.item_id,
    url: item.url,
    item_type: 'image'
  }))
}

const cancelEdit = () => {
  editMode.value = false
  editForm.title = ''
  editForm.platform = ''
  editForm.contentItems = []
  editForm.imageItems = []
}

const handleSaveEdit = async () => {
  if (!editForm.title.trim()) {
    ElMessage.warning('请输入标题')
    return
  }
  
  try {
    editLoading.value = true
    const items = [
      ...editForm.contentItems.map(item => ({
        item_type: 'content',
        item_id: item.id
      })),
      ...editForm.imageItems.map(item => ({
        item_type: 'image',
        item_id: item.id
      }))
    ]
    
    const res = await updatePackage(currentPackage.value.id, {
      title: editForm.title,
      platform: editForm.platform,
      items: items
    })
    
    if (res.code === 200) {
      ElMessage.success('保存成功')
      editMode.value = false
      await loadPackageDetail(currentPackage.value.id)
      loadPackageList()
    } else {
      ElMessage.error(res.msg || '保存失败')
    }
  } catch (error) {
    ElMessage.error('保存失败')
    console.error('保存内容包失败：', error)
  } finally {
    editLoading.value = false
  }
}

const removeEditContent = (index) => {
  editForm.contentItems.splice(index, 1)
}

const removeEditImage = (index) => {
  editForm.imageItems.splice(index, 1)
}

const openSelectMaterialDialog = (type) => {
  selectMaterialType.value = type
  selectMaterialDialogVisible.value = true
}

const handleSelectMaterial = (materials) => {
  if (selectMaterialType.value === 'content') {
    materials.forEach(material => {
      if (!editForm.contentItems.some(item => item.id === material.id)) {
        editForm.contentItems.push({
          id: material.id,
          content: material.content,
          item_type: 'content'
        })
      }
    })
  } else {
    materials.forEach(material => {
      if (!editForm.imageItems.some(item => item.id === material.id)) {
        editForm.imageItems.push({
          id: material.id,
          url: material.url,
          item_type: 'image'
        })
      }
    })
  }
}

const handleCommand = async (command) => {
  switch (command) {
    case 'copy':
      await handleCopy()
      break
    case 'schedule':
      scheduleDialogVisible.value = true
      break
    case 'delete':
      await handleDelete()
      break
  }
}

const handleCopy = async () => {
  try {
    const res = await copyPackage(currentPackage.value.id)
    if (res.code === 200) {
      ElMessage.success('复制成功')
      loadPackageList()
    } else {
      ElMessage.error(res.msg || '复制失败')
    }
  } catch (error) {
    ElMessage.error('复制失败')
    console.error('复制内容包失败：', error)
  }
}

const handleDelete = async () => {
  try {
    await ElMessageBox.confirm('确定要删除该内容包吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const res = await deletePackage(currentPackage.value.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      selectedPackageId.value = null
      currentPackage.value = null
      loadPackageList()
    } else {
      ElMessage.error(res.msg || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error('删除内容包失败：', error)
    }
  }
}

const handleSaveSchedule = async (form) => {
  if (!form.publish_time) {
    ElMessage.warning('请选择发布时间')
    return
  }
  
  try {
    scheduleLoading.value = true
    const res = await createSchedule({
      package_id: currentPackage.value.id,
      platform: currentPackage.value.platform,
      publish_time: form.publish_time,
      schedule_note: form.schedule_note
    })
    
    if (res.code === 200) {
      ElMessage.success('排期创建成功')
      scheduleDialogVisible.value = false
      router.push('/schedule')
    } else {
      ElMessage.error(res.msg || '排期创建失败')
    }
  } catch (error) {
    ElMessage.error('排期创建失败')
    console.error('创建排期失败：', error)
  } finally {
    scheduleLoading.value = false
  }
}

const handleBatchCreateSchedule = async (list) => {
  const hasEmptyTime = list.some(item => !item.publish_time)
  if (hasEmptyTime) {
    ElMessage.warning('请为所有内容包设置发布时间')
    return
  }
  
  try {
    batchScheduleLoading.value = true
    const res = await batchCreateSchedule(
      list.map(item => ({
        package_id: item.package_id,
        platform: item.platform,
        publish_time: item.publish_time,
        schedule_note: item.schedule_note
      }))
    )
    
    if (res.code === 200) {
      ElMessage.success('批量创建排期成功')
      batchScheduleDialogVisible.value = false
      exitBatchMode()
      router.push('/schedule')
    } else {
      ElMessage.error(res.msg || '批量创建排期失败')
    }
  } catch (error) {
    ElMessage.error('批量创建排期失败')
    console.error('批量创建排期失败：', error)
  } finally {
    batchScheduleLoading.value = false
  }
}

const handlePreviewImage = (url) => {
  previewImageUrl.value = url
  showImageViewer.value = true
}

onMounted(() => {
  loadPackageList()
  
  if (route.query.packageId) {
    const packageId = parseInt(route.query.packageId)
    if (!isNaN(packageId)) {
      selectedPackageId.value = packageId
      loadPackageDetail(packageId)
    }
  }
})
</script>
