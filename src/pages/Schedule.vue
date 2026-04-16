<template>
  <div class="schedule-container">
    <el-page-header content="排期管理" @back="$router.push('/home')" class="page-header" />

    <FilterTable
      :filter-fields="filterFields"
      :filter-model="filterForm"
      :date-range="dateRange"
      @update:date-range="dateRange = $event"
      :columns="columns"
      :table-data="scheduleList"
      :loading="loading"
      :pagination="pagination"
      @update:pagination="pagination = $event"
      :selectable="true"
      :operation-width="200"
      @search="handleSearch"
      @reset="handleReset"
      @selection-change="handleSelectionChange"
    >
      <template #table-header>
        <el-button
          type="primary"
          class="bg-green-500 hover:bg-green-600"
          :disabled="selectedSchedules.length === 0"
          @click="handleBatchPublish"
        >
          批量发布 ({{ selectedSchedules.length }})
        </el-button>
        <el-button
          type="primary"
          class="bg-blue-500 hover:bg-blue-600"
          :disabled="selectedSchedules.length === 0"
          @click="handleBatchUpdate"
        >
          批量更新 ({{ selectedSchedules.length }})
        </el-button>
      </template>

      <template #column-platform="{ row }">
        <el-tag class="bg-blue-50 text-blue-600 border-blue-200">{{ row.platform }}</el-tag>
      </template>

      <template #column-status="{ row }">
        <el-tag :class="getStatusClass(row.status)">
          {{ getStatusText(row.status) }}
        </el-tag>
      </template>

      <template #column-publish_note="{ row }">
        <span v-if="row.publish_note">{{ row.publish_note }}</span>
        <span v-else class="text-gray-400">-</span>
      </template>

      <template #operation="{ row }">
        <template v-if="row.status === 'pending'">
          <el-button type="primary" link @click="handleMarkPublished(row)">标记已发布</el-button>
          <el-button type="danger" link @click="handleCancelSchedule(row)">取消排期</el-button>
        </template>
        <template v-else-if="row.status === 'published'">
          <el-button type="primary" link @click="handleEditPublishNote(row)">填写结果</el-button>
        </template>
        <template v-else-if="row.status === 'expired' || row.status === 'failed'">
          <el-button type="primary" link @click="handleReschedule(row)">重新排期</el-button>
        </template>
      </template>
    </FilterTable>

    <el-dialog v-model="publishNoteDialogVisible" title="填写发布结果" width="500px" destroy-on-close>
      <el-form :model="publishNoteForm" label-width="100px">
        <el-form-item label="发布结果">
          <el-input
            v-model="publishNoteForm.publish_note"
            type="textarea"
            :rows="4"
            placeholder="请输入发布结果，如：点赞量100，评论量20"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="publishNoteDialogVisible = false" class="text-gray-600">取消</el-button>
        <el-button type="primary" class="bg-blue-500 hover:bg-blue-600" @click="handleSavePublishNote" :loading="publishNoteLoading">
          保存
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="rescheduleDialogVisible" title="重新排期" width="500px" destroy-on-close>
      <el-form :model="rescheduleForm" label-width="100px">
        <el-form-item label="发布平台">
          <el-select v-model="rescheduleForm.platform" placeholder="请选择发布平台" style="width: 100%">
            <el-option v-for="item in platformOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="发布时间">
          <el-date-picker
            v-model="rescheduleForm.publish_time"
            type="datetime"
            placeholder="选择日期时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="排期备注">
          <el-input
            v-model="rescheduleForm.schedule_note"
            type="textarea"
            :rows="3"
            placeholder="请输入排期备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rescheduleDialogVisible = false" class="text-gray-600">取消</el-button>
        <el-button type="primary" class="bg-blue-500 hover:bg-blue-600" @click="handleSaveReschedule" :loading="rescheduleLoading">
          保存
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="batchPublishDialogVisible" title="批量发布" width="500px" destroy-on-close>
      <div class="batch-info">
        <span>已选择 {{ selectedSchedules.length }} 条排期</span>
      </div>
      <el-form :model="batchPublishForm" label-width="100px">
        <el-form-item label="发布备注">
          <el-input
            v-model="batchPublishForm.publish_note"
            type="textarea"
            :rows="4"
            placeholder="请输入发布备注（可选）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchPublishDialogVisible = false" class="text-gray-600">取消</el-button>
        <el-button type="primary" class="bg-green-500 hover:bg-green-600" @click="handleSaveBatchPublish" :loading="batchPublishLoading">
          确认发布
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="batchUpdateDialogVisible" title="批量更新" width="700px" destroy-on-close>
      <div class="batch-info">
        <span>已选择 {{ selectedSchedules.length }} 条排期</span>
      </div>
      
      <el-form :model="batchUpdateForm" label-width="100px" class="batch-form">
        <el-form-item label="统一平台">
          <el-select v-model="batchUpdateForm.platform" placeholder="不修改" clearable style="width: 100%" @change="handleBatchPlatformChange">
            <el-option v-for="item in platformOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="统一时间">
          <el-date-picker
            v-model="batchUpdateForm.publish_time"
            type="datetime"
            placeholder="不修改"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
            @change="handleBatchTimeChange"
          />
        </el-form-item>
        <el-form-item label="统一备注">
          <el-input
            v-model="batchUpdateForm.publish_note"
            type="textarea"
            :rows="2"
            placeholder="不修改"
            @input="handleBatchNoteChange"
          />
        </el-form-item>
      </el-form>

      <el-table :data="batchUpdateTableData" border style="width: 100%; margin-top: 20px;">
        <el-table-column prop="content_title" label="内容标题" min-width="120" show-overflow-tooltip />
        <el-table-column prop="platform" label="平台" width="100" align="center">
          <template #default="scope">
            <el-select
              v-model="scope.row.platform"
              placeholder="选择平台"
              style="width: 100px"
              size="small"
            >
              <el-option v-for="item in platformOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="publish_time" label="发布时间" width="180" align="center">
          <template #default="scope">
            <el-date-picker
              v-model="scope.row.publish_time"
              type="datetime"
              placeholder="选择时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 160px"
              size="small"
            />
          </template>
        </el-table-column>
        <el-table-column prop="publish_note" label="发布备注" width="120">
          <template #default="scope">
            <el-input
              v-model="scope.row.publish_note"
              placeholder="备注"
              size="small"
            />
          </template>
        </el-table-column>
      </el-table>

      <template #footer>
        <el-button @click="batchUpdateDialogVisible = false" class="text-gray-600">取消</el-button>
        <el-button type="primary" class="bg-blue-500 hover:bg-blue-600" @click="handleSaveBatchUpdate" :loading="batchUpdateLoading">
          批量更新
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import FilterTable from '@/components/FilterTable.vue'
import { getScheduleList, updateSchedule, batchUpdateSchedule } from '@/api/content'

