// Token存储在localStorage，键名固定
const TOKEN_KEY = 'access_token'

/**
 * 获取本地存储的Token
 * @returns {string|null} Token字符串或null
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * 设置Token到本地存储
 * @param {string} token - 登录返回的Token
 */
export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token)
}

/**
 * 删除本地存储的Token（退出登录）
 */
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY)
}