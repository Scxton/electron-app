<template>
  <div class="container">
    <div class="form-container">
      <div class="clear-button-container">
        <el-button type="warning" @click="clearForm">
          <el-icon><Delete /></el-icon>
          清除所有信息
        </el-button>
      </div>

      <h2 class="section-title">填写模板基本信息</h2>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-position="top"
        @submit.prevent
      >
        <!-- 模板名称 -->
        <el-form-item label="模板名称" prop="templateName" required>
          <el-input v-model="formData.templateName" placeholder="请输入模板名称"></el-input>
        </el-form-item>

        <!-- 模板类型和版本 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="模板类型" prop="templateType" required>
              <el-select v-model="formData.templateType" placeholder="请选择模板类型" class="w-100">
                <el-option
                  v-for="item in templateTypes"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="模板版本" prop="version" required>
              <el-input v-model="formData.version" placeholder="请输入版本号"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 模板简介 -->
        <el-form-item label="模板简介" prop="templateIntro" required>
          <el-input
            v-model="formData.templateIntro"
            type="textarea"
            :rows="4"
            placeholder="请输入模板简介"
          ></el-input>
        </el-form-item>

        <!-- 文件上传区域 -->
        <el-form-item label="模板文件" prop="file" required>
          <el-upload
            ref="uploadRef"
            class="upload-area"
            drag
            :auto-upload="false"
            :limit="1"
            :on-change="handleFileChange"
            action="#"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持 .doc/.docx/.pdf/.zip/.rar 格式文件
              </div>
            </template>
          </el-upload>
        </el-form-item>

        <!-- 操作按钮 -->
        <el-form-item class="form-actions">
          <el-button type="primary" @click="previewForm">预览信息</el-button>
          <el-button type="info" @click="saveDraft">保存草稿</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 预览对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      title="信息预览"
      width="50%"
    >
      <div class="preview-content">
        <p><strong>模板名称：</strong>{{ formData.templateName }}</p>
        <p><strong>模板类型：</strong>{{ getTemplateTypeLabel(formData.templateType) }}</p>
        <p><strong>模板版本：</strong>{{ formData.version }}</p>
        <p><strong>模板简介：</strong>{{ formData.templateIntro }}</p>
        <p><strong>上传文件：</strong>{{ uploadedFileName }}</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="previewDialogVisible = false">返回修改</el-button>
          <el-button type="primary" @click="confirmUpload">确认上传</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Delete, UploadFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { addTemplate, Upload_template } from '../../api/template'
import { addLog } from '../../api/log'

// 模板类型选项
const templateTypes = [
  { label: '专利模板', value: 'patent' },
  { label: '论文模板', value: 'paper' },
  { label: '其他压缩包', value: 'other' }
]

// 表单数据初始化
const formData = reactive({
  templateName: '',
  templateType: '',
  version: '',
  templateIntro: '',
  file: null
})

// 文件上传相关
const uploadedFileName = ref('')
const previewDialogVisible = ref(false)

const handleFileChange = (file) => {
  formData.file = file.raw
  uploadedFileName.value = file.name
}

// 表单验证规则
const rules = {
  templateName: [
    { required: true, message: '请输入模板名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度应在 2 到 50 个字符之间', trigger: 'blur' }
  ],
  templateType: [
    { required: true, message: '请选择模板类型', trigger: 'change' }
  ],
  version: [
    { required: true, message: '请输入版本号', trigger: 'blur' }
  ],
  templateIntro: [
    { required: true, message: '请输入模板简介', trigger: 'blur' },
    { min: 10, max: 500, message: '简介长度应在 10 到 500 个字符之间', trigger: 'blur' }
  ],
  file: [
    { required: true, message: '请上传模板文件', trigger: 'change' }
  ]
}

// 获取模板类型标签
const getTemplateTypeLabel = (value) => {
  const type = templateTypes.find(t => t.value === value)
  return type ? type.label : ''
}

// 预览表单
const previewForm = async () => {
  await formRef.value.validate((valid) => {
    if (valid) {
      previewDialogVisible.value = true
    } else {
      ElMessage.error('请确保所有必填项已填写')
    }
  })
}

