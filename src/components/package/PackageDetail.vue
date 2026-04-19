<template>
  <div class="flex-1 flex flex-col overflow-hidden">
    <div v-if="!packageData" class="flex-1 flex items-center justify-center text-[#999]">
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
                <template v-if="editMode">
                  <div class="flex gap-8">
                    <div>
                      <span class="text-sm text-[#999]">标题</span>
                      <el-input
                        v-model="editForm.title"
                        placeholder="请输入标题"
                        size="small"
                        maxlength="64"
                        class="ml-2 w-[480px]"
                      />
                    </div>
                    <div>
                      <span class="text-sm text-[#999]">平台</span>
                      <el-select
                        size="small"
                        v-model="editForm.platform"
                        placeholder="选择平台"
                        class="ml-2 w-32"
                      >
                        <el-option v-for="item in platformOptions" :key="item.value" :label="item.label" :value="item.value" />
                      </el-select>
                    </div>
                  </div>
                </template>
                <template v-else>
                  <div class="text-lg font-semibold text-[#1a1a1a] mb-2">{{ packageData.title }}</div>
                  <div class="flex items-center gap-2">
                    <el-tag class="bg-[#f5f5f5] text-[#666] border-[#e5e5e5] rounded-md">{{ packageData.platform }}</el-tag>
                    <el-tag :type="getStatusType(packageData.status)" size="small" class="rounded-md">
                      {{ getStatusText(packageData.status) }}
                    </el-tag>
                  </div>
                </template>
              </div>
              <div class="flex items-center gap-2 ml-4">
                <template v-if="editMode">
                  <el-button size="small" @click="$emit('cancel-edit')">取消</el-button>
                  <el-button
                    size="small"
                    type="primary"
                    class="bg-[#1a1a1a] border-none hover:bg-[#333]"
                    :loading="editLoading"
                    @click="handleSaveEdit"
                  >
                    保存
                  </el-button>
                </template>
                <template v-else>
                  <el-button size="small" type="primary" class="bg-[#1a1a1a] border-none hover:bg-[#333]" @click="$emit('edit')">
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
                </template>
              </div>
            </div>
            <div class="text-xs text-[#999]">创建时间：{{ packageData.create_time }}</div>
          </div>
          
          <div class="flex-1 overflow-y-auto min-h-0">
            <div v-if="detailLoading" class="p-10 flex items-center justify-center">
              <el-icon class="text-3xl text-[#999] animate-spin"><Loading /></el-icon>
            </div>
            
            <template v-else-if="editMode">
              <div class="p-5">
                <div class="mb-4">
                  <div class="flex items-center justify-between mb-3">
                    <span class="text-sm font-medium text-[#333]">文案内容</span>
                    <el-button
                      size="small"
                      type="primary"
                      link
                      @click="$emit('add-content')"
                    >
                      <el-icon class="mr-1"><Plus /></el-icon>添加文案
                    </el-button>
                  </div>
                  <div v-if="editForm.contentItems.length > 0" class="space-y-3">
                    <div
                      v-for="(item, index) in editForm.contentItems"
                      :key="`edit-content-${index}`"
                      class="p-3 bg-[#fafafa] rounded-lg relative group"
                    >
                      <div class="text-[#333] text-[15px] leading-relaxed whitespace-pre-wrap pr-8">{{ item.content }}</div>
                      <el-button
                        class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        size="small"
                        type="danger"
                        link
                        @click="handleRemoveContent(index)"
                      >
                        <el-icon><Delete /></el-icon>
                      </el-button>
                    </div>
                  </div>
                  <div v-else class="text-center text-[#999] py-6 bg-[#fafafa] rounded-lg">
                    暂无文案，点击上方按钮添加
                  </div>
                </div>
                
                <div>
                  <div class="flex items-center justify-between mb-3">
                    <span class="text-sm font-medium text-[#333]">图片</span>
                    <el-button
                      size="small"
                      type="primary"
                      link
                      @click="$emit('add-image')"
                    >
                      <el-icon class="mr-1"><Plus /></el-icon>添加图片
                    </el-button>
                  </div>
                  <div v-if="editForm.imageItems.length > 0" class="flex flex-wrap gap-3">
                    <div
                      v-for="(item, index) in editForm.imageItems"
                      :key="`edit-image-${index}`"
                      class="relative group"
                    >
                      <img
                        :src="item.url"
                        class="h-[120px] w-auto object-cover rounded-lg"
                      />
                      <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors rounded-lg flex items-center justify-center">
                        <el-button
                          type="danger"
                          size="small"
                          circle
                          class="opacity-0 group-hover:opacity-100 transition-opacity"
                          @click="handleRemoveImage(index)"
                        >
                          <el-icon><Delete /></el-icon>
                        </el-button>
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-center text-[#999] py-6 bg-[#fafafa] rounded-lg">
                    暂无图片，点击上方按钮添加
                  </div>
                </div>
              </div>
            </template>
            
            <div v-else-if="packageData.items && packageData.items.length > 0" class="p-5">
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
                  @click="$emit('preview-image', img.url)"
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
              v-if="!editMode"
              type="primary"
              size="large"
              class="bg-[#1a1a1a] border-none hover:bg-[#333]"
              @click="$emit('create-schedule')"
            >
              创建排期
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { FolderOpened, Loading, ArrowDown, Plus, Delete } from '@element-plus/icons-vue'

const props = defineProps({
  packageData: {
    type: Object,
    default: null
  },
  detailLoading: {
    type: Boolean,
    default: false
  },
  editMode: {
    type: Boolean,
    default: false
  },
  editForm: {
    type: Object,
    default: () => ({
      title: '',
      platform: '',
      contentItems: [],
      imageItems: []
    })
  },
  editLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'edit',
  'cancel-edit',
  'save-edit',
  'remove-content',
  'remove-image',
  'add-content',
  'add-image',
  'command',
  'create-schedule',
  'preview-image'
])

const platformOptions = [
  { label: '小红书', value: '小红书' },
  { label: '微博', value: '微博' },
  { label: '朋友圈', value: '朋友圈' },
  { label: '抖音', value: '抖音' }
]

const contentItems = computed(() => {
  if (!props.packageData?.items) return []
  return props.packageData.items.filter(item => item.item_type === 'content')
})

const imageItems = computed(() => {
  if (!props.packageData?.items) return []
  return props.packageData.items.filter(item => item.item_type === 'image')
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

const handleCommand = (command) => {
  emit('command', command)
}

const handleSaveEdit = () => {
  emit('save-edit', props.editForm)
}

const handleRemoveContent = (index) => {
  emit('remove-content', index)
}

const handleRemoveImage = (index) => {
  emit('remove-image', index)
}
</script>
