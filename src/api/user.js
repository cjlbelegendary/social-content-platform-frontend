import service from './index'

/**
 * 用户登录
 * @param {object} data - 登录参数 {username, password}
 * @returns {Promise} 响应结果
 */
export const login = (data) => {
  return service.post('/user/login', data)
}

/**
 * 用户注册
 * @param {object} data - 注册参数 {username, password, email?}
 * @returns {Promise} 响应结果
 */
export const register = (data) => {
  return service.post('/user/register', data)
}

/**
 * 管理员查询所有用户列表
 * @returns {Promise} 响应结果
 */
export const getUserList = () => {
  return service.get('/admin/user_list')
}