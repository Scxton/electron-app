<template>
  <div class="achievement-publish-container">
    <!-- 页面标题 -->
    <el-page-header title="成果发布" @back="goBack" />

    <!-- 步骤条 -->
    <el-steps :active="currentStep" finish-status="success" class="step-container">
      <el-step title="基本信息" description="填写成果的基本信息" />
      <el-step title="文件上传" description="上传相关文件" />
      <el-step title="质量检查" description="检查成果质量" />
      <el-step title="提交审核" description="提交管理员审核" />
    </el-steps>

    <!-- 发布表单 -->
    <el-form
      ref="publishFormRef"
      :model="publishForm"
      :rules="publishRules"
      label-width="120px"
      class="publish-form"
    >
      <!-- 步骤1：基本信息 -->
      <div v-if="currentStep === 0" class="step-content">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="成果名称" prop="achievementName">
              <el-input v-model="publishForm.achievementName" placeholder="请输入成果名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="成果类别" prop="achievementCategory">
              <el-select v-model="publishForm.achievementCategory" placeholder="请选择成果类别">
                <el-option label="学术论文" value="paper" />
                <el-option label="技术报告" value="technical_report" />
                <el-option label="专利" value="patent" />
                <el-option label="软件著作权" value="software_copyright" />
                <el-option label="数据集" value="dataset" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="成果形式" prop="achievementForm">
              <el-select v-model="publishForm.achievementForm" placeholder="请选择成果形式">
                <el-option label="文档" value="document" />
                <el-option label="图片" value="image" />
                <el-option label="视频" value="video" />
                <el-option label="软件" value="software" />
                <el-option label="数据集" value="dataset" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属项目" prop="projectId">
              <el-select v-model="publishForm.projectId" placeholder="请选择所属项目">
                <el-option
                  v-for="project in projectList"
                  :key="project.projectId"
                  :label="project.projectName"
                  :value="project.projectId"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="成果简介" prop="achievementIntro">
          <el-input
            v-model="publishForm.achievementIntro"
            type="textarea"
            :rows="4"
            placeholder="请简要描述成果内容、创新点和应用价值"
          />
        </el-form-item>

        <el-form-item label="技术领域" prop="technologyCategory">
          <el-cascader
            v-model="publishForm.technologyCategory"
            :options="technologyCategories"
            placeholder="请选择技术领域"
            clearable
          />
        </el-form-item>

        <el-form-item label="关键词" prop="keywords">
          <el-tag
            v-for="tag in publishForm.keywords"
            :key="tag"
            closable
            @close="removeKeyword(tag)"
          >
            {{ tag }}
          </el-tag>
          <el-input
            v-if="keywordInputVisible"
            ref="keywordInputRef"
            v-model="keywordInput"
            class="keyword-input"
            size="small"
            @keyup.enter="addKeyword"
            @blur="addKeyword"
          />
          <el-button v-else class="button-new-tag" size="small" @click="showKeywordInput"
            >+ 添加关键词</el-button
          >
        </el-form-item>
      </div>

      <!-- 步骤2：文件上传 -->
      <div v-if="currentStep === 1" class="step-content">
        <el-upload
          ref="uploadRef"
          drag
          multiple
          :limit="10"
          :auto-upload="false"
          :on-exceed="handleExceed"
          :before-upload="beforeUpload"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadError"
          :on-change="handleFileChange"
          :file-list="fileList"
          action="/api/achievement/publish/upload-file"
          class="achievement-uploader"
        >
          <el-icon class="el-icon--upload"><upload /></el-icon>
          <div class="el-upload__text">
            将文件拖到此处，或
            <em>点击选择文件</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              支持上传文档、图片、视频、软件等多种格式，单个文件不超过100MB
            </div>
          </template>
        </el-upload>

        <el-table :data="fileList" style="width: 100%" class="file-table">
          <el-table-column prop="name" label="文件名" width="200" />
          <el-table-column prop="size" label="文件大小" width="100">
            <template #default="{ row }">{{ formatFileSize(row.size) }}</template>
          </el-table-column>
          <el-table-column prop="type" label="文件类型" width="100" />
          <el-table-column label="文件描述">
            <template #default="{ row, $index }">
              <el-input
                v-model="row.description"
                placeholder="请输入文件描述"
                size="small"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="{ $index }">
              <el-button type="danger" size="small" @click="removeFile($index)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 步骤3：质量检查 -->
      <div v-if="currentStep === 2" class="step-content">
        <el-card class="quality-check-card">
          <template #header>
            <div class="card-header">
              <span>质量检查结果</span>
            </div>
          </template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="成果名称">{{ publishForm.achievementName }}</el-descriptions-item>
            <el-descriptions-item label="成果类别">{{ publishForm.achievementCategory }}</el-descriptions-item>
            <el-descriptions-item label="文件数量">{{ fileList.length }}</el-descriptions-item>
            <el-descriptions-item label="总文件大小">{{ totalFileSize }}</el-descriptions-item>
          </el-descriptions>

          <el-divider>质量检查项</el-divider>

          <el-checkbox-group v-model="qualityCheckItems">
            <el-checkbox label="content_complete">成果内容完整，无缺失</el-checkbox>
            <el-checkbox label="format_standard">文件格式符合发布要求</el-checkbox>
            <el-checkbox label="quality_assured">成果质量符合标准</el-checkbox>
            <el-checkbox label="copyright_clear">无版权争议</el-checkbox>
          </el-checkbox-group>
        </el-card>
      </div>

      <!-- 步骤4：提交审核 -->
      <div v-if="currentStep === 3" class="step-content">
        <el-result
          icon="success"
          title="成果发布申请已准备完成"
          sub-title="请确认信息无误后提交审核"
        >
          <template #extra>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="成果名称">{{ publishForm.achievementName }}</el-descriptions-item>
              <el-descriptions-item label="成果类别">{{ publishForm.achievementCategory }}</el-descriptions-item>
              <el-descriptions-item label="文件数量">{{ fileList.length }}</el-descriptions-item>
              <el-descriptions-item label="提交时间">{{ currentTime }}</el-descriptions-item>
            </el-descriptions>
          </template>
        </el-result>
      </div>
    </el-form>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <el-button v-if="currentStep > 0" @click="previousStep">上一步</el-button>
      <el-button v-if="currentStep < 3" type="primary" @click="nextStep"
        >{{ currentStep === 2 ? '提交审核' : '下一步' }}</el-button
      >
      <el-button v-if="currentStep === 3" type="success" @click="submitAchievement"
        >确认提交</el-button
      >
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Upload } from '@element-plus/icons-vue'
import { submitAchievement, uploadFile, getMyProjects } from '@renderer/api/achievement'

