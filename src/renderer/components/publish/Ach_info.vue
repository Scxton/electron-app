<template>
  <div class="container">
    <div class="form-container">
      <div class="clear-button-container">
        <el-button type="warning" @click="clearForm">
          <el-icon>
            <Delete />
          </el-icon>
          清除所有信息
        </el-button>
      </div>

      <h2 class="section-title">填写成果基本信息</h2>

      <el-form ref="formRef" :model="formData" :rules="rules" label-position="top" @submit.prevent>
        <!-- 成果名称 -->
        <el-form-item label="成果名称" prop="title" required>
          <el-input v-model="formData.title" placeholder="请输入成果名称"></el-input>
        </el-form-item>

        <!-- 成果类型和文件数量 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="成果类型" prop="type" required>
              <el-select v-model="formData.type" placeholder="请选择成果类型" class="w-100">
                <el-option v-for="item in achievementTypes" :key="item.value" :label="item.label"
                  :value="item.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="文件数量" prop="fileCount" required>
              <el-input-number v-model="formData.fileCount" :min="1" :max="10" class="w-100"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 新增课题分类和技术分类 -->
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
              <el-select v-model="formData.techType" placeholder="请选择技术分类" class="w-100">
                <el-option v-for="item in techTypes" :key="item.value" :label="item.label"
                  :value="item.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 成果简介 -->
        <el-form-item label="成果简介" prop="description" required>
          <el-input v-model="formData.description" type="textarea" :rows="4" placeholder="请简要描述您的成果内容" :maxlength="500"
            show-word-limit></el-input>
          <div class="form-tip">建议字数在500字以内</div>
        </el-form-item>

        <!-- 成果亮点 -->
        <el-form-item label="关键词" prop="highlights">
          <el-input v-model="formData.highlights" type="textarea" :rows="4" placeholder="请输出和成果相关的关键词，用逗号隔开"></el-input>
        </el-form-item>
        <el-form-item label="版本号" prop="version">
          <el-input v-model="formData.version" placeholder="请输入版本号"></el-input>
        </el-form-item>

        <!-- Modified organization section -->
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

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="项目" prop="projectId">
              <el-select v-model="formData.projectId" placeholder="请选择项目" class="w-100" clearable>
                <el-option v-for="project in projects" :key="project.projectId" :label="project.projectName"
                  :value="project.projectId"></el-option>
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
import { ref, reactive, nextTick, onMounted } from 'vue'
import { Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'
import Upload from './Upload.vue'
import { addAchievement, getAllOrganizations } from '../../api/upload'
//import  {add} from "../api/upload";
import { getAllProjects } from '../../api/project' // 新增导入

//导入上传组件
// 表单引用
const formRef = ref(null)
const router = useRouter()

// 成果类型选项
const achievementTypes = [
  { label: '学术论文', value: 'paper' },
  { label: '专利', value: 'patent' },
  { label: '科研项目', value: 'project' },
  { label: '技术报告', value: 'report' }
]

// Add organizations data
const organizations = ref([])

// 新增分类选项
const categoryTypes = [
  { label: '理论', value: 'theory' },
  { label: '系统', value: 'system' },
  { label: '应用', value: 'application' },
  { label: '集成', value: 'integration' },
  { label: '评估测试', value: 'evaluation' }
]

const techTypes = [
  { label: '前端', value: 'frontend' },
  { label: '后端', value: 'backend' },
  { label: '框架', value: 'framework' },
  { label: '计算', value: 'computing' },
  { label: '通信', value: 'communication' },
  { label: '测试', value: 'testing' }
]

// 表单数据初始化
const formData = reactive({
  title: '',
  type: '',
  category: '',
  techType: '',
  fileCount: 1,
  description: '',
  highlights: '',
  version: '',
  achievementBelongingOrganization: { id: null, name: '' },
  projectId: null,
  userId: localStorage.getItem('userId') || null,
  userName: localStorage.getItem('username') || '',
  category: '',
  techType: ''
})
console.log("formData-Ach_info", formData)
// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入成果名称', trigger: 'blur' },
    { min: 2, max: 100, message: '长度应在 2 到 100 个字符之间', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择成果类型', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入成果简介', trigger: 'blur' },
    { min: 3, max: 500, message: '字数应在100-500字之间', trigger: 'blur' }
  ],
  fileCount: [
    { required: true, message: '请输入文件数量', trigger: 'change' },
    { type: 'number', min: 1, max: 10, message: '文件数量应在1到10之间', trigger: 'change' }
  ],
  category: [
    { required: true, message: '请选择课题分类', trigger: 'change' }
  ],
  techType: [
    { required: true, message: '请选择技术分类', trigger: 'change' }
  ]
}

