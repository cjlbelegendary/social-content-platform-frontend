<template>
  <div class="list-container">
    <el-page-header content="我的内容列表" @back="$router.push('/home')" class="page-header" />

    <FilterTable
      :filter-fields="filterFields"
      :filter-model="filterForm"
      :date-range="dateRange"
      @update:date-range="dateRange = $event"
      :columns="columns"
      :table-data="contentList"
      :loading="loading"
      :pagination="pagination"
      @update:pagination="pagination = $event"
      :selectable="true"
      @search="handleSearch"
      @reset="handleReset"
      @selection-change="handleSelectionChange"
      @row-click="handleRowClick"
    >
      <template #table-header>
        <el-button
          type="primary"
          class="bg-green-500 hover:bg-green-600"
          :disabled="selectedContents.length === 0"
          @click="handleBatchSchedule"
        >
          批量创建排期 ({{ selectedContents.length }})
        </el-button>
      </template>

      <template #column-platform="{ row }">
        <el-tag class="bg-blue-50 text-blue-600 border-blue-200">{{ row.platform }}</el-tag>
      </template>

      <template #operation="{ row }">
        <el-button type="primary" link @click.stop="handleView(row)">查看详情</el-button>
        <el-button type="success" link @click.stop="handleCreateSchedule(row)">创建排期</el-button>
      </template>
    </FilterTable>

    <el-dialog v-model="dialogVisible" title="内容详情" width="800px" destroy-on-close>
      <el-input v-model="currentContent" type="textarea" :rows="18" readonly class="detail-textarea" />
      <template #footer>
        <el-button @click="dialogVisible = false" class="text-gray-600">关闭</el-button>
        <el-button class="bg-blue-500 text-white hover:bg-blue-600" @click="handleCopyDetail">
          复制内容
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="scheduleDialogVisible" title="创建排期" width="500px" destroy-on-close>
      <el-form :model="scheduleForm" label-width="100px">
        <el-form-item label="发布平台">
          <el-select v-model="scheduleForm.platform" placeholder="请选择发布平台" style="width: 100%">
            <el-option v-for="item in platformOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="发布时间">
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
            placeholder="请输入排期备注，如：小红书早8点发布"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="scheduleDialogVisible = false" class="text-gray-600">取消</el-button>
        <el-button type="primary" class="bg-green-500 hover:bg-green-600" @click="handleSaveSchedule" :loading="scheduleLoading">
          保存
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="batchScheduleDialogVisible" title="批量创建排期" width="700px" destroy-on-close>
      <div class="batch-info">
        <span>已选择 {{ selectedContents.length }} 条内容</span>
      </div>
      
      <el-form :model="batchScheduleForm" label-width="100px" class="batch-form">
        <el-form-item label="统一平台">
          <el-select v-model="batchScheduleForm.platform" placeholder="请选择发布平台" style="width: 100%" @change="handlePlatformChange">
            <el-option v-for="item in platformOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="统一时间">
          <el-date-picker
            v-model="batchScheduleForm.publish_time"
            type="datetime"
            placeholder="选择日期时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
            @change="handleTimeChange"
          />
        </el-form-item>
        <el-form-item label="统一备注">
          <el-input
            v-model="batchScheduleForm.schedule_note"
            type="textarea"
            :rows="2"
            placeholder="请输入排期备注（可选）"
            @input="handleNoteChange"
          />
        </el-form-item>
      </el-form>

      <el-table :data="batchScheduleTableData" border style="width: 100%; margin-top: 20px;">
        <el-table-column prop="title" label="内容标题" min-width="150" show-overflow-tooltip />
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
        <el-table-column prop="schedule_note" label="备注" width="120">
          <template #default="scope">
            <el-input
              v-model="scope.row.schedule_note"
              placeholder="备注"
              size="small"
            />
          </template>
        </el-table-column>
      </el-table>

      <template #footer>
        <el-button @click="batchScheduleDialogVisible = false" class="text-gray-600">取消</el-button>
        <el-button type="primary" class="bg-green-500 hover:bg-green-600" @click="handleSaveBatchSchedule" :loading="batchScheduleLoading">
          批量创建
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import FilterTable from '@/components/FilterTable.vue'
import { getContents, getSessions, createSchedule, batchCreateSchedule } from '@/api/content'