const loading = ref(false)
const scheduleList = ref([])
const dateRange = ref([])
const selectedSchedules = ref([])

const platformOptions = [
  { label: '小红书', value: '小红书' },
  { label: '微博', value: '微博' },
  { label: '朋友圈', value: '朋友圈' },
  { label: '抖音', value: '抖音' }
]
const statusOptions = [
  { label: '待发布', value: 'pending' },
  { label: '已发布', value: 'published' },
  { label: '已过期', value: 'expired' },
  { label: '失败', value: 'failed' }
]

const publishNoteDialogVisible = ref(false)
const publishNoteLoading = ref(false)
const currentSchedule = ref(null)
const publishNoteForm = reactive({
  publish_note: ''
})

const rescheduleDialogVisible = ref(false)
const rescheduleLoading = ref(false)
const rescheduleForm = reactive({
  platform: '',
  publish_time: '',
  schedule_note: ''
})

const batchPublishDialogVisible = ref(false)
const batchPublishLoading = ref(false)
const batchPublishForm = reactive({
  publish_note: ''
})

const batchUpdateDialogVisible = ref(false)
const batchUpdateLoading = ref(false)
const batchUpdateTableData = ref([])
const batchUpdateForm = reactive({
  platform: '',
  publish_time: '',
  publish_note: ''
})

const filterForm = reactive({
  status: [],
  platform: [],
  content_title: '',
  schedule_note: '',
  publish_note: ''
})

const pagination = reactive({
  page: 1,
  page_size: 10,
  total: 0
})

const filterFields = [
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    options: statusOptions,
    multiple: true,
    width: '150px'
  },
  {
    prop: 'platform',
    label: '平台',
    type: 'select',
    options: platformOptions,
    multiple: true,
    width: '150px'
  },
  {
    prop: 'dateRange',
    label: '发布时间',
    type: 'daterange',
    width: '240px'
  },
  {
    prop: 'content_title',
    label: '内容标题',
    type: 'input',
    width: '150px'
  },
  {
    prop: 'schedule_note',
    label: '排期备注',
    type: 'input',
    width: '150px'
  },
  {
    prop: 'publish_note',
    label: '发布结果',
    type: 'input',
    width: '150px'
  }
]