// 提交表单
const confirmForm = async () => {
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 保存表单数据到 localStorage，但不提交到服务器
        localStorage.setItem('Ach_info', JSON.stringify(formData))
        console.log("formData-Ach_info", formData)

        // 直接跳转到文件上传页面
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
  localStorage.setItem('draftFormData', JSON.stringify(formData))
  ElMessage.success('草稿已保存，您可以稍后继续编辑')

}

// 添加加载保存的数据的方法
const loadSavedData = () => {
  const savedData = localStorage.getItem('draftFormData')
  if (savedData) {
    const parsedData = JSON.parse(savedData)
    // 确保日期对象正确恢复
    Object.assign(formData, parsedData)
  }
}

// Add function to fetch organizations
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

const projects = ref([])

// 添加获取项目数据的函数
const fetchProjects = async () => {
  try {
    const response = await getAllProjects()
    console.log("project response", response)
    if (response) {
      projects.value = response.map(item => ({
        projectId: item.projectId,
        projectName: item.projectName // 根据实际接口返回的字段名调整
      }))
      console.log("projects", projects.value)
    }
  } catch (error) {
    console.error('Failed to fetch projects:', error)
    ElMessage.error('获取项目列表失败')
  }
}
// 在组件挂载时加载数据
onMounted(() => {
  loadSavedData()
  fetchOrganizations()
  fetchProjects()
  formData.userId = localStorage.getItem('userId') || null
  formData.userName = localStorage.getItem('username') || ''

  // 新增：从路由参数中获取并填充数据
  const route = useRoute()
  console.log('Route query:', route.query) // 调试信息

  if (route.query.id) {
    console.log('Filling form data from route query') // 调试信息
    formData.title = route.query.title || ''
    formData.type = route.query.type || ''
    formData.description = route.query.description || ''
    formData.version = route.query.version || ''
    formData.achievementBelongingOrganization = {
      id: route.query.achievementBelongingOrganization?.id || null,
      name: route.query.achievementBelongingOrganization?.name || ''
    }
    formData.projectId = route.query.projectId || null
    formData.category = route.query.category || ''
    formData.techType = route.query.techType || ''
    formData.highlights = route.query.highlights || ''
    formData.fileCount = route.query.fileCount || 1

    // 调试信息：打印填充后的表单数据
    console.log('Form data after filling:', JSON.parse(JSON.stringify(formData)))
  } else {
    console.log('No route query id found') // 调试信息
  }

  // 调试信息：打印当前的组织和项目数据
  nextTick(() => {
    console.log('Organizations:', organizations.value)
    console.log('Projects:', projects.value)
  })
})

// 添加清除表单方法
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
        type: '',
        category: '',
        techType: '',
        fileCount: 1,
        description: '',
        highlights: '',
        version: '',
        achievementBelongingOrganization: { id: null, name: '' },
        projectId: null
      })
      localStorage.removeItem('draftFormData')
      ElMessage.success('已清除所有信息')
    })
    .catch(() => {
      ElMessage.info('已取消清除操作')
    })
}

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

.clear-button-container {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}

:deep(.el-button--warning) {
  padding: 4px 12px;
  height: 28px;
  font-size: 13px;
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
