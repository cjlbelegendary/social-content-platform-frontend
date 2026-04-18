<template>
  <div class="w-[300px] bg-[#fafafa] border-r border-[#e5e5e5] flex flex-col">
    <div class="p-5 flex flex-col gap-2">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 bg-[#1a1a1a] rounded-xl flex items-center justify-center text-white">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h3 class="text-base font-semibold text-[#1a1a1a]">AI创作助手</h3>
      </div>
      
      <el-button size="small" @click="$emit('new-chat')" class="new-chat-btn w-full h-11 rounded-xl text-sm font-semibold border-2 border-[#1a1a1a] bg-[#1a1a1a] text-white hover:bg-[#333] hover:border-[#333] hover:text-gray-100 transition-all duration-200">
        <el-icon class="mr-2">
          <Plus />
        </el-icon>
        新创作
      </el-button>
      
      <div class="flex flex-col gap-1.5 mt-2">
        <div>
          <el-button size="small" @click="$emit('navigate', 'package-list')" class="nav-btn w-full h-10 rounded-xl text-sm text-[#666] hover:text-[#1a1a1a] hover:bg-white border border-transparent hover:border-[#e5e5e5] transition-all duration-200">
          <el-icon class="mr-2">
            <FolderOpened />
          </el-icon>
          我的内容包
        </el-button>
        </div>
        <div>
          <el-button size="small" @click="$emit('navigate', 'schedule')" class="nav-btn w-full h-10 rounded-xl text-sm text-[#666] hover:text-[#1a1a1a] hover:bg-white border border-transparent hover:border-[#e5e5e5] transition-all duration-200">
          <el-icon class="mr-2">
            <Calendar />
          </el-icon>
          排期管理
        </el-button>
        </div>
        <div>
          <el-button size="small" @click="$emit('navigate', 'content-list')" class="nav-btn w-full h-10 rounded-xl text-sm text-[#666] hover:text-[#1a1a1a] hover:bg-white border border-transparent hover:border-[#e5e5e5] transition-all duration-200">
          <el-icon class="mr-2">
            <Document />
          </el-icon>
          创作历史
        </el-button>
        </div>
        <div>
          <el-button v-if="isAdmin" size="small" @click="$emit('navigate', 'user-list')" class="nav-btn w-full h-10 rounded-xl text-sm text-[#666] hover:text-[#1a1a1a] hover:bg-white border border-transparent hover:border-[#e5e5e5] transition-all duration-200">
          <el-icon class="mr-2">
            <UserFilled />
          </el-icon>
          用户列表
        </el-button>
        </div>
      </div>
    </div>
    
    <div class="px-4 flex-1 overflow-hidden">
      <el-tabs v-model="activeTab" class="h-full sidebar-tabs">
        <el-tab-pane label="历史会话" name="history">
          <div class="overflow-y-auto p-2 pr-4" style="max-height: calc(100vh - 340px);">
            <div v-if="loading" class="p-4">
              <el-skeleton :rows="3" animated />
            </div>
            <div v-else-if="chatHistory.length === 0" class="p-4 text-center">
              <div class="text-[#999] text-sm">暂无创作历史</div>
              <div class="text-[#999] text-xs mt-1">开始你的第一次创作吧～</div>
            </div>
            <div v-else v-for="(chat, index) in chatHistory" :key="chat.id || index" 
                 class="p-3 rounded-xl mb-2 cursor-pointer transition-all duration-200 border border-transparent"
                 :class="currentIndex === index ? 'bg-white border-[#e5e5e5] shadow-sm' : 'hover:bg-white hover:border-[#e5e5e5]'" 
                 @click="$emit('switch-chat', index)">
              <div class="flex items-center gap-2 text-sm mb-1" :class="currentIndex === index ? 'font-semibold text-[#1a1a1a]' : 'text-[#666]'">
                <el-icon class="text-[#999]">
                  <Document />
                </el-icon>
                <span class="truncate">{{ chat.title }}</span>
              </div>
              <div class="text-xs text-[#999] pl-6">{{ chat.time }}</div>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="热点浏览" name="hotspot">
          <div class="flex flex-col" style="max-height: calc(100vh - 340px);">
            <div class="mb-3">
              <el-select v-model="platform" placeholder="全部平台" size="small" class="w-full">
                <el-option label="全部" value="" />
                <el-option label="微博" value="微博" />
                <el-option label="小红书" value="小红书" />
                <el-option label="抖音" value="抖音" />
              </el-select>
            </div>
            
            <div class="mb-3">
              <el-input v-model="searchKeyword" placeholder="搜索热点" size="small" clearable>
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </div>
            
            <div class="mb-3">
              <el-button size="small" @click="handleRefresh" :loading="loading" class="w-full rounded-lg border-[#e5e5e5] text-[#666] hover:text-[#1a1a1a] hover:border-[#d5d5d5]">
                <el-icon class="mr-1"><Refresh /></el-icon>
                刷新热点
              </el-button>
            </div>
            
            <div class="flex-1 overflow-y-auto">
              <div v-if="loading" class="p-4">
                <el-skeleton :rows="3" animated />
              </div>
              <div v-else-if="filteredHotspots.length === 0" class="p-4 text-center">
                <div class="text-[#999] text-sm">暂无热点数据</div>
              </div>
              <div v-else v-for="hotspot in filteredHotspots" :key="hotspot.id" 
                   class="p-3 rounded-xl mb-2 bg-white border border-[#e5e5e5] hover:border-[#d5d5d5] hover:shadow-sm transition-all duration-200">
                <div class="flex items-start justify-between mb-2">
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-[#1a1a1a] mb-1 truncate">{{ hotspot.title }}</div>
                    <div class="text-xs text-[#999] mb-2 truncate">{{ hotspot.keywords }}</div>
                  </div>
                  <el-tag :type="getHeatTag(hotspot.heat_value).type" size="small" class="ml-2 flex-shrink-0">
                    {{ getHeatTag(hotspot.heat_value).text }}
                  </el-tag>
                </div>
                <div class="flex items-center justify-between">
                  <div class="text-xs text-[#999]">{{ hotspot.platform }}</div>
                  <el-button size="small" @click="$emit('use-hotspot', hotspot)" class="use-btn text-xs rounded-lg bg-[#1a1a1a] text-white border-none hover:bg-[#333]">
                    一键使用
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    
    <div class="p-4 border-t border-[#e5e5e5]">
      <el-button @click="$emit('logout')" class="w-full h-10 rounded-xl text-[#666] hover:text-[#1a1a1a] hover:bg-white border border-transparent hover:border-[#e5e5e5] transition-all duration-200">
        退出登录
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Document, UserFilled, Calendar, Search, Refresh, FolderOpened } from '@element-plus/icons-vue'
import { getHotspotList, refreshHotspots } from '@/api/hotspot'

const props = defineProps({
  isAdmin: Boolean,
  chatHistory: Array,
  currentIndex: Number,
  loading: Boolean
})

const emit = defineEmits(['new-chat', 'navigate', 'switch-chat', 'use-hotspot', 'logout'])

const activeTab = ref('history')
const platform = ref('')
const searchKeyword = ref('')
const hotspotList = ref([])
const hotspotLoading = ref(false)

const filteredHotspots = computed(() => {
  if (!searchKeyword.value) {
    return hotspotList.value
  }
  return hotspotList.value.filter(hotspot => 
    hotspot.title.includes(searchKeyword.value) ||
    hotspot.keywords.includes(searchKeyword.value)
  )
})

const getHeatTag = (heatValue) => {
  if (heatValue >= 1000000) {
    return { text: '爆', type: 'danger' }
  } else if (heatValue >= 500000) {
    return { text: '热', type: 'warning' }
  } else {
    return { text: '新', type: 'success' }
  }
}

const loadHotspots = async () => {
  hotspotLoading.value = true
  try {
    const params = { limit: 50 }
    if (platform.value) {
      params.platform = platform.value
    }
    
    const res = await getHotspotList(params)
    if (res.code === 200 && res.data) {
      hotspotList.value = res.data
    } else {
      hotspotList.value = []
    }
  } catch (error) {
    console.error('加载热点列表失败：', error)
    ElMessage.error('加载热点列表失败')
    hotspotList.value = []
  } finally {
    hotspotLoading.value = false
  }
}

const handleRefresh = async () => {
  try {
    const res = await refreshHotspots()
    if (res.code === 200) {
      ElMessage.success('刷新热点数据成功')
      await loadHotspots()
    } else {
      ElMessage.error(res.msg || '刷新失败')
    }
  } catch (error) {
    console.error('刷新热点数据失败：', error)
    ElMessage.error('刷新失败，请稍后重试')
  }
}

watch(activeTab, (newVal) => {
  if (newVal === 'hotspot' && hotspotList.value.length === 0) {
    loadHotspots()
  }
})

watch(platform, () => {
  if (activeTab.value === 'hotspot') {
    loadHotspots()
  }
})
</script>

<style scoped>
.sidebar-tabs :deep(.el-tabs__header) {
  margin-bottom: 12px;
}

.sidebar-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

.sidebar-tabs :deep(.el-tabs__item) {
  color: #666;
  font-size: 14px;
}

.sidebar-tabs :deep(.el-tabs__item.is-active) {
  color: #1a1a1a;
  font-weight: 600;
}

.sidebar-tabs :deep(.el-tabs__active-bar) {
  background-color: #1a1a1a;
}

.new-chat-btn :deep(.el-icon) {
  color: white;
}

.nav-btn :deep(.el-icon) {
  color: inherit;
}

.use-btn :deep(.el-loading-spinner) {
  color: white;
}
</style>
