<template>
  <div class="container">
    <div class="form-container">
      <div class="header-buttons">
        <el-button type="primary" @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回成果表单
        </el-button>
        <div class="clear-button-container">
          <el-button type="warning" @click="clearForm">
            <el-icon>
              <Delete />
            </el-icon>
            清除所有信息
          </el-button>
        </div>
      </div>

      <h2 class="section-title">填写专利信息</h2>

      <el-form ref="formRef" :model="formData" :rules="rules" label-position="top" @submit.prevent>
        <!-- 成果类型和文件数量 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="成果类型" prop="type" required>
              <el-input v-model="formData.type" disabled></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="文件数量" prop="fileCount" required>
              <el-input-number v-model="formData.fileCount" :min="1" :max="10" class="w-100"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 项目选择 -->
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="项目分类" prop="projectId">
              <el-select v-model="formData.projectId" placeholder="请选择项目" class="w-100" clearable>
                <el-option v-for="project in projects" :key="project.projectId" :label="project.projectName"
                  :value="project.projectId"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 课题分类和技术分类 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="课题分类" prop="category" required>
              <el-select v-model="formData.category" placeholder="请选择课题分类" class="w-100">
                <el-option v-for="item in categoryTypes" :key="item.value" :label="item.label"
                  :value="item.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="技术分类" prop="techType" required>
              <el-input v-model="formData.techType" disabled></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 专利类型 -->
        <el-form-item label="专利类型" prop="patentType" required>
          <el-select v-model="formData.patentType" placeholder="请选择专利类型" class="w-100">
            <el-option label="发明专利" value="invention"></el-option>
            <el-option label="软件著作" value="software"></el-option>
            <el-option label="实用新型专利" value="utility"></el-option>
            <el-option label="外观设计专利" value="design"></el-option>
          </el-select>
        </el-form-item>

        <!-- 产权编号 -->
        <el-form-item label="产权编号" prop="patentNumber" required>
          <el-input v-model="formData.patentNumber" placeholder="请输入产权编号"></el-input>
        </el-form-item>

        <!-- 专利日期 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="专利生效时间" prop="effectiveDate" required>
              <el-date-picker
                v-model="formData.effectiveDate"
                type="date"
                placeholder="选择生效日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                class="w-100">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="专利过期时间" prop="expiryDate" required>
              <el-date-picker
                v-model="formData.expiryDate"
                type="date"
                placeholder="选择过期日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                class="w-100">
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 专利名称 -->
        <el-form-item label="专利名称" prop="title" required>
          <el-input v-model="formData.title" placeholder="请输入专利名称"></el-input>
        </el-form-item>

        <!-- 专利简介 -->
        <el-form-item label="专利简介" prop="description" required>
          <el-input v-model="formData.description" type="textarea" :rows="4" placeholder="请简要描述您的专利内容" :maxlength="500"
            show-word-limit></el-input>
          <div class="form-tip">建议字数在500字以内</div>
        </el-form-item>

        <!-- 关键词 -->
        <el-form-item label="关键词" prop="highlights">
          <el-input v-model="formData.highlights" type="textarea" :rows="4" placeholder="请输出和专利相关的关键词，用逗号隔开"></el-input>
        </el-form-item>
        
        <!-- 版本号 -->
        <el-form-item label="版本号" prop="version">
          <el-input v-model="versionWithPrefix" placeholder="请输入版本号"></el-input>
        </el-form-item>

        <!-- 所属组织 -->
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="所属组织" prop="achievementBelongingOrganization" required>
              <el-select v-model="formData.achievementBelongingOrganization" placeholder="请选择所属组织" class="w-100"
                value-key="id">
                <el-option v-for="org in organizations" :key="org.id" :label="org.name" :value="org"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 操作按钮 -->
        <el-form-item class="form-actions">
          <el-button type="submit" @click="confirmForm">
            下一步
          </el-button>
          <el-button type="info" @click="saveDraft">保存草稿</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted, computed } from 'vue'
