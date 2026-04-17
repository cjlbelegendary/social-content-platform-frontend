<template>
  <div class="flex h-screen bg-[#fafafa]">
    <LeftSidebar
      :is-admin="userStore.isAdminUser"
      :chat-history="chatStore.chatHistory"
      :current-index="chatStore.currentChatIndex"
      :loading="chatStore.loadingHistory"
      @new-chat="startNewChat"
      @navigate="handleNavigate"
      @switch-chat="handleSwitchChat"
      @use-hotspot="useHotspot"
      @logout="handleLogout"
    />

    <div class="flex-1 flex flex-col bg-white">
      <div class="h-14 px-6 bg-white border-b border-[#e5e5e5] flex justify-between items-center">
        <div class="flex flex-col justify-center items-center flex-1">
          <div class="text-base font-semibold text-[#1a1a1a]">{{ chatStore.currentTitle }}</div>
          <div class="text-xs text-[#999]">内容由AI生成</div>
        </div>
        <div class="flex items-center gap-2 px-4 py-2 bg-[#fafafa] rounded-xl border border-[#e5e5e5]">
          <el-icon class="text-[#666]"><Document /></el-icon>
          <span class="text-sm text-[#666]">Markdown</span>
          <el-switch 
            v-model="settingsStore.enableMarkdown" 
            size="small"
            style="--el-switch-on-color: #1a1a1a"
          />
        </div>
      </div>

      <MessageList
        ref="messageListRef"
        :messages="chatStore.currentMessages"
        :enable-markdown="settingsStore.enableMarkdown"
        @use-prompt="useQuickPrompt"
        @copy="copyContent"
        @regenerate="regenerateContent"
      />

      <InputArea
        v-model="userInput"
        v-model:platform="settingsStore.currentPlatform"
        :loading="chatStore.loading"
        @send="handleSend"
      >
        <template #persona-config>
          <PersonaConfig />
        </template>
      </InputArea>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document } from '@element-plus/icons-vue'
import { reactive } from 'vue'

import { useChatStore } from '@/stores/chat'
import { useUserStore } from '@/stores/user'
import { usePersonaStore } from '@/stores/persona'
import { useSettingsStore } from '@/stores/settings'

import LeftSidebar from '@/components/LeftSidebar.vue'
import PersonaConfig from '@/components/PersonaConfig.vue'
import MessageList from '@/components/MessageList.vue'
import InputArea from '@/components/InputArea.vue'
import { generateContentStream } from '@/api/content'

const router = useRouter()
const messageListRef = ref(null)
const userInput = ref('')

const chatStore = useChatStore()
const userStore = useUserStore()
const personaStore = usePersonaStore()
const settingsStore = useSettingsStore()

const scrollToBottom = () => {
  if (messageListRef.value) {
    messageListRef.value.scrollToBottom()
  }
}

const handleNavigate = (page) => {
  const routes = {
    'content-list': '/content-list',
    'user-list': '/admin/user-list',
    'schedule': '/schedule'
  }
  if (routes[page]) {
    router.push(routes[page])
  }
}

const handleSend = async () => {
  if (!userInput.value.trim()) {
    ElMessage.warning('请输入创作需求')
    return
  }

  chatStore.clearStreamController()

  chatStore.addUserMessage({
    content: userInput.value.trim(),
    platform: settingsStore.currentPlatform
  })

  const aiMsg = reactive(chatStore.addAIMessage({
    loading: true,
    isTyping: false
  }))

  const inputPrompt = userInput.value.trim()
  userInput.value = ''
  scrollToBottom()

  chatStore.setLoading(true)
  
  const streamData = {
    prompt: inputPrompt,
    platform: settingsStore.currentPlatform,
    title: inputPrompt,
    session_id: chatStore.currentSessionId,
    persona: personaStore.personaObject
  }

  let fullContent = ''
  let displayLength = 0

  const animate = () => {
    const remaining = fullContent.length - displayLength
    
    if (remaining <= 0) {
      aiMsg.isTyping = false
      chatStore.setAnimationFrame(null)
      return
    }
    
    if (!aiMsg.isTyping) {
      aiMsg.isTyping = true
    }
    
    const speed = Math.max(1, Math.min(remaining, 10))
    displayLength += speed
    aiMsg.displayContent = fullContent.substring(0, displayLength)
    scrollToBottom()
    
    chatStore.setAnimationFrame(requestAnimationFrame(animate))
  }

  const controller = generateContentStream(
    streamData,
    (data) => { 
      if (data.code === 200) {
        if (data.content) {
          fullContent += data.content
          aiMsg.content = fullContent
          aiMsg.loading = false
          
          if (!chatStore.animationFrame) {
            animate()
          }
        }
      } else {
        ElMessage.error(data.msg || '生成失败')
        aiMsg.loading = false
        aiMsg.content = '生成失败，请稍后重试'
        aiMsg.displayContent = aiMsg.content
        chatStore.setLoading(false)
        chatStore.setStreamController(null)
      }
    },
    (error) => {
      ElMessage.error('生成异常，请稍后重试')
      aiMsg.loading = false
      aiMsg.content = '生成异常，请稍后重试'
      aiMsg.displayContent = aiMsg.content
      console.error('生成异常：', error)
      chatStore.setLoading(false)
      chatStore.setStreamController(null)
    },
    async (data) => {
      displayLength = fullContent.length
      aiMsg.displayContent = fullContent
      aiMsg.loading = false
      aiMsg.isTyping = false
      scrollToBottom()
      
      if (chatStore.animationFrame) {
        cancelAnimationFrame(chatStore.animationFrame)
        chatStore.setAnimationFrame(null)
      }
      
      if (fullContent) {
        await chatStore.loadSessionListOnly()
      }
      chatStore.setLoading(false)
      chatStore.setStreamController(null)
    }
  )
  
  chatStore.setStreamController(controller)
}

const useQuickPrompt = (prompt) => {
  userInput.value = prompt
}

const useHotspot = (hotspot) => {
  const content = `基于热点：【${hotspot.title}】
关键词：${hotspot.keywords}
请生成一篇适合${personaStore.domain || '社交平台'}的社交文案`
  userInput.value = content
  ElMessage.success('已填入输入框')
}

const copyContent = (content) => {
  navigator.clipboard.writeText(content).then(() => {
    ElMessage.success('内容已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败，请手动复制')
  })
}

const regenerateContent = (msg) => {
  const messages = chatStore.currentMessages
  const msgIndex = messages.indexOf(msg)
  const userMsgIndex = messages.findIndex((m, i) => m.role === 'user' && i < msgIndex)
  
  if (userMsgIndex !== -1) {
    const userMsg = messages[userMsgIndex]
    userInput.value = userMsg.content
    settingsStore.setPlatform(userMsg.platform)
    chatStore.currentMessages = messages.slice(0, userMsgIndex + 1)
    handleSend()
  }
}

const startNewChat = () => {
  chatStore.startNewChat()
  userInput.value = ''
}

const handleSwitchChat = async (index) => {
  await chatStore.switchChat(index)
  scrollToBottom()
}

const handleLogout = () => {
  ElMessageBox.confirm(
    '确定要退出登录吗？',
    '提示',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    userStore.logout()
    router.push('/login')
    ElMessage.success('已退出登录')
  })
}

onMounted(async () => {
  await userStore.checkAdminStatus()
  await chatStore.loadHistory()
  scrollToBottom()
})

onUnmounted(() => {
  chatStore.clearStreamController()
})
</script>