const columns = [
  { prop: 'id', label: 'ID', width: 80, align: 'center' },
  { prop: 'content_title', label: '内容标题', minWidth: 150 },
  { prop: 'platform', label: '发布平台', width: 100, align: 'center' },
  { prop: 'publish_time', label: '发布时间', width: 160, align: 'center' },
  { prop: 'status', label: '状态', width: 100, align: 'center' },
  { prop: 'schedule_note', label: '排期备注', minWidth: 120 },
  { prop: 'publish_note', label: '发布结果', minWidth: 120 },
  { prop: 'create_time', label: '创建时间', width: 160, align: 'center' },
  { prop: 'update_time', label: '更新时间', width: 160, align: 'center' }
]

const loadScheduleList = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.page,
      page_size: pagination.page_size
    }

    if (filterForm.status && filterForm.status.length > 0) {
      params.status = filterForm.status
    }
    if (filterForm.platform && filterForm.platform.length > 0) {
      params.platform = filterForm.platform
    }
    if (filterForm.content_title) {
      params.content_title = filterForm.content_title
    }
    if (filterForm.schedule_note) {
      params.schedule_note = filterForm.schedule_note
    }
    if (filterForm.publish_note) {
      params.publish_note = filterForm.publish_note
    }
    if (dateRange.value && dateRange.value.length === 2) {
      params.start_time = dateRange.value[0]
      params.end_time = dateRange.value[1]
    }

    const res = await getScheduleList(params)
    if (res.code === 200) {
      scheduleList.value = res.schedule_list || []
      pagination.total = res.total || 0
      if (scheduleList.value.length === 0) {
        ElMessage.info('暂无排期数据')
      }
    } else {
      ElMessage.error(res.msg || '查询排期列表失败')
    }
  } catch (error) {
    ElMessage.error('查询异常，请稍后重试')
    console.error('查询排期列表失败：', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  loadScheduleList()
}

const handleReset = () => {
  filterForm.status = []
  filterForm.platform = []
  filterForm.content_title = ''
  filterForm.schedule_note = ''
  filterForm.publish_note = ''
  dateRange.value = []
  pagination.page = 1
  loadScheduleList()
}

const handleSelectionChange = (selection) => {
  selectedSchedules.value = selection
}

const getStatusText = (status) => {
  const statusMap = {
    pending: '待发布',
    published: '已发布',
    expired: '已过期',
    failed: '失败'
  }
  return statusMap[status] || status
}

const getStatusClass = (status) => {
  const classMap = {
    pending: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    published: 'bg-green-50 text-green-600 border-green-200',
    expired: 'bg-gray-50 text-gray-600 border-gray-200',
    failed: 'bg-red-50 text-red-600 border-red-200'
  }
  return classMap[status] || ''
}

const handleMarkPublished = async (row) => {
  try {
    await ElMessageBox.confirm('确认将该排期标记为已发布？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const res = await updateSchedule({ schedule_id: row.id, status: 'published' })
    if (res.code === 200) {
      ElMessage.success('已标记为已发布')
      loadScheduleList()
    } else {
      ElMessage.error(res.msg || '操作失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作异常，请稍后重试')
      console.error('标记已发布失败：', error)
    }
  }
}

const handleCancelSchedule = async (row) => {
  try {
    await ElMessageBox.confirm('确认取消该排期？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const res = await updateSchedule({ schedule_id: row.id, status: 'failed' })
    if (res.code === 200) {
      ElMessage.success('排期已取消')
      loadScheduleList()
    } else {
      ElMessage.error(res.msg || '操作失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作异常，请稍后重试')
      console.error('取消排期失败：', error)
    }
  }
}

const handleEditPublishNote = (row) => {
  currentSchedule.value = row
  publishNoteForm.publish_note = row.publish_note || ''
  publishNoteDialogVisible.value = true
}

const handleSavePublishNote = async () => {
  try {
    publishNoteLoading.value = true
    const res = await updateSchedule({
      schedule_id: currentSchedule.value.id,
      status: currentSchedule.value.status,
      publish_note: publishNoteForm.publish_note
    })
    if (res.code === 200) {
      ElMessage.success('发布结果已保存')
      publishNoteDialogVisible.value = false
      loadScheduleList()
    } else {
      ElMessage.error(res.msg || '保存失败')
    }
  } catch (error) {
    ElMessage.error('保存异常，请稍后重试')
    console.error('保存发布结果失败：', error)
  } finally {
    publishNoteLoading.value = false
  }
}

const handleReschedule = (row) => {
  currentSchedule.value = row
  rescheduleForm.platform = row.platform || ''
  rescheduleForm.publish_time = ''
  rescheduleForm.schedule_note = row.schedule_note || ''
  rescheduleDialogVisible.value = true
}

const handleSaveReschedule = async () => {
  if (!rescheduleForm.platform) {
    ElMessage.warning('请选择发布平台')
    return
  }
  if (!rescheduleForm.publish_time) {
    ElMessage.warning('请选择发布时间')
    return
  }

  try {
    rescheduleLoading.value = true
    const res = await updateSchedule({
      schedule_id: currentSchedule.value.id,
      status: 'pending',
      platform: rescheduleForm.platform,
      publish_time: rescheduleForm.publish_time,
      schedule_note: rescheduleForm.schedule_note
    })
    if (res.code === 200) {
      ElMessage.success('重新排期成功')
      rescheduleDialogVisible.value = false
      loadScheduleList()
    } else {
      ElMessage.error(res.msg || '重新排期失败')
    }
  } catch (error) {
    ElMessage.error('重新排期异常，请稍后重试')
    console.error('重新排期失败：', error)
  } finally {
    rescheduleLoading.value = false
  }
}

const handleBatchPublish = () => {
  batchPublishForm.publish_note = ''
  batchPublishDialogVisible.value = true
}

const handleSaveBatchPublish = async () => {
  try {
    batchPublishLoading.value = true
    const updates = selectedSchedules.value.map(item => ({
      schedule_id: item.id,
      status: 'published',
      publish_note: batchPublishForm.publish_note
    }))

    const res = await batchUpdateSchedule({ updates })
    if (res.code === 200) {
      ElMessage.success(res.msg || '批量发布成功')
      batchPublishDialogVisible.value = false
      selectedSchedules.value = []
      loadScheduleList()
    } else {
      ElMessage.error(res.msg || '批量发布失败')
    }
  } catch (error) {
    ElMessage.error('批量发布异常，请稍后重试')
    console.error('批量发布失败：', error)
  } finally {
    batchPublishLoading.value = false
  }
}

const handleBatchUpdate = () => {
  batchUpdateTableData.value = selectedSchedules.value.map(item => ({
    schedule_id: item.id,
    content_title: item.content_title,
    platform: item.platform || '',
    publish_time: item.publish_time || '',
    publish_note: item.publish_note || ''
  }))
  batchUpdateForm.platform = ''
  batchUpdateForm.publish_time = ''
  batchUpdateForm.publish_note = ''
  batchUpdateDialogVisible.value = true
}

const handleBatchPlatformChange = (val) => {
  if (val) {
    batchUpdateTableData.value.forEach(item => {
      item.platform = val
    })
  }
}

const handleBatchTimeChange = (val) => {
  if (val) {
    batchUpdateTableData.value.forEach(item => {
      item.publish_time = val
    })
  }
}

const handleBatchNoteChange = () => {
  if (batchUpdateForm.publish_note) {
    batchUpdateTableData.value.forEach(item => {
      item.publish_note = batchUpdateForm.publish_note
    })
  }
}

const handleSaveBatchUpdate = async () => {
  try {
    batchUpdateLoading.value = true
    const updates = batchUpdateTableData.value.map(item => ({
      schedule_id: item.schedule_id,
      platform: item.platform,
      publish_time: item.publish_time,
      publish_note: item.publish_note
    }))

    const res = await batchUpdateSchedule({ updates })
    if (res.code === 200) {
      ElMessage.success(res.msg || '批量更新成功')
      batchUpdateDialogVisible.value = false
      selectedSchedules.value = []
      loadScheduleList()
    } else {
      ElMessage.error(res.msg || '批量更新失败')
    }
  } catch (error) {
    ElMessage.error('批量更新异常，请稍后重试')
    console.error('批量更新失败：', error)
  } finally {
    batchUpdateLoading.value = false
  }
}

onMounted(() => {
  loadScheduleList()
})
</script>

<style scoped>
.schedule-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 20px;
}

.batch-info {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  color: #606266;
}

.batch-form {
  margin-bottom: 10px;
}
</style>
