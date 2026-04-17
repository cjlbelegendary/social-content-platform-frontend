<template>
  <div class="p-4 px-6 bg-white border-t border-[#e5e5e5]">
    <div class="max-w-[1000px] mx-auto">
      <slot name="persona-config"></slot>
      
      <div class="input-container rounded-2xl border border-[#e5e5e5] hover:border-[#d5d5d5] focus-within:border-[#1a1a1a] focus-within:shadow-sm transition-all duration-200 bg-white p-4">
        <el-input 
          v-model="localInput" 
          type="textarea" 
          :rows="3" 
          placeholder="输入你的创作需求（例如：春日野餐、职场穿搭、节日祝福）..."
          @keydown.enter.ctrl="handleSend"
        />
        <div class="flex justify-between items-center gap-3 mt-3">
          <span class="text-xs text-[#999]">Ctrl+Enter 发送</span>
          <div class="flex items-center gap-3 w-[30%]">
            <span class="text-sm text-[#666] font-medium text-nowrap">适配平台：</span>
            <el-select v-model="localPlatform" placeholder="选择平台" size="small" class="platform-select">
              <el-option label="小红书" value="小红书" />
              <el-option label="微博" value="微博" />
              <el-option label="朋友圈" value="朋友圈" />
              <el-option label="抖音" value="抖音" />
            </el-select>
            <el-button 
              size="large" 
              :loading="loading" 
              @click="handleSend" 
              class="send-btn rounded-xl px-6 font-semibold bg-[#1a1a1a] hover:bg-[#333] text-white hover:text-gray-100 border-none transition-all duration-200 h-10"
            >
              <el-icon class="mr-1">
                <Promotion />
              </el-icon>
              生成内容
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Promotion } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: String,
  platform: String,
  loading: Boolean
})

const emit = defineEmits(['update:modelValue', 'update:platform', 'send'])

const localInput = ref('')
const localPlatform = ref('小红书')

const handleSend = () => {
  if (!localInput.value.trim()) {
    return
  }
  emit('send', {
    input: localInput.value,
    platform: localPlatform.value
  })
}

watch(() => props.modelValue, (newVal) => {
  localInput.value = newVal || ''
}, { immediate: true })

watch(() => props.platform, (newVal) => {
  localPlatform.value = newVal || '小红书'
}, { immediate: true })

watch(localInput, (newVal) => {
  emit('update:modelValue', newVal)
})

watch(localPlatform, (newVal) => {
  emit('update:platform', newVal)
})
</script>

<style scoped>
.input-container :deep(.el-textarea__inner) {
  border: none;
  resize: none;
  outline: none;
  box-shadow: none;
  font-size: 15px;
  color: #1a1a1a;
}

.input-container :deep(.el-textarea__inner::placeholder) {
  color: #999;
}

.input-container :deep(.el-textarea) {
  border: none;
  box-shadow: none;
}

.platform-select :deep(.el-input__wrapper) {
  border-radius: 8px;
  border-color: #e5e5e5;
}

.platform-select :deep(.el-input__wrapper:hover) {
  border-color: #d5d5d5;
}

.platform-select :deep(.el-input__wrapper.is-focus) {
  border-color: #1a1a1a;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.04);
}

.send-btn :deep(.el-loading-spinner) {
  color: white;
}
</style>
