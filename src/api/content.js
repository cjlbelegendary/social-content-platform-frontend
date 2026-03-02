import service from './index'

// 生成内容：延长超时到70秒（比后端多10秒）
export const generateContent = (data) => {
  return service.post('/content/generate', data, {
    timeout: 70000  // 70秒超时
  })
}

// 查询内容列表：改为GET（和后端对应）
export const getContentList = () => {
  return service.get('/content/list')
}

// 删除内容（如需使用）
export const deleteContent = (contentId) => {
  return service.post('/content/delete', { content_id: contentId })
}