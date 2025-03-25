<template>
  <div class="download-history-container">
    <!-- 统计卡片区域 -->
    <el-row :gutter="20" class="stats-card-container">
      <el-col :span="6" v-for="(stat, index) in statsData" :key="index">
        <el-card shadow="hover" class="stats-card">
          <div class="stats-card-content">
            <div class="stats-title">{{ stat.title }}</div>
            <div class="stats-value">{{ stat.value }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选区域 -->
    <el-row class="filter-container" :gutter="20">
      <el-col :span="6">
        <el-input 
          v-model="searchFileName" 
          placeholder="按文件名称搜索" 
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </el-col>
      
      <el-col :span="6">
        <el-date-picker
          v-model="downloadTimeRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
        />
      </el-col>
      
      <el-col :span="4">
        <el-select v-model="fileStatus" placeholder="文件状态" clearable>
          <el-option label="下载状态" value="" />
          <el-option label="下载成功" value="completed" />
          <el-option label="下载失败" value="error" />
          <el-option label="已过期" value="expired" />
        </el-select>
      </el-col>
      
      <el-col :span="4">
        <el-select v-model="fileType" placeholder="文件类型" clearable>
          <el-option label="文件类型" value="" />
          <el-option label="文档" value="pdf" />
          <el-option label="图片" value="image" />
          <el-option label="压缩包" value="zip" />
          <el-option label="其他" value="other" />
        </el-select>
      </el-col>

      <el-col :span="4">
        <el-button type="primary" @click="searchDownloadHistory">
          <el-icon><Search /></el-icon>搜索
        </el-button>
        <el-button @click="resetFilters">重置</el-button>
      </el-col>
    </el-row>

    <!-- 下载历史表格 -->
    <el-table 
      :data="filteredDownloadHistory" 
      stripe 
      class="download-history-table"
      max-height="500"
    >
      <el-table-column prop="fileName" label="文件名称" sortable />
      <el-table-column prop="downloadTime" label="下载时间" sortable />
      <el-table-column prop="fileSize" label="文件大小" />
      <el-table-column label="状态" align="center">
        <template #default="scope">
          <el-tag 
            :type="getStatusType(scope.row.status)" 
            disable-transitions
          >
            {{ getStatusLabel(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button-group>
            <el-button 
              type="primary" 
              size="small" 
              @click="redownloadFile(scope.row)"
            >重新下载</el-button>
            <el-button 
              type="danger" 
              size="small" 
              @click="deleteRecord(scope.row)"
            >删除记录</el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="totalRecords"
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        background
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 统计数据

// 下载历史数据
const downloadHistory = ref([
  {
    fileName: '研究报告2024.pdf',
    downloadTime: '2025-02-21 15:30',
    fileSize: '4.5MB',
    status: 'completed'
  },
  {
    fileName: '评估软件.zip',
    downloadTime: '2025-02-22 09:15',
    fileSize: '500MB',
    status: 'error'
  },
  {
    fileName: '专利模板.word',
    downloadTime: '2025-02-26 14:22',
    fileSize: '2.5MB',
    status: 'completed'
  }
])

// 搜索和筛选条件
const searchFileName = ref('')
const downloadTimeRange = ref(null)
const fileStatus = ref('')
const fileType = ref('')

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const totalRecords = ref(downloadHistory.value.length)

// 过滤下载历史
const filteredDownloadHistory = computed(() => {
  return downloadHistory.value.filter(item => {
    const matchFileName = !searchFileName.value || 
      item.fileName.includes(searchFileName.value)
    
    const matchTimeRange = !downloadTimeRange.value || 
      (item.downloadTime >= downloadTimeRange.value[0] && 
       item.downloadTime <= downloadTimeRange.value[1])
    
    const matchStatus = !fileStatus.value || 
      item.status === fileStatus.value
    
    // 这里可以根据文件类型扩展匹配逻辑
    const matchFileType = true

    return matchFileName && matchTimeRange && matchStatus && matchFileType
  })
})

// 获取状态标签类型
const getStatusType = (status) => {
  const statusMap = {
    'completed': 'success',
    'error': 'danger',
    'expired': 'warning'
  }
  return statusMap[status] || 'info'
}

// 获取状态标签文本
const getStatusLabel = (status) => {
  const statusLabels = {
    'completed': '已完成',
    'error': '下载失败',
    'expired': '已过期'
  }
  return statusLabels[status] || '未知状态'
}

// 搜索方法
const searchDownloadHistory = () => {
  // 在实际应用中，这里会调用后端 API
  ElMessage.success('搜索成功')
}

// 重置筛选条件
const resetFilters = () => {
  searchFileName.value = ''
  downloadTimeRange.value = null
  fileStatus.value = ''
  fileType.value = ''
}

// 重新下载文件
const redownloadFile = (row) => {
  ElMessageBox.confirm(
    `确定要重新下载文件 ${row.fileName} 吗?`,
    '确认重新下载',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 实际应用中调用后端重新下载 API
    ElMessage.success('已开始重新下载')
  }).catch(() => {
    ElMessage.info('已取消重新下载')
  })
}

// 删除记录
const deleteRecord = (row) => {
  ElMessageBox.confirm(
    `确定要删除 ${row.fileName} 的下载记录吗?`,
    '删除记录',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'error'
    }
  ).then(() => {
    // 实际应用中调用后端删除记录 API
    downloadHistory.value = downloadHistory.value.filter(
      item => item !== row
    )
    ElMessage.success('记录已删除')
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 分页事件处理
const handleSizeChange = (val) => {
  pageSize.value = val
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}

onMounted(() => {
  // 可以在这里调用后端 API 获取初始数据
})
</script>

<style scoped>
.download-history-container {
  padding: 20px;
}

.stats-card-container {
  margin-bottom: 20px;
}

.stats-card {
  text-align: center;
  height: 100px;
}

.stats-card-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.stats-title {
  color: #909399;
  margin-bottom: 10px;
}

.stats-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.filter-container {
  margin-bottom: 20px;
  align-items: center;
}

.download-history-table {
  width: 100%;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>