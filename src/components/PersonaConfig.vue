<template>
  <el-collapse v-model="collapseActive" class="mb-4 border-none persona-collapse">
    <el-collapse-item name="persona">
      <template #title>
        <div class="flex items-center gap-2 text-sm font-medium text-[#666]">
          <el-icon><UserFilled /></el-icon>
          <span>人设配置</span>
          <el-tag v-if="personaStore.hasPersona" size="small" class="ml-2 bg-[#f6ffed] text-[#52c41a] border-[#b7eb8f]">已配置</el-tag>
        </div>
      </template>
      
      <div class="p-4 bg-[#fafafa] rounded-xl">
        <div class="grid grid-cols-3 gap-4 mb-4">
          <div>
            <div class="text-sm font-medium text-[#666] mb-2">领域</div>
            <el-select v-model="personaStore.domain" placeholder="请选择领域" class="w-full persona-select">
              <el-option 
                v-for="item in personaOptions.domain" 
                :key="item.value" 
                :label="item.label" 
                :value="item.value" 
              />
            </el-select>
          </div>
          
          <div>
            <div class="text-sm font-medium text-[#666] mb-2">风格</div>
            <el-select v-model="personaStore.style" placeholder="请选择风格" class="w-full persona-select">
              <el-option 
                v-for="item in personaOptions.style" 
                :key="item.value" 
                :label="item.label" 
                :value="item.value" 
              />
            </el-select>
          </div>
          
          <div>
            <div class="text-sm font-medium text-[#666] mb-2">语气</div>
            <el-select v-model="personaStore.tone" placeholder="请选择语气" class="w-full persona-select">
              <el-option 
                v-for="item in personaOptions.tone" 
                :key="item.value" 
                :label="item.label" 
                :value="item.value" 
              />
            </el-select>
          </div>
        </div>
        
        <div class="flex gap-3">
          <el-button @click="handleSave" :loading="saving" class="save-btn rounded-xl bg-[#1a1a1a] text-white border-none hover:text-gray-100 hover:bg-[#333]">
            保存为我的人设
          </el-button>
          <el-button @click="handleReset" class="rounded-xl text-[#666] hover:text-[#1a1a1a] border-[#e5e5e5] hover:border-[#d5d5d5]">
            重置为默认
          </el-button>
        </div>
      </div>
    </el-collapse-item>
  </el-collapse>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { UserFilled } from '@element-plus/icons-vue'
import { usePersonaStore } from '@/stores/persona'
import { getPersonaInfo, savePersona } from '@/api/persona'
import { personaOptions } from '@/data/personaOptions'

const personaStore = usePersonaStore()

const collapseActive = ref([])
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
      ElMessage.success('保存人设配置成功')
    } else {
      ElMessage.error(res.msg || '保存失败')
    }
  } catch (error) {
    console.error('保存人设配置失败：', error)
    ElMessage.error('保存失败，请稍后重试')
  } finally {
    saving.value = false
  }
}

const handleReset = () => {
  personaStore.reset()
  ElMessage.success('已重置为默认')
}

onMounted(() => {
  loadPersona()
})
</script>

<style scoped>
.persona-collapse :deep(.el-collapse-item__header) {
  background: transparent;
  border: none;
  height: 40px;
  line-height: 40px;
}

.persona-collapse :deep(.el-collapse-item__wrap) {
  border: none;
}

.persona-collapse :deep(.el-collapse-item__content) {
  padding-bottom: 0;
}

.persona-select :deep(.el-input__wrapper) {
  border-radius: 8px;
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
