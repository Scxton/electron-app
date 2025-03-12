<!-- search.vue -->
<template>
  <div>
    <input v-model="searchQuery" placeholder="Search for a file..." />
    <button @click="searchFiles">Search</button>

    <div v-if="files.length">
      <ul>
        <li v-for="file in files" :key="file.id">
          {{ file.name }}
          <button @click="startDownload(file)">Download</button>
        </li>
      </ul>
    </div>

    <!-- 将下载模块引入，并传递数据 -->
    <Download :file="fileToDownload" v-if="fileToDownload" />
  </div>
</template>

<script>
import Download from './Test_down.vue'

export default {
  components: {
    Download
  },
  data() {
    return {
      searchQuery: '',
      files: [],  // 搜索结果文件列表
      fileToDownload: null  // 当前选择的下载文件
    }
  },
  methods: {
    // 模拟搜索文件
    searchFiles() {
      // 假设有一些文件数据
      this.files = [
        { id: 1, name: 'File1.txt' },
        { id: 2, name: 'File2.txt' }
      ]
    },
    // 当点击下载按钮时，设置当前要下载的文件
    startDownload(file) {
      this.fileToDownload = file
    }
  }
}
</script>

<style scoped>
/* 样式可以根据需要自定义 */
</style>
