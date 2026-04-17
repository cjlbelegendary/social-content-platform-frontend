<template>
  <div class="flex-1 overflow-y-auto p-6 bg-white" ref="messagesRef">
    <div class="max-w-3xl mx-auto">
      <div v-if="messages.length === 0" class="text-center py-20 px-5">
        <div class="text-gray-500 mb-5">
          <el-icon :size="80">
            <MagicStick />
          </el-icon>
        </div>
        <h2 class="text-2xl font-medium text-gray-800 mb-2">开始你的创作之旅</h2>
        <p class="text-gray-600 mb-7">输入你的创作需求，我会为你生成适配平台的优质内容</p>
        <div class="flex flex-wrap gap-2 justify-center">
          <el-tag 
            v-for="prompt in quickPrompts" 
            :key="prompt" 
            class="cursor-pointer transition-all duration-200 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 hover:text-gray-800 hover:-translate-y-0.5" 
            @click="$emit('use-prompt', prompt)"
          >
            {{ prompt }}
          </el-tag>
        </div>
      </div>

      <div v-for="(msg, index) in messages" :key="index" class="flex gap-3 mb-6" :class="{'flex-row-reverse': msg.role === 'user'}">
        <div class="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-base flex-shrink-0" :class="{'bg-gray-300 text-gray-700': msg.role === 'user'}">
          <el-icon v-if="msg.role === 'user'">
            <User />
          </el-icon>
          <el-icon v-else>
            <ChatDotRound />
          </el-icon>
        </div>
        <div class="max-w-[80%]">
          <div class="p-4 rounded-[12px] mb-1" :class="{'bg-gray-200': msg.role === 'user', 'bg-white': msg.role === 'ai'}">
            <template v-if="msg.role === 'user'">
              <div class="flex items-center gap-2">
                <div class="flex-1 text-base leading-relaxed text-gray-800">{{ msg.content }}</div>
                <el-tag size="small" class="bg-gray-300 text-gray-700 border-none">{{ msg.platform }}</el-tag>
              </div>
            </template>
            <template v-else>
              <div v-if="msg.loading" class="flex gap-1.5 py-2">
                <span class="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style="animation-delay: -0.32s"></span>
                <span class="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style="animation-delay: -0.16s"></span>
                <span class="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></span>
              </div>
              <div v-else class="text-base leading-relaxed text-gray-800">
                <MarkdownRenderer v-if="enableMarkdown && !msg.isTyping" :content="msg.displayContent" />
                <div v-else class="whitespace-pre-wrap mb-3">{{ msg.displayContent }}</div>
                <div class="flex gap-3 pt-2 border-t border-gray-100">
                  <el-button size="small" link @click="$emit('copy', msg.content)" class="text-sm text-gray-600 hover:text-gray-800">
                    <el-icon>
                      <DocumentCopy />
                    </el-icon>
                    复制内容
                  </el-button>
                  <el-button size="small" link @click="$emit('regenerate', msg)" class="text-sm text-gray-600 hover:text-gray-800">
                    <el-icon>
                      <Refresh />
                    </el-icon>
                    重新生成
                  </el-button>
                </div>
              </div>
            </template>
          </div>
          <div class="text-xs text-gray-500 px-1">{{ msg.time }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'
import { MagicStick, User, ChatDotRound, DocumentCopy, Refresh } from '@element-plus/icons-vue'
import MarkdownRenderer from './MarkdownRenderer.vue'

const props = defineProps({
  messages: Array,
  enableMarkdown: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['use-prompt', 'copy', 'regenerate'])

const messagesRef = ref(null)

const quickPrompts = [
  '春日野餐文案',
  '职场穿搭分享',
  '生日祝福文案',
  '周末出游攻略',
  '美食探店推荐'
]

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    }
  })
}

watch(() => props.messages, () => {
  scrollToBottom()
}, { deep: true })

defineExpose({
  scrollToBottom
})
</script>
