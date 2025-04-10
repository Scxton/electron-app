<template>
  <div class="download-manager">
    <!-- Overall Download Statistics -->
    <el-card class="download-stats">
      <div class="stats-container">
        <div class="stat-item">
          <el-icon>
            <DataLine />
          </el-icon>
          <span>总下载速度：{{ totalDownloadSpeed }} MB/s</span>
        </div>
        <div class="stat-item">
          <el-icon>
            <View />
          </el-icon>
          <span>活动任务：{{ activeDownloads }}</span>
        </div>
        <div class="stat-item">
          <el-icon>
            <Clock />
          </el-icon>
          <span>等待任务：{{ waitingDownloads }}</span>
        </div>
      </div>
    </el-card>

    <!-- Download Actions -->
    <div class="download-actions">
      <el-button type="primary" @click="openFileSelection" icon="Plus">
        添加下载
      </el-button>
      <el-button type="success" @click="startAllDownloads" :disabled="!canStartAll">
        全部开始
      </el-button>
      <el-button type="danger" @click="pauseAllDownloads" :disabled="!canPauseAll">
        全部暂停
      </el-button>
    </div>

    <!-- Download List -->
    <el-card class="download-list">
      <el-table :data="downloadTasks" stripe style="width: 100%" @selection-change="handleSelectionChange">
        <!-- Multiselect Column -->
        <el-table-column type="selection" width="55" />

        <!-- File Information Columns -->
        <el-table-column label="文件名" prop="fileName">
          <template #default="{ row }">
            <div class="file-info">
              <el-tag :type="getFileTypeTag(row.fileType)">
                {{ row.fileType }}
              </el-tag>
              {{ row.fileName }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="大小" prop="fileSize" width="120">
          <template #default="{ row }">
            {{ formatFileSize(row.fileSize) }}
          </template>
        </el-table-column>

        <el-table-column label="状态" prop="status" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" effect="light">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="进度" width="200">
          <template #default="{ row }">
            <el-progress :percentage="calculateProgress(row)" :status="getProgressStatus(row.status)" />
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button v-if="row.status === 'paused'" type="success" link @click="resumeDownload(row)">
                继续
              </el-button>
              <el-button v-if="row.status === 'downloading'" type="warning" link @click="pauseDownload(row)">
                暂停
              </el-button>
              <el-button type="danger" link @click="deleteDownload(row)">
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- File Selection Modal -->
    <el-dialog v-model="fileSelectionDialogVisible" title="选择下载文件" width="600px">
      <el-form>
        <!-- 文件选择逻辑 -->
        <el-form-item label="选择文件">
          <el-upload multiple drag action="#" :on-change="handleFileChange" :auto-upload="false">
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              拖拽文件到此处或<em>点击上传</em>
            </div>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="fileSelectionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmFileSelection">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  ElMessage,
  ElNotification
} from 'element-plus'
import {
  DataLine,
  View,
  Clock,
  UploadFilled
} from '@element-plus/icons-vue'

// Simulated download task structure
const downloadTasks = ref([
  {
    id: 1,
    fileName: '计算中间件.pdf',
    fileType: 'PDF文档',
    fileSize: 4.5 * 1024 * 1024, // 125.4 MB
    status: 'error',
    downloadedSize: 56.4 * 1024 * 1024,
    totalSize: 125.4 * 1024 * 1024,
    errorMessage: '网络连接中断，请检查网络连接后重试'
  },
  {
    id: 2,
    fileName: '监控软件.zip',
    fileType: '压缩包',
    fileSize: 1.2 * 1024 * 1024, // 1.2 GB
    status: 'downloading',
    downloadedSize: 900 * 1024 * 1024,
    totalSize: 1.2 * 1024 * 1024 * 1024,
    downloadSpeed: 1.8
  },
  {
    id: 3,
    fileName: '演示视频.mp4',
    fileType: '视频文件',
    fileSize: 125.4 * 1024 * 1024, // 4.5 GB
    status: 'error',
    downloadedSize: 675 * 1024 * 1024,
    totalSize: 4.5 * 1024 * 1024 * 1024,
    errorMessage: '存储空间不足，请清理磁盘空间后重试'
  },
  {
    id: 4,
    fileName: '通信中间件.zip',
    fileType: '压缩包',
    fileSize: 80 * 1024 * 1024, // 850 MB
    status: 'paused',
    downloadedSize: 0,
    totalSize: 850 * 1024 * 1024
  }
])

