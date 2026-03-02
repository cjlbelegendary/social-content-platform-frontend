<template>
  <div class="list-container">
    <!-- 页面头部 -->
    <el-page-header
      content="我的内容列表"
      @back="$router.push('/home')"
      class="page-header"
    />
    
    <!-- 内容列表卡片 -->
    <el-card class="list-card">
      <el-table
        :data="contentList"
        border
        stripe
        :loading="loading"
        style="width: 100%;"
        @row-click="handleRowClick"
      >
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="title" label="标题" min-width="200" />
        <el-table-column prop="platform" label="发布平台" width="120" align="center">
          <template #default="scope">
            <el-tag type="primary">{{ scope.row.platform }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="创建时间" width="200" align="center" />
        <el-table-column label="操作" width="120" align="center">
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              @click="handleView(scope.row)"
            >
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 内容详情弹窗 -->
      <el-dialog
        v-model="dialogVisible"
        title="内容详情"
        width="800px"
        destroy-on-close
      >
        <el-input
          v-model="currentContent"
          type="textarea"
          :rows="18"
          readonly
          class="detail-textarea"
        />
        <template #footer>
          <el-button @click="dialogVisible = false">关闭</el-button>
          <el-button
            type="success"
            @click="handleCopyDetail"
          >
            复制内容
          </el-button>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getContentList } from '@/api/content'

// 加载状态
const loading = ref(false)
// 内容列表
const contentList = ref([])
// 弹窗显隐
const dialogVisible = ref(false)
// 当前选中的内容
const currentContent = ref('')

/**
 * 加载内容列表
 */
const loadContentList = async () => {
  try {
    loading.value = true
    const res = await getContentList()
    if (res.code === 200) {
      contentList.value = res.content_list || []
      if (contentList.value.length === 0) {
        ElMessage.info('暂无生成的内容，请先去生成')
      }
    } else {
      ElMessage.error(res.msg || '查询内容列表失败')
    }
  } catch (error) {
    ElMessage.error('查询异常，请稍后重试')
    console.error('查询内容列表失败：', error)
  } finally {
    loading.value = false
  }
}

/**
 * 查看内容详情
 * @param {object} row - 表格行数据
 */
const handleView = (row) => {
  currentContent.value = row.content
  dialogVisible.value = true
}

/**
 * 行点击事件（查看详情）
 * @param {object} row - 表格行数据
 */
const handleRowClick = (row) => {
  handleView(row)
}

/**
 * 复制详情内容
 */
const handleCopyDetail = () => {
  navigator.clipboard.writeText(currentContent.value).then(() => {
    ElMessage.success('内容已复制到剪贴板！')
  }).catch(() => {
    ElMessage.error('复制失败，请手动复制')
  })
}

// 页面挂载时加载列表
onMounted(() => {
  loadContentList()
})
</script>

<style scoped>
.list-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 20px;
}

.list-card {
  padding: 20px;
}

.detail-textarea {
  font-size: 14px;
  line-height: 1.6;
}
</style>