const router = useRouter()

// 当前步骤
const currentStep = ref(0)

// 表单数据
const publishForm = reactive({
  achievementName: '',
  achievementCategory: '',
  achievementForm: '',
  projectId: null,
  achievementIntro: '',
  technologyCategory: [],
  keywords: [],
  userId: null
})

// 表单验证规则
const publishRules = {
  achievementName: [
    { required: true, message: '请输入成果名称', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  achievementCategory: [
    { required: true, message: '请选择成果类别', trigger: 'change' }
  ],
  achievementForm: [
    { required: true, message: '请选择成果形式', trigger: 'change' }
  ],
  projectId: [
    { required: true, message: '请选择所属项目', trigger: 'change' }
  ],
  achievementIntro: [
    { required: true, message: '请输入成果简介', trigger: 'blur' },
    { min: 10, max: 1000, message: '长度在 10 到 1000 个字符', trigger: 'blur' }
  ]
}

// 文件列表
const fileList = ref([])

// 项目列表
const projectList = ref([])

// 技术领域选项
const technologyCategories = [
  {
    value: 'artificial_intelligence',
    label: '人工智能',
    children: [
      { value: 'machine_learning', label: '机器学习' },
      { value: 'deep_learning', label: '深度学习' },
      { value: 'computer_vision', label: '计算机视觉' }
    ]
  },
  {
    value: 'software_engineering',
    label: '软件工程',
    children: [
      { value: 'web_development', label: 'Web开发' },
      { value: 'mobile_development', label: '移动开发' },
      { value: 'devops', label: 'DevOps' }
    ]
  }
]

// 关键词相关
const keywordInputVisible = ref(false)
const keywordInput = ref('')
const keywordInputRef = ref()

// 质量检查
const qualityCheckItems = ref([])

// 计算属性
const totalFileSize = computed(() => {
  const total = fileList.value.reduce((sum, file) => sum + file.size, 0)
  return formatFileSize(total)
})

const currentTime = computed(() => {
  return new Date().toLocaleString()
})

// 方法
const nextStep = async () => {
  if (currentStep.value === 0) {
    // 验证基本信息
    await publishFormRef.value.validate()
  } else if (currentStep.value === 1) {
    if (fileList.value.length === 0) {
      ElMessage.warning('请至少上传一个文件')
      return
    }
  } else if (currentStep.value === 2) {
    if (qualityCheckItems.value.length < 4) {
      ElMessage.warning('请完成所有质量检查项')
      return
    }
  }

  if (currentStep.value < 3) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const addKeyword = () => {
  if (keywordInput.value) {
    publishForm.keywords.push(keywordInput.value)
    keywordInput.value = ''
    keywordInputVisible.value = false
  }
}

const removeKeyword = (tag) => {
  publishForm.keywords.splice(publishForm.keywords.indexOf(tag), 1)
}

const showKeywordInput = () => {
  keywordInputVisible.value = true
  nextTick(() => {
    keywordInputRef.value?.focus()
  })
}

const handleExceed = () => {
  ElMessage.warning('最多只能上传10个文件')
}

const beforeUpload = (file) => {
  const isLt100M = file.size / 1024 / 1024 < 100
  if (!isLt100M) {
    ElMessage.error('文件大小不能超过100MB')
    return false
  }
  return true
}

const handleFileChange = (file, fileList) => {
  fileList.value = fileList
}

const removeFile = (index) => {
  fileList.value.splice(index, 1)
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const submitAchievement = async () => {
  try {
    const formData = {
      ...publishForm,
      technologyCategory: publishForm.technologyCategory.join('/'),
      keywords: publishForm.keywords.join(','),
      files: fileList.value
    }

    const response = await submitAchievement(formData)
    
    if (response.data.code === 200) {
      ElMessage.success('成果发布申请已提交，等待管理员审核')
      router.push('/publish/my-achievements')
    } else {
      ElMessage.error(response.data.message || '提交失败')
    }
  } catch (error) {
    console.error('提交成果失败:', error)
    ElMessage.error('提交失败，请稍后重试')
  }
}

const goBack = () => {
  router.push('/publish')
}

const loadProjects = async () => {
  try {
    const response = await getMyProjects()
    if (response.data.code === 200) {
      projectList.value = response.data.data
    }
  } catch (error) {
    console.error('加载项目列表失败:', error)
  }
}

onMounted(() => {
  loadProjects()
})
</script>

<style scoped>
.achievement-publish-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.step-container {
  margin-bottom: 30px;
}

.publish-form {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.step-content {
  margin-bottom: 30px;
}

.keyword-input {
  width: 100px;
  margin-left: 10px;
}

.button-new-tag {
  margin-left: 10px;
}

.file-table {
  margin-top: 20px;
}

.quality-check-card {
  margin-top: 20px;
}

.card-header {
  font-weight: bold;
  color: #303133;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
}

:deep(.el-upload-dragger) {
  padding: 40px;
}

:deep(.el-tag) {
  margin-right: 10px;
  margin-bottom: 5px;
}
</style>