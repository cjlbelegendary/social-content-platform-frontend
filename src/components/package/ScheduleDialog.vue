<template>
  <el-dialog
    :model-value="visible"
    title="排期发布"
    width="500px"
    destroy-on-close
    @update:model-value="$emit('update:visible', $event)"
  >
    <el-form :model="form" label-width="100px">
      <el-form-item label="内容包">
        <div class="text-sm text-[#333]">{{ packageData?.title }}</div>
      </el-form-item>
      <el-form-item label="发布时间" required>
        <el-date-picker
          v-model="form.publish_time"
          type="datetime"
          placeholder="选择日期时间"
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="排期备注">
        <el-input
          v-model="form.schedule_note"
          type="textarea"
          :rows="3"
          placeholder="请输入排期备注"
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <el-button @click="$emit('update:visible', false)">取消</el-button>
      <el-button
        type="primary"
        class="bg-[#1a1a1a] border-none hover:bg-[#333]"
        :loading="loading"
        @click="handleConfirm"
      >
        创建排期
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  packageData: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'confirm'])

const form = reactive({
  publish_time: '',
  schedule_note: ''
})

watch(() => props.visible, (val) => {
  if (!val) {
    form.publish_time = ''
    form.schedule_note = ''
  }
})

const handleConfirm = () => {
  emit('confirm', { ...form })
}
</script>