import { Delete, ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'
import { addAchievement, getAllOrganizations } from '../../api/upload'
import { getAllProjects } from '../../api/project'

// 表单引用
const formRef = ref(null)
const router = useRouter()

// 项目和组织数据
const organizations = ref([])
const projects = ref([])

// 课题分类选项
const categoryTypes = [
  { label: '课题1', value: 'subject1' },
  { label: '课题2', value: 'subject2' },
  { label: '课题3', value: 'subject3' },
  { label: '课题4', value: 'subject4' },
  { label: '课题5', value: 'subject5' }
]

// 表单数据初始化 - 专利默认为技术类成果和专利分类
const formData = reactive({
  title: '',
  type: '技术类成果',  // 显示为中文
  category: '',
  techType: '专利',   // 显示为中文
  fileCount: 1,
  description: '',
  highlights: '',
  version: '',
  achievementBelongingOrganization: { id: null, name: '' },
  projectId: null,
  userId: localStorage.getItem('userId') || null,
  userName: localStorage.getItem('username') || '',
  patentType: '',     // 专利类型
  patentNumber: '',   // 产权编号
  effectiveDate: '',  // 生效时间
  expiryDate: ''      // 过期时间
})

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入专利名称', trigger: 'blur' },
    { min: 2, max: 100, message: '长度应在 2 到 100 个字符之间', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入专利简介', trigger: 'blur' },
    { min: 3, max: 500, message: '字数应在100-500字之间', trigger: 'blur' }
  ],
  fileCount: [
    { required: true, message: '请输入文件数量', trigger: 'change' },
    { type: 'number', min: 1, max: 10, message: '文件数量应在1到10之间', trigger: 'change' }
  ],
  category: [
    { required: true, message: '请选择课题分类', trigger: 'change' }
  ],
  patentType: [
    { required: true, message: '请选择专利类型', trigger: 'change' }
  ],
  patentNumber: [
    { required: true, message: '请输入产权编号', trigger: 'blur' }
  ],
  effectiveDate: [
    { required: true, message: '请选择专利生效时间', trigger: 'change' }
  ],
  expiryDate: [
    { required: true, message: '请选择专利过期时间', trigger: 'change' }
  ],
  achievementBelongingOrganization: [
    { required: true, message: '请选择所属组织', trigger: 'change' }
  ]
}

// 版本号自动前缀功能
const versionWithPrefix = computed({
  get: () => {
    if (!formData.version || formData.version.startsWith('v')) {
      return formData.version
    }
    return `v${formData.version}`
  },
  set: (val) => {
    if (!val) {
      formData.version = ''
      return
    }
    
    if (val.startsWith('v')) {
      formData.version = val
    } else {
      formData.version = `v${val}`
    }
  }
})

// 返回成果表单页面
const goBack = () => {
  router.push('/publish/info')
}

// 提交表单
const confirmForm = async () => {
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 创建提交数据副本
        const submitData = {
          ...formData,
          type: 'technology',  // 转换为英文值
          techType: 'patent'   // 转换为英文值
        }
        
        // 保存表单数据到 localStorage
        localStorage.setItem('Ach_info', JSON.stringify(submitData))
        console.log("formData-Patent", submitData)

        // 跳转到文件上传页面
        router.push('/publish/upload')

        ElMessage.success('请选择要上传的文件')
      } catch (error) {
        console.error('Validation Error:', error)
        ElMessage.error('表单验证失败，请检查必填项')
      }
    } else {
      ElMessage.error('请确保所有必填项已填写')
    }
  })
}

// 保存草稿
const saveDraft = () => {
  localStorage.setItem('patentDraftData', JSON.stringify(formData))
  ElMessage.success('草稿已保存，您可以稍后继续编辑')
}

// 加载保存的草稿数据
const loadSavedData = () => {
  const savedData = localStorage.getItem('patentDraftData')
  if (savedData) {
    const parsedData = JSON.parse(savedData)
    Object.assign(formData, parsedData)
  }
}

// 获取组织数据
const fetchOrganizations = async () => {
  try {
    const response = await getAllOrganizations()
    if (Array.isArray(response)) {
      organizations.value = response.map(item => ({
        id: item.organizationId,
        name: item.organizationName,
      }));
      console.log("organizations", organizations.value)
    }
  } catch (error) {
    console.error('Failed to fetch organizations:', error)
    ElMessage.error('获取组织列表失败')
  }
}

// 获取项目数据
const fetchProjects = async () => {
  try {
    const response = await getAllProjects()
    if (response) {
      projects.value = response.map(item => ({
        projectId: item.projectId,
        projectName: item.projectName
      }))
      console.log("projects", projects.value)
    }
  } catch (error) {
    console.error('Failed to fetch projects:', error)
    ElMessage.error('获取项目列表失败')
  }
}

