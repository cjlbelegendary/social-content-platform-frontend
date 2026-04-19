<template>
  <el-dialog
    :model-value="visible"
    :title="materialType === 'content' ? '选择文案' : '选择图片'"
    width="700px"
    destroy-on-close
    @update:model-value="$emit('update:visible', $event)"
  >
    <div class="mb-4 flex items-center gap-3">
      <el-select
        v-model="filter.platform"
        placeholder="平台"
        clearable
        size="small"
        class="w-28"
        @change="loadList"
      >
        <el-option v-for="item in platformOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-input
        v-model="filter.keyword"
        :placeholder="materialType === 'content' ? '搜索文案内容' : '搜索图片描述'"
        clearable
        size="small"
        class="w-48"
        @keyup.enter="loadList"
        @clear="loadList"
      >
        <template #append>
          <el-button @click="loadList">
            <el-icon><Search /></el-icon>
          </el-button>
        </template>
      </el-input>
    </div>
    
    <div v-if="loading" class="py-10 flex items-center justify-center">
      <el-icon class="text-3xl text-[#999] animate-spin"><Loading /></el-icon>
    </div>
    
    <div v-else-if="materialList.length === 0" class="py-10 text-center text-[#999]">
      暂无可选素材
    </div>
    
    <div v-else class="max-h-[400px] overflow-y-auto">
      <template v-if="materialType === 'content'">
        <div
          v-for="item in materialList"
          :key="item.id"
          class="p-3 rounded-lg cursor-pointer transition-all mb-2"
          :class="isSelected(item.id) ? 'bg-[#e6f4ff] border border-[#1a1a1a]' : 'bg-[#fafafa] hover:bg-[#f0f0f0] border border-transparent'"
          @click="toggleSelect(item)"
        >
          <div class="flex items-start gap-2">
            <el-checkbox
              :model-value="isSelected(item.id)"
              @click.stop
              @change="toggleSelect(item)"
            />
            <div class="flex-1 min-w-0">
              <div class="text-sm text-[#333] line-clamp-3">{{ item.content }}</div>
              <div class="flex items-center gap-2 mt-1">
                <el-tag size="small" class="bg-[#f5f5f5] text-[#666] border-[#e5e5e5] rounded">{{ item.platform }}</el-tag>
                <span class="text-xs text-[#999]">{{ item.create_time }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
      
      <template v-else>
        <div class="grid grid-cols-4 gap-3">
          <div
            v-for="item in materialList"
            :key="item.id"
            class="relative cursor-pointer group rounded-lg overflow-hidden"
            :class="isSelected(item.id) ? 'ring-2 ring-[#1a1a1a]' : ''"
            @click="toggleSelect(item)"
          >
            <img
              :src="item.url"
              class="w-full h-[120px] object-cover"
            />
            <div
              v-if="isSelected(item.id)"
              class="absolute top-2 right-2 w-5 h-5 bg-[#1a1a1a] rounded-full flex items-center justify-center"
            >
              <el-icon class="text-white text-xs"><Check /></el-icon>
            </div>
            <div class="absolute bottom-0 left-0 right-0 bg-black/50 p-1">
              <div class="text-xs text-white truncate">{{ item.prompt || '无描述' }}</div>
            </div>
          </div>
        </div>
      </template>
    </div>
    
    <div v-if="materialList.length > 0" class="mt-4 flex justify-center">
      <el-pagination
        v-model:current-page="pagination.page"
        :page-size="pagination.size"
        :total="pagination.total"
        layout="prev, pager, next"
        small
        @current-change="loadList"
      />
    </div>
    
    <template #footer>
      <div class="flex items-center justify-between">
        <span class="text-sm text-[#666]">已选 {{ selectedMaterials.length }} 项</span>
        <div>
          <el-button @click="$emit('update:visible', false)">取消</el-button>
          <el-button
            type="primary"
            class="bg-[#1a1a1a] border-none hover:bg-[#333]"
            :disabled="selectedMaterials.length === 0"
            @click="handleConfirm"
          >
            确认添加
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { Loading, Search, Check } from '@element-plus/icons-vue'
import { getContents } from '@/api/content'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  materialType: {
    type: String,
    default: 'content'
  }
})

const emit = defineEmits(['update:visible', 'confirm'])

const platformOptions = [
  { label: '小红书', value: '小红书' },
  { label: '微博', value: '微博' },
  { label: '朋友圈', value: '朋友圈' },
  { label: '抖音', value: '抖音' }
]

const loading = ref(false)
const materialList = ref([])
const selectedMaterials = ref([])

const filter = reactive({
  platform: '',
  keyword: ''
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

watch(() => props.visible, (val) => {
  if (val) {
    selectedMaterials.value = []
    pagination.page = 1
    filter.platform = ''
    filter.keyword = ''
    loadList()
  }
})

const loadList = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.page,
      size: pagination.size,
      type: props.materialType
    }
    if (filter.platform) {
      params.platform = filter.platform
    }
    if (filter.keyword) {
      params.keyword = filter.keyword
    }
    
    const res = await getContents(params)
    if (res.code === 200) {
      materialList.value = res.data?.list || []
      pagination.total = res.data?.total || 0
    }
  } catch (error) {
    console.error('获取素材列表失败：', error)
  } finally {
    loading.value = false
  }
}

const isSelected = (id) => {
  return selectedMaterials.value.some(m => m.id === id)
}

const toggleSelect = (item) => {
  const index = selectedMaterials.value.findIndex(m => m.id === item.id)
  if (index > -1) {
    selectedMaterials.value.splice(index, 1)
  } else {
    selectedMaterials.value.push(item)
  }
}

const handleConfirm = () => {
  emit('confirm', selectedMaterials.value)
  emit('update:visible', false)
}
</script>
