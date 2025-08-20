<template>
  <div class="download-face">
    <h2>下载记录</h2>
    
    <div class="action-bar">
      <button @click="deleteSelected" class="btn btn-delete-batch" :disabled="selectedItems.length === 0">
        批量删除 ({{ selectedItems.length }})
      </button>
    </div>
    
    <div class="table-container">
      <table class="download-table">
        <thead>
          <tr>
            <th>
              <input 
                type="checkbox" 
                :checked="selectAll" 
                @change="toggleSelectAll" 
                :disabled="displayedDownloadList.length === 0"
              />
            </th>
            <th>下载名称</th>
            <th>下载时间</th>
            <th>下载状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in displayedDownloadList" :key="index">
            <td>
              <input 
                type="checkbox" 
                :checked="isSelected(item)" 
                @change="toggleSelect(item)"
              />
            </td>
            <td>{{ item.name }}</td>
            <td>{{ formatDate(item.time) }}</td>
            <td>
              <span :class="item.submitted ? 'status-success' : 'status-warning'">
                {{ item.submitted ? '已下载' : '未下载' }}
              </span>
            </td>
            <td>
              <button @click="viewDetails(item)" class="btn btn-view">查看</button>
              <button @click="retryDownload(item)" v-if="!item.completed" class="btn btn-retry">重试</button>
              <button @click="deleteRecord(item)" class="btn btn-delete">删除</button>
            </td>
          </tr>
          <tr v-if="downloadList.length === 0">
            <td colspan="5" class="no-data">暂无下载记录</td>
          </tr>
        </tbody>
      </table>
      
      <!-- 分页控件 -->
      <div class="pagination" v-if="downloadList.length > 0">
        <button 
          class="page-btn" 
          @click="changePage(1)" 
          :disabled="currentPage === 1"
        >
          首页
        </button>
        <button 
          class="page-btn" 
          @click="changePage(currentPage - 1)" 
          :disabled="currentPage === 1"
        >
          上一页
        </button>
        
        <div class="page-info">
          第 <span class="current-page">{{ currentPage }}</span> 页 / 共 {{ totalPages }} 页
        </div>
        
        <button 
          class="page-btn" 
          @click="changePage(currentPage + 1)" 
          :disabled="currentPage === totalPages"
        >
          下一页
        </button>
        <button 
          class="page-btn" 
          @click="changePage(totalPages)" 
          :disabled="currentPage === totalPages"
        >
          末页
        </button>
        
        <select v-model="pageSize" class="page-size-select">
          <option :value="10">10条/页</option>
          <option :value="20">20条/页</option>
          <option :value="50">50条/页</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';

// 下载记录数据
const downloadList = ref([]);
// 选中的记录
const selectedItems = ref([]);

// 分页相关
const currentPage = ref(1);
const pageSize = ref(10); // 每页显示数量
const totalPages = computed(() => {
  return Math.ceil(downloadList.value.length / pageSize.value) || 1;
});

// 当前页显示的下载列表
const displayedDownloadList = computed(() => {
  const startIdx = (currentPage.value - 1) * pageSize.value;
  const endIdx = startIdx + pageSize.value;
  return downloadList.value.slice(startIdx, endIdx);
});

// 切换页码
const changePage = (page) => {
  if (page < 1) page = 1;
  if (page > totalPages.value) page = totalPages.value;
  currentPage.value = page;
};

// 监听每页显示数量变化
watch(pageSize, () => {
  // 重置到第一页
  currentPage.value = 1;
});

// 计算全选状态
const selectAll = computed(() => {
  return displayedDownloadList.value.length > 0 && 
         displayedDownloadList.value.every(item => isSelected(item));
});

// 切换全选/取消全选
const toggleSelectAll = () => {
  if (displayedDownloadList.value.every(item => isSelected(item))) {
    // 取消选中当前页的所有项
    displayedDownloadList.value.forEach(item => {
      if (isSelected(item)) {
        selectedItems.value = selectedItems.value.filter(
          selected => !(selected.name === item.name && selected.time.getTime() === item.time.getTime())
        );
      }
    });
  } else {
    // 选中当前页的所有项
    displayedDownloadList.value.forEach(item => {
      if (!isSelected(item)) {
        selectedItems.value.push(item);
      }
    });
  }
};

