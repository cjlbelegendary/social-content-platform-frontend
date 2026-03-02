<template>
  <div class="admin-container">
    <!-- 页面头部 -->
    <el-page-header
      content="管理员 - 用户管理"
      @back="$router.push('/home')"
      class="page-header"
    />
    
    <!-- 用户列表卡片 -->
    <el-card class="user-card">
      <el-table
        :data="userList"
        border
        stripe
        :loading="loading"
        style="width: 100%;"
      >
        <el-table-column prop="id" label="用户ID" width="80" align="center" />
        <el-table-column prop="username" label="用户名" min-width="150" />
        <el-table-column prop="email" label="邮箱" min-width="200" />
        <el-table-column prop="is_admin" label="是否管理员" width="120" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.is_admin" type="success">是</el-tag>
            <el-tag v-else type="info">否</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="注册时间" width="200" align="center" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getUserList } from '@/api/user'

// 加载状态
const loading = ref(false)
// 用户列表
const userList = ref([])

/**
 * 加载用户列表
 */
const loadUserList = async () => {
  try {
    loading.value = true
    const res = await getUserList()
    if (res.code === 200) {
      userList.value = res.user_list || []
      if (userList.value.length === 0) {
        ElMessage.info('暂无用户数据')
      }
    } else {
      ElMessage.error(res.msg || '查询用户列表失败')
    }
  } catch (error) {
    ElMessage.error('无管理员权限或查询异常')
    console.error('查询用户列表失败：', error)
  } finally {
    loading.value = false
  }
}

// 页面挂载时加载列表
onMounted(() => {
  loadUserList()
})
</script>

<style scoped>
.admin-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 20px;
}

.user-card {
  padding: 20px;
}
</style>