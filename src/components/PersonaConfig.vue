<template>
  <el-popover
    placement="top"
    :width="400"
    trigger="click"
  >
    <template #reference>
      <div class="flex items-center gap-2 px-3 py-1.5 bg-[#f5f5f5] rounded-lg cursor-pointer hover:bg-[#f0f0f0] transition-colors">
        <el-icon class="text-[#666]"><UserFilled /></el-icon>
        <span class="text-sm text-[#666]">人设</span>
        <el-tag v-if="personaStore.hasPersona" size="small" class="bg-[#f6ffed] text-[#52c41a] border-[#b7eb8f]">已配置</el-tag>
      </div>
    </template>
    
    <div class="p-3">
      <div class="grid grid-cols-3 gap-3 mb-3">
        <div>
          <div class="text-xs font-medium text-[#999] mb-1.5">领域</div>
          <el-select v-model="personaStore.domain" placeholder="请选择" size="small" class="w-full persona-select">
            <el-option 
              v-for="item in personaOptions.domain" 
              :key="item.value" 
              :label="item.label" 
              :value="item.value" 
            />
          </el-select>
        </div>
        
        <div>
          <div class="text-xs font-medium text-[#999] mb-1.5">风格</div>
          <el-select v-model="personaStore.style" placeholder="请选择" size="small" class="w-full persona-select">
            <el-option 
              v-for="item in personaOptions.style" 
              :key="item.value" 
              :label="item.label" 
              :value="item.value" 
            />
          </el-select>
        </div>
        
        <div>
          <div class="text-xs font-medium text-[#999] mb-1.5">语气</div>
          <el-select v-model="personaStore.tone" placeholder="请选择" size="small" class="w-full persona-select">
            <el-option 
              v-for="item in personaOptions.tone" 
              :key="item.value" 
              :label="item.label" 
              :value="item.value" 
            />
          </el-select>
        </div>
      </div>
      
      <div class="flex gap-2">
        <el-button size="small" @click="handleSave" :loading="saving" class="save-btn rounded-lg bg-[#1a1a1a] text-white border-none hover:bg-[#333]">
          保存
        </el-button>
        <el-button size="small" @click="handleReset" class="rounded-lg text-[#666] border-[#e5e5e5]">
          重置
        </el-button>
      </div>
    </div>
  </el-popover>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { UserFilled } from '@element-plus/icons-vue'
import { usePersonaStore } from '@/stores/persona'
import { getPersonaInfo, savePersona } from '@/api/persona'
import { personaOptions } from '@/data/personaOptions'

const personaStore = usePersonaStore()

const saving = ref(false)

const loadPersona = async () => {
  try {
    const res = await getPersonaInfo()
    if (res.code === 200 && res.persona) {
      personaStore.updatePersona({
        domain: res.persona.domain || '',
        style: res.persona.style || '',
        tone: res.persona.tone || ''
      })
    }
  } catch (error) {
    console.error('加载人设配置失败：', error)
  }
}

const handleSave = async () => {
  if (!personaStore.domain || !personaStore.style || !personaStore.tone) {
    ElMessage.warning('请完整配置人设信息')
    return
  }
  
  saving.value = true
  try {
    const res = await savePersona({
      domain: personaStore.domain,
      style: personaStore.style,
      tone: personaStore.tone,
      is_default: 1
    })
    
    if (res.code === 200) {
      ElMessage.success('保存成功')
    } else {
      ElMessage.error(res.msg || '保存失败')
    }
  } catch (error) {
    console.error('保存人设配置失败：', error)
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

const handleReset = () => {
  personaStore.reset()
  ElMessage.success('已重置')
}

onMounted(() => {
  loadPersona()
})
</script>

<style scoped>
.persona-select :deep(.el-input__wrapper) {
  border-radius: 6px;
  border-color: #e5e5e5;
  background: white;
}

.persona-select :deep(.el-input__wrapper:hover) {
  border-color: #d5d5d5;
}

.persona-select :deep(.el-input__wrapper.is-focus) {
  border-color: #1a1a1a;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.04);
}

.save-btn :deep(.el-loading-spinner) {
  color: white;
}
</style>
