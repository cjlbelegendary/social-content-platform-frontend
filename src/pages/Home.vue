<template>
  <div class="flex h-screen bg-gray-100">
    <!-- 左侧：历史记录栏 -->
    <div class="w-[300px] bg-gray-50 border-r border-gray-200 flex flex-col shadow-sm">
      <div class="p-4 flex flex-col gap-1">
        <h3 class="text-lg font-bold text-gray-800 mb-4">🤖 社交内容生成助手</h3>
        
        <div class="flex flex-col justify-end items-end gap-2">
          <el-button size="small" @click="startNewChat" class="text-sm bg-blue-50 border-blue-100 border-1  hover:bg-blue-100 hover:border-blue-200 text-blue-400 font-bold w-full h-10 rounded-lg">
            <el-icon class="mr-2">
              <Plus />
            </el-icon>
            新创作
          </el-button>
          <el-button size="small" @click="navigateToContentList" class="text-sm rounded-lg w-full h-10 text-gray-600 hover:text-gray-800 hover:bg-gray-100 hover:border-gray-100 border-2 border-gray-100">
            <el-icon class="mr-2">
              <Document />
            </el-icon>
            历史管理
          </el-button>
          <el-button v-if="isAdmin" size="small" @click="navigateToUserList" class="text-sm rounded-lg w-full h-10 text-gray-600 hover:text-gray-800 hover:bg-gray-100 hover:border-gray-100 border-2 border-gray-100">
            <el-icon class="mr-2">
              <UserFilled />
            </el-icon>
            用户列表
          </el-button>
        </div>
      </div>
      <p class="text-xs text-gray-500 mx-4 my-2">创作历史</p>
      <div class="flex-1 overflow-y-auto p-2 pr-4 bg-gray-50">
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
             class="p-3 rounded-lg mb-2 cursor-pointer transition-all duration-200 bg-gray-50 hover:bg-gray-100 hover:translate-x-1"
             :class="{'bg-white': currentChatIndex === index}" 
             @click="switchChat(index)">
          <div class="flex items-center gap-2 text-sm font-medium mb-1" :class="{'font-bold': currentChatIndex === index}">
            <el-icon class="text-gray-500">
              <Document />
            </el-icon>
            {{ chat.title }}
          </div>
          <div class="text-xs text-gray-500" >{{ chat.time }}</div>
        </div>
      </div>
      <div class="p-4">
        <el-button @click="handleLogout" class="rounded-lg w-full h-10 text-gray-600 hover:text-gray-800 hover:bg-gray-100 hover:border-gray-100 border-2 border-gray-100 ">
          退出登录
        </el-button>
      </div>
    </div>

    <!-- 右侧：对话主界面 -->
    <div class="flex-1 flex flex-col bg-white">
      <!-- 顶部栏 -->
      <div class="p-3 px-6 bg-white border-b border-gray-200 flex flex-col justify-center items-center">
        <div class="text-base font-medium text-gray-800">{{ currentChatIndex >= 0 && chatHistory.length > 0 ? chatHistory[currentChatIndex].title : '社交内容创作助手' }}</div>
        <div class="text-xs text-gray-500">内容由ai生成</div>
      </div>

      <!-- 对话消息区 -->
      <div class="flex-1 overflow-y-auto p-6 bg-white" ref="messagesRef">
        <div class="max-w-3xl mx-auto">
          <div v-if="currentMessages.length === 0" class="text-center py-20 px-5">
            <div class="text-gray-500 mb-5">
              <el-icon :size="80">
                <MagicStick />
              </el-icon>
            </div>
            <h2 class="text-2xl font-medium text-gray-800 mb-2">开始你的创作之旅</h2>
            <p class="text-gray-600 mb-7">输入你的创作需求，我会为你生成适配平台的优质内容</p>
            <div class="flex flex-wrap gap-2 justify-center">
              <el-tag v-for="prompt in quickPrompts" :key="prompt" class="cursor-pointer transition-all duration-200 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 hover:text-gray-800 hover:-translate-y-0.5" @click="useQuickPrompt(prompt)">
                {{ prompt }}
              </el-tag>
            </div>
          </div>

          <div v-for="(msg, index) in currentMessages" :key="index" class="flex gap-3 mb-6" :class="{'flex-row-reverse': msg.role === 'user'}">
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
                <!-- 用户消息 -->
                <template v-if="msg.role === 'user'">
                  <div class="flex items-center gap-2">
                    <div class="flex-1 text-base leading-relaxed text-gray-800">{{ msg.content }}</div>
                    <el-tag size="small" class="bg-gray-300 text-gray-700 border-none">{{ msg.platform }}</el-tag>
                  </div>
                </template>
                <!-- AI消息（打字机效果） -->
                <template v-else>
                  <div v-if="msg.loading" class="flex gap-1.5 py-2">
                    <span class="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style="animation-delay: -0.32s"></span>
                    <span class="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style="animation-delay: -0.16s"></span>
                    <span class="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></span>
                  </div>
                  <div v-else class="text-base leading-relaxed text-gray-800">
                    <div class="whitespace-pre-wrap mb-3">{{ msg.displayContent }}</div>
                    <div class="flex gap-3 pt-2 border-t border-gray-100">
                      <el-button size="small" link @click="copyContent(msg.content)" class="text-sm text-gray-600 hover:text-gray-800">
                        <el-icon>
                          <DocumentCopy />
                        </el-icon>
                        复制内容
                      </el-button>
                      <el-button size="small" link @click="regenerateContent(msg)" class="text-sm text-gray-600 hover:text-gray-800">
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

      <!-- 底部输入区 -->
      <div class="p-4 px-6 bg-white">
        <div class="max-w-[1000px] mx-auto">
          <!-- 悬浮风格输入框 -->
          <div class="input-container rounded-[20px] border border-gray-200 hover:border-gray-300 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 transition-all duration-200 bg-white p-4">
            <el-input v-model="userInput" type="textarea" :rows="3" placeholder="输入你的创作需求（例如：春日野餐、职场穿搭、节日祝福）..."
              @keydown.enter.ctrl="handleSend" />
            <div class="flex justify-between items-center gap-3 mt-3">
              <span class="text-xs text-gray-500">Ctrl+Enter 发送</span>
              <div class="flex items-center gap-3">
                <span class="text-sm text-gray-600 font-medium">适配平台：</span>
                <el-select v-model="currentPlatform" placeholder="选择平台" size="small" style="width:100px;">
                  <el-option label="小红书" value="小红书" />
                  <el-option label="微博" value="微博" />
                  <el-option label="朋友圈" value="朋友圈" />
                  <el-option label="抖音" value="抖音" />
                </el-select>
                <el-button size="large" :loading="loading" @click="handleSend" class="rounded-full px-7 font-medium bg-blue-500 hover:bg-blue-600 text-white border-none transition-all duration-200">
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
  Promotion,
  UserFilled
} from '@element-plus/icons-vue'
import { generateContent, generateContentStream, getSessions, getSessionDetail } from '@/api/content' // 导入getSessions、getSessionDetail和generateContentStream
import { validateAdmin } from '@/api/admin'
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
const isAdmin = ref(false) // 管理员状态
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