const loading = ref(false)
const contentList = ref([])
const sessionList = ref([])
const dialogVisible = ref(false)
const currentContent = ref('')
const dateRange = ref([])

const platformOptions = [
  { label: '小红书', value: '小红书' },
  { label: '微博', value: '微博' },
  { label: '朋友圈', value: '朋友圈' },
  { label: '抖音', value: '抖音' }
]

const selectedContents = ref([])

const scheduleDialogVisible = ref(false)
const scheduleLoading = ref(false)
const currentScheduleContent = ref(null)

const scheduleForm = reactive({
  platform: '',
  publish_time: '',
  schedule_note: ''
})

const batchScheduleDialogVisible = ref(false)
const batchScheduleLoading = ref(false)
const batchScheduleTableData = ref([])

const batchScheduleForm = reactive({
  platform: '',
  publish_time: '',
  schedule_note: ''
})

const filterForm = reactive({
  platform: [],
  session_id: [],
  title: '',
  content: ''
})

const pagination = reactive({
  page: 1,
  page_size: 10,
  total: 0
})

const filterFields = computed(() => [
  {
    prop: 'platform',
    label: '平台',
    type: 'select',
    options: platformOptions,
    multiple: true,
    width: '150px'
  },
  {
    prop: 'session_id',
    label: '会话',
    type: 'select',
    options: sessionList.value.map(s => ({ label: s.session_title, value: s.session_id })),
    multiple: true,
    width: '200px'
  },
  {
    prop: 'dateRange',
    label: '时间范围',
    type: 'daterange',
    width: '240px'
  },
  {
    prop: 'title',
    label: '标题',
    type: 'input',
    width: '180px'
  },
  {
    prop: 'content',
    label: '内容',
    type: 'input',
    width: '180px'
  }
])

const columns = [
  { prop: 'id', label: 'ID', width: 80, align: 'center' },
  { prop: 'title', label: '标题', minWidth: 200 },
  { prop: 'session_title', label: '会话', minWidth: 150 },
  { prop: 'platform', label: '发布平台', width: 120, align: 'center' },
  { prop: 'create_time', label: '创建时间', width: 200, align: 'center' }
]

const loadSessionList = async () => {
  try {
    const res = await getSessions()
    if (res.code === 200 && res.session_list) {
      sessionList.value = res.session_list
    }
  } catch (error) {
    console.error('加载会话列表失败：', error)
  }
}

