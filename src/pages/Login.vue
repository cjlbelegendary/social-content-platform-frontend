<template>
  <div class="login-container">
    <div class="background-gradient"></div>
    <div class="particles">
      <div v-for="i in 50" :key="i" class="particle" :style="getParticleStyle(i)"></div>
    </div>
    
    <div class="login-content">
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

      <div class="login-card">
        <div class="card-header">
          <h2>欢迎回来</h2>
          <p>登录以继续您的创作之旅</p>
        </div>

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          class="login-form"
          @submit.prevent="handleLogin"
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
                @keyup.enter="handleLogin"
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
                @keyup.enter="handleLogin"
              />
            </div>
          </el-form-item>

          <el-form-item class="remember-row">
            <el-checkbox v-model="rememberMe" class="remember-checkbox">
              记住我
            </el-checkbox>
            <a href="#" class="forgot-link">忘记密码？</a>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="login-button"
              :loading="loading"
              @click="handleLogin"
            >
              <span v-if="!loading">登录</span>
              <span v-else>登录中...</span>
            </el-button>
          </el-form-item>

          <div class="divider">
            <span>或</span>
          </div>

          <div class="register-section">
            <span class="register-text">还没有账号？</span>
            <el-button
              type="text"
              class="register-link"
              @click="$router.push('/register')"
            >
              立即注册
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login } from '@/api/user'
import { setToken } from '@/utils/auth'

const router = useRouter()
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
    
    let accessToken = ''
    if (res.data && res.data.access_token) {
      accessToken = res.data.access_token
    } else if (res.access_token) {
      accessToken = res.access_token
    }
    
    if (res.code === 200 && accessToken) {
      saveRememberedUsername()
      ElMessage.success('登录成功！')
      setToken(accessToken)
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

onMounted(() => {
  loadRememberedUsername()
})
</script>

<style scoped>
.login-container {
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

.login-content {
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

.login-card {
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

.login-card:hover {
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

.login-form {
  margin-top: 0;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 24px;
}

.login-form :deep(.el-form-item__error) {
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

.remember-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px !important;
}

.remember-row :deep(.el-form-item__content) {
  justify-content: space-between;
}

.remember-checkbox {
  color: rgba(255, 255, 255, 0.7);
}

.remember-checkbox :deep(.el-checkbox__label) {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.remember-checkbox :deep(.el-checkbox__inner) {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.3);
}

.remember-checkbox :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
}

.forgot-link {
  color: rgba(102, 126, 234, 0.9);
  font-size: 14px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.forgot-link:hover {
  color: rgba(102, 126, 234, 1);
  text-decoration: underline;
}

.login-button {
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

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(102, 126, 234, 0.4);
}

.login-button:active {
  transform: translateY(0);
}

.login-button :deep(.el-loading-spinner) {
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

.register-section {
  text-align: center;
}

.register-text {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  margin-right: 8px;
}

.register-link {
  color: rgba(102, 126, 234, 0.9);
  font-size: 14px;
  font-weight: 600;
  padding: 0;
  transition: all 0.3s ease;
}

.register-link:hover {
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
  .login-content {
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

  .login-card {
    width: 100%;
    max-width: 420px;
  }
}

@media (max-width: 480px) {
  .login-content {
    padding: 24px;
  }

  .login-card {
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
