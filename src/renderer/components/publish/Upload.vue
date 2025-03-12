<template>
  <div class="achievement-upload-container">
    <!-- 顶部导航 -->
    

    <!-- 主内容区域 -->
    <el-container>
      

      <!-- 上传主内容 -->
      <el-main class="upload-main">
        <!-- 文件拖拽上传区域 -->
        <el-upload
          ref="uploadRef"
          drag
          multiple
          :limit="5"
          :auto-upload="false"
          :on-exceed="handleExceed"
          :before-upload="beforeUpload"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadError"
          :on-change="onChange"
          action="/api/upload"
          class="achievement-uploader"
        >
          <el-icon class="el-icon--upload"><Upload /></el-icon>
          <div class="el-upload__text">
            将文件拖到此处，或
            <em>点击选择文件</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              仅支持 DOC/DOCX/PDF/JPG/PNG/MP4/ZIP/RAR，
              单个文件不超过100MB
            </div>
          </template>
        </el-upload>

        <!-- 修改文件列表卡片 -->
        <el-card v-if="hasFiles" class="file-list-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <div class="card-title">
                <span>待上传文件列表</span>
                <el-tag type="info" class="file-count">
                  共 {{ uploadFileList.length }} 个文件
                </el-tag>
              </div>
              <div class="card-actions">
                <el-button 
                  type="primary" 
                  @click="submitUpload"
                  :disabled="!hasFiles"
                >
                  开始上传
                </el-button>
                <el-button 
                  type="danger" 
                  @click="clearUploadList"
                  :disabled="!hasFiles"
                >
                  清空列表
                </el-button>
                <el-button 
                  type="text" 
                  @click="viewUploadLog()"
                >
                  查看上传记录
                </el-button>
              </div>
            </div>
          </template>
          
          <el-table :data="uploadFileList" stripe>
            <el-table-column prop="name" label="文件名" min-width="120"/>
            <el-table-column prop="type" label="文件类型" width="100">
              <template #default="{ row }">
                {{ getFileTypeLabel(row.type) }}
              </template>
            </el-table-column>
            <el-table-column label="文件信息" min-width="300">
              <template #default="{ row }">
                <!-- 文档类型选项 -->
                <template v-if="isDocumentType(row.type)">
                  <el-form :model="row.metadata" label-width="80px" class="file-form">
                    <el-form-item label="文档类型" required>
                      <el-select v-model="row.metadata.type" placeholder="请选择文档类型">
                        <el-option label="项目报告" value="project_report" />
                        <el-option label="论文" value="paper" />
                        <el-option label="技术文档" value="technical_doc" />
                      </el-select>
                    </el-form-item>
                    <el-form-item label="文档描述">
                      <el-input 
                        v-model="row.metadata.description" 
                        type="textarea" 
                        :rows="2"
                        placeholder="请输入文档描述"
                      />
                    </el-form-item>
                  </el-form>
                </template>

                <!-- 图类型选项 -->
                <template v-if="isImageType(row.type)">
                  <el-form :model="row.metadata" label-width="80px" class="file-form">
                    <el-form-item label="图片分类" required>
                      <el-select v-model="row.metadata.category" placeholder="请选择图片分类">
                        <el-option label="项目截图" value="project_screenshot" />
                        <el-option label="设计图" value="design_image" />
                        <el-option label="演示图" value="demo_image" />
                      </el-select>
                    </el-form-item>
                    <el-form-item label="图片标签">
                      <el-input 
                        v-model="row.metadata.tags" 
                        placeholder="输入标签，多个标签用逗号分隔"
                      />
                    </el-form-item>
                  </el-form>
                </template>

                <!-- 视频类型选项 -->
                <template v-if="isVideoType(row.type)">
                  <el-form :model="row.metadata" label-width="80px" class="file-form">
                    <el-form-item label="视频类型" required>
                      <el-select v-model="row.metadata.type" placeholder="请选择视频类型">
                        <el-option label="演示视频" value="demo_video" />
                        <el-option label="项目介绍" value="project_intro" />
                        <el-option label="技术展示" value="tech_show" />
                      </el-select>
                    </el-form-item>
                  </el-form>
                </template>

                <!-- 压缩文件类型选项 -->
                <template v-if="isArchiveType(row.type)">
                  <el-form :model="row.metadata" label-width="80px" class="file-form">
                    <el-form-item label="文件描述">
                      <el-input 
                        v-model="row.metadata.description" 
                        type="textarea" 
                        :rows="2"
                        placeholder="请输入压缩包描述"
                      />
                    </el-form-item>
                  </el-form>
                </template>
              </template>
            </el-table-column>
            <el-table-column label="上传进度" width="200">
              <template #default="{ row }">
                <el-progress 
                  :percentage="row.progress" 
                  :status="row.status"
                />
              </template>
            </el-table-column>
            <el-table-column prop="size" label="文件大小" width="100" />
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="{ row }">
                <el-button 
                  type="text" 
                  @click="removeFile(row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-main>
    </el-container>

    <!-- 添加导航按钮 -->
    <div class="navigation-buttons">
      <el-button @click="goBack">上一步</el-button>
      <el-button type="primary" @click="goNext">下一步</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { 
  ElMessage, 
  ElMessageBox 
} from 'element-plus'
import { 
  Upload, 
  User, 
  Folder,
  Plus
} from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 上传文件列表
const uploadFileList = ref([])

