<template>
  <div class="h-screen bg-[#fafafa]">
    <div class="h-14 px-6 bg-white border-b border-[#e5e5e5] flex items-center">
      <el-page-header @back="$router.push('/home')">
        <template #content>
          <span class="text-lg font-semibold text-[#1a1a1a]">排期管理</span>
        </template>
      </el-page-header>
    </div>
    
    <div class="p-6 px-10">
      <div class="bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden max-w-[1400px] mx-auto">
        <div class="p-4 flex items-center gap-4">
          <el-select
            v-model="filterForm.status"
            placeholder="状态"
            clearable
            class="w-32"
          >
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          
          <el-select
            v-model="filterForm.platform"
            placeholder="平台"
            clearable
            class="w-28"
          >
            <el-option v-for="item in platformOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          
          <el-button type="primary" class="bg-[#1a1a1a] border-none hover:bg-[#333]" @click="handleSearch">
            搜索
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>
        
        <div class="min-h-[400px] relative">
          <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-white/50">
            <el-icon class="text-4xl text-[#999] animate-spin"><Loading /></el-icon>
          </div>
          
          <div v-else-if="scheduleList.length === 0" class="flex flex-col items-center justify-center py-20 text-[#999]">
            <el-icon class="text-5xl mb-4"><Calendar /></el-icon>
            <p>暂无排期数据</p>
          </div>
          
          <div v-else class="p-4 space-y-4">
            <div
              v-for="item in scheduleList"
              :key="item.id"
              class="p-4 rounded-xl border border-[#e5e5e5] bg-white hover:shadow-md transition-all duration-200"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-3 mb-2">
                    <div class="text-base font-semibold text-[#1a1a1a]">
                      {{ item.package?.title || '未知内容包' }}
                    </div>
                    <el-tag class="bg-[#f5f5f5] text-[#666] border-[#e5e5e5] rounded-md">
                      {{ item.package?.platform }}
                    </el-tag>
                    <el-tag
                      :type="getStatusType(item.status)"
                      size="small"
                      class="rounded-md"
                    >
                      {{ getStatusText(item.status) }}
                    </el-tag>
                  </div>
                  
                  <div class="text-sm text-[#666] mb-2">
                    发布时间：{{ item.publish_time }}
                  </div>
                  
                  <div v-if="item.package?.items" class="flex items-center gap-2 mb-2">
                    <span class="text-xs text-[#999]">包含：</span>
                    <div class="flex items-center gap-1">
                      <template v-for="(pkgItem, index) in item.package.items.slice(0, 3)" :key="index">
                        <el-tag
                          v-if="pkgItem.item_type === 'content'"
                          type="primary"
                          size="small"
                          class="rounded-md"
                        >
                          文案
                        </el-tag>
                        <img
                          v-else-if="pkgItem.item_type === 'image'"
                          :src="pkgItem.url"
                          class="w-8 h-8 rounded object-cover"
                        />
                      </template>
                      <span v-if="item.package.items.length > 3" class="text-xs text-[#999]">
                        +{{ item.package.items.length - 3 }}
                      </span>
                    </div>
                  </div>
                  
                  <div v-if="item.schedule_note" class="text-xs text-[#999]">
                    备注：{{ item.schedule_note }}
                  </div>
                </div>
                
                <div class="flex items-center gap-2 ml-4">
                  <el-button size="small" @click="handleViewDetail(item)">
                    查看详情
                  </el-button>
                  <template v-if="item.status === 'pending'">
                    <el-button size="small" type="primary" class="bg-[#1a1a1a] border-none hover:bg-[#333]" @click="handleMarkPublished(item)">
                      标记已发布
                    </el-button>
                    <el-button size="small" type="danger" @click="handleCancel(item)">
                      取消
                    </el-button>
                  </template>
                  <template v-else-if="item.status === 'published'">
                    <el-button size="small" @click="handleEditNote(item)">
                      填写结果
                    </el-button>
                  </template>
                  <template v-else-if="item.status === 'expired' || item.status === 'failed'">
                    <el-button size="small" type="primary" class="bg-[#1a1a1a] border-none hover:bg-[#333]" @click="handleReschedule(item)">
                      重新排期
                    </el-button>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="p-4 flex justify-end">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.page_size"
            :total="pagination.total"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next"
            @size-change="loadScheduleList"
            @current-change="loadScheduleList"
          />
        </div>
      </div>
    </div>
    
    <el-dialog
      v-model="detailDialogVisible"
      title="排期详情"
      width="700px"
      destroy-on-close
    >
      <div v-if="currentSchedule" class="space-y-4">
        <div class="flex items-center gap-4">
          <div class="text-lg font-semibold text-[#1a1a1a]">
            {{ currentSchedule.package?.title }}
          </div>
          <el-tag class="bg-[#f5f5f5] text-[#666] border-[#e5e5e5] rounded-md">
            {{ currentSchedule.package?.platform }}
          </el-tag>
          <el-tag :type="getStatusType(currentSchedule.status)" size="small" class="rounded-md">
            {{ getStatusText(currentSchedule.status) }}
          </el-tag>
        </div>
        
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="text-[#999]">发布时间：</span>
            <span class="text-[#333]">{{ currentSchedule.publish_time }}</span>
          </div>
          <div>
            <span class="text-[#999]">创建时间：</span>
            <span class="text-[#333]">{{ currentSchedule.create_time }}</span>
          </div>
        </div>
        
        <div v-if="currentSchedule.schedule_note" class="text-sm">
          <span class="text-[#999]">排期备注：</span>
          <span class="text-[#333]">{{ currentSchedule.schedule_note }}</span>
        </div>
        
        <div v-if="currentSchedule.package?.items" class="border-t border-[#e5e5e5] pt-4">
          <div class="text-sm font-medium text-[#666] mb-3">内容项</div>
          <div class="space-y-3 max-h-[300px] overflow-y-auto">
            <div
              v-for="(pkgItem, index) in currentSchedule.package.items"
              :key="index"
              class="p-3 bg-[#fafafa] rounded-lg"
            >
              <div class="flex items-center gap-2 mb-2">
                <el-tag
                  :type="pkgItem.item_type === 'content' ? 'primary' : 'success'"
                  size="small"
                  class="rounded-md"
                >
                  {{ pkgItem.item_type === 'content' ? '文案' : '图片' }}
                </el-tag>
              </div>
              
              <template v-if="pkgItem.item_type === 'content'">
                <div class="text-sm text-[#333] whitespace-pre-wrap">{{ pkgItem.content }}</div>
              </template>
              <template v-else>
                <div class="flex items-center gap-3">
                  <img
                    :src="pkgItem.url"
                    class="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                  />
                  <div class="flex-1 min-w-0">
                    <div class="text-sm text-[#333]">{{ pkgItem.prompt }}</div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
    
    <el-dialog
      v-model="noteDialogVisible"
      title="填写发布结果"
      width="500px"
      destroy-on-close
    >
      <el-form :model="noteForm" label-width="100px">
        <el-form-item label="发布结果">
          <el-input
            v-model="noteForm.publish_note"
            type="textarea"
            :rows="4"
            placeholder="请输入发布结果，如：点赞量100，评论量20"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="noteDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          class="bg-[#1a1a1a] border-none hover:bg-[#333]"
          :loading="noteLoading"
          @click="handleSaveNote"
        >
          保存
        </el-button>
      </template>
    </el-dialog>
    
    <el-dialog
      v-model="rescheduleDialogVisible"
      title="重新排期"
      width="500px"
      destroy-on-close
    >
      <el-form :model="rescheduleForm" label-width="100px">
        <el-form-item label="发布时间" required>
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
        <el-button @click="rescheduleDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          class="bg-[#1a1a1a] border-none hover:bg-[#333]"
          :loading="rescheduleLoading"
          @click="handleSaveReschedule"
        >
          确认
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Loading, Calendar } from '@element-plus/icons-vue'
import { getScheduleList, updateSchedule } from '@/api/schedule'

const loading = ref(false)
const scheduleList = ref([])
const detailDialogVisible = ref(false)
const noteDialogVisible = ref(false)
const rescheduleDialogVisible = ref(false)
const noteLoading = ref(false)
const rescheduleLoading = ref(false)
const currentSchedule = ref(null)

const platformOptions = [
  { label: '小红书', value: '小红书' },
  { label: '微博', value: '微博' },
  { label: '朋友圈', value: '朋友圈' },
  { label: '抖音', value: '抖音' }
]

const statusOptions = [
  { label: '待发布', value: 'pending' },
  { label: '已发布', value: 'published' },
  { label: '发布失败', value: 'failed' },
  { label: '已过期', value: 'expired' }
]

const filterForm = reactive({
  status: '',
  platform: ''
})

const pagination = reactive({
  page: 1,
  page_size: 10,
  total: 0
})

const noteForm = reactive({
  publish_note: ''
})

const rescheduleForm = reactive({
  publish_time: '',
  schedule_note: ''
})

const getStatusType = (status) => {
  const types = {
    pending: 'warning',
    published: 'success',
    failed: 'danger',
    expired: 'info'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    pending: '待发布',
    published: '已发布',
    failed: '发布失败',
    expired: '已过期'
  }
  return texts[status] || status
}

const loadScheduleList = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.page,
      size: pagination.page_size
    }
    
    if (filterForm.status) {
      params.status = filterForm.status
    }
    if (filterForm.platform) {
      params.platform = filterForm.platform
    }
    
    const res = await getScheduleList(params)
    if (res.code === 200) {
      scheduleList.value = res.data?.list || []
      pagination.total = res.data?.total || 0
    } else {
      ElMessage.error(res.msg || '查询失败')
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
  filterForm.status = ''
  filterForm.platform = ''
  pagination.page = 1
  loadScheduleList()
}

