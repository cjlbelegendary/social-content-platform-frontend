<template>
  <div class="image-message">
    <div class="image-container relative rounded-xl overflow-hidden cursor-pointer group" @click="$emit('preview')">
      <img 
        :src="imageInfo.url" 
        :alt="imageInfo.prompt"
        class="w-full max-w-[400px] object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
        <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div class="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center">
            <el-icon class="text-[#1a1a1a]"><ZoomIn /></el-icon>
          </div>
        </div>
      </div>
      
      <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-white/90">
        <div class="text-center">
          <el-icon class="is-loading text-3xl text-[#1a1a1a] mb-2"><Loading /></el-icon>
          <p class="text-sm text-[#666]">生成中...</p>
        </div>
      </div>
    </div>
    
    <div class="mt-2 flex items-center gap-2 text-xs text-[#999]">
      <span>{{ imageInfo.style }}</span>
      <span>·</span>
      <span>{{ imageInfo.width }}×{{ imageInfo.height }}</span>
      <span v-if="imageInfo.platform">
        <span>·</span>
        <span>{{ imageInfo.platform }}</span>
      </span>
    </div>
    
    <div class="flex gap-3 mt-3 pt-3 border-t border-[#e5e5e5]">
      <el-button size="small" link @click="$emit('preview')" class="text-sm text-[#666] hover:text-[#1a1a1a]">
        <el-icon class="mr-1"><ZoomIn /></el-icon>
        预览
      </el-button>
      <el-button size="small" link @click="handleDownload" class="text-sm text-[#666] hover:text-[#1a1a1a]">
        <el-icon class="mr-1"><Download /></el-icon>
        下载
      </el-button>
      <el-button size="small" link @click="$emit('regenerate')" class="text-sm text-[#666] hover:text-[#1a1a1a]">
        <el-icon class="mr-1"><Refresh /></el-icon>
        重新生成
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { ZoomIn, Download, Refresh, Loading } from '@element-plus/icons-vue'

const props = defineProps({
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
  loading: Boolean
})

const emit = defineEmits(['preview', 'regenerate'])

const handleDownload = () => {
  const link = document.createElement('a')
  link.href = props.imageInfo.url
  link.download = `ai-image-${Date.now()}.png`
  link.click()
  ElMessage.success('图片下载成功')
}
</script>

<style scoped>
.image-container {
  background: #fafafa;
  min-height: 200px;
}

.image-container img {
  display: block;
}
</style>
