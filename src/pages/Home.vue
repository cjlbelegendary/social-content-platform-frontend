<template>
  <div class="flex h-screen bg-gradient-to-br from-primary to-secondary">
    <!-- 测试Tailwind CSS -->
    <div class="fixed top-0 left-0 test-tailwind">Tailwind CSS Test</div>
    <!-- 左侧：历史记录栏 -->
    <div class="w-[280px] bg-white/95 backdrop-blur-md border-r border-gray-100 flex flex-col">
      <div class="p-5 border-b border-gray-100 flex justify-between items-center">
        <h3 class="text-base font-medium text-gray-800">创作历史</h3>
        <el-button type="primary" size="small" @click="startNewChat">
          <el-icon>
            <Plus />
          </el-icon>
          新创作
        </el-button>
      </div>
      <div class="flex-1 overflow-y-auto p-2.5">
        <!-- 加载状态提示 -->
        <div v-if="loadingHistory" class="p-4">
          <el-skeleton :rows="3" animated />
        </div>
        <!-- 无历史记录提示 -->
        <div v-else-if="chatHistory.length === 0" class="p-4">
          <el-empty description="暂无创作历史，开始你的第一次创作吧～" />
        </div>
        <!-- 历史列表 -->
        <div v-else v-for="(chat, index) in chatHistory" :key="chat.id || index" 
             class="p-3.5 rounded-lg mb-2.5 cursor-pointer transition-all duration-300 bg-gray-50 hover:bg-blue-50 hover:translate-x-1.5"
             :class="{'bg-gradient-to-r from-primary to-secondary text-white': currentChatIndex === index}" 
             @click="switchChat(index)">
          <div class="flex items-center gap-2 text-sm font-medium mb-1.5">
            <el-icon>
              <Document />
            </el-icon>
            {{ chat.title }}
          </div>
          <div class="text-xs opacity-70">{{ chat.time }}</div>
        </div>
      </div>
    </div>

    <!-- 右侧：对话主界面 -->
    <div class="flex-1 flex flex-col bg-white/90 backdrop-blur-md">
      <!-- 顶部栏 -->
      <div class="p-3.5 px-6 bg-white border-b border-gray-100 flex justify-between items-center shadow-sm">
        <div class="flex items-center gap-3.5">
          <div class="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xl">
            <el-icon>
              <ChatDotRound />
            </el-icon>
          </div>
          <div>
            <h3 class="text-base font-medium text-gray-800">社交内容创作助手</h3>
            <span class="text-xs text-green-600 flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-green-600"></span>
              在线
            </span>
          </div>
        </div>
        <div class="flex items-center gap-3.5">
          <el-button type="danger" size="small" @click="handleLogout">
            退出登录
          </el-button>
        </div>
      </div>

      <!-- 对话消息区 -->
      <div class="flex-1 overflow-y-auto p-7 bg-gray-50" ref="messagesRef">
        <div v-if="currentMessages.length === 0" class="text-center py-20 px-5">
          <div class="text-primary mb-5">
            <el-icon :size="80">
              <MagicStick />
            </el-icon>
          </div>
          <h2 class="text-2xl font-medium text-gray-800 mb-2.5">开始你的创作之旅</h2>
          <p class="text-gray-600 mb-7.5">输入你的创作需求，我会为你生成适配平台的优质内容</p>
          <div class="flex flex-wrap gap-2.5 justify-center">
            <el-tag v-for="prompt in quickPrompts" :key="prompt" class="cursor-pointer transition-all duration-300 px-3.5 py-2 text-sm hover:bg-gradient-to-r hover:from-primary hover:to-secondary hover:text-white hover:-translate-y-0.5" @click="useQuickPrompt(prompt)">
              {{ prompt }}
            </el-tag>
          </div>
        </div>

        <div v-for="(msg, index) in currentMessages" :key="index" class="flex gap-3.5 mb-7.5" :class="{'flex-row-reverse': msg.role === 'user'}">
          <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-primary text-lg flex-shrink-0" :class="{'bg-gradient-to-br from-primary to-secondary text-white': msg.role === 'user'}">
            <el-icon v-if="msg.role === 'user'">
              <User />
            </el-icon>
            <el-icon v-else>
              <ChatDotRound />
            </el-icon>
          </div>
          <div class="max-w-[70%]">
            <div class="bg-white p-3 rounded-xl shadow-sm mb-2" :class="{'bg-gradient-to-br from-primary to-secondary text-white': msg.role === 'user'}">
              <!-- 用户消息 -->
              <template v-if="msg.role === 'user'">
                <div class="flex items-center gap-2.5">
                  <div class="flex-1 text-base leading-relaxed">{{ msg.content }}</div>
                  <el-tag size="small" type="info">{{ msg.platform }}</el-tag>
                </div>
              </template>
              <!-- AI消息（打字机效果） -->
              <template v-else>
                <div v-if="msg.loading" class="flex gap-1.5 py-2.5">
                  <span class="w-2 h-2 rounded-full bg-primary animate-pulse" style="animation-delay: -0.32s"></span>
                  <span class="w-2 h-2 rounded-full bg-primary animate-pulse" style="animation-delay: -0.16s"></span>
                  <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                </div>
                <div v-else class="text-base leading-relaxed text-gray-800">
                  <div class="whitespace-pre-wrap mb-3.5">{{ msg.displayContent }}</div>
                  <div class="flex gap-3.5 pt-2.5 border-t border-gray-100">
                    <el-button type="primary" size="small" link @click="copyContent(msg.content)">
                      <el-icon>
                        <DocumentCopy />
                      </el-icon>
                      复制内容
                    </el-button>
                    <el-button type="success" size="small" link @click="regenerateContent(msg)">
                      <el-icon>
                        <Refresh />
                      </el-icon>
                      重新生成
                    </el-button>
                  </div>
                </div>
              </template>
            </div>
            <div class="text-xs text-gray-500 px-1.5">{{ msg.time }}</div>
          </div>
        </div>
      </div>

      <!-- 底部输入区 -->
      <div class="p-5 px-7 bg-white border-t border-gray-100">
        <div class="max-w-[1000px] mx-auto">
          <el-input v-model="userInput" type="textarea" :rows="3" placeholder="输入你的创作需求（例如：春日野餐、职场穿搭、节日祝福）..."
            @keydown.enter.ctrl="handleSend" class="mb-3.5" />
          <div class="flex justify-between items-center gap-3.5">
            <span class="text-xs text-gray-500">Ctrl+Enter 发送</span>
            <div class="flex items-center gap-3.5">
              <span class="text-sm text-gray-600 font-medium">适配平台：</span>
              <el-select v-model="currentPlatform" placeholder="选择平台" size="small" style="width:100px;">
                <el-option label="小红书" value="小红书" />
                <el-option label="微博" value="微博" />
                <el-option label="朋友圈" value="朋友圈" />
                <el-option label="抖音" value="抖音" />
              </el-select>
              <el-button type="primary" size="large" :loading="loading" @click="handleSend" class="rounded-full px-7.5 font-medium bg-gradient-to-r from-primary to-secondary border-none hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/40 transition-all duration-300">
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
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Document,
  ChatDotRound,
  MagicStick,
  User,
  DocumentCopy,
  Refresh,
  Promotion
} from '@element-plus/icons-vue'
import { generateContent, generateContentStream, getSessions, getSessionDetail } from '@/api/content' // 导入getSessions、getSessionDetail和generateContentStream
import { removeToken } from '@/utils/auth'