const loadContentList = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.page,
      page_size: pagination.page_size
    }

    if (filterForm.platform && filterForm.platform.length > 0) {
      params.platform = filterForm.platform
    }
    if (filterForm.session_id && filterForm.session_id.length > 0) {
      params.session_id = filterForm.session_id
    }
    if (filterForm.title) {
      params.title = filterForm.title
    }
    if (filterForm.content) {
      params.content = filterForm.content
    }
    if (dateRange.value && dateRange.value.length === 2) {
      params.start_time = dateRange.value[0]
      params.end_time = dateRange.value[1]
    }

    const res = await getContents(params)
    if (res.code === 200) {
      contentList.value = res.content_list || []
      pagination.total = res.total || 0
      if (contentList.value.length === 0) {
        ElMessage.info('暂无生成的内容，请先去生成')
      }
    } else {
      ElMessage.error(res.msg || '查询内容列表失败')
    }
  } catch (error) {
    ElMessage.error('查询异常，请稍后重试')
    console.error('查询内容列表失败：', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  loadContentList()
}

const handleReset = () => {
  filterForm.platform = []
  filterForm.session_id = []
  filterForm.title = ''
  filterForm.content = ''
  dateRange.value = []
  pagination.page = 1
  loadContentList()
}

const handleView = (row) => {
  currentContent.value = row.content
  dialogVisible.value = true
}

const handleRowClick = (row) => {
  handleView(row)
}

const handleSelectionChange = (selection) => {
  selectedContents.value = selection
}

const handleCopyDetail = () => {
  navigator.clipboard.writeText(currentContent.value).then(() => {
    ElMessage.success('内容已复制到剪贴板！')
  }).catch(() => {
    ElMessage.error('复制失败，请手动复制')
  })
}

const handleCreateSchedule = (row) => {
  currentScheduleContent.value = row
  scheduleForm.platform = row.platform || ''
  scheduleForm.publish_time = ''
  scheduleForm.schedule_note = ''
  scheduleDialogVisible.value = true
}

const handleSaveSchedule = async () => {
  if (!scheduleForm.platform) {
    ElMessage.warning('请选择发布平台')
    return
  }
  if (!scheduleForm.publish_time) {
    ElMessage.warning('请选择发布时间')
    return
  }

  try {
    scheduleLoading.value = true
    const params = {
      content_id: currentScheduleContent.value.id,
      platform: scheduleForm.platform,
      publish_time: scheduleForm.publish_time,
      schedule_note: scheduleForm.schedule_note
    }

    const res = await createSchedule(params)
    if (res.code === 200) {
      ElMessage.success('排期创建成功')
      scheduleDialogVisible.value = false
    } else {
      ElMessage.error(res.msg || '排期创建失败')
    }
  } catch (error) {
    ElMessage.error('排期创建异常，请稍后重试')
    console.error('排期创建失败：', error)
  } finally {
    scheduleLoading.value = false
  }
}

const handleBatchSchedule = () => {
  batchScheduleTableData.value = selectedContents.value.map(item => ({
    content_id: item.id,
    title: item.title,
    platform: item.platform || '',
    publish_time: '',
    schedule_note: ''
  }))
  batchScheduleForm.platform = ''
  batchScheduleForm.publish_time = ''
  batchScheduleForm.schedule_note = ''
  batchScheduleDialogVisible.value = true
}

const handlePlatformChange = (val) => {
  batchScheduleTableData.value.forEach(item => {
    item.platform = val
  })
}

const handleTimeChange = (val) => {
  batchScheduleTableData.value.forEach(item => {
    item.publish_time = val
  })
}

const handleNoteChange = () => {
  batchScheduleTableData.value.forEach(item => {
    item.schedule_note = batchScheduleForm.schedule_note
  })
}

const handleSaveBatchSchedule = async () => {
  const invalidItems = batchScheduleTableData.value.filter(item => !item.platform || !item.publish_time)
  if (invalidItems.length > 0) {
    ElMessage.warning('请确保每条内容都已选择平台和发布时间')
    return
  }

  try {
    batchScheduleLoading.value = true
    const schedules = batchScheduleTableData.value.map(item => ({
      content_id: item.content_id,
      platform: item.platform,
      publish_time: item.publish_time,
      schedule_note: item.schedule_note
    }))

    const res = await batchCreateSchedule({ schedules })
    if (res.code === 200) {
      ElMessage.success(res.msg || '批量创建排期成功')
      batchScheduleDialogVisible.value = false
      selectedContents.value = []
    } else {
      ElMessage.error(res.msg || '批量创建排期失败')
    }
  } catch (error) {
    ElMessage.error('批量创建排期异常，请稍后重试')
    console.error('批量创建排期失败：', error)
  } finally {
    batchScheduleLoading.value = false
  }
}

onMounted(() => {
  loadSessionList()
  loadContentList()
})
</script>

<style scoped>
.list-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 20px;
}

.detail-textarea {
  font-size: 14px;
  line-height: 1.6;
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
