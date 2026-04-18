<template>
  <div class="w-[420px] bg-white border border-[#e5e5e5] rounded-3xl py-12 px-10 shadow-lg transition-all duration-300 hover:border-[#d5d5d5] hover:shadow-xl max-sm:py-8 max-sm:px-6">
    <div class="text-center mb-10">
      <h2 class="text-[28px] font-semibold text-[#1a1a1a] m-0 mb-2 max-sm:text-2xl">欢迎回来</h2>
      <p class="text-sm text-[#999] m-0">登录以继续您的创作之旅</p>
    </div>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      @submit.prevent="handleLogin"
    >
      <el-form-item prop="username" class="mb-6">
        <div class="relative flex items-center">
          <div class="absolute left-4 w-5 h-5 text-[#999] z-10 pointer-events-none">
            <svg class="w-full h-full" viewBox="0 0 24 24" fill="none">
              <path d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            size="large"
            class="custom-input"
            @keyup.enter="handleLogin"
          />
        </div>
      </el-form-item>

      <el-form-item prop="password" class="mb-6">
        <div class="relative flex items-center">
          <div class="absolute left-4 w-5 h-5 text-[#999] z-10 pointer-events-none">
            <svg class="w-full h-full" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
              <circle cx="12" cy="16" r="1" fill="currentColor"/>
              <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            class="custom-input"
            show-password
            @keyup.enter="handleLogin"
          />
        </div>
      </el-form-item>

      <el-form-item class="mb-8">
        <div class="flex justify-between items-center w-full">
          <el-checkbox v-model="rememberMe" class="remember-checkbox">
            记住我
          </el-checkbox>
          <a href="#" class="text-sm text-[#666] no-underline transition-colors hover:text-[#1a1a1a] hover:underline">忘记密码？</a>
        </div>
      </el-form-item>

      <el-form-item class="mb-6">
        <el-button
          type="primary"
          size="large"
          class="submit-button w-full h-12 bg-[#1a1a1a] border-none rounded-xl text-base font-semibold text-white cursor-pointer transition-all duration-300 shadow-md hover:bg-[#333] hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
          :loading="loading"
          @click="handleLogin"
        >
          <span v-if="!loading">登录</span>
          <span v-else>登录中...</span>
        </el-button>
      </el-form-item>

      <div class="relative text-center my-6">
        <div class="absolute left-0 right-0 top-1/2 h-px bg-[#e5e5e5]"></div>
        <span class="relative px-4 bg-white text-sm text-[#999]">或</span>
      </div>

      <div class="text-center">
        <span class="text-sm text-[#999] mr-2">还没有账号？</span>
        <el-button
          type="text"
          class="text-sm font-semibold text-[#1a1a1a] p-0 transition-colors hover:text-[#333]"
          @click="goToRegister"
        >
          立即注册
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login } from '@/api/user'
import { setToken } from '@/utils/auth'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref(null)
const loading = ref(false)
const rememberMe = ref(false)

const form = ref({
  username: '',
  password: ''
})

const rules = ref({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
})

const loadRememberedUsername = () => {
  const savedUsername = localStorage.getItem('rememberedUsername')
  const wasRemembered = localStorage.getItem('rememberMe') === 'true'
  
  if (wasRemembered && savedUsername) {
    form.value.username = savedUsername
    rememberMe.value = true
  }
}

const saveRememberedUsername = () => {
  if (rememberMe.value) {
    localStorage.setItem('rememberedUsername', form.value.username)
    localStorage.setItem('rememberMe', 'true')
  } else {
    localStorage.removeItem('rememberedUsername')
    localStorage.removeItem('rememberMe')
  }
}

const handleLogin = async () => {
  try {
    await formRef.value.validate()
    loading.value = true
    
    const res = await login(form.value)
    
    if (!res) {
      ElMessage.error('登录失败：接口返回空')
      return
    }
    
    if (res.code === 200 && res.access_token) {
      saveRememberedUsername()
      userStore.setToken(res.access_token)
      if (res.user_info) {
        userStore.setUserInfo(res.user_info)
        if (res.user_info.is_admin) {
          userStore.isAdmin = true
        }
      }
      ElMessage.success('登录成功！')
      setToken(res.access_token)
      router.push('/home')
    } else {
      ElMessage.error(res.msg || '登录失败：用户名或密码错误')
    }
  } catch (error) {
    console.error('登录异常：', error)
    if (!error.message.includes('取消')) {
      ElMessage.error('登录异常，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}

const goToRegister = () => {
  router.push('/register')
}

onMounted(() => {
  loadRememberedUsername()
})
</script>

<style scoped>
.custom-input :deep(.el-input__wrapper) {
  background: #fafafa;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  padding: 12px 16px 12px 48px;
  box-shadow: none;
  transition: all 0.3s ease;
}

.custom-input :deep(.el-input__wrapper:hover) {
  background: #f5f5f5;
  border-color: #d5d5d5;
}

.custom-input :deep(.el-input__wrapper.is-focus) {
  background: white;
  border-color: #1a1a1a;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.04);
}

.custom-input :deep(.el-input__inner) {
  color: #1a1a1a;
  font-size: 15px;
}

.custom-input :deep(.el-input__inner::placeholder) {
  color: #999;
}

.custom-input :deep(.el-input__suffix) {
  color: #999;
}

.remember-checkbox :deep(.el-checkbox__label) {
  color: #666;
  font-size: 14px;
}

.remember-checkbox :deep(.el-checkbox__inner) {
  background: white;
  border-color: #d5d5d5;
}

.remember-checkbox :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background: #1a1a1a;
  border-color: #1a1a1a;
}

.submit-button :deep(.el-loading-spinner) {
  color: white;
}
</style>
