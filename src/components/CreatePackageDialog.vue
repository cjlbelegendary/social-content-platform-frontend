<template>
  <el-dialog
    v-model="visible"
    title="创建内容包"
    width="600px"
    :close-on-click-modal="false"
    class="create-package-dialog"
  >
    <div class="space-y-4">
      <div>
        <div class="text-sm font-medium text-[#666] mb-2">内容包标题</div>
        <el-input
          v-model="form.title"
          placeholder="请输入内容包标题"
          maxlength="50"
          show-word-limit
        />
      </div>
      
      <div>
        <div class="text-sm font-medium text-[#666] mb-2">发布平台</div>
        <el-select v-model="form.platform" placeholder="选择平台" class="w-full">
          <el-option label="小红书" value="小红书" />
          <el-option label="微博" value="微博" />
          <el-option label="朋友圈" value="朋友圈" />
          <el-option label="抖音" value="抖音" />
        </el-select>
      </div>
      
      <div>
        <div class="text-sm font-medium text-[#666] mb-2">
          已选内容
          <span class="text-[#999] font-normal">（{{ items.length }} 项）</span>
        </div>
        <div class="bg-[#fafafa] rounded-xl p-3 max-h-[300px] overflow-y-auto">
          <div v-if="items.length === 0" class="text-center text-[#999] py-8">
            暂无选中内容
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="(item, index) in items"
              :key="`${item.item_type}-${item.item_id}`"
              class="flex items-start gap-3 p-3 bg-white rounded-lg border border-[#e5e5e5]"
            >
              <div class="flex-shrink-0">
                <el-tag
                  :type="item.item_type === 'content' ? 'primary' : 'success'"
                  size="small"
                  class="rounded-md"
                >
                  {{ item.item_type === 'content' ? '文案' : '图片' }}
                </el-tag>
              </div>
              <div class="flex-1 min-w-0">
                <template v-if="item.item_type === 'content'">
                  <div class="text-sm text-[#333] line-clamp-2">{{ item.content || item.title }}</div>
                  <div class="text-xs text-[#999] mt-1">{{ item.platform }}</div>
                </template>
                <template v-else>
                  <div class="flex items-center gap-2">
                    <img
                      :src="item.url"
                      class="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    />
                    <div class="min-w-0">
                      <div class="text-sm text-[#333] line-clamp-1">{{ item.prompt || '图片描述' }}</div>
                      <div class="text-xs text-[#999] mt-0.5">{{ item.style }} · {{ item.size }}</div>
                    </div>
                  </div>
                </template>
              </div>
              <el-button
                type="text"
                size="small"
                class="flex-shrink-0 text-[#999] hover:text-[#f56c6c]"
                @click="removeItem(index)"
              >
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <template #footer>
      <div class="flex justify-end gap-3">
        <el-button @click="handleCancel">取消</el-button>
        <el-button
          type="primary"
          :loading="loading"
          :disabled="!form.title || !form.platform || items.length === 0"
          class="bg-[#1a1a1a] border-none hover:bg-[#333]"
          @click="handleConfirm"
        >
          创建
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Close } from '@element-plus/icons-vue'
import { createPackage } from '@/api/package'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  selectedItems: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

const visible = ref(false)
const loading = ref(false)
const items = ref([])
const form = ref({
  title: '',
  platform: ''
})

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    items.value = [...props.selectedItems]
    form.value = {
      title: '',
      platform: ''
    }
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const removeItem = (index) => {
  items.value.splice(index, 1)
}

const handleCancel = () => {
  visible.value = false
}

const handleConfirm = async () => {
  if (!form.value.title.trim()) {
    ElMessage.warning('请输入内容包标题')
    return
  }
  if (!form.value.platform) {
    ElMessage.warning('请选择发布平台')
    return
  }
  if (items.value.length === 0) {
    ElMessage.warning('请至少选择一项内容')
    return
  }
  
  loading.value = true
  try {
    const packageItems = items.value.map(item => ({
      item_type: item.item_type,
      item_id: item.item_id
    }))
    
    const res = await createPackage({
      title: form.value.title.trim(),
      platform: form.value.platform,
      items: packageItems
    })
    
    if (res.code === 200) {
      ElMessage.success('创建成功')
      emit('success', res.data)
      visible.value = false
    } else {
      ElMessage.error(res.msg || '创建失败')
    }
  } catch (error) {
    console.error('创建内容包失败：', error)
    ElMessage.error('创建失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.create-package-dialog :deep(.el-dialog__header) {
  border-bottom: 1px solid #e5e5e5;
  padding-bottom: 16px;
}

.create-package-dialog :deep(.el-dialog__body) {
  padding: 20px;
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