const router = useRouter()
const messagesRef = ref(null)

// 状态管理
const currentPlatform = ref('小红书')
const userInput = ref('')
const loading = ref(false)
const currentChatIndex = ref(-1)
const chatHistory = ref([]) // 存储后端返回的历史对话
const currentMessages = ref([]) // 当前显示的对话消息
const loadingHistory = ref(false) // 加载历史的loading状态
const sessions = ref([]) // 存储会话列表
let streamController = null // 流式请求控制器
let typeWriterTimeout = null // 打字机效果定时器

// 快捷提示词
const quickPrompts = [
  '春日野餐文案',
  '职场穿搭分享',
  '生日祝福文案',
  '周末出游攻略',
  '美食探店推荐'
]

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    }
  })
}

// 格式化时间（适配后端返回的时间格式）
const formatTime = (timeStr = '') => {
  if (!timeStr) {
    const now = new Date()
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
  }
  // 转换后端返回的 "2026-03-03 13:47:57" 为 "13:47"
  return timeStr.split(' ')[1]?.substring(0, 5) || timeStr
}

// 全局定时器变量
let typeWriterTimer = null

// 打字机效果（最终响应式版）
const typeWriter = (msg, content, speed = 30) => {
  if (typeWriterTimer) clearInterval(typeWriterTimer)

  msg.displayContent = ''
  let currentIndex = 0
  const contentLength = content.length

  typeWriterTimer = setInterval(() => {
    if (currentIndex < contentLength) {
      const newContent = msg.displayContent + content[currentIndex]
      msg.displayContent = newContent
      currentIndex++
      scrollToBottom()
    } else {
      clearInterval(typeWriterTimer)
      typeWriterTimer = null
    }
  }, speed)
}



