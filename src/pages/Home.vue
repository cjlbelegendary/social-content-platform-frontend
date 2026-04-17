<template>
  <div class="flex h-screen bg-gray-100">
    <LeftSidebar
      :is-admin="isAdmin"
      :chat-history="chatHistory"
      :current-index="currentChatIndex"
      :loading="loadingHistory"
      @new-chat="startNewChat"
      @navigate="handleNavigate"
      @switch-chat="switchChat"
      @use-hotspot="useHotspot"
      @logout="handleLogout"
    />

    <div class="flex-1 flex flex-col bg-white">
      <div class="p-3 px-6 bg-white border-b border-gray-200 flex justify-between items-center">
        <div class="flex flex-col justify-center items-center flex-1">
          <div class="text-base font-medium text-gray-800">{{ currentTitle }}</div>
          <div class="text-xs text-gray-500">内容由ai生成</div>
        </div>
        <div class="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
          <el-icon class="text-gray-600"><Document /></el-icon>
          <span class="text-sm text-gray-600">Markdown</span>
          <el-switch v-model="enableMarkdown" size="small" />
        </div>
      </div>

      <MessageList
        ref="messageListRef"
        :messages="currentMessages"
        :enable-markdown="enableMarkdown"
        @use-prompt="useQuickPrompt"
        @copy="copyContent"
        @regenerate="regenerateContent"
      />

      <InputArea
        v-model="userInput"
        v-model:platform="currentPlatform"
        :loading="loading"
        @send="handleSend"
      >
        <template #persona-config>
          <PersonaConfig v-model="personaForm" />
        </template>
      </InputArea>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document } from '@element-plus/icons-vue'
import LeftSidebar from '@/components/LeftSidebar.vue'
import PersonaConfig from '@/components/PersonaConfig.vue'
import MessageList from '@/components/MessageList.vue'
import InputArea from '@/components/InputArea.vue'
import { generateContentStream, getSessions, getSessionDetail } from '@/api/content'
import { validateAdmin } from '@/api/admin'
import { removeToken } from '@/utils/auth'

const router = useRouter()
const messageListRef = ref(null)

const currentPlatform = ref('小红书')
const userInput = ref('')
const loading = ref(false)
const currentChatIndex = ref(-1)
const chatHistory = ref([])
const currentMessages = ref([])
const loadingHistory = ref(false)
const sessions = ref([])
const isAdmin = ref(false)
const enableMarkdown = ref(true)
const personaForm = reactive({
  domain: '',
  style: '',
  tone: ''
})

let streamController = null
let animationFrame = null

const currentTitle = computed(() => {
  return currentChatIndex.value >= 0 && chatHistory.value.length > 0 
    ? chatHistory.value[currentChatIndex.value].title 
    : '社交内容创作助手'
})

const formatTime = (timeStr = '') => {
  if (!timeStr) {
    const now = new Date()
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
  }
  return timeStr.split(' ')[1]?.substring(0, 5) || timeStr
}

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

const checkAdminStatus = async () => {
  try {
    const response = await validateAdmin(false)
    if (response.code === 200 && response.admin_info.is_admin) {
      isAdmin.value = true
    } else {
      isAdmin.value = false
    }
  } catch (error) {
    isAdmin.value = false
  }
}

const loadHistoryFromBackend = async () => {
  loadingHistory.value = true
  try {
    const res = await getSessions()
    if (res.code === 200 && res.session_list) {
      sessions.value = res.session_list
      
      const transformedHistory = []
      res.session_list.forEach(session => {
        transformedHistory.push({
          id: session.session_id,
          title: session.session_title,
          time: formatTime(session.update_time),
          session_id: session.session_id,
          messages: []
        })
      })
      chatHistory.value = transformedHistory

      if (chatHistory.value.length > 0) {
        currentChatIndex.value = 0
        await loadSessionDetail(chatHistory.value[0].session_id)
      }
    } else {
      chatHistory.value = []
      currentMessages.value = []
    }
  } catch (error) {
    console.error('加载历史对话失败：', error)
    ElMessage.warning('加载历史创作失败，仅显示新创作内容')
    chatHistory.value = []
  } finally {
    loadingHistory.value = false
  }
}

const loadSessionDetail = async (sessionId) => {
  try {
    const res = await getSessionDetail(sessionId)
    if (res.code === 200 && res.session) {
      const session = res.session
      const messages = []
      session.contents.forEach(content => {
        messages.push({
          role: 'user',
          content: content.title,
          platform: content.platform,
          time: formatTime(content.create_time),
          originalTime: content.create_time
        })
        messages.push({
          role: 'ai',
          content: content.content,
          displayContent: content.content,
          loading: false,
          time: formatTime(content.create_time),
          originalTime: content.create_time
        })
      })
      messages.sort((a, b) => new Date(a.originalTime) - new Date(b.originalTime))
      currentMessages.value = messages
      scrollToBottom()
    }
  } catch (error) {
    console.error('加载会话详情失败：', error)
    ElMessage.warning('加载会话详情失败')
  }
}

