<template>
  <div class="h-screen bg-[#fafafa] flex flex-col">
    <div class="h-14 px-6 bg-white border-b border-[#e5e5e5] flex items-center flex-shrink-0">
      <el-page-header @back="$router.push('/home')">
        <template #content>
          <span class="text-lg font-semibold text-[#1a1a1a]">创作历史</span>
        </template>
      </el-page-header>
      <div class="flex items-center gap-4 text-sm text-[#999]">
        <router-link to="/package-list" class="hover:text-[#1a1a1a] transition-colors">我的内容包</router-link>
        <router-link to="/schedule" class="hover:text-[#1a1a1a] transition-colors">排期管理</router-link>
      </div>
    </div>
    
    <div class="flex-1 overflow-y-auto p-6 px-10 pb-32">
      <div class="bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden max-w-[1200px] mx-auto">
        <div class="p-4 flex items-center gap-4 flex-wrap sticky top-0 bg-white z-10">
          <div class="flex gap-1 p-1 bg-[#f5f5f5] rounded-lg">
            <button
              v-for="tab in typeTabs"
              :key="tab.value"
              @click="activeType = tab.value"
              class="px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200"
              :class="activeType === tab.value ? 'bg-white text-[#1a1a1a] shadow-sm' : 'text-[#999] hover:text-[#666]'"
            >
              {{ tab.label }}
            </button>
          </div>
          
          <el-select
            v-model="filterForm.platform"
            placeholder="平台"
            clearable
            class="w-28"
          >
            <el-option v-for="item in platformOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            class="w-56"
          />
          
          <el-input
            v-model="filterForm.keyword"
            placeholder="搜索关键词"
            clearable
            class="w-32"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          
          <el-button type="primary" class="bg-[#1a1a1a] border-none hover:bg-[#333]" @click="handleSearch">
            搜索
          </el-button>
          <el-button @click="handleReset">重置</el-button>
          
          <div class="flex items-center gap-1 p-1 bg-[#f5f5f5] rounded-lg">
            <el-tooltip content="单列" placement="top">
              <button
                @click="columnMode = 1"
                class="p-1.5 rounded-md transition-all duration-200"
                :class="columnMode === 1 ? 'bg-white text-[#1a1a1a] shadow-sm' : 'text-[#999] hover:text-[#666]'"
              >
                <el-icon><Menu /></el-icon>
              </button>
            </el-tooltip>
            <el-tooltip content="双列" placement="top">
              <button
                @click="columnMode = 2"
                class="p-1.5 rounded-md transition-all duration-200"
                :class="columnMode === 2 ? 'bg-white text-[#1a1a1a] shadow-sm' : 'text-[#999] hover:text-[#666]'"
              >
                <el-icon><Grid /></el-icon>
              </button>
            </el-tooltip>
          </div>
          
          <div class="flex-1"></div>
          
          <el-button
            type="primary"
            class="bg-[#1a1a1a] border-none hover:bg-[#333]"
            :disabled="selectMode"
            @click="enterSelectMode"
          >
            <el-icon class="mr-1"><FolderAdd /></el-icon>
            创建内容包
          </el-button>
        </div>
        
        <div class="min-h-[400px] relative">
          <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-white/50">
            <el-icon class="text-4xl text-[#999] animate-spin"><Loading /></el-icon>
          </div>
          
          <div v-else-if="contentList.length === 0" class="flex flex-col items-center justify-center py-20 text-[#999]">
            <el-icon class="text-5xl mb-4"><Document /></el-icon>
            <p>暂无内容</p>
          </div>
          
          <div v-else class="p-4 grid gap-4" :class="columnMode === 1 ? 'grid-cols-1' : 'grid-cols-2'">
            <div
              v-for="item in contentList"
              :key="`${item.type}-${item.id}`"
              class="p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-md"
              :class="getItemClass(item)"
              @click="handleCardClick(item)"
            >
              <div class="flex items-start gap-3">
                <el-checkbox
                  v-if="selectMode"
                  :model-value="isSelected(item)"
                  @change="toggleSelect(item)"
                  @click.stop
                />
                
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-2">
                    <el-tag
                      :type="item.type === 'content' ? 'primary' : 'success'"
                      size="small"
                      class="rounded-md"
                    >
                      {{ item.type === 'content' ? '文案' : '图片' }}
                    </el-tag>
                    <el-tag class="bg-[#f5f5f5] text-[#666] border-[#e5e5e5] rounded-md text-xs">{{ item.platform }}</el-tag>
                    <el-tag
                      v-if="item.is_in_package"
                      type="warning"
                      size="small"
                      class="rounded-md"
                    >
                      已在内容包
                    </el-tag>
                  </div>
                  
                  <template v-if="item.type === 'content'">
                    <div class="text-sm text-[#333] line-clamp-2 mb-2">{{ item.content || item.title }}</div>
                  </template>
                  <template v-else>
                    <div class="flex items-center gap-3 mb-2">
                      <img
                        :src="item.url"
                        class="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                      <div class="flex-1 min-w-0">
                        <div class="text-sm text-[#333] line-clamp-2">{{ item.prompt || '图片描述' }}</div>
                        <div class="text-xs text-[#999] mt-1">{{ item.style }}</div>
                      </div>
                    </div>
                  </template>
                  
                  <div class="flex items-center justify-between">
                    <div class="text-xs text-[#999]">{{ item.create_time_str }}</div>
                    <div v-if="item.session" class="text-xs text-[#1a1a1a] flex items-center gap-1">
                      <el-icon><ChatDotRound /></el-icon>
                      <span class="truncate max-w-[120px]">{{ item.session.session_title }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="p-4 flex items-center justify-end border-t border-[#e5e5e5]">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.page_size"
            :total="pagination.total"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next"
            @size-change="loadContentList"
            @current-change="loadContentList"
          />
        </div>
      </div>
    </div>
    
    <Transition name="slide-up">
      <div
        v-if="selectMode"
        class="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e5e5e5] shadow-lg z-20"
      >
        <div class="max-w-[1200px] mx-auto px-10 py-4 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <el-checkbox
              :model-value="isAllSelected"
              :indeterminate="isIndeterminate"
              @change="handleSelectAll"
            >
              全选
            </el-checkbox>
            <div class="text-sm text-[#666]">
              已选择 <span class="font-semibold text-[#1a1a1a]">{{ selectedItems.length }}</span> 项
            </div>
          </div>
          
          <div class="flex items-center gap-3">
            <el-button @click="exitSelectMode">取消</el-button>
            <el-button
              type="primary"
              class="bg-[#1a1a1a] border-none hover:bg-[#333]"
              :disabled="selectedItems.length === 0"
              @click="showCreatePackageDialog = true"
            >
              创建内容包
            </el-button>
          </div>
        </div>
      </div>
    </Transition>
    
    <ContentDetailDialog
      v-model:visible="detailDialogVisible"
      :content-data="currentDetail"
      @go-to-session="handleGoToSession"
    />
    
    <CreatePackageDialog
      v-model="showCreatePackageDialog"
      :selected-items="selectedItemsForPackage"
      @success="handlePackageCreated"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Loading, Document, Menu, Grid, FolderAdd, ChatDotRound } from '@element-plus/icons-vue'
