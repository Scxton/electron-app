<!-- download.vue -->
<template>
  <div v-if="file">
    <h3>Downloading: {{ file.name }}</h3>
    <progress :value="progress" max="100"></progress>
    <p>{{ downloadStatus }}</p>
  </div>
</template>

<script>
export default {
  props: ['file'],
  data() {
    return {
      progress: 0,  // 下载进度
      downloadStatus: 'Preparing to download...'  // 下载状态
    }
  },
  watch: {
    file: 'startDownload'  // 当传入的文件改变时，重新开始下载
  },
  methods: {
    startDownload() {
      if (this.file) {
        this.downloadStatus = 'Downloading...'
        this.progress = 0
        this.downloadFile()
      }
    },
    downloadFile() {
      // 模拟文件下载，逐步增加进度
      let interval = setInterval(() => {
        this.progress += 10
        if (this.progress >= 100) {
          clearInterval(interval)
          this.downloadStatus = 'Download Complete!'
        }
      }, 500)
    }
  }
}
</script>

<style scoped>
/* 下载进度条样式 */
progress {
  width: 100%;
  height: 20px;
}
</style>