const handleViewDetail = (item) => {
  currentSchedule.value = item
  detailDialogVisible.value = true
}

const handleMarkPublished = async (item) => {
  try {
    await ElMessageBox.confirm('确认将该排期标记为已发布？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const res = await updateSchedule(item.id, { status: 'published' })
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

const handleCancel = async (item) => {
  try {
    await ElMessageBox.confirm('确认取消该排期？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const res = await updateSchedule(item.id, { status: 'failed' })
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

const handleEditNote = (item) => {
  currentSchedule.value = item
  noteForm.publish_note = item.publish_note || ''
  noteDialogVisible.value = true
}

const handleSaveNote = async () => {
  try {
    noteLoading.value = true
    const res = await updateSchedule(currentSchedule.value.id, {
      status: currentSchedule.value.status,
      publish_note: noteForm.publish_note
    })
    if (res.code === 200) {
      ElMessage.success('发布结果已保存')
      noteDialogVisible.value = false
      loadScheduleList()
    } else {
      ElMessage.error(res.msg || '保存失败')
    }
  } catch (error) {
    ElMessage.error('保存异常，请稍后重试')
    console.error('保存发布结果失败：', error)
  } finally {
    noteLoading.value = false
  }
}

const handleReschedule = (item) => {
  currentSchedule.value = item
  rescheduleForm.publish_time = ''
  rescheduleForm.schedule_note = item.schedule_note || ''
  rescheduleDialogVisible.value = true
}

const handleSaveReschedule = async () => {
  if (!rescheduleForm.publish_time) {
    ElMessage.warning('请选择发布时间')
    return
  }
  
  try {
    rescheduleLoading.value = true
    const res = await updateSchedule(currentSchedule.value.id, {
      status: 'pending',
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

onMounted(() => {
  loadScheduleList()
})
</script>