import { getContents } from '@/api/content'
import ContentDetailDialog from '@/components/ContentDetailDialog.vue'
import CreatePackageDialog from '@/components/CreatePackageDialog.vue'

const router = useRouter()

const loading = ref(false)
const contentList = ref([])
const selectedItems = ref([])
const showCreatePackageDialog = ref(false)
const dateRange = ref([])
const columnMode = ref(2)

const selectMode = ref(false)
const detailDialogVisible = ref(false)
const currentDetail = ref(null)

const activeType = ref('all')

watch(activeType, () => {
  pagination.page = 1
  loadContentList()
})

const typeTabs = [
  { label: '全部', value: 'all' },
  { label: '文案', value: 'content' },
  { label: '图片', value: 'image' }
]

const platformOptions = [
  { label: '小红书', value: '小红书' },
  { label: '微博', value: '微博' },
  { label: '朋友圈', value: '朋友圈' },
  { label: '抖音', value: '抖音' }
]

const filterForm = reactive({
  platform: '',
  keyword: ''
})

const pagination = reactive({
  page: 1,
  page_size: 10,
  total: 0
})

const selectedItemsForPackage = computed(() => {
  return selectedItems.value.map(item => ({
    item_type: item.type,
    item_id: item.id,
    content: item.content,
    title: item.title,
    platform: item.platform,
    url: item.url,
    prompt: item.prompt,
    style: item.style,
    size: item.size
  }))
})

const isAllSelected = computed(() => {
  return contentList.value.length > 0 && selectedItems.value.length === contentList.value.length
})

const isIndeterminate = computed(() => {
  return selectedItems.value.length > 0 && selectedItems.value.length < contentList.value.length
})

const loadContentList = async () => {
  try {
    loading.value = true
    const params = {
      type: activeType.value,
      page: pagination.page,
      size: pagination.page_size
    }
    
    if (filterForm.platform) {
      params.platform = filterForm.platform
    }
    if (filterForm.keyword) {
      params.keyword = filterForm.keyword
    }
    if (dateRange.value && dateRange.value.length === 2) {
      params.start_time = dateRange.value[0]
      params.end_time = dateRange.value[1]
    }
    
    const res = await getContents(params)
    if (res.code === 200) {
      contentList.value = res.data?.list || []
      pagination.total = res.data?.total || 0
    } else {
      ElMessage.error(res.msg || '查询失败')
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
  filterForm.platform = ''
  filterForm.keyword = ''
  dateRange.value = []
  activeType.value = 'all'
  pagination.page = 1
  loadContentList()
}

const enterSelectMode = () => {
  selectMode.value = true
  selectedItems.value = []
}

const exitSelectMode = () => {
  selectMode.value = false
  selectedItems.value = []
}

const isSelected = (item) => {
  return selectedItems.value.some(
    i => i.type === item.type && i.id === item.id
  )
}

const toggleSelect = (item) => {
  const index = selectedItems.value.findIndex(
    i => i.type === item.type && i.id === item.id
  )
  if (index > -1) {
    selectedItems.value.splice(index, 1)
  } else {
    selectedItems.value.push(item)
  }
}

const handleSelectAll = (val) => {
  if (val) {
    selectedItems.value = [...contentList.value]
  } else {
    selectedItems.value = []
  }
}

const getItemClass = (item) => {
  if (selectMode.value) {
    return isSelected(item) 
      ? 'border-[#1a1a1a] bg-[#fafafa]' 
      : 'border-[#e5e5e5] bg-white hover:border-[#d5d5d5]'
  }
  return 'border-[#e5e5e5] bg-white hover:border-[#d5d5d5]'
}

const handleCardClick = (item) => {
  if (selectMode.value) {
    toggleSelect(item)
  } else {
    currentDetail.value = item
    detailDialogVisible.value = true
  }
}

const handleGoToSession = (sessionId) => {
  router.push({
    path: '/home',
    query: { sessionId }
  })
}

const handlePackageCreated = () => {
  exitSelectMode()
  loadContentList()
  router.push('/package-list')
}

onMounted(() => {
  loadContentList()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
