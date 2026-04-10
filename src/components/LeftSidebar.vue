<template>
  <div class="w-[300px] bg-gray-50 border-r border-gray-200 flex flex-col shadow-sm">
    <div class="p-4 flex flex-col gap-1">
      <h3 class="text-lg font-bold text-gray-800 mb-4">🤖 社交内容生成助手</h3>
      
      <div class="flex flex-col justify-end items-end gap-2">
        <el-button size="small" @click="$emit('new-chat')" class="text-sm bg-blue-50 border-blue-100 border-1 hover:bg-blue-100 hover:border-blue-200 text-blue-400 font-bold w-full h-10 rounded-lg">
          <el-icon class="mr-2">
            <Plus />
          </el-icon>
          新创作
        </el-button>
        <el-button size="small" @click="$emit('navigate', 'content-list')" class="text-sm rounded-lg w-full h-10 text-gray-600 hover:text-gray-800 hover:bg-gray-100 hover:border-gray-100 border-2 border-gray-100">
          <el-icon class="mr-2">
            <Document />
          </el-icon>
          历史管理
        </el-button>
        <el-button v-if="isAdmin" size="small" @click="$emit('navigate', 'user-list')" class="text-sm rounded-lg w-full h-10 text-gray-600 hover:text-gray-800 hover:bg-gray-100 hover:border-gray-100 border-2 border-gray-100">
          <el-icon class="mr-2">
            <UserFilled />
          </el-icon>
          用户列表
        </el-button>
        <el-button size="small" @click="$emit('navigate', 'schedule')" class="text-sm rounded-lg w-full h-10 text-gray-600 hover:text-gray-800 hover:bg-gray-100 hover:border-gray-100 border-2 border-gray-100">
          <el-icon class="mr-2">
            <Calendar />
          </el-icon>
          排期管理
        </el-button>
      </div>
    </div>
    
    <div class="px-4 flex-1 overflow-hidden">
      <el-tabs v-model="activeTab" class="h-full">
        <el-tab-pane label="历史会话" name="history">
          <div class="overflow-y-auto p-2 pr-4 bg-gray-50" style="max-height: calc(100vh - 320px);">
            <div v-if="loading" class="p-4">
              <el-skeleton :rows="3" animated />
            </div>
            <div v-else-if="chatHistory.length === 0" class="p-4">
              <el-empty description="暂无创作历史，开始你的第一次创作吧～" />
            </div>
            <div v-else v-for="(chat, index) in chatHistory" :key="chat.id || index" 
                 class="p-3 rounded-lg mb-2 cursor-pointer transition-all duration-200 bg-gray-50 hover:bg-gray-100 hover:translate-x-1"
                 :class="{'bg-white': currentIndex === index}" 
                 @click="$emit('switch-chat', index)">
              <div class="flex items-center gap-2 text-sm font-medium mb-1" :class="{'font-bold': currentIndex === index}">
                <el-icon class="text-gray-500">
                  <Document />
                </el-icon>
                {{ chat.title }}
              </div>
              <div class="text-xs text-gray-500">{{ chat.time }}</div>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="热点浏览" name="hotspot">
          <div class="flex flex-col" style="max-height: calc(100vh - 320px);">
            <div class="mb-3">
              <el-select v-model="platform" placeholder="全部平台" size="small" clearable class="w-full">
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
              <el-button size="small" @click="handleRefresh" :loading="loading" class="w-full">
                <el-icon class="mr-1"><Refresh /></el-icon>
                刷新热点
              </el-button>
            </div>
            
            <div class="flex-1 overflow-y-auto">
              <div v-if="loading" class="p-4">
                <el-skeleton :rows="3" animated />
              </div>
              <div v-else-if="filteredHotspots.length === 0" class="p-4">
                <el-empty description="暂无热点数据" />
              </div>
              <div v-else v-for="hotspot in filteredHotspots" :key="hotspot.id" 
                   class="p-3 rounded-lg mb-2 bg-white border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all duration-200">
                <div class="flex items-start justify-between mb-2">
                  <div class="flex-1">
                    <div class="text-sm font-medium text-gray-800 mb-1 line-clamp-2">{{ hotspot.title }}</div>
                    <div class="text-xs text-gray-500 mb-2">{{ hotspot.keywords }}</div>
                  </div>
                  <el-tag :type="getHeatTag(hotspot.heat_value).type" size="small" class="ml-2 flex-shrink-0">
                    {{ getHeatTag(hotspot.heat_value).text }}
                  </el-tag>
                </div>
                <div class="flex items-center justify-between">
                  <div class="text-xs text-gray-400">{{ hotspot.platform }}</div>
                  <el-button size="small" type="primary" @click="$emit('use-hotspot', hotspot)" class="text-xs">
                    一键使用
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    
    <div class="p-4">
      <el-button @click="$emit('logout')" class="rounded-lg w-full h-10 text-gray-600 hover:text-gray-800 hover:bg-gray-100 hover:border-gray-100 border-2 border-gray-100">
        退出登录
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Document, UserFilled, Calendar, Search, Refresh } from '@element-plus/icons-vue'
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
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
