<template>
  <div class="upload-container">
    <el-form :model="templateForm" :rules="rules" ref="templateForm">
      <el-form-item label="模板名称" prop="name" class="full-width">
        <el-input v-model="templateForm.name"></el-input>
      </el-form-item>
      
      <div class="form-row">
        <el-form-item label="模板ID" prop="templateId">
          <el-input v-model="templateForm.templateId"></el-input>
        </el-form-item>
        
        <el-form-item label="模板版本" prop="version">
          <el-input v-model="templateForm.version"></el-input>
        </el-form-item>
        
        <el-form-item label="模板类型" prop="type">
          <el-select v-model="templateForm.type" placeholder="请选择模板类型">
            <el-option label="学术论文" value="paper"></el-option>
            <el-option label="专利模板" value="patent"></el-option>
            <el-option label="其他" value="other"></el-option>
          </el-select>
        </el-form-item>
      </div>
      
      
      <el-form-item label="模板文件" prop="file" class="full-width">
        <el-upload
          class="upload-area"
          drag
          :action="'#'"
          :auto-upload="false"
          :on-change="handleFileChange"
          :before-upload="beforeUpload"
          :file-list="fileList">
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <template #tip>
            <div class="el-upload__tip">支持 .doc/.docx/.pdf/.zip/.rar 格式文件</div>
          </template>
        </el-upload>
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" @click="submitForm">提交</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { Upload_template } from '../../api/upload'
import { UploadFilled } from '@element-plus/icons-vue'
export default {
  name: 'UploadTemplate',
  data() {
    return {
      templateForm: {
        name: '',
        version: '',
        type: '',
        templateId: '',
        file: null
      },
      fileList: [],
      rules: {
        name: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
        version: [{ required: true, message: '请输入模板版本', trigger: 'blur' }],
        type: [{ required: true, message: '请选择模板类型', trigger: 'change' }],
        templateId: [{ required: true, message: '请输入模板ID', trigger: 'blur' }],
        file: [{ required: true, message: '请上传模板文件', trigger: 'change' }]
      }
    }
  },
  methods: {
    handleFileChange(file) {
      this.templateForm.file = file.raw
      this.fileList = [file]
    },
    beforeUpload(file) {
      const validTypes = ['.doc', '.docx', '.pdf', '.zip', '.rar']
      const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
      if (!validTypes.includes(extension)) {
        this.$message.error('只支持 .doc/.docx/.pdf/.zip/.rar 格式文件！')
        return false
      }
      return true
    },
    submitForm() {
      this.$refs.templateForm.validate(async (valid) => {
        if (valid) {
          const formData = new FormData()
          formData.append('name', this.templateForm.name)
          formData.append('version', this.templateForm.version)
          formData.append('type', this.templateForm.type)
          formData.append('templateId', this.templateForm.templateId)
          formData.append('file', this.templateForm.file)
          
          try {
            await Upload_template(formData)
            this.$message.success('模板上传成功')
            this.resetForm()
          } catch (error) {
            this.$message.error('模板上传失败：' + error.message)
          }
        }
      })
    },
    resetForm() {
      this.$refs.templateForm.resetFields()
      this.fileList = []
      this.templateForm.file = null
    }
  }
}
</script>
<style scoped>
.upload-container {
  padding: 20px;
}
.upload-area {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  text-align: center;
  padding: 40px 0;
}
.upload-area:hover {
  border-color: #409EFF;
}
.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}
.form-row .el-form-item {
  flex: 1;
  margin-bottom: 0;
}
.full-width {
  margin-bottom: 30px;
}
.el-form-item {
  margin-bottom: 20px;
}
.el-form :deep(.el-form-item__label) {
  width: 80px !important;
}
</style>

