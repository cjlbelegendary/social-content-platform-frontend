import { defineStore } from 'pinia'
import { validateAdmin } from '@/api/admin'
import { removeToken } from '@/utils/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    isAdmin: false,
    userInfo: null,
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
    },

    setUserInfo(info) {
      this.userInfo = info
    },

    setToken(token) {
      this.token = token
    }
  }
})
