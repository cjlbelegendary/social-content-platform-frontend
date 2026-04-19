import { defineStore } from 'pinia'
import { getSessions, getSessionDetail } from '@/api/content'
import { ElMessage } from 'element-plus'

export const useChatStore = defineStore('chat', {
  state: () => ({
    chatHistory: [],
    currentChatIndex: -1,
    currentMessages: [],
    sessions: [],
    loadingHistory: false,
    loading: false,
    streamController: null,
    animationFrame: null
  }),

  getters: {
    currentChat: (state) => {
      return state.currentChatIndex >= 0 
        ? state.chatHistory[state.currentChatIndex] 
        : null
    },

    currentTitle: (state) => {
      return state.currentChatIndex >= 0 && state.chatHistory.length > 0 
        ? state.chatHistory[state.currentChatIndex].title 
        : '社交内容创作助手'
    },

    hasHistory: (state) => state.chatHistory.length > 0,

    currentSessionId: (state) => {
      const currentChat = state.chatHistory[state.currentChatIndex]
      return currentChat ? currentChat.session_id : null
    }
  },

  actions: {
    formatTime(timeStr = '') {
      if (!timeStr) {
        const now = new Date()
        return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
      }
      return timeStr.split(' ')[1]?.substring(0, 5) || timeStr
    },

    async loadHistory() {
      this.loadingHistory = true
      try {
        const res = await getSessions()
        if (res.code === 200 && res.session_list) {
          this.sessions = res.session_list
          
          const transformedHistory = []
          res.session_list.forEach(session => {
            transformedHistory.push({
              id: session.session_id,
              title: session.session_title,
              time: this.formatTime(session.update_time),
              session_id: session.session_id,
              messages: []
            })
          })
          this.chatHistory = transformedHistory

          if (this.chatHistory.length > 0) {
            this.currentChatIndex = 0
            await this.loadSessionDetail(this.chatHistory[0].session_id)
          } else {
            this.currentChatIndex = -1
            this.currentMessages = []
          }
        } else {
          this.chatHistory = []
          this.currentMessages = []
          this.currentChatIndex = -1
        }
      } catch (error) {
        console.error('加载历史对话失败：', error)
        ElMessage.warning('加载历史创作失败，仅显示新创作内容')
        this.chatHistory = []
        this.currentMessages = []
        this.currentChatIndex = -1
      } finally {
        this.loadingHistory = false
      }
    },

    async loadSessionDetail(sessionId) {
      try {
        const res = await getSessionDetail(sessionId)
        if (res.code === 200 && res.session) {
          const session = res.session
          const messages = []
          session.contents.forEach(item => {
            if (item.type === 'content') {
              messages.push({
                role: 'user',
                content: item.title,
                platform: item.platform,
                type: 'text',
                time: this.formatTime(item.create_time_str || item.create_time),
                originalTime: item.create_time_str || item.create_time
              })
              messages.push({
                role: 'ai',
                content: item.content,
                displayContent: item.content,
                loading: false,
                type: 'text',
                contentId: item.id,
                platform: item.platform,
                time: this.formatTime(item.create_time_str || item.create_time),
                originalTime: item.create_time_str || item.create_time
              })
            } else if (item.type === 'image') {
              messages.push({
                role: 'user',
                content: item.prompt,
                platform: item.platform,
                type: 'image-request',
                time: this.formatTime(item.create_time_str || item.create_time),
                originalTime: item.create_time_str || item.create_time
              })
              messages.push({
                role: 'ai',
                type: 'image',
                loading: false,
                imageLoading: false,
                imageInfo: {
                  imageId: item.id,
                  url: item.url,
                  prompt: item.prompt,
                  style: item.style,
                  size: item.size,
                  width: item.width,
                  height: item.height,
                  platform: item.platform
                },
                time: this.formatTime(item.create_time_str || item.create_time),
                originalTime: item.create_time_str || item.create_time
              })
            }
          })
          messages.sort((a, b) => new Date(a.originalTime) - new Date(b.originalTime))
          this.currentMessages = messages
        }
      } catch (error) {
        console.error('加载会话详情失败：', error)
        ElMessage.warning('加载会话详情失败')
      }
    },

    async switchChat(index) {
      this.currentChatIndex = index
      const session = this.chatHistory[index]
      if (session) {
        await this.loadSessionDetail(session.session_id)
      }
    },

    startNewChat() {
      this.currentChatIndex = -1
      this.currentMessages = []
    },

    addUserMessage(message) {
      this.currentMessages.push({
        role: 'user',
        content: message.content,
        platform: message.platform,
        type: message.type || 'text',
        time: this.formatTime(),
        originalTime: new Date().toISOString()
      })
    },

    addAIMessage(message) {
      this.currentMessages.push({
        role: 'ai',
        content: message.content || '',
        displayContent: message.displayContent || '',
        loading: message.loading || false,
        isTyping: message.isTyping || false,
        type: message.type || 'text',
        imageLoading: message.imageLoading || false,
        imageInfo: message.imageInfo || null,
        time: this.formatTime(),
        originalTime: new Date().toISOString()
      })
      return this.currentMessages[this.currentMessages.length - 1]
    },

    updateAIMessage(index, updates) {
      if (index >= 0 && index < this.currentMessages.length) {
        Object.assign(this.currentMessages[index], updates)
      }
    },

    async loadSessionListOnly() {
      try {
        const res = await getSessions()
        if (res.code === 200 && res.session_list) {
          this.sessions = res.session_list
          
          const transformedHistory = []
          res.session_list.forEach(session => {
            transformedHistory.push({
              id: session.session_id,
              title: session.session_title,
              time: this.formatTime(session.update_time),
              session_id: session.session_id,
              messages: []
            })
          })
          this.chatHistory = transformedHistory
          this.currentChatIndex = 0
        }
      } catch (error) {
        console.error('加载会话列表失败：', error)
      }
    },

    setStreamController(controller) {
      this.streamController = controller
    },

    setAnimationFrame(frame) {
      this.animationFrame = frame
    },

    clearStreamController() {
      if (this.streamController) {
        this.streamController.abort()
        this.streamController = null
      }
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame)
        this.animationFrame = null
      }
    },

    setLoading(status) {
      this.loading = status
    },

    reset() {
      this.chatHistory = []
      this.currentChatIndex = -1
      this.currentMessages = []
      this.sessions = []
      this.loadingHistory = false
      this.loading = false
      this.clearStreamController()
    }
  }
})
