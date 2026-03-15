import service from './index'
import { getToken } from '@/utils/auth'

// 生成内容：延长超时到70秒（比后端多10秒）
export const generateContent = (data) => {
  return service.post('/content/generate', data, {
    timeout: 70000  // 70秒超时
  })
}

// 流式生成内容
export const generateContentStream = (data, onData, onError, onComplete) => {
  const token = getToken()
  const url = 'http://127.0.0.1:8000/api/content/generate/stream'
  
  let controller = new AbortController()
  let signal = controller.signal
  
  console.log('开始流式请求:', url, data)
  
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
    signal: signal
  })
  .then(response => {
    console.log('流式请求响应:', response)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const reader = response.body.getReader()
    let buffer = ''
    
    const processStream = async () => {
      try {
        const { done, value } = await reader.read()
        
        if (done) {
          console.log('流式请求完成')
          onComplete()
          return
        }
        
        const chunk = new TextDecoder('utf-8').decode(value)
        console.log('收到流式数据:', chunk)
        
        // 处理SSE格式
        buffer += chunk
        const lines = buffer.split('\n')
        buffer = lines.pop() // 保留不完整的行
        
        for (const line of lines) {
          if (line.startsWith('data:')) {
            const content = line.substring(5).trim()
            if (content) {
              console.log('提取SSE数据:', content)
              // 直接传递文本内容，不需要解析JSON
              onData({ code: 200, content: content })
            }
          }
        }
        
        processStream()
      } catch (error) {
        console.error('流式处理错误:', error)
        onError(error)
      }
    }
    
    processStream()
  })
  .catch(error => {
    console.error('流式请求错误:', error)
    onError(error)
  })
  
  return {
    abort: () => controller.abort()
  }
}

// 查询内容列表：改为GET（和后端对应）
export const getContentList = () => {
  return service.get('/content/list')
}

// 获取会话列表
export const getSessions = () => {
  return service.get('/content/list')
}

// 获取会话详情
export const getSessionDetail = (sessionId) => {
  return service.get(`/content/session/${sessionId}`)
}

// 删除内容（如需使用）
export const deleteContent = (contentId) => {
  return service.post('/content/delete', { content_id: contentId })
}