const selectedTasks = ref([])
const fileSelectionDialogVisible = ref(false)

// Computed Properties for Download Statistics
const totalDownloadSpeed = computed(() => {
  return downloadTasks.value
    .filter(task => task.status === 'downloading')
    .reduce((sum, task) => sum + (task.downloadSpeed || 0), 0)
    .toFixed(1)
})

const activeDownloads = computed(() =>
  downloadTasks.value.filter(task => task.status === 'downloading').length
)

const waitingDownloads = computed(() =>
  downloadTasks.value.filter(task => task.status === 'paused').length
)

const canStartAll = computed(() =>
  downloadTasks.value.some(task => task.status === 'paused')
)

const canPauseAll = computed(() =>
  downloadTasks.value.some(task => task.status === 'downloading')
)

// Utility Functions
function formatFileSize(bytes) {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`
}

function calculateProgress(task) {
  return task.totalSize > 0
    ? Math.round((task.downloadedSize / task.totalSize) * 100)
    : 0
}

function getStatusLabel(status) {
  const statusMap = {
    'downloading': '下载中',
    'paused': '等待中',
    'completed': '已完成',
    'error': '失败'
  }
  return statusMap[status] || status
}

function getStatusType(status) {
  const statusTypeMap = {
    'downloading': 'primary',
    'paused': 'warning',
    'completed': 'success',
    'error': 'danger'
  }
  return statusTypeMap[status] || 'info'
}

function getProgressStatus(status) {
  return status === 'error' ? 'exception' : undefined
}

function getFileTypeTag(fileType) {
  const typeMap = {
    'PDF文档': 'info',
    '可执行文件': 'success',
    '视频文件': 'warning',
    '压缩文件': 'primary'
  }
  return typeMap[fileType] || 'info'
}

// Download Management Functions
function openFileSelection() {
  fileSelectionDialogVisible.value = true
}

function handleFileChange(file) {
  // 处理文件变更逻辑
  console.log('File changed:', file)
}

function confirmFileSelection() {
  fileSelectionDialogVisible.value = false
  ElMessage.success('文件选择完成')
}

function handleSelectionChange(selection) {
  selectedTasks.value = selection
}

function resumeDownload(task) {
  task.status = 'downloading'
  ElMessage.success(`已恢复下载：${task.fileName}`)
}

function pauseDownload(task) {
  task.status = 'paused'
  ElMessage.warning(`已暂停下载：${task.fileName}`)
}

function deleteDownload(task) {
  const index = downloadTasks.value.findIndex(t => t.id === task.id)
  if (index !== -1) {
    downloadTasks.value.splice(index, 1)
    ElMessage.info(`已删除：${task.fileName}`)
  }
}

function startAllDownloads() {
  downloadTasks.value.forEach(task => {
    if (task.status === 'paused') {
      task.status = 'downloading'
    }
  })
  ElMessage.success('已开始所有等待中的下载任务')
}

function pauseAllDownloads() {
  downloadTasks.value.forEach(task => {
    if (task.status === 'downloading') {
      task.status = 'paused'
    }
  })
  ElMessage.warning('已暂停所有下载任务')
}

onMounted(() => {
  // Initialization logic
  ElNotification({
    title: '下载管理器',
    message: '下载管理器已准备就绪',
    type: 'success'
  })
})
</script>

<style lang="scss" scoped>
.download-manager {
  padding: 20px;
  background-color: #f5f7fa;

  .download-stats {
    margin-bottom: 20px;

    .stats-container {
      display: flex;
      justify-content: space-between;

      .stat-item {
        display: flex;
        align-items: center;
        gap: 10px;
      }
    }
  }

  .download-actions {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
  }

  .file-info {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .action-buttons {
    display: flex;
    gap: 10px;
  }
}
</style>