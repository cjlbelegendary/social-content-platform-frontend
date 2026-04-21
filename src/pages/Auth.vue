<template>
  <div class="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#fafafa]">
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        v-for="i in 30"
        :key="i"
        class="particle"
        :style="getParticleStyle(i)"
      ></div>
    </div>

    <div class="flex items-center gap-[120px] z-10 p-10 max-lg:flex-col max-lg:gap-10">
      <div class="max-w-[400px] max-lg:text-center max-lg:max-w-full">
        <div class="flex items-center gap-4 mb-4 max-lg:justify-center">
          <div class="logo-icon w-14 h-14 bg-[#1a1a1a] rounded-2xl flex items-center justify-center text-white shadow-lg">
            <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h1 class="text-[32px] font-semibold text-[#1a1a1a] tracking-tight max-sm:text-2xl">社交内容生成平台</h1>
        </div>
        <p class="text-base text-[#666] mb-10 leading-relaxed max-sm:text-sm">一站式社交内容生成与管理平台</p>
        
        <div class="flex flex-col gap-5 max-lg:flex-row max-lg:flex-wrap max-lg:justify-center max-lg:gap-4 max-sm:gap-3">
          <div class="flex items-center gap-3 max-lg:px-4 max-lg:py-2 max-lg:bg-white max-lg:border max-lg:border-[#e5e5e5] max-lg:rounded-full">
            <div class="w-10 h-10 bg-white border border-[#e5e5e5] rounded-[10px] flex items-center justify-center text-[#1a1a1a]">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <span class="text-[15px] text-[#666] max-sm:text-[13px]">AI智能生成图文</span>
          </div>
          <div class="flex items-center gap-3 max-lg:px-4 max-lg:py-2 max-lg:bg-white max-lg:border max-lg:border-[#e5e5e5] max-lg:rounded-full">
            <div class="w-10 h-10 bg-white border border-[#e5e5e5] rounded-[10px] flex items-center justify-center text-[#1a1a1a]">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" stroke="currentColor" stroke-width="2"/>
                <path d="M2 12H22" stroke="currentColor" stroke-width="2"/>
                <path d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2Z" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <span class="text-[15px] text-[#666] max-sm:text-[13px]">发布排期管理</span>
          </div>
          <div class="flex items-center gap-3 max-lg:px-4 max-lg:py-2 max-lg:bg-white max-lg:border max-lg:border-[#e5e5e5] max-lg:rounded-full">
            <div class="w-10 h-10 bg-white border border-[#e5e5e5] rounded-[10px] flex items-center justify-center text-[#1a1a1a]">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <span class="text-[15px] text-[#666] max-sm:text-[13px]">热点浏览</span>
          </div>
        </div>
      </div>

      <div class="relative left-1/2 transform -translate-x-1/2">
        <Transition name="card-fade" mode="out-in">
          <LoginCard v-if="mode === 'login'" />
          <RegisterCard v-else />
        </Transition>
      </div>
    </div>

    <div class="absolute bottom-6 left-0 right-0 text-center z-10">
      <p class="text-[#999] text-[13px] m-0">© 2024 社交内容生成平台 · 让创作更简单</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import LoginCard from '@/components/auth/LoginCard.vue'
import RegisterCard from '@/components/auth/RegisterCard.vue'

const route = useRoute()
const mode = ref('login')

const getParticleStyle = (index) => {
  const size = Math.random() * 3 + 1
  const left = Math.random() * 100
  const delay = Math.random() * 20
  const duration = Math.random() * 20 + 10

  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${left}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`
  }
}

const updateModeFromRoute = () => {
  if (route.path === '/register') {
    mode.value = 'register'
  } else {
    mode.value = 'login'
  }
}

onMounted(() => {
  updateModeFromRoute()
})

watch(() => route.path, () => {
  updateModeFromRoute()
})
</script>

<style scoped>
.particle {
  position: absolute;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  animation: float linear infinite;
}

@keyframes float {
  0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100vh) rotate(720deg);
    opacity: 0;
  }
}

.logo-icon {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
  }
}

.card-fade-enter-active,
.card-fade-leave-active {
  transition: all 0.3s ease;
}

.card-fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.card-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
