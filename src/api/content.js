import service from './index'

/**
 * 生成社交内容
 * @param {object} data - 生成参数 {prompt, platform, title}
 * @returns {Promise} 响应结果
 */
export const generateContent = (data) => {
  return service.post('/content/generate', data)
}

/**
 * 查询当前用户的内容列表
 * @returns {Promise} 响应结果
 */
export const getContentList = () => {
  return service.get('/content/list')
}