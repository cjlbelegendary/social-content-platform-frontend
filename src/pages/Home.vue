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
        @generate-image="handleGenerateImage"
        @regenerate-image="handleRegenerateImage"
      />

      <InputArea
        v-model="userInput"
        v-model:platform="settingsStore.currentPlatform"
        v-model:mode="generateMode"
        v-model:image-style="imageStyle"
        v-model:image-size="imageSize"
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
import { ref, onMounted, onUnmounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document } from '@element-plus/icons-vue'

import { useChatStore } from '@/stores/chat'
import { useUserStore } from '@/stores/user'
import { usePersonaStore } from '@/stores/persona'
import { useSettingsStore } from '@/stores/settings'

import LeftSidebar from '@/components/LeftSidebar.vue'
import PersonaConfig from '@/components/PersonaConfig.vue'
import MessageList from '@/components/MessageList.vue'
import InputArea from '@/components/InputArea.vue'
import { generateContentStream } from '@/api/content'
import { generateImage, regenerateImage, generateImageFromContent } from '@/api/image'

const router = useRouter()
const messageListRef = ref(null)
const userInput = ref('')
const generateMode = ref('text')
const imageStyle = ref('清新自然')
const imageSize = ref('1:1')

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

const handleSend = async (data) => {
  if (!data.input.trim()) {
    ElMessage.warning(generateMode.value === 'text' ? '请输入创作需求' : '请输入图片描述')
    return
  }

  if (data.mode === 'image') {
    await handleImageGeneration(data)
    return
  }

  chatStore.clearStreamController()

  chatStore.addUserMessage({
    content: data.input.trim(),
    platform: data.platform
  })

  const aiMsg = reactive(chatStore.addAIMessage({
    loading: true,
    isTyping: false
  }))

  const inputPrompt = data.input.trim()
  userInput.value = ''
  scrollToBottom()

  chatStore.setLoading(true)
  
  const streamData = {
    prompt: inputPrompt,
    platform: data.platform,
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

const handleImageGeneration = async (data) => {
  chatStore.clearStreamController()

  chatStore.addUserMessage({
    content: data.input.trim(),
    platform: data.platform,
    type: 'image-request'
  })

  const aiMsg = reactive(chatStore.addAIMessage({
    type: 'image',
    loading: true,
    imageLoading: true,
    imageInfo: {
      url: '',
      prompt: data.input.trim(),
      style: data.imageStyle,
      size: data.imageSize,
      width: 1024,
      height: 1024,
      platform: data.platform
    }
  }))

  userInput.value = ''
  scrollToBottom()
  chatStore.setLoading(true)

  try {
    const sessionId = chatStore.currentSessionId ? parseInt(chatStore.currentSessionId) : null
    const res = await generateImage({
      prompt: data.input.trim(),
      style: data.imageStyle,
      size: data.imageSize,
      platform: data.platform,
      session_id: sessionId
    })

    if (res.code === 200) {
      aiMsg.loading = false
      aiMsg.imageLoading = false
      aiMsg.imageInfo = {
        imageId: res.data.image_id,
        url: res.data.url,
        prompt: res.data.prompt,
        style: res.data.style,
        size: res.data.size,
        width: res.data.width,
        height: res.data.height,
        platform: data.platform
      }
      ElMessage.success('图片生成成功')
    } else {
      throw new Error(res.msg || '生成失败')
    }
  } catch (error) {
    aiMsg.loading = false
    aiMsg.imageLoading = false
    aiMsg.imageInfo.url = ''
    ElMessage.error(error.response?.data?.detail || error.message || '图片生成失败')
  } finally {
    chatStore.setLoading(false)
    scrollToBottom()
  }
}

const handleGenerateImage = async (msg) => {
  chatStore.addUserMessage({
    content: `为以下内容生成配图：${msg.content.substring(0, 50)}...`,
    platform: settingsStore.currentPlatform,
    type: 'image-request'
  })

  const aiMsg = reactive(chatStore.addAIMessage({
    type: 'image',
    loading: true,
    imageLoading: true,
    imageInfo: {
      url: '',
      prompt: msg.content,
      style: imageStyle.value,
      size: imageSize.value,
      width: 1024,
      height: 1024,
      platform: settingsStore.currentPlatform
    }
  }))

  scrollToBottom()
  chatStore.setLoading(true)

  try {
    const sessionId = chatStore.currentSessionId ? parseInt(chatStore.currentSessionId) : null
    const res = await generateImageFromContent({
      content: msg.content,
      platform: settingsStore.currentPlatform,
      style: imageStyle.value,
      size: imageSize.value,
      session_id: sessionId
    })

    if (res.code === 200) {
      aiMsg.loading = false
      aiMsg.imageLoading = false
      aiMsg.imageInfo = {
        imageId: res.data.image_id,
        url: res.data.url,
        prompt: res.data.prompt,
        style: res.data.style,
        size: res.data.size,
        width: res.data.width,
        height: res.data.height,
        platform: settingsStore.currentPlatform
      }
      ElMessage.success('配图生成成功')
    } else {
      throw new Error(res.msg || '生成失败')
    }
  } catch (error) {
    aiMsg.loading = false
    aiMsg.imageLoading = false
    aiMsg.imageInfo.url = ''
    ElMessage.error(error.response?.data?.detail || error.message || '配图生成失败')
  } finally {
    chatStore.setLoading(false)
    scrollToBottom()
  }
}

const handleRegenerateImage = async (imageInfo) => {
  chatStore.setLoading(true)
  
  try {
    const res = await regenerateImage({
      image_id: imageInfo.imageId,
      prompt: imageInfo.prompt,
      style: imageInfo.style,
      size: imageInfo.size
    })

    if (res.code === 200) {
      const currentMsg = chatStore.currentMessages.find(m => 
        m.type === 'image' && m.imageInfo?.imageId === imageInfo.imageId
      )
      
      if (currentMsg) {
        currentMsg.imageInfo.url = res.data.url
        currentMsg.imageInfo.imageId = res.data.image_id
        ElMessage.success('图片已重新生成')
      }
    } else {
      throw new Error(res.msg || '重新生成失败')
    }
  } catch (error) {
    ElMessage.error(error.response?.data?.detail || error.message || '图片重新生成失败')
  } finally {
    chatStore.setLoading(false)
  }
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
    handleSend({
      input: userMsg.content,
      platform: userMsg.platform,
      mode: 'text'
    })
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
