<template>
  <div class="download-manager-container">
    <!-- 页面标题 -->
    <el-page-header title="下载管理" @back="goBack" />

    <!-- 统计卡片 -->
    <div class="statistics-container">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon" style="color: #409EFF;">
                <el-icon><Download /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ statistics.totalDownloads }}</div>
                <div class="stat-label">总下载量</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon" style="color: #67C23A;">
                <el-icon><CircleCheck /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ statistics.completedDownloads }}</div>
                <div class="stat-label">已完成</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon" style="color: #E6A23C;">
                <el-icon><Loading /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ statistics.activeDownloads }}</div>
                <div class="stat-label">进行中</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon" style="color: #F56C6C;">
                <el-icon><CircleClose /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ statistics.failedDownloads }}</div>
                <div class="stat-label">失败</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 操作栏 -->
    <div class="operation-bar">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            v-model="searchForm.achievementName"
            placeholder="搜索成果名称"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          />
        </el-col>
        <el-col :span="4">
          <el-select
            v-model="searchForm.status"
            placeholder="下载状态"
            clearable
            @change="handleSearch"
          >
            <el-option label="全部" value="" />
            <el-option label="进行中" value="in_progress" />
            <el-option label="已完成" value="completed" />
            <el-option label="失败" value="failed" />
            <el-option label="已暂停" value="paused" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="handleSearch"
          />
        </el-col>
        <el-col :span="6">
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetSearch">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 下载列表 -->
    <el-card shadow="never">
      <el-table
        :data="downloadList"
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column label="成果信息" min-width="250">
          <template #default="{ row }">
            <div class="achievement-info">
              <div class="achievement-name">{{ row.achievementName }}</div>
              <div class="achievement-meta">
                <el-tag size="small" :type="getCategoryType(row.achievementCategory)">
                  {{ getCategoryLabel(row.achievementCategory) }}
                </el-tag>
                <span class="achievement-author">{{ row.userName }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="文件信息" width="200">
          <template #default="{ row }">
            <div class="file-info">
              <div>{{ row.fileName }}</div>
              <div class="file-size">{{ formatFileSize(row.fileSize) }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="下载进度" width="200">
          <template #default="{ row }">
            <div class="download-progress">
              <el-progress
                :percentage="row.progress"
                :status="getProgressStatus(row.status)"
                :stroke-width="6"
              />
              <div class="progress-text">{{ getProgressText(row) }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="下载时间" width="160">
          <template #default="{ row }">
            <div>{{ formatDateTime(row.downloadTime) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button
                v-if="row.status === 'in_progress'"
                size="small"
                @click="pauseDownload(row)"
              >
                暂停
              </el-button>
              <el-button
                v-if="row.status === 'paused'"
                size="small"
                type="primary"
                @click="resumeDownload(row)"
              >
                继续
              </el-button>
              <el-button
                v-if="row.status === 'failed'"
                size="small"
                type="warning"
                @click="retryDownload(row)"
              >
                重试
              </el-button>
              <el-button
                v-if="row.status === 'completed'"
                size="small"
                type="success"
                @click="openFile(row)"
              >
                打开
              </el-button>
              <el-button
                size="small"
                type="danger"
                @click="deleteDownload(row)"
              >
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';
import {
  getDownloadHistory,
  getDownloadStatistics,
  deleteDownloadRecord,
  retryDownload,
  pauseDownload as pauseDownloadApi,
  resumeDownload as resumeDownloadApi,
  downloadAchievementFile
} from '@renderer/api/download';

const router = useRouter();

// 数据定义
const downloadList = ref([]);
const statistics = ref({
  totalDownloads: 0,
  completedDownloads: 0,
  activeDownloads: 0,
  failedDownloads: 0
});
const loading = ref(false);

// 搜索表单
const searchForm = ref({
  achievementName: '',
  status: '',
  dateRange: []
});

// 分页
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
});

// 计算属性
const filteredDownloads = computed(() => {
  let filtered = [...downloadList.value];
  
  if (searchForm.value.achievementName) {
    filtered = filtered.filter(item => 
      item.achievementName.toLowerCase().includes(searchForm.value.achievementName.toLowerCase())
    );
  }
  
  if (searchForm.value.status) {
    filtered = filtered.filter(item => item.status === searchForm.value.status);
  }
  
  if (searchForm.value.dateRange && searchForm.value.dateRange.length === 2) {
    const [startDate, endDate] = searchForm.value.dateRange;
    filtered = filtered.filter(item => {
      const downloadTime = new Date(item.downloadTime);
      return downloadTime >= startDate && downloadTime <= endDate;
    });
  }
  
  return filtered;
});

// 获取类别标签类型
const getCategoryType = (category) => {
  const typeMap = {
    'paper': 'primary',
    'technical_report': 'success',
    'patent': 'warning',
    'software_copyright': 'info',
    'dataset': 'danger',
    'other': ''
  };
  return typeMap[category] || '';
};

// 获取类别显示标签
const getCategoryLabel = (category) => {
  const labelMap = {
    'paper': '学术论文',
    'technical_report': '技术报告',
    'patent': '专利',
    'software_copyright': '软件著作权',
    'dataset': '数据集',
    'other': '其他'
  };
  return labelMap[category] || category;
};

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
};

// 获取进度状态
const getProgressStatus = (status) => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'failed':
      return 'exception';
    case 'in_progress':
      return '';
    default:
      return '';
  }
};