// 检查记录是否被选中
const isSelected = (item) => {
  return selectedItems.value.some(
    selected => selected.name === item.name && selected.time.getTime() === item.time.getTime()
  );
};

// 切换选中/取消选中记录
const toggleSelect = (item) => {
  if (isSelected(item)) {
    selectedItems.value = selectedItems.value.filter(
      selected => !(selected.name === item.name && selected.time.getTime() === item.time.getTime())
    );
  } else {
    selectedItems.value.push(item);
  }
};

// 批量删除选中的记录
const deleteSelected = () => {
  if (selectedItems.value.length === 0) return;
  
  if (confirm(`确定要删除选中的 ${selectedItems.value.length} 条记录吗？`)) {
    // 过滤掉被选中的记录
    downloadList.value = downloadList.value.filter(record => {
      return !selectedItems.value.some(
        selected => selected.name === record.name && selected.time.getTime() === record.time.getTime()
      );
    });
    
    // 同时处理downloadPaths中的记录
    selectedItems.value.forEach(item => {
      removeFromDownloadPaths(item);
    });
    
    // 清空选中列表
    selectedItems.value = [];
    
    // 更新本地存储
    updateLocalStorage();
  }
};

// 格式化日期为易读格式
const formatDate = (date) => {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 查看详情
const viewDetails = async (item) => {
  console.log('查看详情:', item);
  
  if (!item.path) {
    alert('无效的下载路径');
    return;
  }

  try {
    window.api.sendmessage('open_folder', item.path)
    
    // const result = await window.electronAPI.sendmessage(item.path);
    // if (!result?.success) {
    //   throw new Error(result?.error || '打开路径失败');
    // }
  } catch (error) {
    console.error('打开路径失败:', error);
    alert(`无法打开路径: ${item.path}\n错误: ${error.message}`);
  }
};

// 重试下载
const retryDownload = (item) => {
  console.log('重试下载:', item);
  // 在这里实现重试下载逻辑
};

// 删除记录
const deleteRecord = (item) => {
  console.log('删除记录:', item);
  
  // 确认删除操作
  if (confirm('确定要删除该下载记录吗？')) {
    // 从下载列表中删除记录
    downloadList.value = downloadList.value.filter(record => 
      !(record.name === item.name && record.time.getTime() === item.time.getTime())
    );
    
    // 更新本地存储
    updateLocalStorage();
    // 同时处理downloadPaths中的记录
    removeFromDownloadPaths(item);
  }
};

// 更新本地存储中的记录
const updateLocalStorage = () => {
  try {
    // 将当前记录转换为存储格式
    const recordsToStore = downloadList.value.map(record => ({
      downloadName: record.name,
      downloadTime: record.time.toISOString(),
      downloadPath: record.path,
      downloadSubmitted: record.submitted,
      downloadSuccess: record.completed
    }));
    
    // 获取当前用户ID（如果有）
    const currentUser = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const userId = currentUser.userId || 'guest';
    
    // 使用用户ID作为键的一部分，这样每个用户都有自己的下载历史
    localStorage.setItem(`downloadForms_${userId}`, JSON.stringify(recordsToStore));
    console.log('下载记录已更新到本地存储');
  } catch (error) {
    console.error('更新下载记录失败:', error);
  }
};

// 从本地存储加载下载记录
const loadDownloadRecords = () => {
  try {
    // 获取当前用户ID（如果有）
    const currentUser = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const userId = currentUser.userId || 'guest';
    
    // 首先尝试加载与当前用户关联的新格式的下载记录
    const storedRecords = localStorage.getItem(`downloadForms_${userId}`);
    
    // 然后尝试加载从Basic_search中保存的下载路径记录
    const storedPaths = localStorage.getItem(`downloadPaths_${userId}`) || localStorage.getItem('downloadPaths');
    
    let records = [];
    
    // 处理downloadForms记录
    if (storedRecords) {
      const parsedRecords = JSON.parse(storedRecords);
      records = [...records, ...parsedRecords.map(record => ({
        name: record.downloadName || '未命名文件',
        time: new Date(record.downloadTime),
        path: record.downloadPath || '未指定路径',
        submitted: record.downloadSubmitted || false,
        completed: record.downloadSuccess || false
      }))];
    }
    
    // 处理从Basic_search中保存的downloadPaths记录
    if (storedPaths) {
      const pathRecords = JSON.parse(storedPaths);
      const convertedRecords = pathRecords.map(record => ({
        name: record.fileName || '未命名文件',
        time: new Date(record.timestamp),
        path: record.path || '未指定路径',
        submitted: true, // 如果有记录，我们假设它已经被提交
        completed: true  // 如果有记录，我们假设下载已经完成
      }));
      
      records = [...records, ...convertedRecords];
    }
    
    // 按时间排序，最新的记录在前面
    records.sort((a, b) => new Date(b.time) - new Date(a.time));
    
    downloadList.value = records;
    
    console.log('加载的下载记录:', downloadList.value);
    
    if (records.length === 0) {
      console.log('没有找到下载记录');
    }
  } catch (error) {
    console.error('加载下载记录失败:', error);
    downloadList.value = [];
  }
};

// 从downloadPaths中移除记录
const removeFromDownloadPaths = (item) => {
  try {
    // 获取当前用户ID（如果有）
    const currentUser = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const userId = currentUser.userId || 'guest';
    
    const storedPaths = localStorage.getItem(`downloadPaths_${userId}`) || localStorage.getItem('downloadPaths');
    if (storedPaths) {
      const pathRecords = JSON.parse(storedPaths);
      // 过滤掉匹配的记录
      const updatedPaths = pathRecords.filter(record => {
        return !(
          (record.fileName === item.name || record.downloadName === item.name) &&
          new Date(record.timestamp || record.downloadTime).getTime() === item.time.getTime()
        );
      });
      
      // 更新本地存储
      localStorage.setItem(`downloadPaths_${userId}`, JSON.stringify(updatedPaths));
      console.log('已从downloadPaths中移除记录');
    }
  } catch (error) {
    console.error('从downloadPaths中移除记录失败:', error);
  }
};

// 组件挂载后加载下载记录
onMounted(() => {
  loadDownloadRecords();
});
</script>

<style scoped>
.download-face {
  padding: 20px;
  max-width: 100%;
}

h2 {
  margin-bottom: 20px;
  color: #333;
}

.action-bar {
  margin-bottom: 15px;
  display: flex;
  justify-content: flex-end;
}

.btn-delete-batch {
  background-color: #ef4444;
  color: white;
  padding: 8px 16px;
}

.btn-delete-batch:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.table-container {
  overflow-x: auto;
}

.download-table {
  width: 100%;
  border-collapse: collapse;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.download-table th,
.download-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.download-table th {
  background-color: #f5f5f5;
  font-weight: bold;
}

.download-table tr:hover {
  background-color: #f9f9f9;
}

.status-success {
  color: #10b981;
  background-color: rgba(16, 185, 129, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
}

.status-warning {
  color: #f59e0b;
  background-color: rgba(245, 158, 11, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
}

.no-data {
  text-align: center;
  color: #888;
  padding: 30px 0;
}

/* 设置复选框样式 */
input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

input[type="checkbox"]:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.btn {
  padding: 6px 12px;
  margin-right: 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
}

.btn-view {
  background-color: #3b82f6;
  color: white;
}

.btn-retry {
  background-color: #f59e0b;
  color: white;
}

.btn-delete {
  background-color: #ef4444;
  color: white;
}

.btn:hover {
  opacity: 0.9;
}

/* 分页样式 */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
  padding: 10px;
  gap: 10px;
}

.page-btn {
  padding: 6px 12px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  color: #333;
  cursor: pointer;
}

.page-btn:hover:not(:disabled) {
  background-color: #e0e0e0;
}

.page-btn:disabled {
  color: #999;
  cursor: not-allowed;
}

.page-info {
  margin: 0 15px;
  color: #666;
}

.current-page {
  font-weight: bold;
  color: #3b82f6;
}

.page-size-select {
  margin-left: 10px;
  padding: 6px;
  border-radius: 4px;
  border: 1px solid #ddd;
}
</style>
