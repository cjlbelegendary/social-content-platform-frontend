<template>
  <div class="px-6 py-4 bg-transparent">
    <div class="max-w-[1000px] mx-auto">
      <div class="input-container rounded-2xl border border-[#e5e5e5] hover:border-[#d5d5d5] focus-within:border-[#1a1a1a] focus-within:shadow-lg transition-all duration-200 bg-white p-4 shadow-xl">
        <el-input 
          v-model="localInput" 
          type="textarea" 
          :rows="3" 
          :placeholder="localMode === 'text' ? '输入你的创作需求（例如：春日野餐、职场穿搭、节日祝福）...' : '描述你想要的图片（例如：春日野餐场景、清新自然的风格、阳光透过树叶）...'"
          @keydown.enter.ctrl="handleSend"
        />
        
        <div class="flex justify-between items-center gap-3 mt-3">
          <div class="flex items-center gap-3">
            <div class="flex gap-1 p-1 bg-[#f5f5f5] rounded-lg">
              <button 
                @click="localMode = 'text'"
                class="mode-btn px-3 py-1 rounded-md text-sm font-medium transition-all duration-200"
                :class="localMode === 'text' ? 'bg-white text-[#1a1a1a] shadow-sm' : 'text-[#999] hover:text-[#666]'"
              >
                <el-icon class="mr-1 align-middle"><EditPen /></el-icon>
                文本
              </button>
              <button 
                @click="localMode = 'image'"
                class="mode-btn px-3 py-1 rounded-md text-sm font-medium transition-all duration-200"
                :class="localMode === 'image' ? 'bg-white text-[#1a1a1a] shadow-sm' : 'text-[#999] hover:text-[#666]'"
              >
                <el-icon class="mr-1 align-middle"><Picture /></el-icon>
                图片
              </button>
            </div>
            <slot name="persona-config"></slot>
            <template v-if="localMode === 'text'">
              <span class="text-sm text-[#666]">平台：</span>
              <el-select v-model="localPlatform" placeholder="选择平台" size="small" class="platform-select w-20">
                <el-option label="小红书" value="小红书" />
                <el-option label="微博" value="微博" />
                <el-option label="朋友圈" value="朋友圈" />
                <el-option label="抖音" value="抖音" />
              </el-select>
            </template>
            
            <template v-else>
              <span class="text-sm text-[#666]">风格：</span>
              <el-select v-model="localImageStyle" placeholder="风格" size="small" class="style-select w-[100px]">
                <el-option label="清新自然" value="清新自然" />
                <el-option label="复古胶片" value="复古胶片" />
                <el-option label="简约极简" value="简约极简" />
                <el-option label="文艺柔和" value="文艺柔和" />
                <el-option label="潮流时尚" value="潮流时尚" />
                <el-option label="商务专业" value="商务专业" />
              </el-select>
              <span class="text-sm text-[#666]">尺寸：</span>
              <el-select v-model="localImageSize" placeholder="尺寸" size="small" class="size-select w-[100px]">
                <el-option label="1:1 正方形" value="1:1" />
                <el-option label="3:4 竖版" value="3:4" />
                <el-option label="4:3 横版" value="4:3" />
                <el-option label="16:9 宽屏" value="16:9" />
                <el-option label="9:16 竖长" value="9:16" />
              </el-select>
            </template>
          </div>
          
          <div class="flex items-center gap-3">
            <span class="text-xs text-[#999]">Ctrl+Enter 发送</span>
            <el-button 
              size="large" 
              :loading="loading" 
              @click="handleSend" 
              class="send-btn rounded-xl px-6 font-semibold bg-[#1a1a1a] hover:bg-[#333] text-white hover:text-gray-100 border-none transition-all duration-200 h-10"
            >
              <el-icon class="mr-1">
                <Promotion v-if="localMode === 'text'" />
                <Picture v-else />
              </el-icon>
              {{ localMode === 'text' ? '生成内容' : '生成图片' }}
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Promotion, Picture, EditPen } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: String,
  platform: String,
  mode: {
    type: String,
    default: 'text'
  },
  imageStyle: String,
  imageSize: String,
  loading: Boolean
})

const emit = defineEmits(['update:modelValue', 'update:platform', 'update:mode', 'update:imageStyle', 'update:imageSize', 'send'])

const localInput = ref('')
const localPlatform = ref('小红书')
const localMode = ref('text')
const localImageStyle = ref('清新自然')
const localImageSize = ref('1:1')

const handleSend = () => {
  if (!localInput.value.trim()) {
    return
  }
  emit('send', {
    input: localInput.value,
    platform: localPlatform.value,
    mode: localMode.value,
    imageStyle: localImageStyle.value,
    imageSize: localImageSize.value
  })
}

watch(() => props.modelValue, (newVal) => {
  localInput.value = newVal || ''
}, { immediate: true })

watch(() => props.platform, (newVal) => {
  localPlatform.value = newVal || '小红书'
}, { immediate: true })

watch(() => props.mode, (newVal) => {
  localMode.value = newVal || 'text'
}, { immediate: true })

watch(() => props.imageStyle, (newVal) => {
  localImageStyle.value = newVal || '清新自然'
}, { immediate: true })

watch(() => props.imageSize, (newVal) => {
  localImageSize.value = newVal || '1:1'
}, { immediate: true })

watch(localInput, (newVal) => {
  emit('update:modelValue', newVal)
})

watch(localPlatform, (newVal) => {
  emit('update:platform', newVal)
})

watch(localMode, (newVal) => {
  emit('update:mode', newVal)
})

watch(localImageStyle, (newVal) => {
  emit('update:imageStyle', newVal)
})

watch(localImageSize, (newVal) => {
  emit('update:imageSize', newVal)
})
</script>

<style scoped>
.mode-btn {
  display: inline-flex;
  align-items: center;
}

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

.platform-select :deep(.el-input__wrapper),
.style-select :deep(.el-input__wrapper),
.size-select :deep(.el-input__wrapper) {
  border-radius: 8px;
  border-color: #e5e5e5;
}

.platform-select :deep(.el-input__wrapper:hover),
.style-select :deep(.el-input__wrapper:hover),
.size-select :deep(.el-input__wrapper:hover) {
  border-color: #d5d5d5;
}

.platform-select :deep(.el-input__wrapper.is-focus),
.style-select :deep(.el-input__wrapper.is-focus),
.size-select :deep(.el-input__wrapper.is-focus) {
  border-color: #1a1a1a;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.04);
}

.send-btn :deep(.el-loading-spinner) {
  color: white;
}
</style>