// 当前活跃的上传类型
const activeUploadType = ref('document')

// 当前用户名


// 表单数据
const documentForm = reactive({
  type: '',
  description: ''
})

const imageForm = reactive({
  category: '',
  tags: ''
})

const videoForm = reactive({
  type: '',
  coverUrl: ''
})

const mixedForm = reactive({
  achievementType: '',
  fileGroups: []
})

const uploadRef = ref(null)
const hasFiles = ref(false)

// 添加上传日志相关的状态
const uploadLogs = reactive({
  timestamp: '',
  successFiles: [],
  failedFiles: [],
})

// 添加保存日志的方法
const saveUploadLog = async (successFiles, failedFiles) => {
  const log = {
    timestamp: new Date().toISOString(),
    successFiles: successFiles.map(file => ({
      name: file.name,
      type: file.type,
      size: file.size,
      metadata: file.metadata
    })),
    failedFiles: failedFiles.map(file => ({
      name: file.name,
      type: file.type,
      size: file.size,
      error: file.error || '上传失败'
    }))
  }

  try {
    // 这里添加保存日志的接口调用
    await saveLogToServer(log)
    return log.timestamp
  } catch (error) {
    console.error('保存日志失败:', error)
    return null
  }
}

// 修改 beforeUpload 函数，添加压缩文件类型
const beforeUpload = (file) => {
  const isLt100M = file.size / 1024 / 1024 < 100
  const allowedTypes = {
    document: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/pdf'],
    image: ['image/jpeg', 'image/png'],
    video: ['video/mp4'],
    archive: ['application/zip', 'application/x-rar-compressed', 'application/x-zip-compressed']
  }
  
  const fileType = Object.keys(allowedTypes).find(type => 
    allowedTypes[type].includes(file.type)
  )

  if (!fileType) {
    ElMessage.error(`不支持的文件类型: ${file.type}`)
    return false
  }

  if (!isLt100M) {
    ElMessage.error('文件大小不能超过100MB')
    return false
  }

  return true
}

// 修改上传成功处理函数
const handleUploadSuccess = (response, file) => {
  const fileIndex = uploadFileList.value.findIndex(
    item => item.name === file.name
  )
  
  if (fileIndex !== -1) {
    uploadFileList.value[fileIndex].progress = 100
    uploadFileList.value[fileIndex].status = 'success'
  }
}

// 修改上传失败处理函数
const handleUploadError = (err, file) => {
  const fileIndex = uploadFileList.value.findIndex(
    item => item.name === file.name
  )
  
  if (fileIndex !== -1) {
    uploadFileList.value[fileIndex].status = 'exception'
    uploadFileList.value[fileIndex].error = err.message || '上传失败'
  }
}

// 处理文件超出限制
const handleExceed = () => {
  ElMessage.warning('最多同时上传5个文件')
}

