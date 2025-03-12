<template>
  <div class="upload-container">
    <el-upload
      class="upload-template"
      :action="'#'"
      :http-request="handleUpload"
      :before-upload="beforeUpload"
      :on-success="handleSuccess"
      :on-error="handleError"
      :file-list="fileList">
      <el-button type="primary">选择文件</el-button>
      <template #tip>
        <div class="el-upload__tip">请选择要上传的模板文件</div>
      </template>
    </el-upload>
  </div>
</template>

<script>
import { uploadTemplate } from '../../api/upload'

export default {
  name: 'UploadTemplate',
  data() {
    return {
      fileList: []
    }
  },
  methods: {
    handleUpload(options) {
      const formData = new FormData()
      formData.append('file', options.file)
      
      uploadTemplate(formData).then(response => {
        options.onSuccess(response)
      }).catch(error => {
        options.onError(error)
      })
    },
    beforeUpload(file) {
      // 可以在这里添加文件验证逻辑
      return true
    },
    handleSuccess(response) {
      this.$message.success('上传成功')
    },
    handleError(error) {
      this.$message.error('上传失败：' + error.message)
    }
  }
}
</script>

<style scoped>
.upload-container {
  padding: 20px;
}
.upload-template {
  text-align: center;
}
.el-upload__tip {
  margin-top: 10px;
  color: #606266;
}
</style>
