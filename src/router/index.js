import { createRouter, createWebHistory } from 'vue-router'
import { getToken } from '@/utils/auth'
import { validateAdmin } from '@/api/admin'

import Auth from '@/pages/Auth.vue'
import Home from '@/pages/Home.vue'
import ContentList from '@/pages/ContentList.vue'
import UserList from '@/pages/admin/UserList.vue'
import Schedule from '@/pages/Schedule.vue'

// 路由守卫：验证登录状态（未登录跳登录页）
const requireAuth = (to, from, next) => {
  if (getToken()) {
    next()
  } else {
    next('/login')
  }
}

// 路由守卫：管理员权限（调用接口验证管理员身份）
const requireAdmin = (to, from, next) => {
  const token = getToken()
  if (!token) {
    next('/login')
    return
  }
  
  // 调用管理员身份验证接口
  validateAdmin()
  .then(response => {
    if (response.code === 200 && response.admin_info.is_admin) {
      next()
    } else {
      // 用户不是管理员
      next('/home')
    }
  })
  .catch(error => {
    // 处理错误响应
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      next('/home')
    } else {
      // 其他错误，跳转到首页
      next('/home')
    }
  })
}

const routes = [
  { path: '/', redirect: '/home' },
  { path: '/login', component: Auth },
  { path: '/register', component: Auth },
  { path: '/home', component: Home, beforeEnter: requireAuth },
  { path: '/content-list', component: ContentList, beforeEnter: requireAuth },
  { path: '/schedule', component: Schedule, beforeEnter: requireAuth },
  { path: '/admin/user-list', component: UserList, beforeEnter: requireAdmin }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(), // HTML5历史模式
  routes
})

export default router