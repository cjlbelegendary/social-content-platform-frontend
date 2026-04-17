import { defineStore } from 'pinia'

export const usePersonaStore = defineStore('persona', {
  state: () => ({
    domain: '',
    style: '',
    tone: ''
  }),

  getters: {
    hasPersona: (state) => !!(state.domain || state.style || state.tone),
    
    personaText: (state) => {
      const parts = []
      if (state.domain) parts.push(`领域：${state.domain}`)
      if (state.style) parts.push(`风格：${state.style}`)
      if (state.tone) parts.push(`语气：${state.tone}`)
      return parts.join('、')
    },

    personaObject: (state) => ({
      domain: state.domain,
      style: state.style,
      tone: state.tone
    })
  },

  actions: {
    updatePersona(data) {
      this.domain = data.domain || ''
      this.style = data.style || ''
      this.tone = data.tone || ''
    },

    setDomain(domain) {
      this.domain = domain
    },

    setStyle(style) {
      this.style = style
    },

    setTone(tone) {
      this.tone = tone
    },

    reset() {
      this.domain = ''
      this.style = ''
      this.tone = ''
    }
  },

  persist: {
    key: 'persona',
    storage: localStorage,
    paths: ['domain', 'style', 'tone']
  }
})
