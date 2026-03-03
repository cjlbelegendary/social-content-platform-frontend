<template>
  <div class="home-container">
    <!-- 左侧：历史记录栏 -->
    <!-- 左侧：历史记录栏 -->
    <div class="sidebar">
      <div class="sidebar-header">
        <h3>创作历史</h3>
        <el-button type="primary" size="small" @click="startNewChat">
          <el-icon>
            <Plus />
          </el-icon>
          新创作
        </el-button>
      </div>
      <div class="history-list">
        <!-- 加载状态提示 -->
        <div v-if="loadingHistory" class="history-loading">
          <el-skeleton :rows="3" animated />
        </div>
        <!-- 无历史记录提示 -->
        <div v-else-if="chatHistory.length === 0" class="no-history">
          <el-empty description="暂无创作历史，开始你的第一次创作吧～" />
        </div>
        <!-- 历史列表 -->
        <div v-else v-for="(chat, index) in chatHistory" :key="chat.id || index" class="history-item"
          :class="{ active: currentChatIndex === index }" @click="switchChat(index)">
          <div class="history-title">
            <el-icon>
              <Document />
            </el-icon>
            {{ chat.title }}
          </div>
          <div class="history-time">{{ chat.time }}</div>
        </div>
      </div>
    </div>

    <!-- 右侧：对话主界面 -->
    <div class="chat-main">
      <!-- 顶部栏 -->
      <div class="chat-header">
        <div class="header-left">
          <div class="ai-avatar">
            <el-icon>
              <ChatDotRound />
            </el-icon>
          </div>
          <div class="header-info">
            <h3>社交内容创作助手</h3>
            <span class="status">在线</span>
          </div>
        </div>
        <div class="header-right">
          <el-select v-model="currentPlatform" placeholder="选择平台" size="small" style="width:80px;">
            <el-option label="小红书" value="小红书" />
            <el-option label="微博" value="微博" />
            <el-option label="朋友圈" value="朋友圈" />
            <el-option label="抖音" value="抖音" />
          </el-select>
          <el-button type="danger" size="small" @click="handleLogout">
            退出登录
          </el-button>
        </div>
      </div>

      <!-- 对话消息区 -->
      <div class="chat-messages" ref="messagesRef">
        <div v-if="currentMessages.length === 0" class="empty-state">
          <div class="empty-icon">
            <el-icon :size="80">
              <MagicStick />
            </el-icon>
          </div>
          <h2>开始你的创作之旅</h2>
          <p>输入你的创作需求，我会为你生成适配平台的优质内容</p>
          <div class="quick-prompts">
            <el-tag v-for="prompt in quickPrompts" :key="prompt" class="quick-prompt" @click="useQuickPrompt(prompt)">
              {{ prompt }}
            </el-tag>
          </div>
        </div>

        <div v-for="(msg, index) in currentMessages" :key="index" class="message-item" :class="msg.role">
          <div class="message-avatar">
            <el-icon v-if="msg.role === 'user'">
              <User />
            </el-icon>
            <el-icon v-else>
              <ChatDotRound />
            </el-icon>
          </div>
          <div class="message-content">
            <div class="message-bubble">
              <!-- 用户消息 -->
              <template v-if="msg.role === 'user'">
                <div class="user-prompt">
                  <div class="prompt-text">{{ msg.content }}</div>
                  <el-tag size="small" type="info">{{ msg.platform }}</el-tag>
                </div>
              </template>
              <!-- AI消息（打字机效果） -->
              <template v-else>
                <div v-if="msg.loading" class="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
                <div v-else class="ai-content">
                  <div class="content-text">{{ msg.displayContent }}</div>
                  <div class="content-actions">
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
            <div class="message-time">{{ msg.time }}</div>
          </div>
        </div>
      </div>

      <!-- 底部输入区 -->
      <div class="chat-input-area">
        <div class="input-wrapper">
          <el-input v-model="userInput" type="textarea" :rows="3" placeholder="输入你的创作需求（例如：春日野餐、职场穿搭、节日祝福）..."
            @keydown.enter.ctrl="handleSend" class="chat-input" />
          <div class="input-actions">
            <span class="hint">Ctrl+Enter 发送</span>
            <el-button type="primary" size="large" :loading="loading" @click="handleSend" class="send-btn">
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
import { generateContent, getContentList } from '@/api/content' // 导入getContentList
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
    const res = await getContentList()
    if (res.code === 200 && res.content_list) {
      // 转换后端数据为前端格式
      const transformedHistory = transformBackendData(res.content_list)
      chatHistory.value = transformedHistory

      // 如果有历史记录，默认选中第一条
      if (chatHistory.value.length > 0) {
        currentChatIndex.value = 0
        currentMessages.value = [...chatHistory.value[0].messages]
        scrollToBottom()
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

// 发送消息（适配后端接口）
const handleSend = async () => {
  if (!userInput.value.trim()) {
    ElMessage.warning('请输入创作需求')
    return
  }

  if (typeWriterTimer) clearInterval(typeWriterTimer)

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
  try {
    const res = await generateContent({
      prompt: inputPrompt,
      platform: currentPlatform.value,
      title: inputPrompt
    })

    if (res.code === 200) {
      const fullContent = res.content.content
      aiMsg.content = fullContent
      aiMsg.loading = false

      setTimeout(() => {
        typeWriter(aiMsg, fullContent, 25)
      }, 100)

      // 新增：将新创作添加到历史列表头部
      const newChatItem = {
        id: res.content.id, // 后端返回的新内容ID
        title: inputPrompt.length > 15 ? inputPrompt.substring(0, 15) + '...' : inputPrompt,
        time: formatTime(),
        messages: [...currentMessages.value]
      }
      chatHistory.value.unshift(newChatItem)
      currentChatIndex.value = 0

      // 可选：重新加载历史（确保和后端数据一致）
      // await loadHistoryFromBackend()
    } else {
      ElMessage.error(res.msg || '生成失败')
      aiMsg.loading = false
      aiMsg.content = '生成失败，请稍后重试'
      aiMsg.displayContent = aiMsg.content
    }
  } catch (error) {
    ElMessage.error('生成异常，请稍后重试')
    aiMsg.loading = false
    aiMsg.content = '生成异常，请稍后重试'
    aiMsg.displayContent = aiMsg.content
    console.error('生成异常：', error)
  } finally {
    loading.value = false
  }
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
const switchChat = (index) => {
  currentChatIndex.value = index
  currentMessages.value = [...chatHistory.value[index].messages]
  scrollToBottom()
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
.home-container {
  display: flex;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 左侧历史记录栏 */
.sidebar {
  width: 280px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h3 {
  margin: 0;
  color: #333;
  font-size: 16px;
}

.history-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.history-item {
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.3s;
  background: #f5f7fa;
}

.history-item:hover {
  background: #e8f0fe;
  transform: translateX(5px);
}

.history-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.history-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 5px;
}

.history-time {
  font-size: 12px;
  opacity: 0.7;
}

/* 右侧对话主界面 */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}

/* 顶部栏 */
.chat-header {
  padding: 15px 25px;
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.ai-avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 22px;
}

.header-info h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.status {
  font-size: 12px;
  color: #67c23a;
  display: flex;
  align-items: center;
  gap: 5px;
}

.status::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #67c23a;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

/* 对话消息区 */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 30px;
  background: #f8f9fa;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  color: #667eea;
  margin-bottom: 20px;
}

.empty-state h2 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 24px;
}

.empty-state p {
  color: #666;
  margin-bottom: 30px;
}

.quick-prompts {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.quick-prompt {
  cursor: pointer;
  transition: all 0.3s;
  padding: 8px 15px;
  font-size: 14px;
}

.quick-prompt:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transform: translateY(-2px);
}

/* 消息气泡 */
.message-item {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
}

.message-item.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e8f0fe;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
  font-size: 20px;
  flex-shrink: 0;
}

.message-item.user .message-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.message-content {
  max-width: 70%;
}

.message-bubble {
  background: white;
  padding: 18px 22px;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  margin-bottom: 8px;
}

.message-item.user .message-bubble {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

/* 用户消息 */
.user-prompt {
  display: flex;
  align-items: center;
  gap: 10px;
}

.prompt-text {
  flex: 1;
  font-size: 15px;
  line-height: 1.6;
}

/* AI消息 */
.typing-indicator {
  display: flex;
  gap: 5px;
  padding: 10px 0;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #667eea;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing {

  0%,
  80%,
  100% {
    transform: scale(0);
  }

  40% {
    transform: scale(1);
  }
}

.ai-content {
  font-size: 15px;
  line-height: 1.8;
  color: #333;
}

.content-text {
  white-space: pre-wrap;
  margin-bottom: 15px;
}

.content-actions {
  display: flex;
  gap: 15px;
  padding-top: 10px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.message-time {
  font-size: 12px;
  color: #999;
  padding: 0 5px;
}

/* 底部输入区 */
.chat-input-area {
  padding: 20px 30px;
  background: white;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.input-wrapper {
  max-width: 1000px;
  margin: 0 auto;
}

.chat-input {
  margin-bottom: 15px;
}

.chat-input :deep(.el-textarea__inner) {
  border-radius: 15px;
  border: 2px solid #e8f0fe;
  font-size: 15px;
  padding: 15px;
  transition: all 0.3s;
}

.chat-input :deep(.el-textarea__inner):focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hint {
  font-size: 12px;
  color: #999;
}

.send-btn {
  border-radius: 25px;
  padding: 0 30px;
  font-weight: 500;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.send-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}
</style>