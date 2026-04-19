<template>
  <el-dialog
    :model-value="visible"
    title="批量创建排期"
    width="700px"
    destroy-on-close
    @update:model-value="$emit('update:visible', $event)"
  >
    <div class="mb-4">
      <span class="text-sm text-[#666]">已选择 {{ selectedPackages.length }} 个内容包</span>
    </div>
    
    <div class="p-4 bg-[#f0f0f0] rounded-lg mb-4">
      <div class="text-sm font-medium text-[#333] mb-3">统一设置</div>
      <div class="grid grid-cols-3 gap-3 items-end">
        <el-form-item label="发布时间" class="mb-0">
          <el-date-picker
            v-model="commonTime"
            type="datetime"
            placeholder="统一设置发布时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
            size="small"
          />
        </el-form-item>
        <el-form-item label="排期备注" class="mb-0">
          <el-input
            v-model="commonNote"
            placeholder="统一设置备注"
            size="small"
          />
        </el-form-item>
        <el-button
          size="small"
          type="primary"
          class="bg-[#1a1a1a] border-none hover:bg-[#333]"
          @click="applyCommonSettings"
        >
          应用到全部
        </el-button>
      </div>
    </div>
    
    <div class="space-y-4 max-h-[350px] overflow-y-auto">
      <div
        v-for="(item, index) in scheduleList"
        :key="index"
        class="p-4 bg-[#fafafa] rounded-lg"
      >
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-[#1a1a1a]">{{ item.title }}</span>
            <el-tag class="bg-[#f5f5f5] text-[#666] border-[#e5e5e5] rounded-md text-xs">{{ item.platform }}</el-tag>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <el-form-item label="发布时间" required class="mb-0">
            <el-date-picker
              v-model="item.publish_time"
              type="datetime"
              placeholder="选择日期时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%"
              size="small"
            />
          </el-form-item>
          <el-form-item label="排期备注" class="mb-0">
            <el-input
              v-model="item.schedule_note"
              placeholder="请输入备注"
              size="small"
            />
          </el-form-item>
        </div>
      </div>
    </div>
    
    <template #footer>
      <el-button @click="$emit('update:visible', false)">取消</el-button>
      <el-button
        type="primary"
        class="bg-[#1a1a1a] border-none hover:bg-[#333]"
        :loading="loading"
        @click="handleConfirm"
      >
        确认创建
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  selectedPackages: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'confirm'])

const scheduleList = ref([])
const commonTime = ref('')
const commonNote = ref('')

watch(() => props.visible, (val) => {
  if (val) {
    scheduleList.value = props.selectedPackages.map(p => ({
      package_id: p.id,
      title: p.title,
      platform: p.platform,
      publish_time: '',
      schedule_note: ''
    }))
    commonTime.value = ''
    commonNote.value = ''
  }
})

const applyCommonSettings = () => {
  scheduleList.value.forEach(item => {
    if (commonTime.value) {
      item.publish_time = commonTime.value
    }
    if (commonNote.value) {
      item.schedule_note = commonNote.value
    }
  })
}

const handleConfirm = () => {
  emit('confirm', scheduleList.value)
}
</script>
