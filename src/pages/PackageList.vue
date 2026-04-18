<template>
  <div class="h-screen bg-[#fafafa] flex flex-col">
    <div class="h-14 px-6 bg-white border-b border-[#e5e5e5] flex items-center flex-shrink-0">
      <el-page-header @back="$router.push('/home')">
        <template #content>
          <span class="text-lg font-semibold text-[#1a1a1a]">我的内容包</span>
        </template>
      </el-page-header>
    </div>
    
    <div class="flex-1 flex overflow-hidden">
      <div class="w-[360px] bg-white border-r border-[#e5e5e5] flex flex-col flex-shrink-0">
        <div class="rounded-xl p-4 flex items-center gap-3">
          <el-select
            v-model="filterForm.platform"
            placeholder="平台"
            clearable
            size="middle"
            class="w-24"
            @change="loadPackageList"
          >
            <el-option v-for="item in platformOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          
          <el-select
            v-model="filterForm.status"
            placeholder="状态"
            clearable
            size="middle"
            class="w-28"
            @change="loadPackageList"
          >
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          
          <div class="flex-1"></div>
          
          <el-button
            v-if="!batchMode && packageList.length > 0"
            size="middle"
            @click="enterBatchMode"
            type="primary"
            class="bg-[#1a1a1a] border-none hover:bg-[#333]"
          >
            批量排期
          </el-button>
        </div>
        
        <div v-if="batchMode" class="px-4 py-2 bg-[#f5f5f5] border-b border-[#e5e5e5] flex items-center justify-between">
          <div class="flex items-center gap-2">
            <el-checkbox
              v-model="selectAll"
              :indeterminate="isIndeterminate"
              @change="handleSelectAll"
            >
              全选
            </el-checkbox>
            <span class="text-sm text-[#666]">已选 {{ selectedPackages.length }} 项</span>
          </div>
          <div class="flex items-center gap-2">
            <el-button size="small" @click="exitBatchMode">取消</el-button>
            <el-button
              size="small"
              type="primary"
              class="bg-[#1a1a1a] border-none hover:bg-[#333]"
              :disabled="selectedPackages.length === 0"
              @click="showBatchScheduleDialog"
            >
              创建排期
            </el-button>
          </div>
        </div>
        
        <div class="flex-1 overflow-y-auto">
          <div v-if="loading" class="flex items-center justify-center py-20">
            <el-icon class="text-3xl text-[#999] animate-spin"><Loading /></el-icon>
          </div>
          
          <div v-else-if="packageList.length === 0" class="flex flex-col items-center justify-center py-20 text-[#999]">
            <el-icon class="text-4xl mb-3"><FolderOpened /></el-icon>
            <p class="text-sm">暂无内容包</p>
          </div>
          
          <div v-else class="p-3 space-y-2">
            <div
              v-for="item in packageList"
              :key="item.id"
              class="p-3 rounded-xl cursor-pointer transition-all duration-200 relative"
              :class="getPackageItemClass(item)"
              @click="handlePackageClick(item)"
            >
              <div v-if="batchMode" class="absolute top-3 left-3">
                <el-checkbox
                  :model-value="isPackageSelected(item.id)"
                  @click.stop
                  @change="togglePackageSelection(item)"
                />
              </div>
              
              <div :class="batchMode ? 'pl-6' : ''">
                <div class="flex items-start justify-between mb-2">
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-semibold text-[#1a1a1a] truncate">{{ item.title }}</div>
                  </div>
                  <el-tag
                    :type="getStatusType(item.status)"
                    size="small"
                    class="rounded-md ml-2 flex-shrink-0"
                  >
                    {{ getStatusText(item.status) }}
                  </el-tag>
                </div>
                
                <div class="flex items-center gap-2 mb-2">
                  <el-tag class="bg-[#f5f5f5] text-[#666] border-[#e5e5e5] rounded-md text-xs">{{ item.platform }}</el-tag>
                  <span class="text-xs text-[#999]">{{ item.content_count }} 文案 · {{ item.image_count }} 图片</span>
                </div>
                
                <div class="text-xs text-[#999]">{{ item.create_time }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="p-3 flex-shrink-0">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.page_size"
            :total="pagination.total"
            :page-sizes="[10, 20]"
            layout="prev, pager, next"
            small
            @size-change="loadPackageList"
            @current-change="loadPackageList"
          />
        </div>
      </div>
      
      <div class="flex-1 flex flex-col overflow-hidden">
        <div v-if="!currentPackage" class="flex-1 flex items-center justify-center text-[#999]">
          <div class="text-center">
            <el-icon class="text-5xl mb-4"><FolderOpened /></el-icon>
            <p>请选择一个内容包查看详情</p>
          </div>
        </div>
        
        <div v-else class="flex-1 overflow-y-auto">
          <div class="h-full flex items-center justify-center py-4 px-6">
            <div class="bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden w-full max-w-[1000px] h-[840px] flex flex-col">
              <div class="p-5 flex-shrink-0">
                <div class="flex items-start justify-between mb-3">
                  <div class="flex-1 min-w-0">
                    <div class="text-lg font-semibold text-[#1a1a1a] mb-2">{{ currentPackage.title }}</div>
                    <div class="flex items-center gap-2">
                      <el-tag class="bg-[#f5f5f5] text-[#666] border-[#e5e5e5] rounded-md">{{ currentPackage.platform }}</el-tag>
                      <el-tag :type="getStatusType(currentPackage.status)" size="small" class="rounded-md">
                        {{ getStatusText(currentPackage.status) }}
                      </el-tag>
                    </div>
                  </div>
                  <div class="flex items-center gap-2 ml-4">
                    <el-button size="small" @click="handleEdit">
                      编辑
                    </el-button>
                    <el-dropdown trigger="click" @command="handleCommand">
                      <el-button size="small">
                        更多<el-icon class="el-icon--right"><ArrowDown /></el-icon>
                      </el-button>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item command="copy">复制</el-dropdown-item>
                          <el-dropdown-item command="schedule">创建排期</el-dropdown-item>
                          <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </div>
                </div>
                <div class="text-xs text-[#999]">创建时间：{{ currentPackage.create_time }}</div>
              </div>
              
              <div class="flex-1 overflow-y-auto min-h-0">
                <div v-if="detailLoading" class="p-10 flex items-center justify-center">
                  <el-icon class="text-3xl text-[#999] animate-spin"><Loading /></el-icon>
                </div>
                
                <div v-else-if="currentPackage.items && currentPackage.items.length > 0" class="p-5">
                  <div
                    v-for="(pkgItem, index) in contentItems"
                    :key="`content-${index}`"
                    class="mb-4 last:mb-0"
                  >
                    <div class="text-[#333] text-[15px] leading-relaxed whitespace-pre-wrap">{{ pkgItem.content }}</div>
                  </div>
                  
                  <div v-if="imageItems.length > 0" class="flex flex-wrap gap-3 mt-4">
                    <div
                      v-for="(img, imgIndex) in imageItems"
                      :key="`image-${imgIndex}`"
                      class="relative cursor-pointer group"
                      @click="handlePreviewImage(img.url)"
                    >
                      <img
                        :src="img.url"
                        class="h-[200px] w-auto object-cover rounded-lg"
                        loading="lazy"
                      />
                      <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg"></div>
                    </div>
                  </div>
                </div>
                
                <div v-else class="p-10 text-center text-[#999]">
                  暂无内容
                </div>
              </div>
              
              <div class="px-5 py-4 flex-shrink-0 flex justify-end">
                <el-button
                  type="primary"
                  size="large"
                  class="bg-[#1a1a1a] border-none hover:bg-[#333]"
                  @click="scheduleDialogVisible = true"
                >
                  创建排期
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <el-dialog
      v-model="scheduleDialogVisible"
      title="排期发布"
      width="500px"
      destroy-on-close
    >
      <el-form :model="scheduleForm" label-width="100px">
        <el-form-item label="内容包">
          <div class="text-sm text-[#333]">{{ currentPackage?.title }}</div>
        </el-form-item>
        <el-form-item label="发布时间" required>
          <el-date-picker
            v-model="scheduleForm.publish_time"
            type="datetime"
            placeholder="选择日期时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="排期备注">
          <el-input
            v-model="scheduleForm.schedule_note"
            type="textarea"
            :rows="3"
            placeholder="请输入排期备注"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="scheduleDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          class="bg-[#1a1a1a] border-none hover:bg-[#333]"
          :loading="scheduleLoading"
          @click="handleSaveSchedule"
        >
          创建排期
        </el-button>
      </template>
    </el-dialog>
    
    <el-dialog
      v-model="batchScheduleDialogVisible"
      title="批量创建排期"
      width="700px"
      destroy-on-close
    >
      <div class="mb-4">
        <span class="text-sm text-[#666]">已选择 {{ selectedPackages.length }} 个内容包</span>
      </div>
      
      <div class="p-4 bg-[#f0f0f0] rounded-lg mb-4">
        <div class="text-sm font-medium text-[#333] mb-3">统一设置</div>
        <div class="grid grid-cols-3 gap-3 items-end">
          <el-form-item label="发布时间" class="mb-0">
            <el-date-picker
              v-model="batchCommonTime"
              type="datetime"
              placeholder="统一设置发布时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%"
              size="small"
            />
          </el-form-item>
          <el-form-item label="排期备注" class="mb-0">
            <el-input
              v-model="batchCommonNote"
              placeholder="统一设置备注"
              size="small"
            />
          </el-form-item>
          <el-button
            size="small"
            type="primary"
            class="bg-[#1a1a1a] border-none hover:bg-[#333]"
            @click="applyCommonSettings"
          >
            应用到全部
          </el-button>
        </div>
      </div>
      
      <div class="space-y-4 max-h-[350px] overflow-y-auto">
        <div
          v-for="(item, index) in batchScheduleList"
          :key="index"
          class="p-4 bg-[#fafafa] rounded-lg"
        >
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-[#1a1a1a]">{{ item.title }}</span>
              <el-tag class="bg-[#f5f5f5] text-[#666] border-[#e5e5e5] rounded-md text-xs">{{ item.platform }}</el-tag>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <el-form-item label="发布时间" required class="mb-0">
              <el-date-picker
                v-model="item.publish_time"
                type="datetime"
                placeholder="选择日期时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
                size="small"
              />
            </el-form-item>
            <el-form-item label="排期备注" class="mb-0">
              <el-input
                v-model="item.schedule_note"
                placeholder="请输入备注"
                size="small"
              />
            </el-form-item>
          </div>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="batchScheduleDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          class="bg-[#1a1a1a] border-none hover:bg-[#333]"
          :loading="batchScheduleLoading"
          @click="handleBatchCreateSchedule"
        >
          确认创建
        </el-button>
      </template>
    </el-dialog>
    
    <ElImageViewer
      v-if="showImageViewer"
      :url-list="[previewImageUrl]"
      @close="showImageViewer = false"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ElImageViewer } from 'element-plus'
import { Loading, FolderOpened, ArrowDown } from '@element-plus/icons-vue'
import { getPackageList, getPackageDetail, deletePackage, copyPackage } from '@/api/package'
import { createSchedule, batchCreateSchedule } from '@/api/schedule'

const router = useRouter()

const loading = ref(false)
const detailLoading = ref(false)
const packageList = ref([])
const selectedPackageId = ref(null)
const currentPackage = ref(null)
const scheduleDialogVisible = ref(false)
const scheduleLoading = ref(false)
const showImageViewer = ref(false)
const previewImageUrl = ref('')

const batchMode = ref(false)
const selectedPackages = ref([])
const selectAll = ref(false)
const batchScheduleDialogVisible = ref(false)
const batchScheduleLoading = ref(false)
const batchScheduleList = ref([])
const batchCommonTime = ref('')
const batchCommonNote = ref('')

const platformOptions = [
  { label: '小红书', value: '小红书' },
  { label: '微博', value: '微博' },
  { label: '朋友圈', value: '朋友圈' },
  { label: '抖音', value: '抖音' }
]

const statusOptions = [
  { label: '草稿', value: 'draft' },
  { label: '已完成', value: 'completed' },
  { label: '已排期', value: 'scheduled' },
  { label: '已发布', value: 'published' }
]

const filterForm = reactive({
  platform: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  page_size: 10,
  total: 0
})

const scheduleForm = reactive({
  publish_time: '',
  schedule_note: ''
})

const contentItems = computed(() => {
  if (!currentPackage.value?.items) return []
  return currentPackage.value.items.filter(item => item.item_type === 'content')
})

const imageItems = computed(() => {
  if (!currentPackage.value?.items) return []
  return currentPackage.value.items.filter(item => item.item_type === 'image')
})

const getStatusType = (status) => {
  const types = {
    draft: 'info',
    completed: 'success',
    scheduled: 'primary',
    published: 'warning'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    draft: '草稿',
    completed: '已完成',
    scheduled: '已排期',
    published: '已发布'
  }
  return texts[status] || status
}

const handlePreviewImage = (url) => {
  previewImageUrl.value = url
  showImageViewer.value = true
}

const loadPackageList = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.page,
      size: pagination.page_size
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

const handleEdit = () => {
  router.push(`/package-edit/${currentPackage.value.id}`)
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

const handleSaveSchedule = async () => {
  if (!scheduleForm.publish_time) {
    ElMessage.warning('请选择发布时间')
    return
  }
  
  try {
    scheduleLoading.value = true
    const res = await createSchedule({
      package_id: currentPackage.value.id,
      platform: currentPackage.value.platform,
      publish_time: scheduleForm.publish_time,
      schedule_note: scheduleForm.schedule_note
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

const enterBatchMode = () => {
  batchMode.value = true
  selectedPackages.value = []
  selectAll.value = false
}

const exitBatchMode = () => {
  batchMode.value = false
  selectedPackages.value = []
  selectAll.value = false
}

const isPackageSelected = (id) => {
  return selectedPackages.value.some(p => p.id === id)
}

const togglePackageSelection = (item) => {
  const index = selectedPackages.value.findIndex(p => p.id === item.id)
  if (index > -1) {
    selectedPackages.value.splice(index, 1)
  } else {
    selectedPackages.value.push(item)
  }
  updateSelectAllState()
}

const handleSelectAll = (val) => {
  if (val) {
    selectedPackages.value = [...packageList.value]
  } else {
    selectedPackages.value = []
  }
}

const updateSelectAllState = () => {
  selectAll.value = selectedPackages.value.length === packageList.value.length
}

const isIndeterminate = computed(() => {
  return selectedPackages.value.length > 0 && selectedPackages.value.length < packageList.value.length
})

const getPackageItemClass = (item) => {
  if (batchMode.value) {
    return isPackageSelected(item.id) 
      ? 'bg-[#f0f0f0] border border-[#1a1a1a]' 
      : 'bg-white border border-[#e5e5e5] hover:border-[#d5d5d5]'
  }
  return selectedPackageId.value === item.id 
    ? 'bg-[#f0f0f0] border border-[#1a1a1a]' 
    : 'bg-white border border-[#e5e5e5] hover:border-[#d5d5d5]'
}

const handlePackageClick = (item) => {
  if (batchMode.value) {
    togglePackageSelection(item)
  } else {
    handleSelectPackage(item)
  }
}

const showBatchScheduleDialog = () => {
  batchScheduleList.value = selectedPackages.value.map(p => ({
    package_id: p.id,
    title: p.title,
    platform: p.platform,
    publish_time: '',
    schedule_note: ''
  }))
  batchCommonTime.value = ''
  batchCommonNote.value = ''
  batchScheduleDialogVisible.value = true
}

const applyCommonSettings = () => {
  if (!batchCommonTime.value) {
    ElMessage.warning('请先设置统一发布时间')
    return
  }
  batchScheduleList.value.forEach(item => {
    item.publish_time = batchCommonTime.value
    if (batchCommonNote.value) {
      item.schedule_note = batchCommonNote.value
    }
  })
  ElMessage.success('已应用到全部内容包')
}

const handleBatchCreateSchedule = async () => {
  const invalidItems = batchScheduleList.value.filter(item => !item.publish_time)
  if (invalidItems.length > 0) {
    ElMessage.warning('请为所有内容包选择发布时间')
    return
  }
  
  try {
    batchScheduleLoading.value = true
    const res = await batchCreateSchedule(
      batchScheduleList.value.map(item => ({
        package_id: item.package_id,
        platform: item.platform,
        publish_time: item.publish_time,
        schedule_note: item.schedule_note
      }))
    )
    
    if (res.code === 200) {
      ElMessage.success(res.msg || '批量创建排期成功')
      batchScheduleDialogVisible.value = false
      exitBatchMode()
      loadPackageList()
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

const handleDelete = async () => {
  try {
    await ElMessageBox.confirm('确定要删除该内容包吗？删除后无法恢复。', '删除确认', {
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

onMounted(() => {
  loadPackageList()
})
</script>
