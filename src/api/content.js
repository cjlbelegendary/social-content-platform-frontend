import service from './index'
import { getToken } from '@/utils/auth'

export const generateContent = (data) => {
  return service.post('/content/generate', data, {
    timeout: 70000
  })
}

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
        
        buffer += chunk
        const lines = buffer.split('\n')
        buffer = lines.pop()
        
        for (const line of lines) {
          if (line.startsWith('data:')) {
            const content = line.substring(5).trim()
            if (content) {
              console.log('提取SSE数据:', content)
              try {
                const jsonData = JSON.parse(content)
                onData({ code: 200, ...jsonData })
              } catch (e) {
                onData({ code: 200, content: content })
              }
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

export const getContentList = () => {
  return service.get('/content/list')
}

export const getSessions = () => {
  return service.get('/content/list')
}

export const getSessionDetail = (sessionId) => {
  return service.get(`/content/session/${sessionId}`)
}

export const getContents = (params = {}) => {
  return service.get('/content/contents', { params })
}

export const deleteContent = (contentId) => {
  return service.post('/content/delete', { content_id: contentId })
}
