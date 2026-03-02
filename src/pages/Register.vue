<template>
  <div class="register-wrapper">
    <el-card class="register-card" shadow="hover">
      <div class="register-header">
        <h2>用户注册</h2>
        <p>注册后即可使用AI内容生成功能</p>
      </div>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
        class="register-form"
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
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            size="large"
            prefix-icon="Lock"
          />
        </el-form-item>
        <el-form-item label="邮箱（选填）" prop="email">
          <el-input
            v-model="form.email"
            placeholder="请输入邮箱"
            size="large"
            prefix-icon="Message"
          />
        </el-form-item>
        <el-form-item class="register-btn-group">
          <el-button
            type="primary"
            size="large"
            class="register-btn"
            @click="handleRegister"
            :loading="loading"
          >
            注册
          </el-button>
          <el-button size="large" @click="$router.push('/login')">
            返回登录
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
import { register } from '@/api/user'

// 路由实例
const router = useRouter()
// 表单引用
const formRef = ref(null)
// 加载状态
const loading = ref(false)
// 表单数据
const form = ref({
  username: '',
  password: '',
  confirmPassword: '',
  email: ''
})

// 表单校验规则
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

/**
 * 注册处理函数
 */
const handleRegister = async () => {
  try {
    // 表单校验
    await formRef.value.validate()
    loading.value = true
    
    // 构造注册参数（去掉确认密码）
    const registerData = {
      username: form.value.username,
      password: form.value.password,
      email: form.value.email || ''
    }
    
    // 调用注册接口
    const res = await register(registerData)
    if (res.code === 200) {
      ElMessage.success('注册成功！请登录')
      // 跳转到登录页
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
.register-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
}

.register-card {
  width: 450px;
  padding: 20px;
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.register-header h2 {
  color: #1989fa;
  margin-bottom: 10px;
}

.register-header p {
  color: #666;
  font-size: 14px;
}

.register-form {
  margin-top: 20px;
}

.register-btn-group {
  display: flex;
  gap: 10px;
}

.register-btn {
  flex: 1;
}
</style>