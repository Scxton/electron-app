<template>
  <div class="file-upload">
    <h2 class="title">文件上传</h2>

    <div class="upload-area">
      <el-upload
        class="upload-list"
        drag
        multiple
        :action="uploadUrl"
        :on-success="handleSuccess"
        :on-error="handleError"
        :before-upload="beforeUpload"
        :file-list="fileList"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持多个文件上传，单个文件不超过500MB
          </div>
        </template>
      </el-upload>

      <div class="file-list" v-if="fileList.length > 0">
        <h3>已上传文件列表：</h3>
        <el-table :data="fileList" style="width: 100%">
          <el-table-column prop="name" label="文件名"></el-table-column>
          <el-table-column prop="size" label="大小" width="180">
            <template #default="scope">
              {{ formatFileSize(scope.row.size) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="scope">
              <el-button 
                type="danger" 
                size="small" 
                @click="handleRemove(scope.$index)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <div class="action-buttons">
      <el-button @click="prevStep">上一步</el-button>
      <el-button type="primary" @click="nextStep" :disabled="fileList.length === 0">
        下一步
      </el-button>
    </div>
  </div>
</template>

<script>
import { UploadFilled } from '@element-plus/icons-vue'

export default {
  name: 'FileUpload',
  components: {
    UploadFilled
  },
  data() {
    return {
      uploadUrl: 'your-upload-api-url', // 替换为实际的上传接口
      fileList: []
    }
  },
  methods: {
    handleSuccess(response, file) {
      this.$message.success(`${file.name} 上传成功`)
      // 可以在这里处理文件上传成功后的响应
    },
    handleError(err) {
      this.$message.error('上传失败：' + err.message)
    },
    beforeUpload(file) {
      const maxSize = 500 * 1024 * 1024 // 500MB
      if (file.size > maxSize) {
        this.$message.error('文件大小不能超过 500MB')
        return false
      }
      return true
    },
    handleRemove(index) {
      this.fileList.splice(index, 1)
    },
    formatFileSize(bytes) {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },
    prevStep() {
      this.$router.push('/publish/basic')
    },
    nextStep() {
      // 保存文件列表信息
      localStorage.setItem('uploadedFiles', JSON.stringify(this.fileList))
      this.$router.push('/publish/quality')
    }
  },
  created() {
    // 恢复之前上传的文件列表
    const savedFiles = localStorage.getItem('uploadedFiles')
    if (savedFiles) {
      this.fileList = JSON.parse(savedFiles)
    }
  }
}
</script>

<style scoped>
.file-upload {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.title {
  margin-bottom: 30px;
  text-align: center;
}

.upload-area {
  margin: 20px 0;
}

.file-list {
  margin-top: 20px;
}

.action-buttons {
  margin-top: 30px;
  text-align: right;
}

.action-buttons .el-button {
  margin-left: 10px;
}

:deep(.el-upload-dragger) {
  width: 100%;
}

:deep(.el-upload) {
  width: 100%;
}
</style>