const handleSend = async () => {
  if (!userInput.value.trim()) {
    ElMessage.warning('请输入创作需求')
    return
  }

  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
    animationFrame = null
  }
  if (streamController) {
    streamController.abort()
    streamController = null
  }

  const now = new Date().toISOString()
  
  const userMsg = {
    role: 'user',
    content: userInput.value.trim(),
    platform: currentPlatform.value,
    time: formatTime(),
    originalTime: now
  }
  currentMessages.value.push(userMsg)

  const aiMsg = reactive({
    role: 'ai',
    content: '',
    displayContent: '',
    loading: true,
    isTyping: false,
    time: formatTime(),
    originalTime: now
  })
  currentMessages.value.push(aiMsg)

  const inputPrompt = userInput.value.trim()
  userInput.value = ''
  scrollToBottom()

  loading.value = true
  
  const currentChat = chatHistory.value[currentChatIndex.value]
  const sessionId = currentChat ? currentChat.session_id : null
  
  const streamData = {
    prompt: inputPrompt,
    platform: currentPlatform.value,
    title: inputPrompt,
    session_id: sessionId,
    persona: {
      domain: personaForm.domain,
      style: personaForm.style,
      tone: personaForm.tone
    }
  }

  let fullContent = ''
  let displayLength = 0

  const animate = () => {
    const remaining = fullContent.length - displayLength
    
    if (remaining <= 0) {
      aiMsg.isTyping = false
      animationFrame = null
      return
    }
    
    if (!aiMsg.isTyping) {
      aiMsg.isTyping = true
    }
    
    const speed = Math.max(1, Math.min(remaining, 10))
    displayLength += speed
    aiMsg.displayContent = fullContent.substring(0, displayLength)
    scrollToBottom()
    
    animationFrame = requestAnimationFrame(animate)
  }

  streamController = generateContentStream(
    streamData,
    (data) => { 
      if (data.code === 200) {
        if (data.content) {
          fullContent += data.content
          aiMsg.content = fullContent
          aiMsg.loading = false
          
          if (!animationFrame) {
            animate()
          }
        }
      } else {
        ElMessage.error(data.msg || '生成失败')
        aiMsg.loading = false
        aiMsg.content = '生成失败，请稍后重试'
        aiMsg.displayContent = aiMsg.content
        loading.value = false
        streamController = null
      }
    },
    (error) => {
      ElMessage.error('生成异常，请稍后重试')
      aiMsg.loading = false
      aiMsg.content = '生成异常，请稍后重试'
      aiMsg.displayContent = aiMsg.content
      console.error('生成异常：', error)
      loading.value = false
      streamController = null
    },
    (data) => {
      displayLength = fullContent.length
      aiMsg.displayContent = fullContent
      aiMsg.loading = false
      aiMsg.isTyping = false
      scrollToBottom()
      
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
        animationFrame = null
      }
      
      if (fullContent) {
        loadSessionListOnly()
        currentChatIndex.value = 0
      }
      loading.value = false
      streamController = null
    }
  )
}

const loadSessionListOnly = async () => {
  try {
    const res = await getSessions()
    if (res.code === 200 && res.session_list) {
      sessions.value = res.session_list
      
      const transformedHistory = []
      res.session_list.forEach(session => {
        transformedHistory.push({
          id: session.session_id,
          title: session.session_title,
          time: formatTime(session.update_time),
          session_id: session.session_id,
          messages: []
        })
      })
      chatHistory.value = transformedHistory
    }
  } catch (error) {
    console.error('加载会话列表失败：', error)
  }
}

const useQuickPrompt = (prompt) => {
  userInput.value = prompt
}

const useHotspot = (hotspot) => {
  const content = `基于热点：【${hotspot.title}】
关键词：${hotspot.keywords}
请生成一篇适合${personaForm.domain || '社交平台'}的社交文案`
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
  const userMsgIndex = currentMessages.value.findIndex(m => m.role === 'user' && currentMessages.value.indexOf(m) < currentMessages.value.indexOf(msg))
  if (userMsgIndex !== -1) {
    const userMsg = currentMessages.value[userMsgIndex]
    userInput.value = userMsg.content
    currentPlatform.value = userMsg.platform
    currentMessages.value = currentMessages.value.slice(0, userMsgIndex + 1)
    handleSend()
  }
}

const startNewChat = () => {
  currentChatIndex.value = -1
  currentMessages.value = []
  userInput.value = ''
}

const switchChat = async (index) => {
  currentChatIndex.value = index
  const sessionId = chatHistory.value[index].session_id
  await loadSessionDetail(sessionId)
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
    removeToken()
    router.push('/login')
    ElMessage.success('已退出登录')
  })
}

onMounted(() => {
  loadHistoryFromBackend()
  checkAdminStatus()
  scrollToBottom()
})

onUnmounted(() => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
    animationFrame = null
  }
  if (streamController) {
    streamController.abort()
    streamController = null
  }
})
</script>
