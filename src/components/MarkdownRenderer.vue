<template>
  <div class="markdown-content" v-html="renderedContent"></div>
</template>

<script setup>
import { computed } from 'vue'
import { marked } from 'marked'

const props = defineProps({
  content: {
    type: String,
    default: ''
  }
})

marked.setOptions({
  breaks: true,
  gfm: true
})

const renderedContent = computed(() => {
  if (!props.content) return ''
  
  try {
    return marked.parse(props.content)
  } catch (error) {
    console.error('Markdown解析错误:', error)
    return props.content
  }
})
</script>

<style scoped>
.markdown-content {
  line-height: 1.6;
  word-wrap: break-word;
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  margin-top: 1em;
  margin-bottom: 0.5em;
  font-weight: 600;
  line-height: 1.3;
}

.markdown-content :deep(h1) {
  font-size: 1.5em;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.3em;
}

.markdown-content :deep(h2) {
  font-size: 1.3em;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.3em;
}

.markdown-content :deep(h3) {
  font-size: 1.15em;
}

.markdown-content :deep(p) {
  margin: 0.5em 0;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin: 0.5em 0;
  padding-left: 1.5em;
}

.markdown-content :deep(ul) {
  list-style-type: disc;
}

.markdown-content :deep(ol) {
  list-style-type: decimal;
}

.markdown-content :deep(li) {
  margin: 0.25em 0;
}

.markdown-content :deep(code) {
  background-color: #f3f4f6;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.9em;
}

.markdown-content :deep(pre) {
  background-color: #f3f4f6;
  padding: 1em;
  border-radius: 6px;
  overflow-x: auto;
  margin: 0.5em 0;
}

.markdown-content :deep(pre code) {
  background-color: transparent;
  padding: 0;
  font-size: 0.85em;
  line-height: 1.5;
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid #d1d5db;
  padding-left: 1em;
  margin: 0.5em 0;
  color: #6b7280;
}

.markdown-content :deep(strong) {
  font-weight: 600;
}

.markdown-content :deep(em) {
  font-style: italic;
}

.markdown-content :deep(a) {
  color: #3b82f6;
  text-decoration: none;
}

.markdown-content :deep(a:hover) {
  text-decoration: underline;
}

.markdown-content :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 0.5em 0;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid #e5e7eb;
  padding: 0.5em;
  text-align: left;
}

.markdown-content :deep(th) {
  background-color: #f9fafb;
  font-weight: 600;
}

.markdown-content :deep(hr) {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 1em 0;
}

.markdown-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}
</style>
