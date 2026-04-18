import { createRouter, createWebHistory } from 'vue-router'
import { getToken } from '@/utils/auth'
import { validateAdmin } from '@/api/admin'

import Auth from '@/pages/Auth.vue'
import Home from '@/pages/Home.vue'
import ContentList from '@/pages/ContentList.vue'
import PackageList from '@/pages/PackageList.vue'
import UserList from '@/pages/admin/UserList.vue'
import Schedule from '@/pages/Schedule.vue'

const requireAuth = (to, from, next) => {
  if (getToken()) {
    next()
  } else {
    next('/login')
  }
}

const requireAdmin = (to, from, next) => {
  const token = getToken()
  if (!token) {
    next('/login')
    return
  }
  
  validateAdmin()
  .then(response => {
    if (response.code === 200 && response.admin_info.is_admin) {
      next()
    } else {
      next('/home')
    }
  })
  .catch(error => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      next('/home')
    } else {
      next('/home')
    }
  })
}

const routes = [
  { 
    path: '/', 
    redirect: '/home'
  },
  { 
    path: '/login', 
    component: Auth,
    meta: { title: '登录' }
  },
  { 
    path: '/register', 
    component: Auth,
    meta: { title: '注册' }
  },
  { 
    path: '/home', 
    component: Home, 
    beforeEnter: requireAuth,
    meta: { title: '对话生成' }
  },
  { 
    path: '/content-list', 
    component: ContentList, 
    beforeEnter: requireAuth,
    meta: { title: '创作历史' }
  },
  { 
    path: '/package-list', 
    component: PackageList, 
    beforeEnter: requireAuth,
    meta: { title: '我的内容包' }
  },
  { 
    path: '/schedule', 
    component: Schedule, 
    beforeEnter: requireAuth,
    meta: { title: '排期管理' }
  },
  { 
    path: '/admin/user-list', 
    component: UserList, 
    beforeEnter: requireAdmin,
    meta: { title: '用户列表' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const title = to.meta?.title
  if (title) {
    document.title = `${title}-社交内容生成平台`
  } else {
    document.title = '社交内容生成平台'
  }
  next()
})

export default router
