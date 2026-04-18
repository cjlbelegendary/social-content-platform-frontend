import { defineStore } from 'pinia'
import { validateAdmin } from '@/api/admin'
import { removeToken } from '@/utils/auth'

const USER_INFO_KEY = 'user_info'

const getStoredUserInfo = () => {
  try {
    const stored = localStorage.getItem(USER_INFO_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export const useUserStore = defineStore('user', {
  state: () => ({
    isAdmin: false,
    userInfo: getStoredUserInfo(),
    token: null
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    isAdminUser: (state) => state.isAdmin
  },

  actions: {
    async checkAdminStatus() {
      try {
        const response = await validateAdmin(false)
        if (response.code === 200 && response.admin_info.is_admin) {
          this.isAdmin = true
        } else {
          this.isAdmin = false
        }
      } catch (error) {
        this.isAdmin = false
      }
    },

    logout() {
      removeToken()
      this.isAdmin = false
      this.userInfo = null
      this.token = null
      localStorage.removeItem(USER_INFO_KEY)
    },

    setUserInfo(info) {
      this.userInfo = info
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(info))
    },

    setToken(token) {
      this.token = token
    }
  }
})
