<template>
  <div class="p-4 px-6 bg-white">
    <div class="max-w-[1000px] mx-auto">
      <slot name="persona-config"></slot>
      
      <div class="input-container rounded-[20px] border border-gray-200 hover:border-gray-300 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 transition-all duration-200 bg-white p-4">
        <el-input 
          v-model="localInput" 
          type="textarea" 
          :rows="3" 
          placeholder="输入你的创作需求（例如：春日野餐、职场穿搭、节日祝福）..."
          @keydown.enter.ctrl="handleSend"
        />
        <div class="flex justify-between items-center gap-3 mt-3">
          <span class="text-xs text-gray-500">Ctrl+Enter 发送</span>
          <div class="flex items-center gap-3">
            <span class="text-sm text-gray-600 font-medium">适配平台：</span>
            <el-select v-model="localPlatform" placeholder="选择平台" size="small" style="width:100px;">
              <el-option label="小红书" value="小红书" />
              <el-option label="微博" value="微博" />
              <el-option label="朋友圈" value="朋友圈" />
              <el-option label="抖音" value="抖音" />
            </el-select>
            <el-button 
              size="large" 
              :loading="loading" 
              @click="handleSend" 
              class="rounded-full px-7 font-medium bg-blue-500 hover:bg-blue-600 text-white border-none transition-all duration-200"
            >
              <el-icon>
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
}

.input-container :deep(.el-textarea) {
  border: none;
  box-shadow: none;
}
</style>
