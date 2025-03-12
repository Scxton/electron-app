<template>
  <div class="upload-container">
    <el-form :model="uploadForm" label-width="120px">
      <el-form-item label="成果名称">
        <el-input v-model="uploadForm.achievementName" placeholder="请输入成果名称"></el-input>
      </el-form-item>
      
      <el-form-item label="上传文件">
        <el-upload
          class="upload-demo"
          action="#"
          :auto-upload="false"
          :on-change="handleFileChange"
          :file-list="fileList"
          multiple>
          <el-button type="primary">选择文件</el-button>
          <template #tip>
            <div class="el-upload__tip">请选择要上传的文件</div>
          </template>
        </el-upload>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="submitUpload">上传文件</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { addFile } from '../../api/upload'

export default {
  name: 'UploadNew',
  data() {
    return {
      uploadForm: {
        achievementName: ''
      },
      fileList: []
    }
  },
  methods: {
    handleFileChange(file, fileList) {
      this.fileList = fileList
    },
    async submitUpload() {
      if (!this.uploadForm.achievementName) {
        this.$message.error('请输入成果名称')
        return
      }
      if (this.fileList.length === 0) {
        this.$message.error('请选择要上传的文件')
        return
      }

      try {
        const files = this.fileList.map(file => file.raw)
        console.log('Files to upload:', files.map(f => f.name))
        
        const formData = new FormData()
        files.forEach(file => {
          formData.append('file', file)
        })
        formData.append('achievementName', this.uploadForm.achievementName)
        
        for (let [key, value] of formData.entries()) {
          console.log(`${key}:`, value instanceof File ? value.name : value)
        }
        
        const response = await addFile(files, this.uploadForm.achievementName)
        
        if (response.type === 'success') {
          this.$message.success('上传成功')
          this.fileList = []
          this.uploadForm.achievementName = ''
        } else {
          this.$message.error(response.message || '上传失败')
        }
      } catch (error) {
        this.$message.error('上传失败：' + error.message)
      }
    }
  }
}
</script>

<style scoped>
.upload-container {
  padding: 20px;
}
</style>