// 清空上传列表
const clearUploadList = () => {
  ElMessageBox.confirm(
    '确定要清空上传列表吗?', 
    '提示', 
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    uploadFileList.value = []
    uploadRef.value.clearFiles()
    hasFiles.value = false
    ElMessage.success('已清空上传列表')
  })
}

// 移除单个文件
const removeFile = (file) => {
  const index = uploadFileList.value.indexOf(file)
  if (index !== -1) {
    uploadFileList.value.splice(index, 1)
    hasFiles.value = uploadFileList.value.length > 0
    uploadRef.value.handleRemove(file)
  }
}

// 菜单选择处理
const activeMenu = ref('upload')
const handleMenuSelect = (index) => {
  activeMenu.value = index
  // 可以添加路由跳转逻辑
}

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm(
    '确定要退出登录吗?', 
    '退出', 
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 退出登录逻辑
    ElMessage.success('已成功退出')
  })
}

// 添加导航方法
const goBack = () => {
  router.push('/publish/info')
}

const goNext = () => {
  // 检查是否有正在上传的文件
  const hasUploadingFiles = uploadFileList.value.some(
    file => file.status === 'uploading'
  )
  
  if (hasUploadingFiles) {
    ElMessage.warning('请等待所有文件上传完成')
    return
  }

  // 检查是否有上传失败的文件
  const hasFailedFiles = uploadFileList.value.some(
    file => file.status === 'exception'
  )
  
  if (hasFailedFiles) {
    ElMessage.warning('存在上传失败的文件，请重试或删除')
    return
  }

  if (uploadFileList.value.length === 0) {
    ElMessage.warning('请至少上传一个文件')
    return
  }

  router.push('/publish/QualityCheck')
}

// 修改一键上传方法
const submitUpload = async () => {
  // 验证所有必填段
  const hasInvalidFiles = uploadFileList.value.some(file => {
    if (isDocumentType(file.type) && !file.metadata.type) {
      ElMessage.warning(`请选择文件 "${file.name}" 的文档类型`)
      return true
    }
    if (isImageType(file.type) && !file.metadata.category) {
      ElMessage.warning(`请选择文件 "${file.name}" 的图片分类`)
      return true
    }
    if (isVideoType(file.type) && !file.metadata.type) {
      ElMessage.warning(`请选择文件 "${file.name}" 的视频类型`)
      return true
    }
    return false
  })

  if (hasInvalidFiles) return

  // 检查是否有文件正在上传
  const hasUploadingFiles = uploadFileList.value.some(
    file => file.status === 'uploading'
  )
  
  if (hasUploadingFiles) {
    ElMessage.warning('有文件正在上传中，请等待上传完成')
    return
  }

  try {
    // 更新所有等待上传的文件状态为上传中
    uploadFileList.value.forEach(file => {
      if (file.status === 'waiting') {
        file.status = 'uploading'
        file.progress = 0
      }
    })
    
    await uploadRef.value.submit()
    
    // 统计上传结果
    const successFiles = uploadFileList.value.filter(file => file.status === 'success')
    const failedFiles = uploadFileList.value.filter(file => file.status === 'exception')
    
    // 保存上传日志
    const logTimestamp = await saveUploadLog(successFiles, failedFiles)
    
    // 构建提示信息
    const message = h('div', null, [
      h('p', null, [
        `${successFiles.length}个文件上传成功，${failedFiles.length}个文件上传失败。`
      ]),
      h('a', 
        { 
          style: { 
            color: '#409EFF',
            cursor: 'pointer',
            textDecoration: 'underline'
          },
          onClick: () => viewUploadLog(logTimestamp)
        }, 
        '点击查看上传记录'
      )
    ])

    // 根据上传结果显示不同类型的消息
    if (failedFiles.length === 0) {
      ElMessage.success({
        message: '所有文件上传成功',
        duration: 3000
      })
    } else {
      ElMessage({
        message,
        type: 'warning',
        duration: 5000,
        dangerouslyUseHTMLString: true
      })
    }
  } catch (error) {
    console.error('上传错误:', error)
    ElMessage.error('上传过程中出现错误，请查看上传记录了解详情')
    
    // 将上传中的文件状态设置为异常
    uploadFileList.value.forEach(file => {
      if (file.status === 'uploading') {
        file.status = 'exception'
        file.progress = 0
        file.error = error.message || '上传失败'
      }
    })
    
    // 保存错误日志
    await saveUploadLog(
      uploadFileList.value.filter(file => file.status === 'success'),
      uploadFileList.value.filter(file => file.status === 'exception')
    )
  }
}

