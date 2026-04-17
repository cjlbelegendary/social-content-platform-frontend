<template>
  <div class="w-[420px] bg-white border border-[#e5e5e5] rounded-3xl py-12 px-10 shadow-lg transition-all duration-300 hover:border-[#d5d5d5] hover:shadow-xl max-sm:py-8 max-sm:px-6">
    <div class="text-center mb-10">
      <h2 class="text-[28px] font-semibold text-[#1a1a1a] m-0 mb-2 max-sm:text-2xl">创建账号</h2>
      <p class="text-sm text-[#999] m-0">开启您的AI创作之旅</p>
    </div>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      @submit.prevent="handleRegister"
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
            @keyup.enter="handleRegister"
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
            @keyup.enter="handleRegister"
          />
        </div>
      </el-form-item>

      <el-form-item prop="confirmPassword" class="mb-6">
        <div class="relative flex items-center">
          <div class="absolute left-4 w-5 h-5 text-[#999] z-10 pointer-events-none">
            <svg class="w-full h-full" viewBox="0 0 24 24" fill="none">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2"/>
              <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            size="large"
            class="custom-input"
            show-password
            @keyup.enter="handleRegister"
          />
        </div>
      </el-form-item>

      <el-form-item prop="email" class="mb-6">
        <div class="relative flex items-center">
          <div class="absolute left-4 w-5 h-5 text-[#999] z-10 pointer-events-none">
            <svg class="w-full h-full" viewBox="0 0 24 24" fill="none">
              <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M22 6L12 13L2 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <el-input
            v-model="form.email"
            placeholder="请输入邮箱（选填）"
            size="large"
            class="custom-input"
            @keyup.enter="handleRegister"
          />
        </div>
      </el-form-item>

      <el-form-item class="mb-6">
        <el-button
          type="primary"
          size="large"
          class="submit-button w-full h-12 bg-[#1a1a1a] border-none rounded-xl text-base font-semibold text-white cursor-pointer transition-all duration-300 shadow-md hover:bg-[#333] hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
          :loading="loading"
          @click="handleRegister"
        >
          <span v-if="!loading">立即注册</span>
          <span v-else>注册中...</span>
        </el-button>
      </el-form-item>

      <div class="relative text-center my-6">
        <div class="absolute left-0 right-0 top-1/2 h-px bg-[#e5e5e5]"></div>
        <span class="relative px-4 bg-white text-sm text-[#999]">或</span>
      </div>

      <div class="text-center">
        <span class="text-sm text-[#999] mr-2">已有账号？</span>
        <el-button
          type="text"
          class="text-sm font-semibold text-[#1a1a1a] p-0 transition-colors hover:text-[#333]"
          @click="goToLogin"
        >
          立即登录
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { register } from '@/api/user'

const router = useRouter()
const formRef = ref(null)
const loading = ref(false)

const form = ref({
  username: '',
  password: '',
  confirmPassword: '',
  email: ''
})

const rules = ref({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== form.value.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  email: [
    {
      pattern: /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
      message: '请输入正确的邮箱格式',
      trigger: 'blur'
    }
  ]
})

const handleRegister = async () => {
  try {
    await formRef.value.validate()
    loading.value = true
    
    const registerData = {
      username: form.value.username,
      password: form.value.password,
      email: form.value.email || ''
    }
    
    const res = await register(registerData)
    if (res.code === 200) {
      ElMessage.success('注册成功！请登录')
      router.push('/login')
    } else {
      ElMessage.error(res.msg || '注册失败')
    }
  } catch (error) {
    ElMessage.error('注册异常，请稍后重试')
    console.error('注册失败：', error)
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}
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

.submit-button :deep(.el-loading-spinner) {
  color: white;
}
</style>
