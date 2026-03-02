import { createRouter, createWebHistory } from 'vue-router'
import { getToken } from '@/utils/auth'

// 导入页面组件
import Login from '@/pages/Login.vue'
import Register from '@/pages/Register.vue'
import Home from '@/pages/Home.vue'
import ContentList from '@/pages/ContentList.vue'
import UserList from '@/pages/admin/UserList.vue'

// 路由守卫：验证登录状态（未登录跳登录页）
const requireAuth = (to, from, next) => {
  if (getToken()) {
    next()
  } else {
    next('/login')
  }
}

// 路由守卫：管理员权限（仅登录验证，接口层做权限校验）
const requireAdmin = (to, from, next) => {
  if (getToken()) {
    next()
  } else {
    next('/login')
  }
}

// 路由规则
const routes = [
  { path: '/', redirect: '/home' }, // 默认跳首页
  { path: '/login', component: Login }, // 登录页
  { path: '/register', component: Register }, // 注册页
  { path: '/home', component: Home, beforeEnter: requireAuth }, // 内容生成页（需登录）
  { path: '/content-list', component: ContentList, beforeEnter: requireAuth }, // 我的内容列表（需登录）
  { path: '/admin/user-list', component: UserList, beforeEnter: requireAdmin } // 管理员用户列表（需登录）
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(), // HTML5历史模式
  routes
})

export default router