// 添加保存日志到服务器的方法（需要实现）
const saveLogToServer = async (log) => {
  // 这里添加与后端的接口交互
  const response = await fetch('/api/upload-logs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(log)
  })
  
  if (!response.ok) {
    throw new Error('保存日志失败')
  }
  
  return response.json()
}

// 修改 onChange 函数，为压缩文件添加元数据
const onChange = (file, fileList) => {
  if (file.status === 'ready') {
    if (uploadFileList.value.some(f => f.name === file.name)) {
      ElMessage.error('文件名重复')
      uploadRef.value.handleRemove(file)
      return
    }

    // 初始化文件元数据
    let metadata = {}
    if (isDocumentType(file.raw.type)) {
      metadata = { type: '', description: '' }
    } else if (isImageType(file.raw.type)) {
      metadata = { category: '', tags: '' }
    } else if (isVideoType(file.raw.type)) {
      metadata = { type: '' }
    } else if (isArchiveType(file.raw.type)) {
      metadata = { description: '' }  // 压缩文件只需要描述字段
    }

    uploadFileList.value.push({
      name: file.name,
      type: file.raw.type,
      size: (file.size / 1024 / 1024).toFixed(2) + 'MB',
      progress: 0,
      status: 'waiting',
      metadata: metadata
    })

    uploadRef.value.clearFiles()
  }
  
  hasFiles.value = uploadFileList.value.length > 0
}

// 添加文件类型判断函数
const isDocumentType = (type) => {
  return ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/pdf'].includes(type)
}

const isImageType = (type) => {
  return ['image/jpeg', 'image/png'].includes(type)
}

const isVideoType = (type) => {
  return ['video/mp4'].includes(type)
}

// 添加压缩文件类型判断函数
const isArchiveType = (type) => {
  return ['application/zip', 'application/x-rar-compressed', 'application/x-zip-compressed'].includes(type)
}

// 修改文件类型显示标签函数
const getFileTypeLabel = (type) => {
  if (isDocumentType(type)) return '文档'
  if (isImageType(type)) return '图片'
  if (isVideoType(type)) return '视频'
  if (isArchiveType(type)) return '压缩包'
  return '未知类型'
}

// 添加查看日志的方法
const viewUploadLog = (timestamp) => {
  router.push({
    path: '/upload-logs',
    query: { timestamp }
  })
}

</script>

<style lang="css" scoped>
.achievement-upload-container {
  height: 100vh;
}

.upload-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f5f5f5;
  padding: 0 20px;
}

.sidebar {
  background-color: #f0f2f5;
  height: calc(100vh - 60px);
}

.upload-main {
  background-color: #ffffff;
}

.achievement-uploader {
  margin-bottom: 20px;
}

.upload-options {
  margin-top: 20px;
}

.file-list-card {
  margin-top: 20px;
}

.video-cover-uploader .cover {
  width: 178px;
  height: 178px;
  display: block;
}

.video-cover-uploader .cover-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
  line-height: 178px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
}

.navigation-buttons {
  display: flex;
  justify-content: space-between;
  padding: 20px;
  margin-top: 20px;
}

.upload-controls {
  display: flex;
  gap: 10px;
  margin: 20px 0;
}

.file-form {
  padding: 10px 0;
}

.file-form :deep(.el-form-item) {
  margin-bottom: 10px;
}

.file-form :deep(.el-form-item__label) {
  font-size: 13px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.file-count {
  font-size: 12px;
}

.card-actions {
  display: flex;
  gap: 10px;
}

.file-list-card {
  margin-top: 20px;
  transition: all 0.3s;
}
</style>