<template>
  <div class="flex-1 overflow-y-auto p-6 bg-[#fafafa]" ref="messagesRef">
    <div class="max-w-3xl mx-auto">
      <div v-if="messages.length === 0" class="text-center py-20 px-5">
        <div class="w-20 h-20 mx-auto mb-6 bg-[#1a1a1a] rounded-2xl flex items-center justify-center text-white">
          <svg class="w-10 h-10" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h2 class="text-2xl font-semibold text-[#1a1a1a] mb-3">开始你的创作之旅</h2>
        <p class="text-[#666] mb-8">输入你的创作需求，我会为你生成适配平台的优质内容</p>
        <div class="flex flex-wrap gap-2 justify-center">
          <el-tag 
            v-for="prompt in quickPrompts" 
            :key="prompt" 
            class="cursor-pointer transition-all duration-200 px-4 py-2 text-sm bg-white border border-[#e5e5e5] text-[#666] hover:border-[#1a1a1a] hover:text-[#1a1a1a] hover:-translate-y-0.5 hover:shadow-sm rounded-xl" 
            @click="$emit('use-prompt', prompt)"
          >
            {{ prompt }}
          </el-tag>
        </div>
      </div>

      <div v-for="(msg, index) in messages" :key="index" class="flex gap-3 mb-6" :class="{'flex-row-reverse': msg.role === 'user'}">
        <div class="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0" :class="msg.role === 'user' ? 'bg-[#e5e5e5] text-[#333]' : 'bg-white border border-[#e5e5e5] text-[#666]'">
          <el-icon v-if="msg.role === 'user'">
            <User />
          </el-icon>
          <el-icon v-else>
            <ChatDotRound />
          </el-icon>
        </div>
        <div class="max-w-[80%]">
          <div class="p-4 rounded-2xl mb-1" :class="msg.role === 'user' ? 'bg-[#f0f0f0] text-[#333]' : 'bg-white border border-[#e5e5e5]'">
            <template v-if="msg.role === 'user'">
              <div class="flex items-center gap-2">
                <div class="flex-1 text-base leading-relaxed">{{ msg.content }}</div>
                <el-tag size="small" class="bg-white text-[#666] border-[#e5e5e5]">{{ msg.platform }}</el-tag>
              </div>
            </template>
            <template v-else>
              <div v-if="msg.loading" class="flex gap-1.5 py-2">
                <span class="w-2 h-2 rounded-full bg-[#999] animate-pulse" style="animation-delay: -0.32s"></span>
                <span class="w-2 h-2 rounded-full bg-[#999] animate-pulse" style="animation-delay: -0.16s"></span>
                <span class="w-2 h-2 rounded-full bg-[#999] animate-pulse"></span>
              </div>
              
              <template v-else-if="msg.type === 'image'">
                <ImageMessage 
                  :image-info="msg.imageInfo" 
                  :loading="msg.imageLoading"
                  @preview="handlePreview(msg.imageInfo)"
                  @regenerate="$emit('regenerate', msg)"
                />
              </template>
              
              <div v-else class="text-base leading-relaxed text-[#1a1a1a]">
                <MarkdownRenderer v-if="enableMarkdown && !msg.isTyping" :content="msg.displayContent" />
                <div v-else class="whitespace-pre-wrap mb-3">{{ msg.displayContent }}</div>
                <div class="flex gap-3 pt-3 border-t border-[#e5e5e5]">
                  <el-button size="small" link @click="$emit('copy', msg.content)" class="text-sm text-[#666] hover:text-[#1a1a1a]">
                    <el-icon class="mr-1">
                      <DocumentCopy />
                    </el-icon>
                    复制内容
                  </el-button>
                  <el-button size="small" link @click="$emit('regenerate', msg)" class="text-sm text-[#666] hover:text-[#1a1a1a]">
                    <el-icon class="mr-1">
                      <Refresh />
                    </el-icon>
                    重新生成
                  </el-button>
                  <el-button size="small" link @click="$emit('generate-image', msg)" class="text-sm text-[#666] hover:text-[#1a1a1a]">
                    <el-icon class="mr-1">
                      <Picture />
                    </el-icon>
                    生成配图
                  </el-button>
                </div>
              </div>
            </template>
          </div>
          <div class="text-xs text-[#999] px-1">{{ msg.time }}</div>
        </div>
      </div>
    </div>
    
    <ImagePreview 
      v-model="showPreview" 
      :image-info="previewImageInfo"
      :loading="previewLoading"
      :regenerating="previewRegenerating"
      @regenerate="handlePreviewRegenerate"
    />
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'
import { User, ChatDotRound, DocumentCopy, Refresh, Picture } from '@element-plus/icons-vue'
import MarkdownRenderer from './MarkdownRenderer.vue'
import ImageMessage from './ImageMessage.vue'
import ImagePreview from './ImagePreview.vue'

const props = defineProps({
  messages: Array,
  enableMarkdown: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['use-prompt', 'copy', 'regenerate', 'generate-image', 'preview-image', 'regenerate-image'])

const messagesRef = ref(null)

const quickPrompts = [
  '春日野餐文案',
  '职场穿搭分享',
  '生日祝福文案',
  '周末出游攻略',
  '美食探店推荐'
]

const showPreview = ref(false)
const previewImageInfo = ref({})
const previewLoading = ref(false)
const previewRegenerating = ref(false)

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    }
  })
}

const handlePreview = (imageInfo) => {
  previewImageInfo.value = imageInfo
  showPreview.value = true
}

const handlePreviewRegenerate = () => {
  emit('regenerate-image', previewImageInfo.value)
}

watch(() => props.messages, () => {
  scrollToBottom()
}, { deep: true })

defineExpose({
  scrollToBottom
})
</script>
