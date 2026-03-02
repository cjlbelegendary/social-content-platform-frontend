<template>
  <div class="home-container">
    <!-- 页面头部 -->
    <el-page-header
      content="AI内容生成"
      @back="handleLogout"
      class="page-header"
    />
    
    <!-- 生成表单卡片 -->
    <el-card class="generate-card">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="generate-form"
      >
        <el-form-item label="创作需求" prop="prompt">
          <el-input
            v-model="form.prompt"
            type="textarea"
            :rows="4"
            placeholder="请输入创作需求（例如：春日野餐、职场穿搭、节日祝福）"
            size="large"
          />
        </el-form-item>
        
        <el-form-item label="目标平台" prop="platform">
          <el-select
            v-model="form.platform"
            placeholder="请选择发布平台"
            size="large"
            style="width: 100%;"
          >
            <el-option label="小红书" value="小红书" />
            <el-option label="微博" value="微博" />
            <el-option label="朋友圈" value="朋友圈" />
            <el-option label="抖音" value="抖音" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="内容标题" prop="title">
          <el-input
            v-model="form.title"
            placeholder="请输入内容标题（例如：春日野餐文案）"
            size="large"
          />
        </el-form-item>
        
        <el-form-item class="form-actions">
          <el-button
            type="primary"
            size="large"
            @click="handleGenerate"
            :loading="loading"
          >
            生成内容
          </el-button>
          <el-button size="large" @click="handleReset">重置</el-button>
          <el-button
            type="success"
            size="large"
            @click="$router.push('/content-list')"
          >
            查看我的内容
          </el-button>
          <el-button
            type="warning"
            size="large"
            @click="$router.push('/admin/user-list')"
            v-if="isAdmin"
          >
            管理员后台
          </el-button>
        </el-form-item>
      </el-form>
      
      <!-- 生成结果展示 -->
      <div v-if="result" class="result-section">
        <el-divider content-position="left">生成结果</el-divider>
        <el-input
          v-model="result.content"
          type="textarea"
          :rows="12"
          readonly
          class="result-textarea"
        />
        <el-button
          type="success"
          icon="CopyDocument"
          @click="handleCopy"
          class="copy-btn"
        >
          复制内容
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { generateContent } from '@/api/content'
import { removeToken } from '@/utils/auth'

// 路由实例
const router = useRouter()
// 表单引用
const formRef = ref(null)
// 加载状态
const loading = ref(false)
// 生成结果
const result = ref(null)
// 是否管理员（临时占位，实际可从接口获取）
const isAdmin = ref(false)

// 表单数据
const form = ref({
  prompt: '',
  platform: '小红书',
  title: ''
})

// 表单校验规则
const rules = ref({
  prompt: [{ required: true, message: '请输入创作需求', trigger: 'blur' }],
  platform: [{ required: true, message: '请选择目标平台', trigger: 'change' }],
  title: [{ required: true, message: '请输入内容标题', trigger: 'blur' }]
})

/**
 * 生成内容处理函数
 */
const handleGenerate = async () => {
  try {
    // 表单校验
    await formRef.value.validate()
    loading.value = true
    
    // 调用生成接口
    const res = await generateContent(form.value)
    if (res.code === 200) {
      result.value = res.content
      ElMessage.success('内容生成成功！')
    } else {
      ElMessage.error(res.msg || '内容生成失败')
    }
  } catch (error) {
    ElMessage.error('生成异常，请稍后重试')
    console.error('生成失败：', error)
  } finally {
    loading.value = false
  }
}

/**
 * 重置表单
 */
const handleReset = () => {
  formRef.value.resetFields()
  result.value = null
}

/**
 * 复制生成的内容
 */
const handleCopy = () => {
  if (!result.value) return
  navigator.clipboard.writeText(result.value.content).then(() => {
    ElMessage.success('内容已复制到剪贴板！')
  }).catch(() => {
    ElMessage.error('复制失败，请手动复制')
  })
}

/**
 * 退出登录
 */
const handleLogout = () => {
  ElMessageBox.confirm(
    '确定要退出登录吗？',
    '提示',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    removeToken()
    router.push('/login')
    ElMessage.success('已退出登录')
  })
}
</script>

<style scoped>
.home-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 20px;
}

.generate-card {
  padding: 20px;
}

.generate-form {
  margin-bottom: 30px;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.result-section {
  margin-top: 30px;
}

.result-textarea {
  margin-bottom: 10px;
  font-size: 14px;
  line-height: 1.6;
}

.copy-btn {
  margin-top: 10px;
}
</style>