// 确认上传
const confirmUpload = async () => {
  try {
    console.log('开始上传模板，表单数据：', formData)
    
    const userId = parseInt(localStorage.getItem('userId'))
    if (!userId) {
      throw new Error('用户未登录或登录信息已失效')
    }
    
    const templateData = {
      templateName: formData.templateName,
      templateType: formData.templateType,
      versionNumber: formData.version,
      templateIntro: formData.templateIntro,
      userId: userId,
      tableStatus: true,
      reviewStatus: false
    }

    // 统一调用 Upload_template 上传文件和模板数据
    const response = await Upload_template(formData.file, templateData)
    console.log('模板上传响应：', response)
    
    if (!response ) {
      throw new Error(response?.message || '模板上传失败')
    }
    
    // Add logging for template upload
    const currentDate = new Date().toISOString().split('T')[0]
    await addLog({
      userId: userId,
      logIntro: '上传了新的模板：' + formData.templateName,
      logTime: currentDate,
      tableStatus: true
    })
    
    ElMessage.success('模板上传成功')
    previewDialogVisible.value = false
    
    // 清空表单
    clearForm()
  } catch (error) {
    console.error('模板上传失败：', error)
    ElMessage.error(`模板上传失败：${error.message || '请重试'}`)
  }
}

// 添加上传组件的引用
const uploadRef = ref(null)

// 修改清除表单方法
const clearForm = () => {
  ElMessageBox.confirm(
    '确定要清除所有已填写的信息吗？此操作不可恢复。',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      // 重置表单数据
      Object.assign(formData, {
        templateName: '',
        templateType: '',
        version: '',
        templateIntro: '',
        file: null
      })
      // 清除文件名
      uploadedFileName.value = ''
      // 清除上传组件的文件列表
      if (uploadRef.value) {
        uploadRef.value.clearFiles()
      }
      // 清除本地存储
      localStorage.removeItem('draftFormData')
      
      // Add logging for form clear
      const userId = parseInt(localStorage.getItem('userId'))
      if (userId) {
        const currentDate = new Date().toISOString().split('T')[0]
        await addLog({
          userId: userId,
          logIntro: '清除了模板上传表单',
          logTime: currentDate,
          tableStatus: true
        })
      }
      
      ElMessage.success('已清除所有信息')
    })
    .catch(() => {
      // 用户取消操作
      ElMessage.info('已取消清除操作')
    })
}

// 保存草稿
const saveDraft = async () => {
  // 创建不包含文件对象的数据副本
  const draftData = {
    templateName: formData.templateName,
    templateType: formData.templateType,
    version: formData.version,
    templateIntro: formData.templateIntro,
    fileName: uploadedFileName.value
  }
  
  localStorage.setItem('draftFormData', JSON.stringify(draftData))
  
  // Add logging for draft save
  const userId = parseInt(localStorage.getItem('userId'))
  if (userId) {
    const currentDate = new Date().toISOString().split('T')[0]
    await addLog({
      userId: userId,
      logIntro: '保存了模板草稿：' + formData.templateName,
      logTime: currentDate,
      tableStatus: true
    })
  }
  
  ElMessage.success('草稿已保存，您可以稍后继续编辑')
}

// 添加加载草稿方法
const loadDraft = () => {
  const savedDraft = localStorage.getItem('draftFormData')
  if (savedDraft) {
    const draftData = JSON.parse(savedDraft)
    // 恢复表单数据
    formData.templateName = draftData.templateName
    formData.templateType = draftData.templateType
    formData.version = draftData.version
    formData.templateIntro = draftData.templateIntro
    // 恢复文件名
    uploadedFileName.value = draftData.fileName
  }
}

// 组件挂载时加载草稿
onMounted(() => {
  loadDraft()
})

// 添加表单引用
const formRef = ref(null)
</script>

<style lang="css" scoped>
.container {
  max-width: 1800px;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
}

.form-container {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  max-width: 1000px;
  margin: 0 auto;
}

.section-title {
  margin-bottom: 40px;
  font-size: 28px;
  font-weight: bold;
  color: #2c3e50;
  text-align: center;
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: #409EFF;
  border-radius: 3px;
}

.el-form-item {
  margin-bottom: 25px;
}

.el-button {
  padding: 12px 24px;
  font-weight: 500;
}

.w-100 {
  width: 100%;
}

.author-item {
  margin-bottom: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 4px;
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.keyword-tag {
  margin-right: 10px;
  margin-bottom: 10px;
}

.keyword-input {
  width: 90px;
  margin-right: 10px;
  vertical-align: bottom;
}

.button-new-tag {
  margin-bottom: 10px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.form-actions {
  margin-top: 30px;
  text-align: right;
}

@media (max-width: 768px) {
  .container {
    padding: 10px;
  }
  
  .form-container {
    padding: 15px;
  }
}

.clear-button-container {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.upload-area {
  padding: 30px;
  background: #fafafa;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
}

.upload-area:hover {
  border-color: #409EFF;
  background: #f5f7fa;
}

.preview-content {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 25px;
  line-height: 2;
}

.dialog-footer {
  padding: 20px 0 0;
  text-align: right;
  display: block;
}
</style>
<!-- 需要添加存储路径 -->