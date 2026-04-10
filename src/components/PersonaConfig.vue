<template>
  <el-collapse v-model="collapseActive" class="mb-4 border-none">
    <el-collapse-item name="persona">
      <template #title>
        <div class="flex items-center gap-2 text-sm font-medium text-gray-700">
          <el-icon><UserFilled /></el-icon>
          <span>人设配置</span>
          <el-tag v-if="hasPersona" size="small" type="success" class="ml-2">已配置</el-tag>
        </div>
      </template>
      
      <div class="p-4 bg-gray-50 rounded-lg">
        <div class="grid grid-cols-3 gap-4 mb-4">
          <div>
            <div class="text-sm font-medium text-gray-700 mb-2">领域</div>
            <el-select v-model="localForm.domain" placeholder="请选择领域" class="w-full">
              <el-option 
                v-for="item in personaOptions.domain" 
                :key="item.value" 
                :label="item.label" 
                :value="item.value" 
              />
            </el-select>
          </div>
          
          <div>
            <div class="text-sm font-medium text-gray-700 mb-2">风格</div>
            <el-select v-model="localForm.style" placeholder="请选择风格" class="w-full">
              <el-option 
                v-for="item in personaOptions.style" 
                :key="item.value" 
                :label="item.label" 
                :value="item.value" 
              />
            </el-select>
          </div>
          
          <div>
            <div class="text-sm font-medium text-gray-700 mb-2">语气</div>
            <el-select v-model="localForm.tone" placeholder="请选择语气" class="w-full">
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
          <el-button type="primary" @click="handleSave" :loading="saving">
            保存为我的人设
          </el-button>
          <el-button @click="handleReset">
            重置为默认
          </el-button>
        </div>
      </div>
    </el-collapse-item>
  </el-collapse>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { UserFilled } from '@element-plus/icons-vue'
import { getPersonaInfo, savePersona } from '@/api/persona'
import { personaOptions } from '@/data/personaOptions'

const props = defineProps({
  modelValue: Object
})

const emit = defineEmits(['update:modelValue'])

const collapseActive = ref([])
const saving = ref(false)

const localForm = reactive({
  domain: '',
  style: '',
  tone: ''
})

const hasPersona = computed(() => {
  return localForm.domain || localForm.style || localForm.tone
})

const loadPersona = async () => {
  try {
    const res = await getPersonaInfo()
    if (res.code === 200 && res.persona) {
      localForm.domain = res.persona.domain || ''
      localForm.style = res.persona.style || ''
      localForm.tone = res.persona.tone || ''
      emit('update:modelValue', { ...localForm })
    }
  } catch (error) {
    console.error('加载人设配置失败：', error)
  }
}

const handleSave = async () => {
  if (!localForm.domain || !localForm.style || !localForm.tone) {
    ElMessage.warning('请完整配置人设信息')
    return
  }
  
  saving.value = true
  try {
    const res = await savePersona({
      domain: localForm.domain,
      style: localForm.style,
      tone: localForm.tone,
      is_default: 1
    })
    
    if (res.code === 200) {
      ElMessage.success('保存人设配置成功')
      emit('update:modelValue', { ...localForm })
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
  localForm.domain = ''
  localForm.style = ''
  localForm.tone = ''
  emit('update:modelValue', { ...localForm })
  ElMessage.success('已重置为默认')
}

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    localForm.domain = newVal.domain || ''
    localForm.style = newVal.style || ''
    localForm.tone = newVal.tone || ''
  }
}, { immediate: true })

loadPersona()
</script>
