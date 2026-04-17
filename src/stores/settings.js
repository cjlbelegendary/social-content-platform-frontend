import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    enableMarkdown: true,
    currentPlatform: '小红书',
    theme: 'light'
  }),

  getters: {
    isMarkdownEnabled: (state) => state.enableMarkdown,
    currentPlatformName: (state) => state.currentPlatform
  },

  actions: {
    toggleMarkdown() {
      this.enableMarkdown = !this.enableMarkdown
    },

    setMarkdown(value) {
      this.enableMarkdown = value
    },

    setPlatform(platform) {
      this.currentPlatform = platform
    },

    setTheme(theme) {
      this.theme = theme
    },

    reset() {
      this.enableMarkdown = true
      this.currentPlatform = '小红书'
      this.theme = 'light'
    }
  },

  persist: {
    key: 'settings',
    storage: localStorage,
    paths: ['enableMarkdown', 'currentPlatform', 'theme']
  }
})