// 获取进度文本
const getProgressText = (row) => {
  if (row.status === 'in_progress') {
    return `${row.progress}%`;
  } else if (row.status === 'completed') {
    return '已完成';
  } else if (row.status === 'failed') {
    return '失败';
  } else {
    return row.progress + '%';
  }
};

// 获取状态标签类型
const getStatusType = (status) => {
  const typeMap = {
    'in_progress': 'primary',
    'completed': 'success',
    'failed': 'danger',
    'paused': 'warning'
  };
  return typeMap[status] || 'info';
};

// 获取状态标签文本
const getStatusLabel = (status) => {
  const labelMap = {
    'in_progress': '进行中',
    'completed': '已完成',
    'failed': '失败',
    'paused': '已暂停'
  };
  return labelMap[status] || status;
};

// 格式化日期时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return '';
  return new Date(dateTime).toLocaleString('zh-CN');
};

// 返回上一页
const goBack = () => {
  router.push('/home');
};

// 加载下载列表
const loadDownloadList = async () => {
  loading.value = true;
  try {
    const params = {
      pageNum: pagination.value.currentPage,
      pageSize: pagination.value.pageSize,
      ...searchForm.value
    };
    
    if (searchForm.value.dateRange && searchForm.value.dateRange.length === 2) {
      params.startDate = searchForm.value.dateRange[0];
      params.endDate = searchForm.value.dateRange[1];
    }
    
    const response = await getDownloadHistory(params);
    if (response.data.code === 200) {
      downloadList.value = response.data.data.list || [];
      pagination.value.total = response.data.data.total || 0;
    }
  } catch (error) {
    console.error('加载下载列表失败:', error);
    ElMessage.error('加载失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 加载统计数据
const loadStatistics = async () => {
  try {
    const response = await getDownloadStatistics();
    if (response.data.code === 200) {
      statistics.value = response.data.data;
    }
  } catch (error) {
    console.error('加载统计数据失败:', error);
  }
};

// 搜索
const handleSearch = () => {
  pagination.value.currentPage = 1;
  loadDownloadList();
};

// 重置搜索
const resetSearch = () => {
  searchForm.value.achievementName = '';
  searchForm.value.status = '';
  searchForm.value.dateRange = [];
  handleSearch();
};

// 分页处理
const handleSizeChange = (val) => {
  pagination.value.pageSize = val;
  loadDownloadList();
};

const handleCurrentChange = (val) => {
  pagination.value.currentPage = val;
  loadDownloadList();
};

// 暂停下载
const pauseDownload = async (row) => {
  try {
    const response = await pauseDownloadApi(row.downloadId);
    if (response.data.code === 200) {
      ElMessage.success('下载已暂停');
      loadDownloadList();
    } else {
      ElMessage.error(response.data.message || '暂停失败');
    }
  } catch (error) {
    console.error('暂停下载失败:', error);
    ElMessage.error('暂停失败，请稍后重试');
  }
};

// 继续下载
const resumeDownload = async (row) => {
  try {
    const response = await resumeDownloadApi(row.downloadId);
    if (response.data.code === 200) {
      ElMessage.success('下载已继续');
      loadDownloadList();
    } else {
      ElMessage.error(response.data.message || '继续失败');
    }
  } catch (error) {
    console.error('继续下载失败:', error);
    ElMessage.error('继续失败，请稍后重试');
  }
};

// 重试下载
const retryDownload = async (row) => {
  try {
    const response = await retryDownload(row.downloadId);
    if (response.data.code === 200) {
      ElMessage.success('下载已重试');
      loadDownloadList();
    } else {
      ElMessage.error(response.data.message || '重试失败');
    }
  } catch (error) {
    console.error('重试下载失败:', error);
    ElMessage.error('重试失败，请稍后重试');
  }
};

// 打开文件
const openFile = (row) => {
  if (row.filePath) {
    window.electronAPI.openFile(row.filePath);
  } else {
    ElMessage.warning('文件路径不存在');
  }
};

// 删除下载记录
const deleteDownload = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除 "${row.achievementName}" 的下载记录吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    const response = await deleteDownloadRecord(row.downloadId);
    if (response.data.code === 200) {
      ElMessage.success('删除成功');
      loadDownloadList();
      loadStatistics();
    } else {
      ElMessage.error(response.data.message || '删除失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除下载记录失败:', error);
      ElMessage.error('删除失败，请稍后重试');
    }
  }
};

// 生命周期
onMounted(() => {
  loadDownloadList();
  loadStatistics();
});
</script>

<style scoped>
.download-manager-container {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.statistics-container {
  margin-bottom: 20px;
}

.stat-card {
  height: 100%;
}

.stat-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-icon {
  font-size: 48px;
  color: #409EFF;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.operation-bar {
  margin-bottom: 20px;
}

.achievement-info {
  .achievement-name {
    font-weight: bold;
    margin-bottom: 5px;
  }
  
  .achievement-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 12px;
    color: #909399;
    
    .achievement-author {
      margin-left: 10px;
    }
  }
}

.file-info {
  .file-size {
    font-size: 12px;
    color: #909399;
  }
}

.download-progress {
  .progress-text {
    font-size: 12px;
    color: #909399;
    margin-top: 5px;
  }
}

.action-buttons {
  display: flex;
  gap: 5px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

:deep(.el-card) {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style> 