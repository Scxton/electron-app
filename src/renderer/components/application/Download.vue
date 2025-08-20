<template>
  <div class="download-manager">
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
        <el-table-column prop="fileSize" label="文件大小/路径" min-width="200" align="center">
          <template #default="{ row }">
            <div>{{ formatFileSize(row.fileSize) }}</div>
            <div class="download-path" v-if="row.filePath">
              <el-tooltip :content="row.filePath" placement="top" :show-after="500">
                <span class="path-text">{{ shortenPath(row.filePath) }}</span>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="downloadTime" label="下载时间" width="180" align="center">
          <template #default="{ row }">
            {{ formatDownloadTime(row.downloadTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="row.tableStatus ? 'success' : 'danger'">
              {{ row.tableStatus ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="表单信息" min-width="200" align="center">
          <template #default="{ row }">
            <div v-if="row.formData || row.filePath">
              <div v-if="row.formData">
                <div v-for="(value, key) in row.formData" :key="key">
                  <strong>{{ key }}:</strong> {{ value }}
                </div>
              </div>
              <div v-if="row.filePath">
                <strong>文件路径:</strong> {{ shortenPath(row.filePath) }}
              </div>
            </div>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleRedownload(row)">
              重新下载
            </el-button>
            <el-button type="success" size="small" @click="handleOpenFile(row)" v-if="row.tableStatus">
              打开文件
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
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { queryAllDownloadHistory, deleteDownloadRecordById, downloadAchievements } from '../../api/download'
import { queryById } from '../../api/achieveInfo'

// Remove all download task related code and keep only history related code
const downloadHistory = ref([])
const historyLoading = ref(false)
const historyPagination = ref({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

const currentUser = ref(null)
const achievementNames = ref({})

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

// Remove all download task related functions and keep only history related functions
async function loadDownloadHistory() {
  try {
    historyLoading.value = true;
    const userIdStr = localStorage.getItem('userId');
    const userId = userIdStr ? parseInt(userIdStr, 10) : null; 
    
    const res = await queryAllDownloadHistory();
    
    let allRecords = [];
    
    if (res.data && Array.isArray(res.data)) {
      allRecords = res.data;
    } else if (Array.isArray(res)) {
      allRecords = res;
    }
    
    if (userId) {
      downloadHistory.value = allRecords.filter(record => record.userId === userId);
    } else {
      downloadHistory.value = allRecords;
    }
    
    // Enhance download history with saved paths and form data from localStorage
    const savedPaths = JSON.parse(localStorage.getItem('downloadPaths') || '[]');
    const savedForms = JSON.parse(localStorage.getItem('downloadForms') || '[]');
    
    downloadHistory.value = downloadHistory.value.map(record => {
      // Find matching path record
      const matchingPath = savedPaths.find(saved => 
        saved.fileName === record.fileName || 
        (record.achievementId && saved.fileName.includes(record.achievementId))
      );
      
      // Find matching form data
      const matchingForm = savedForms.find(form => 
        form.achievementId === record.achievementId
      );
      
      return {
        ...record,
        filePath: matchingPath?.path || record.filePath,
        formData: matchingForm?.formData || null
      };
    });
    
    historyPagination.value.total = downloadHistory.value.length;
    await fetchAchievementNames();
    
  } catch (error) {
    console.error('加载下载历史失败:', error);
    ElMessage.error('加载下载历史失败');
    downloadHistory.value = [];
  } finally {
    historyLoading.value = false;
  }
}

function handlePageChange(currentPage) {
  historyPagination.value.pageNum = currentPage;
}

function handleSizeChange(size) {
  historyPagination.value.pageSize = size;
  historyPagination.value.pageNum = 1;
}

const paginatedHistoryData = computed(() => {
  const start = (historyPagination.value.pageNum - 1) * historyPagination.value.pageSize;
  const end = start + historyPagination.value.pageSize;
  return downloadHistory.value.slice(start, end);
});

function formatDownloadTime(timestamp) {
  if (!timestamp) return '-'
  const date = new Date(timestamp)
  return date.toISOString().split('T')[0]
}

const userDownloadCount = computed(() => {
  return downloadHistory.value.length;
})

const userSuccessfulDownloads = computed(() => {
  return downloadHistory.value.filter(record => record.tableStatus).length;
})

const userFailedDownloads = computed(() => {
  return downloadHistory.value.filter(record => !record.tableStatus).length;
})

async function fetchAchievementNames() {
  try {
    const achievementIds = [...new Set(downloadHistory.value.map(record => record.achievementId))];
    
    for (const id of achievementIds) {
      if (id) {
        const result = await queryById(id);
        if (result) {
          achievementNames.value[id] = result.achievementName || '未知成果';
        }
      }
    }
  } catch (error) {
    console.error('获取成果名称失败:', error);
  }
}

function getAchievementName(achievementId) {
  return achievementNames.value[achievementId] || `成果ID: ${achievementId}`;
}

function handleRedownload(row) {
  downloadAchievements(row.fileName, row.achievementId);
  ElMessage.success('已开始重新下载');
}

async function handleDeleteHistory(row) {
  try {
    const response = await deleteDownloadRecordById(row.achievementId);
    if (response) {
      ElMessage.success('下载记录删除成功');
      await loadDownloadHistory();
    } else {
      ElMessage.error('删除下载记录失败');
    }
  } catch (error) {
    console.error('删除下载记录失败:', error);
    ElMessage.error('删除下载记录失败: ' + (error.message || '服务器错误'));
  }
}

function handleOpenFile(row) {
  console.log('handleOpenFile_start',row)
  window.electronAPI.openFile(row.filePath).catch(error => {
    console.error('打开文件失败:', error);
    ElMessage.error('打开文件失败: ' + (error.message || '文件不存在或无法打开'));
  });
}

function shortenPath(path) {
  console.log('path_shortenPath_start',path)
  if (!path) return '-';
  // If path is too long, show the beginning and end with ellipsis in the middle
  if (path.length > 30) {
    return path.substring(0, 15) + '...' + path.substring(path.length - 15);
  }
  console.log('path_shortenPath_end',path)  
  return path; 

}

// Add this utility function
function storeDownloadRecord(record) {
  try {
    // Get existing records
    const existingRecords = JSON.parse(localStorage.getItem('downloadForms') || '[]');
    
    // Add new record
    existingRecords.push(record);
    
    // Save back to localStorage
    localStorage.setItem('downloadForms', JSON.stringify(existingRecords));
  } catch (error) {
    console.error('保存下载记录失败:', error);
  }
}

onMounted(() => {
  loadDownloadHistory();
})
</script>

<style lang="scss" scoped>
.download-manager {
  padding: 20px;
  background-color: #f5f7fa;

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