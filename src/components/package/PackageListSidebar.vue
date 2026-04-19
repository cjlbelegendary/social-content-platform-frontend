<template>
  <div class="w-[360px] bg-white border-r border-[#e5e5e5] flex flex-col flex-shrink-0">
    <div class="rounded-xl p-4 flex items-center gap-3">
      <el-select
        v-model="localFilter.platform"
        placeholder="平台"
        clearable
        size="middle"
        class="w-24"
        :disabled="editMode"
        @change="handleFilterChange"
      >
        <el-option v-for="item in platformOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      
      <el-select
        v-model="localFilter.status"
        placeholder="状态"
        clearable
        size="middle"
        class="w-28"
        :disabled="editMode"
        @change="handleFilterChange"
      >
        <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      
      <div class="flex-1"></div>
      
      <el-button
        v-if="!batchMode && packageList.length > 0"
        size="middle"
        @click="$emit('enter-batch-mode')"
        type="primary"
        class="bg-[#1a1a1a] border-none hover:bg-[#333]"
        :disabled="editMode"
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
        <el-button size="small" @click="$emit('exit-batch-mode')">取消</el-button>
        <el-button
          size="small"
          type="primary"
          class="bg-[#1a1a1a] border-none hover:bg-[#333]"
          :disabled="selectedPackages.length === 0"
          @click="$emit('show-batch-dialog')"
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
          class="p-3 rounded-xl transition-all duration-200 relative"
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
              <div class="flex items-center gap-1 ml-2 flex-shrink-0">
                <el-tag
                  v-if="editMode && selectedId === item.id"
                  type="warning"
                  size="small"
                  class="rounded-md"
                >
                  编辑中
                </el-tag>
                <el-tag
                  v-else
                  :type="getStatusType(item.status)"
                  size="small"
                  class="rounded-md"
                >
                  {{ getStatusText(item.status) }}
                </el-tag>
              </div>
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
        v-model:current-page="localPagination.page"
        v-model:page-size="localPagination.size"
        :total="pagination.total"
        :page-sizes="[10, 20]"
        layout="prev, pager, next"
        small
        :disabled="editMode"
        @size-change="handlePageChange"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { Loading, FolderOpened } from '@element-plus/icons-vue'

const props = defineProps({
  packageList: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  selectedId: {
    type: [Number, null],
    default: null
  },
  editMode: {
    type: Boolean,
    default: false
  },
  batchMode: {
    type: Boolean,
    default: false
  },
  selectedPackages: {
    type: Array,
    default: () => []
  },
  filter: {
    type: Object,
    default: () => ({ platform: '', status: '' })
  },
  pagination: {
    type: Object,
    default: () => ({ page: 1, size: 10, total: 0 })
  }
})

const emit = defineEmits([
  'select',
  'filter-change',
  'page-change',
  'enter-batch-mode',
  'exit-batch-mode',
  'toggle-selection',
  'select-all',
  'show-batch-dialog'
])

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

const localFilter = reactive({
  platform: props.filter.platform,
  status: props.filter.status
})

const localPagination = reactive({
  page: props.pagination.page,
  size: props.pagination.size
})

watch(() => props.filter, (val) => {
  localFilter.platform = val.platform
  localFilter.status = val.status
}, { deep: true })

watch(() => props.pagination, (val) => {
  localPagination.page = val.page
  localPagination.size = val.size
}, { deep: true })

const selectAll = ref(false)

const isIndeterminate = computed(() => {
  return props.selectedPackages.length > 0 && props.selectedPackages.length < props.packageList.length
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

const getPackageItemClass = (item) => {
  if (props.editMode) {
    if (props.selectedId === item.id) {
      return 'bg-[#fff7e6] border border-[#faad14] cursor-not-allowed'
    }
    return 'bg-white border border-[#e5e5e5] opacity-50 cursor-not-allowed'
  }
  if (props.batchMode) {
    return isPackageSelected(item.id) 
      ? 'bg-[#f0f0f0] border border-[#1a1a1a] cursor-pointer' 
      : 'bg-white border border-[#e5e5e5] hover:border-[#d5d5d5] cursor-pointer'
  }
  return props.selectedId === item.id 
    ? 'bg-[#f0f0f0] border border-[#1a1a1a] cursor-pointer' 
    : 'bg-white border border-[#e5e5e5] hover:border-[#d5d5d5] cursor-pointer'
}

const handlePackageClick = (item) => {
  if (props.editMode) return
  if (props.batchMode) {
    togglePackageSelection(item)
  } else {
    emit('select', item)
  }
}

const isPackageSelected = (id) => {
  return props.selectedPackages.some(p => p.id === id)
}

const togglePackageSelection = (item) => {
  emit('toggle-selection', item)
}

const handleSelectAll = (val) => {
  emit('select-all', val)
}

const handleFilterChange = () => {
  emit('filter-change', { ...localFilter })
}

const handlePageChange = () => {
  emit('page-change', { ...localPagination })
}
</script>
