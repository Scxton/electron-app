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

    <!-- Download History -->
    <el-card class="download-history">
      <div class="history-header">
        <div class="history-title">
          <h3>下载历史记录</h3>
          <div class="history-stats">
            <span>总下载: {{ userDownloadCount }}</span>
            <span>成功: {{ userSuccessfulDownloads }}</span>
            <span>失败: {{ userFailedDownloads }}</span>
            <el-tag v-if="currentUser" type="info" size="small">
              用户: {{ currentUser.username || currentUser.userId }}
            </el-tag>
          </div>
        </div>
        <el-pagination
          v-model:current-page="historyPagination.pageNum"
          v-model:page-size="historyPagination.pageSize"
          :total="historyPagination.total"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[10, 20, 50, 100]"
          background
        />
      </div>
      
      <el-table 
        :data="paginatedHistoryData" 
        stripe 
        style="width: 100%"
        v-loading="historyLoading"
      >
        <el-table-column label="成果名称" min-width="200">
          <template #default="{ row }">
            {{ getAchievementName(row.achievementId) }}
          </template>
        </el-table-column>
        <el-table-column prop="fileSize" label="文件大小" width="120" align="center">
          <template #default="{ row }">
            {{ formatFileSize(row.fileSize) }}
          </template>
        </el-table-column>
        <el-table-column prop="downloadTime" label="下载时间" width="180" align="center">
          <template #default="{ row }">
            {{ formatDownloadTime(row.downloadTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'success' ? 'success' : 'danger'">
              {{ row.status === 'success' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleRedownload(row)">
              重新下载
            </el-button>
            <el-button type="danger" size="small" @click="handleDeleteHistory(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
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
import { queryAllDownloadHistory, deleteDownloadRecordById, downloadAchievements } from '../../api/download'
import { queryById } from '../../api/achieveInfo'
import { getUserInfo } from '../../utils/auth'

// Replace the simulated downloadTasks data with data from localStorage
const downloadTasks = ref([]);

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

// Add these new refs
const downloadHistory = ref([])
const historyLoading = ref(false)
const historyPagination = ref({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// Add current user state
const currentUser = ref(null)

// 在数据定义部分添加
const achievementNames = ref({}) // 存储成果ID对应的成果名称的映射

// Utility Functions
function formatFileSize(bytes) {
  if (bytes === undefined || bytes === null) {
    return '-'
  }
  
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

function confirmFileChange() {
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
  const activeTasks = JSON.parse(localStorage.getItem('activeTasks') || '[]');
  const index = activeTasks.findIndex(t => t.id === task.id);
  
  if (index !== -1) {
    activeTasks.splice(index, 1);
    localStorage.setItem('activeTasks', JSON.stringify(activeTasks));
    
    // 重新加载任务列表
    loadActiveTasks();
    
    ElMessage.info(`已删除：${task.fileName}`);
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

// Update the loadDownloadHistory function to filter by userId
async function loadDownloadHistory() {
  try {
    historyLoading.value = true;
    // Get current user info
    const userIdStr = localStorage.getItem('userId');
    const userId = userIdStr ? parseInt(userIdStr, 10) : null; 
    console.log('【前端】当前用户ID类型：', typeof userId);   
    
    const res = await queryAllDownloadHistory();
    console.log('【前端】下载历史查询成功：', res);
    
    let allRecords = [];
    
    // Check if the response has a data property or if it's the data directly
    if (res.data && Array.isArray(res.data)) {
      allRecords = res.data;
    } else if (Array.isArray(res)) {
      allRecords = res;
    }
    
    // Filter records by userId if available
    if (userId) {
      downloadHistory.value = allRecords.filter(record => record.userId === userId);
      console.log(`【前端】已过滤用户ID为 ${userId} 的下载历史:`, downloadHistory.value);
    } else {
      downloadHistory.value = allRecords;
      console.log('【前端】无用户ID，显示所有下载历史');
    }
    
    // Update total count for pagination
    historyPagination.value.total = downloadHistory.value.length;
    
    // 获取所有记录中的成果名称
    await fetchAchievementNames();
    
  } catch (error) {
    console.error('加载下载历史失败:', error);
    ElMessage.error('加载下载历史失败');
    downloadHistory.value = [];
  } finally {
    historyLoading.value = false;
  }
}

// Modify pagination handlers to filter data client-side instead of server-side
function handlePageChange(currentPage) {
  historyPagination.value.pageNum = currentPage;
  // No need to reload data, just update the page
}

function handleSizeChange(size) {
  historyPagination.value.pageSize = size;
  historyPagination.value.pageNum = 1; // Reset to first page when changing page size
  // No need to reload data, just update the page size
}

// Add a computed property to handle client-side pagination
const paginatedHistoryData = computed(() => {
  const start = (historyPagination.value.pageNum - 1) * historyPagination.value.pageSize;
  const end = start + historyPagination.value.pageSize;
  return downloadHistory.value.slice(start, end);
});

// Add this new method to format the download time
function formatDownloadTime(timestamp) {
  if (!timestamp) return '-'
  const date = new Date(timestamp)
  return date.toISOString().split('T')[0]
}

// Add computed properties for user-specific statistics
const userDownloadCount = computed(() => {
  return downloadHistory.value.length;
})

const userSuccessfulDownloads = computed(() => {
  return downloadHistory.value.filter(record => record.status === 'success').length;
})

const userFailedDownloads = computed(() => {
  return downloadHistory.value.filter(record => record.status !== 'success').length;
})

// 添加获取成果名称的方法
async function fetchAchievementNames() {
  try {
    // 收集所有不重复的成果ID
    const achievementIds = [...new Set(downloadHistory.value.map(record => record.achievementId))];
    
    // 为每个成果ID获取详细信息
    for (const id of achievementIds) {
      if (id) {
        const result = await queryById(id);
        if (result ) {
          // 保存成果名称到映射对象
          achievementNames.value[id] = result.achievementName || '未知成果';
        }
      }
    }
    
    console.log('【前端】获取到的成果名称映射:', achievementNames.value);
  } catch (error) {
    console.error('获取成果名称失败:', error);
  }
}

// 添加获取成果名称的方法
function getAchievementName(achievementId) {
  return achievementNames.value[achievementId] || `成果ID: ${achievementId}`;
}

// Add these new methods
function handleRedownload(row) {
  downloadAchievements(row.fileName, row.achievementId);
  ElMessage.success('已开始重新下载');
}

async function handleDeleteHistory(row) {
  try {
    const response = await deleteDownloadRecordById(row.achievementId);
    console.log('【前端】成果ID ：', row.achievementId);
    if (response) {
      ElMessage.success('下载记录删除成功');
      // Refresh the history list
      await loadDownloadHistory();
    } else {
      ElMessage.error('删除下载记录失败');
    }
  } catch (error) {
    console.error('删除下载记录失败:', error);
    ElMessage.error('删除下载记录失败: ' + (error.message || '服务器错误'));
  }
}

// 添加加载活动下载任务的方法
function loadActiveTasks() {
  try {
    const tasks = JSON.parse(localStorage.getItem('activeTasks') || '[]');
    downloadTasks.value = tasks;
    console.log('【前端】加载活动下载任务：', downloadTasks.value);
  } catch (error) {
    console.error('加载活动下载任务失败:', error);
    downloadTasks.value = [];
  }
}

onMounted(() => {
  // Initialization logic
  ElNotification({
    title: '下载管理器',
    message: '下载管理器已准备就绪',
    type: 'success'
  })
  
  // 加载活动下载任务
  loadActiveTasks();
  
  // 加载下载历史
  loadDownloadHistory();
  
  // 添加事件监听，当下载任务更新时刷新列表
  window.addEventListener('download-tasks-updated', loadActiveTasks);
})

// 确保在组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('download-tasks-updated', loadActiveTasks);
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

  .download-history {
    margin-top: 20px;

    .history-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      
      .history-title {
        display: flex;
        flex-direction: column;
        gap: 5px;
        
        h3 {
          margin: 0;
        }
        
        .history-stats {
          display: flex;
          gap: 15px;
          align-items: center;
          font-size: 0.9rem;
          color: #606266;
        }
      }
    }
  }
}
</style>