// 清除表单
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
    .then(() => {
      Object.assign(formData, {
        title: '',
        type: '技术类成果',  // 保持固定值
        category: '',
        techType: '专利',    // 保持固定值
        fileCount: 1,
        description: '',
        highlights: '',
        version: '',
        achievementBelongingOrganization: { id: null, name: '' },
        projectId: null,
        patentType: '',
        patentNumber: '',
        effectiveDate: '',
        expiryDate: ''
      })
      localStorage.removeItem('patentDraftData')
      ElMessage.success('已清除所有信息')
    })
    .catch(() => {
      ElMessage.info('已取消清除操作')
    })
}

// 组件加载时执行
onMounted(() => {
  loadSavedData()
  fetchOrganizations()
  fetchProjects()
  formData.userId = localStorage.getItem('userId') || null
  formData.userName = localStorage.getItem('username') || ''
})
</script>

<style lang="css" scoped>
.container {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 12px;
  box-sizing: border-box;
  display: flex;
  align-items: flex-start;
  min-height: 100vh;
}

.form-container {
  background: white;
  padding: 18px 22px;
  border-radius: 10px;
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.06);
  width: 100%;
  transition: all 0.3s ease;
}

.header-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.clear-button-container {
  display: flex;
  justify-content: flex-end;
}

.section-title {
  margin-bottom: 16px;
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  position: relative;
  padding-left: 12px;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 20px;
  background: #409EFF;
  border-radius: 2px;
}

.w-100 {
  width: 100%;
}

/* 表单项样式优化 - 更紧凑但字体更大 */
:deep(.el-form-item) {
  margin-bottom: 10px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #2c3e50;
  padding-bottom: 3px;
  font-size: 14px;
  line-height: 1.3;
}

:deep(.el-input__wrapper),
:deep(.el-textarea__wrapper) {
  box-shadow: 0 0 0 1px #dcdfe6;
  transition: all 0.2s ease;
}

:deep(.el-input__wrapper:hover),
:deep(.el-textarea__wrapper:hover) {
  box-shadow: 0 0 0 1px #409EFF;
}

/* 调整输入框高度和字体 */
:deep(.el-input__inner) {
  height: 32px;
  line-height: 32px;
  font-size: 14px;
}

/* 调整文本域高度和字体 */
:deep(.el-textarea__inner) {
  min-height: 45px !important;
  font-size: 14px;
  padding: 6px 8px;
}

/* 调整数字输入框样式 */
:deep(.el-input-number) {
  width: 100%;
  height: 32px;
  line-height: 32px;
}

:deep(.el-input-number .el-input__inner) {
  text-align: left;
}

/* 调整下拉选择框高度和字体 */
:deep(.el-select) {
  width: 100%;
}

:deep(.el-select__input) {
  height: 32px;
}

:deep(.el-select-dropdown__item) {
  font-size: 14px;
  padding: 6px 12px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.form-actions {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 按钮样式优化 */
:deep(.el-button) {
  padding: 6px 16px;
  height: 32px;
  font-size: 14px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

:deep(.el-button:not(.el-button--text)) {
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

/* Row 间距调整 */
:deep(.el-row) {
  margin-bottom: 6px !important;
}

/* 响应式优化 */
@media (max-width: 768px) {
  .container {
    padding: 8px;
    align-items: flex-start;
  }

  .form-container {
    padding: 14px;
  }

  .form-actions {
    flex-direction: column;
  }

  :deep(.el-button) {
    width: 100%;
    margin-left: 0 !important;
    margin-bottom: 6px;
  }
  
  .header-buttons {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
}

/* 大屏幕优化 */
@media (min-width: 1200px) {
  .container {
    padding: 16px 24px;
  }

  .form-container {
    padding: 22px 26px;
    max-width: 900px;
    margin: 0 auto;
  }
}

/* 超大屏幕优化 */
@media (min-width: 1600px) {
  .container {
    max-width: 1200px;
  }

  .form-container {
    max-width: 1000px;
  }
}

/* 新增：紧凑型布局优化 */
:deep(.el-form--label-top .el-form-item__label) {
  margin-bottom: 2px;
}

:deep(.el-col) {
  padding-bottom: 0 !important;
}

/* 美化滚动条（如果出现的话） */
::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 2px;
}

::-webkit-scrollbar-track {
  background: #f5f7fa;
}
</style> 