// 页面卸载清理
onUnmounted(() => {
  if (typeWriterTimer) clearInterval(typeWriterTimer)
  if (typeWriterTimeout) clearTimeout(typeWriterTimeout)
  if (streamController) {
    streamController.abort()
    streamController = null
  }
})

// ========== 核心修复：从后端加载历史对话 ==========
// 转换后端数据为前端对话格式
const transformBackendData = (backendList) => {
  const history = []
  backendList.forEach(item => {
    // 构造单条历史对话（对应一次创作）
    const chatItem = {
      id: item.id, // 后端返回的内容ID
      title: item.title, // 创作标题
      time: formatTime(item.create_time), // 格式化时间
      // 构造对话消息（用户消息+AI消息）
      messages: [
        // 用户消息
        {
          role: 'user',
          content: item.title, // 创作需求=标题
          platform: item.platform, // 创作平台
          time: formatTime(item.create_time)
        },
        // AI消息
        {
          role: 'ai',
          content: item.content, // AI生成的内容
          displayContent: item.content, // 直接显示完整内容（历史记录无打字机）
          loading: false,
          time: formatTime(item.create_time)
        }
      ]
    }
    history.push(chatItem)
  })
  return history
}

// 加载后端历史对话
const loadHistoryFromBackend = async () => {
  loadingHistory.value = true
  try {
    const res = await getSessions()
    if (res.code === 200 && res.session_list) {
      // 存储会话列表
      sessions.value = res.session_list
      
      // 转换后端会话列表为前端历史对话格式
      const transformedHistory = []
      res.session_list.forEach(session => {
        const chatItem = {
          id: session.session_id,
          title: session.session_title,
          time: formatTime(session.update_time),
          session_id: session.session_id,
          messages: []
        }
        transformedHistory.push(chatItem)
      })
      chatHistory.value = transformedHistory

      // 如果有历史记录，默认选中第一条
      if (chatHistory.value.length > 0) {
        currentChatIndex.value = 0
        // 加载第一个会话的详情
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

// 加载会话详情
const loadSessionDetail = async (sessionId) => {
  try {
    const res = await getSessionDetail(sessionId)
    if (res.code === 200 && res.session) {
      const session = res.session
      // 转换会话内容为前端消息格式
      const messages = []
      session.contents.forEach(content => {
        messages.push({
          role: 'user',
          content: content.title,
          platform: content.platform,
          time: formatTime(content.create_time)
        })
        messages.push({
          role: 'ai',
          content: content.content,
          displayContent: content.content,
          loading: false,
          time: formatTime(content.create_time)
        })
      })
      currentMessages.value = messages
      scrollToBottom()
    }
  } catch (error) {
    console.error('加载会话详情失败：', error)
    ElMessage.warning('加载会话详情失败')
  }
}

// 发送消息（适配后端接口）
const handleSend = async () => {
  if (!userInput.value.trim()) {
    ElMessage.warning('请输入创作需求')
    return
  }

  if (typeWriterTimer) clearInterval(typeWriterTimer)
  if (streamController) {
    streamController.abort()
    streamController = null
  }

  // 添加用户消息
  const userMsg = {
    role: 'user',
    content: userInput.value.trim(),
    platform: currentPlatform.value,
    time: formatTime()
  }
  currentMessages.value.push(userMsg)

  // 响应式AI消息对象
  const aiMsg = {
    role: 'ai',
    content: '',
    displayContent: '',
    loading: true,
    time: formatTime()
  }
  currentMessages.value.push(aiMsg)

  // 清空输入框
  const inputPrompt = userInput.value.trim()
  userInput.value = ''
  scrollToBottom()

  loading.value = true
  
  // 获取session_id
  const currentChat = chatHistory.value[currentChatIndex.value]
  const sessionId = currentChat ? currentChat.session_id : null
  
  const streamData = {
    prompt: inputPrompt,
    platform: currentPlatform.value,
    title: inputPrompt,
    session_id: sessionId
  }

  let fullContent = ''
  let contentId = null
  let typingIndex = 0

  console.log('开始发送流式请求')
  streamController = generateContentStream(
    streamData,
    (data) => {
      console.log('收到流式数据:', data)
      if (data.code === 200) {
        if (data.content) {
          // 累积内容
          fullContent += data.content
          aiMsg.content = fullContent
          aiMsg.loading = false
          
          console.log('当前fullContent:', fullContent)
          console.log('当前typingIndex:', typingIndex)
          
          // 清除之前的定时器
          if (typeWriterTimeout) {
            clearTimeout(typeWriterTimeout)
            typeWriterTimeout = null
          }
          
          // 实现实时打字机效果
          const typeWriter = () => {
            if (typingIndex < fullContent.length) {
              aiMsg.displayContent = fullContent.substring(0, typingIndex + 1)
              typingIndex++
              scrollToBottom()
              console.log('打字中，当前displayContent:', aiMsg.displayContent)
              typeWriterTimeout = setTimeout(typeWriter, 50) // 调整打字速度
            } else {
              console.log('打字完成')
            }
          }
          
          typeWriter()
        }
        if (data.id) {
          contentId = data.id
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
      // 流式结束
      console.log('流式请求完成，内容:', fullContent)
      // 清除所有定时器
      if (typeWriterTimeout) {
        clearTimeout(typeWriterTimeout)
        typeWriterTimeout = null
      }
      if (typeWriterTimer) {
        clearInterval(typeWriterTimer)
        typeWriterTimer = null
      }
      // 确保显示完整内容
      aiMsg.content = fullContent
      aiMsg.displayContent = fullContent
      aiMsg.loading = false
      scrollToBottom()
      
      if (fullContent) {
        // 处理返回的session_id
        const returnedSessionId = data && data.session_id ? data.session_id : sessionId
        // 将新创作添加到历史列表头部
        const newChatItem = {
          id: contentId, // 后端返回的新内容ID
          title: inputPrompt.length > 15 ? inputPrompt.substring(0, 15) + '...' : inputPrompt,
          time: formatTime(),
          session_id: returnedSessionId,
          messages: [...currentMessages.value]
        }
        chatHistory.value.unshift(newChatItem)
        currentChatIndex.value = 0
        // 重新加载会话列表，确保数据同步
        loadHistoryFromBackend()
      }
      loading.value = false
      streamController = null
    }
  )
}

// 使用快捷提示词
const useQuickPrompt = (prompt) => {
  userInput.value = prompt
}

// 复制内容
const copyContent = (content) => {
  navigator.clipboard.writeText(content).then(() => {
    ElMessage.success('内容已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败，请手动复制')
  })
}

// 重新生成
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

// 开始新对话
const startNewChat = () => {
  currentChatIndex.value = -1
  currentMessages.value = []
  userInput.value = ''
}

// 切换历史对话
const switchChat = async (index) => {
  currentChatIndex.value = index
  const sessionId = chatHistory.value[index].session_id
  // 加载会话详情
  await loadSessionDetail(sessionId)
}

// 退出登录
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

// 页面加载时初始化（核心：调用后端接口加载历史）
onMounted(() => {
  // 优先加载后端历史对话
  loadHistoryFromBackend()
  scrollToBottom()
})
</script>