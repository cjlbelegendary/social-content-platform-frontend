<template>
  <el-dialog
    :model-value="visible"
    :title="contentData?.type === 'content' ? '文案详情' : '图片详情'"
    width="600px"
    destroy-on-close
    @update:model-value="$emit('update:visible', $event)"
  >
    <div v-if="contentData" class="space-y-4">
      <div class="flex items-center gap-2">
        <el-tag
          :type="contentData.type === 'content' ? 'primary' : 'success'"
          class="rounded-md"
        >
          {{ contentData.type === 'content' ? '文案' : '图片' }}
        </el-tag>
        <el-tag class="bg-[#f5f5f5] text-[#666] border-[#e5e5e5] rounded-md">
          {{ contentData.platform }}
        </el-tag>
        <el-tag
          v-if="contentData.is_in_package"
          type="warning"
          class="rounded-md"
        >
          已在内容包
        </el-tag>
      </div>
      
      <template v-if="contentData.type === 'content'">
        <div>
          <div class="text-sm font-medium text-[#666] mb-2">标题</div>
          <div class="text-[#333] bg-[#fafafa] rounded-lg p-3">{{ contentData.title || '无标题' }}</div>
        </div>
        
        <div>
          <div class="text-sm font-medium text-[#666] mb-2">内容</div>
          <div class="text-[#333] bg-[#fafafa] rounded-lg p-3 whitespace-pre-wrap max-h-[300px] overflow-y-auto">{{ contentData.content }}</div>
        </div>
      </template>
      
      <template v-else>
        <div>
          <div class="text-sm font-medium text-[#666] mb-2">图片</div>
          <img
            :src="contentData.url"
            class="w-full max-h-[300px] object-contain rounded-lg bg-[#fafafa]"
          />
        </div>
        
        <div v-if="contentData.prompt">
          <div class="text-sm font-medium text-[#666] mb-2">提示词</div>
          <div class="text-[#333] bg-[#fafafa] rounded-lg p-3">{{ contentData.prompt }}</div>
        </div>
        
        <div v-if="contentData.style || contentData.size">
          <div class="text-sm font-medium text-[#666] mb-2">样式信息</div>
          <div class="flex items-center gap-4">
            <span v-if="contentData.style" class="text-sm text-[#666]">风格：{{ contentData.style }}</span>
            <span v-if="contentData.size" class="text-sm text-[#666]">尺寸：{{ contentData.size }}</span>
          </div>
        </div>
      </template>
      
      <div class="text-xs text-[#999]">
        创建时间：{{ contentData.create_time_str }}
      </div>
      
      <div v-if="contentData.session" class="pt-3 border-t border-[#e5e5e5]">
        <div class="text-sm font-medium text-[#666] mb-2">所属会话</div>
        <div
          class="flex items-center gap-2 p-3 bg-[#fafafa] rounded-lg cursor-pointer hover:bg-[#f0f0f0] transition-colors"
          @click="goToSession"
        >
          <el-icon class="text-[#666]"><ChatDotRound /></el-icon>
          <span class="text-[#333]">{{ contentData.session.session_title }}</span>
          <el-icon class="text-[#999] ml-auto"><ArrowRight /></el-icon>
        </div>
      </div>
      
      <div v-else class="pt-3 border-t border-[#e5e5e5]">
        <div class="text-sm text-[#999]">该内容未关联会话</div>
      </div>
    </div>
    
    <template #footer>
      <div class="flex justify-end">
        <el-button @click="$emit('update:visible', false)">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ChatDotRound, ArrowRight } from '@element-plus/icons-vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  contentData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:visible', 'go-to-session'])

const goToSession = () => {
  if (props.contentData?.session) {
    emit('go-to-session', props.contentData.session.session_id)
    emit('update:visible', false)
  }
}
</script>
