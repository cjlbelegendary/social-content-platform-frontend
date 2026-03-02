<template>
  <!-- 路由容器：所有页面都在这里渲染 -->
  <router-view />
</template>

<script setup>
// 空脚本，仅作为路由出口
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif;
  background-color: #f5f7fa;
}
</style>