<template>
  <el-dialog
    v-model="visible"
    :show-close="false"
    width="auto"
    class="image-preview-dialog"
    @close="handleClose"
  >
    <div class="preview-container bg-white rounded-2xl overflow-hidden shadow-2xl">
      <div class="flex justify-between items-center p-4 border-b border-[#e5e5e5]">
        <span class="text-base font-medium text-[#1a1a1a]">图片预览</span>
        <el-button link @click="handleClose" class="text-[#999] hover:text-[#1a1a1a]">
          <el-icon size="20"><Close /></el-icon>
        </el-button>
      </div>
      
      <div class="p-6">
        <div class="image-wrapper relative">
          <img 
            :src="imageInfo.url" 
            :alt="imageInfo.prompt"
            class="max-w-[600px] max-h-[500px] object-contain rounded-xl"
          />
          <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl">
            <div class="text-center">
              <el-icon class="is-loading text-4xl text-[#1a1a1a] mb-3"><Loading /></el-icon>
              <p class="text-sm text-[#666]">正在生成图片...</p>
            </div>
          </div>
        </div>
        
        <div class="mt-4 p-3 bg-[#fafafa] rounded-xl">
          <div class="flex items-center gap-4 text-sm text-[#666]">
            <span>尺寸：{{ imageInfo.width }}×{{ imageInfo.height }}</span>
            <span>风格：{{ imageInfo.style }}</span>
            <span v-if="imageInfo.platform">平台：{{ imageInfo.platform }}</span>
          </div>
          <div class="mt-2 text-sm text-[#999]">
            提示词：{{ imageInfo.prompt || '暂无' }}
          </div>
        </div>
      </div>
      
      <div class="flex justify-center gap-3 p-4 border-t border-[#e5e5e5]">
        <el-button @click="handleDownload" class="rounded-xl bg-[#1a1a1a] text-white border-none hover:bg-[#333]">
          <el-icon class="mr-1"><Download /></el-icon>
          下载图片
        </el-button>
        <el-button @click="$emit('regenerate')" :loading="regenerating" class="rounded-xl text-[#666] hover:text-[#1a1a1a] border-[#e5e5e5] hover:border-[#d5d5d5]">
          <el-icon class="mr-1"><Refresh /></el-icon>
          重新生成
        </el-button>
        <el-button @click="handleCopyPrompt" class="rounded-xl text-[#666] hover:text-[#1a1a1a] border-[#e5e5e5] hover:border-[#d5d5d5]">
          <el-icon class="mr-1"><DocumentCopy /></el-icon>
          复制提示词
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Close, Download, Refresh, DocumentCopy, Loading } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: Boolean,
  imageInfo: {
    type: Object,
    default: () => ({
      url: '',
      prompt: '',
      style: '清新',
      size: '1:1',
      width: 1024,
      height: 1024,
      platform: ''
    })
  },
  loading: Boolean,
  regenerating: Boolean
})

const emit = defineEmits(['update:modelValue', 'regenerate'])

const visible = ref(false)

watch(() => props.modelValue, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const handleClose = () => {
  visible.value = false
}

const handleDownload = () => {
  const link = document.createElement('a')
  link.href = props.imageInfo.url
  link.download = `ai-image-${Date.now()}.png`
  link.click()
  ElMessage.success('图片下载成功')
}

const handleCopyPrompt = () => {
  if (props.imageInfo.prompt) {
    navigator.clipboard.writeText(props.imageInfo.prompt)
    ElMessage.success('提示词已复制')
  }
}
</script>

<style scoped>
.image-preview-dialog :deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
  background: transparent;
  box-shadow: none;
}

.image-preview-dialog :deep(.el-dialog__header) {
  display: none;
}

.image-preview-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.image-wrapper {
  min-width: 300px;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  border-radius: 12px;
}

.image-wrapper img {
  display: block;
}
</style>
