<template>
  <div class="h-screen bg-[#fafafa]">
    <div class="h-14 px-6 bg-white border-b border-[#e5e5e5] flex items-center">
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
    
    <div class="p-6 px-10">
      <div class="bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden max-w-[1200px] mx-auto">
        <div class="p-4 flex items-center gap-4 flex-wrap">
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
            class="w-64"
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
        </div>
        
        <div class="min-h-[400px] relative">
          <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-white/50">
            <el-icon class="text-4xl text-[#999] animate-spin"><Loading /></el-icon>
          </div>
          
          <div v-else-if="contentList.length === 0" class="flex flex-col items-center justify-center py-20 text-[#999]">
            <el-icon class="text-5xl mb-4"><Document /></el-icon>
            <p>暂无内容</p>
          </div>
          
          <div v-else class="p-4 grid grid-cols-2 gap-4">
            <div
              v-for="item in contentList"
              :key="`${item.type}-${item.id}`"
              class="p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-md"
              :class="selectedItems.includes(item) ? 'border-[#1a1a1a] bg-[#fafafa]' : 'border-[#e5e5e5] bg-white hover:border-[#d5d5d5]'"
              @click="toggleSelect(item)"
            >
              <div class="flex items-start gap-3">
                <el-checkbox
                  :model-value="selectedItems.includes(item)"
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
                    <el-tag class="bg-[#f5f5f5] text-[#666] border-[#e5e5e5] rounded-md">{{ item.platform }}</el-tag>
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
                  
                  <div class="text-xs text-[#999]">{{ item.create_time_str }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="p-4 flex items-center justify-between">
          <div class="text-sm text-[#666]">
            已选择 <span class="font-semibold text-[#1a1a1a]">{{ selectedItems.length }}</span> 项
          </div>
          
          <div class="flex items-center gap-4">
            <el-pagination
              v-model:current-page="pagination.page"
              v-model:page-size="pagination.page_size"
              :total="pagination.total"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next"
              @size-change="loadContentList"
              @current-change="loadContentList"
            />
            
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
    </div>
    
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
import { Search, Loading, Document } from '@element-plus/icons-vue'
import { getContents } from '@/api/content'
import CreatePackageDialog from '@/components/CreatePackageDialog.vue'

const router = useRouter()

const loading = ref(false)
const contentList = ref([])
const selectedItems = ref([])
const showCreatePackageDialog = ref(false)
const dateRange = ref([])

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

const handlePackageCreated = () => {
  selectedItems.value = []
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
</style>
