<template>
  <div class="login-wrapper">
    <el-card class="login-card" shadow="hover">
      <div class="login-header">
        <h2>社交内容生成平台</h2>
        <p>登录后体验AI内容生成功能</p>
      </div>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
        class="login-form"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            size="large"
            prefix-icon="User"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            prefix-icon="Lock"
          />
        </el-form-item>
        <el-form-item class="login-btn-group">
          <el-button
            type="primary"
            size="large"
            class="login-btn"
            @click="handleLogin"
            :loading="loading"
          >
            登录
          </el-button>
          <el-button size="large" @click="$router.push('/register')">
            注册账号
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login } from '@/api/user'
import { setToken } from '@/utils/auth'

// 路由实例
const router = useRouter()
// 表单引用
const formRef = ref(null)
// 加载状态
const loading = ref(false)
// 表单数据
const form = ref({
  username: '',
  password: ''
})

// 表单校验规则
const rules = ref({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
})

/**
 * 登录处理函数
 */
const handleLogin = async () => {
  try {
    await formRef.value.validate()
    loading.value = true
    
    // 调用登录接口
    const res = await login(form.value)
    console.log('后端返回原始数据：', res) // 先打印看真实格式
    
    // 修复1：增加空值校验
    if (!res) {
      ElMessage.error('登录失败：接口返回空')
      return
    }
    
    // 修复2：兼容两种返回格式（有data/无data）
    let accessToken = ''
    if (res.data && res.data.access_token) {
      accessToken = res.data.access_token // 有data层级
    } else if (res.access_token) {
      accessToken = res.access_token // 无data层级
    }
    
    // 登录成功判断
    if (res.code === 200 && accessToken) {
      ElMessage.success('登录成功！')
      setToken(accessToken)
      router.push('/home')
    } else {
      // 只提示一次失败
      ElMessage.error(res.msg || '登录失败：用户名或密码错误')
    }
  } catch (error) {
    // 只捕获网络/代码错误，避免重复提示
    console.error('登录异常：', error)
    if (!error.message.includes('取消')) { // 排除用户取消操作的情况
      ElMessage.error('登录异常，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
}

.login-card {
  width: 450px;
  padding: 20px;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  color: #1989fa;
  margin-bottom: 10px;
}

.login-header p {
  color: #666;
  font-size: 14px;
}

.login-form {
  margin-top: 20px;
}

.login-btn-group {
  display: flex;
  gap: 10px;
}

.login-btn {
  flex: 1;
}
</style>