// 跳转到历史管理页
const navigateToContentList = () => {
  router.push('/content-list')
}
// 跳转到用户列表页
const navigateToUserList = () => {
  router.push('/admin/user-list')
}

// 验证管理员身份
const checkAdminStatus = async () => {
  try {
    const response = await validateAdmin(false) // 传递raiseError=false，非管理员时不抛出错误
    if (response.code === 200 && response.admin_info.is_admin) {
      isAdmin.value = true
    } else {
      isAdmin.value = false
    }
  } catch (error) {
    // 非管理员或验证失败，不显示用户列表按钮
    isAdmin.value = false
  }
}

// 页面加载时初始化
onMounted(() => {
  // 优先加载后端历史对话
  loadHistoryFromBackend()
  // 检查管理员身份
  checkAdminStatus()
  scrollToBottom()
})

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
          time: formatTime(content.create_time),
          originalTime: content.create_time // 存储原始时间用于排序
        })
        messages.push({
          role: 'ai',
          content: content.content,
          displayContent: content.content,
          loading: false,
          time: formatTime(content.create_time),
          originalTime: content.create_time // 存储原始时间用于排序
        })
      })
      // 按照时间顺序排序，早的消息在前
      messages.sort((a, b) => new Date(a.originalTime) - new Date(b.originalTime))
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

  // 获取当前时间
  const now = new Date().toISOString()
  
  // 添加用户消息
  const userMsg = {
    role: 'user',
    content: userInput.value.trim(),
    platform: currentPlatform.value,
    time: formatTime(),
    originalTime: now // 存储原始时间用于排序
  }
  currentMessages.value.push(userMsg)

  // 响应式AI消息对象
  const aiMsg = {
    role: 'ai',
    content: '',
    displayContent: '',
    loading: true,
    time: formatTime(),
    originalTime: now // 存储原始时间用于排序
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