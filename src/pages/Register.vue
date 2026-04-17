<template>
  <div class="register-container">
    <div class="background-gradient"></div>
    <div class="particles">
      <div v-for="i in 50" :key="i" class="particle" :style="getParticleStyle(i)"></div>
    </div>
    
    <div class="register-content">
      <div class="brand-section">
        <div class="logo-wrapper">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h1 class="brand-title">AI Content Studio</h1>
        </div>
        <p class="brand-subtitle">智能社交内容创作平台</p>
        <div class="feature-tags">
          <span class="tag">✨ AI驱动</span>
          <span class="tag">🚀 一键生成</span>
          <span class="tag">💡 智能优化</span>
        </div>
      </div>

      <div class="register-card">
        <div class="card-header">
          <h2>创建账号</h2>
          <p>开启您的AI创作之旅</p>
        </div>

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          class="register-form"
          @submit.prevent="handleRegister"
        >
          <el-form-item prop="username">
            <div class="input-wrapper">
              <div class="input-icon">
                <svg viewBox="0 0 24 24" fill="none">
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

          <el-form-item prop="password">
            <div class="input-wrapper">
              <div class="input-icon">
                <svg viewBox="0 0 24 24" fill="none">
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

          <el-form-item prop="confirmPassword">
            <div class="input-wrapper">
              <div class="input-icon">
                <svg viewBox="0 0 24 24" fill="none">
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

          <el-form-item prop="email">
            <div class="input-wrapper">
              <div class="input-icon">
                <svg viewBox="0 0 24 24" fill="none">
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

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="register-button"
              :loading="loading"
              @click="handleRegister"
            >
              <span v-if="!loading">立即注册</span>
              <span v-else>注册中...</span>
            </el-button>
          </el-form-item>

          <div class="divider">
            <span>或</span>
          </div>

          <div class="login-section">
            <span class="login-text">已有账号？</span>
            <el-button
              type="text"
              class="login-link"
              @click="$router.push('/login')"
            >
              立即登录
            </el-button>
          </div>
        </el-form>
      </div>
    </div>

    <div class="footer-info">
      <p>© 2024 AI Content Studio. All rights reserved.</p>
    </div>
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

const getParticleStyle = (index) => {
  const size = Math.random() * 4 + 2
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
</script>

<style scoped>
.register-container {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #0f0f1e;
}

.background-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 40% 20%, rgba(120, 200, 255, 0.3) 0%, transparent 50%);
  animation: gradientShift 15s ease infinite;
}

@keyframes gradientShift {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.particles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
}

.particle {
  position: absolute;
  bottom: -10px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  animation: float linear infinite;
}

@keyframes float {
  0% {
    transform: translateY(0) rotate(0deg);
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

.register-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 80px;
  padding: 40px;
}

.brand-section {
  flex: 0 0 400px;
  text-align: left;
}

.logo-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.logo-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.logo-icon svg {
  width: 32px;
  height: 32px;
}

.brand-title {
  font-size: 32px;
  font-weight: 700;
  color: white;
  margin: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 32px 0;
  font-weight: 300;
}

.feature-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.tag {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.tag:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.register-card {
  width: 420px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 48px 40px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.register-card:hover {
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 
    0 12px 48px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.card-header {
  text-align: center;
  margin-bottom: 40px;
}

.card-header h2 {
  font-size: 28px;
  font-weight: 600;
  color: white;
  margin: 0 0 8px 0;
}

.card-header p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.register-form {
  margin-top: 0;
}

.register-form :deep(.el-form-item) {
  margin-bottom: 24px;
}

.register-form :deep(.el-form-item__error) {
  color: #ff6b6b;
  font-size: 12px;
  padding-top: 4px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 16px;
  width: 20px;
  height: 20px;
  color: rgba(255, 255, 255, 0.5);
  z-index: 1;
  pointer-events: none;
}

.input-icon svg {
  width: 100%;
  height: 100%;
}

.custom-input :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px 16px 12px 48px;
  box-shadow: none;
  transition: all 0.3s ease;
}

.custom-input :deep(.el-input__wrapper:hover) {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

.custom-input :deep(.el-input__wrapper.is-focus) {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(102, 126, 234, 0.5);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.custom-input :deep(.el-input__inner) {
  color: white;
  font-size: 15px;
}

.custom-input :deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.4);
}

.custom-input :deep(.el-input__suffix) {
  color: rgba(255, 255, 255, 0.5);
}

.custom-input :deep(.el-input__suffix-inner) {
  color: rgba(255, 255, 255, 0.5);
}

.register-button {
  width: 100%;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
}

.register-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(102, 126, 234, 0.4);
}

.register-button:active {
  transform: translateY(0);
}

.register-button :deep(.el-loading-spinner) {
  color: white;
}

.divider {
  position: relative;
  text-align: center;
  margin: 24px 0;
}

.divider::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
}

.divider span {
  position: relative;
  padding: 0 16px;
  background: transparent;
  color: rgba(255, 255, 255, 0.4);
  font-size: 14px;
}

.login-section {
  text-align: center;
}

.login-text {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  margin-right: 8px;
}

.login-link {
  color: rgba(102, 126, 234, 0.9);
  font-size: 14px;
  font-weight: 600;
  padding: 0;
  transition: all 0.3s ease;
}

.login-link:hover {
  color: rgba(102, 126, 234, 1);
}

.footer-info {
  position: absolute;
  bottom: 24px;
  left: 0;
  right: 0;
  text-align: center;
  z-index: 1;
}

.footer-info p {
  color: rgba(255, 255, 255, 0.4);
  font-size: 13px;
  margin: 0;
}

@media (max-width: 1024px) {
  .register-content {
    flex-direction: column;
    gap: 40px;
  }

  .brand-section {
    flex: none;
    text-align: center;
    width: 100%;
  }

  .logo-wrapper {
    justify-content: center;
  }

  .feature-tags {
    justify-content: center;
  }

  .register-card {
    width: 100%;
    max-width: 420px;
  }
}

@media (max-width: 480px) {
  .register-content {
    padding: 24px;
  }

  .register-card {
    padding: 32px 24px;
  }

  .brand-title {
    font-size: 24px;
  }

  .card-header h2 {
    font-size: 24px;
  }
}
</style>
