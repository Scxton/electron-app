<template>
  <div class="download-manager" :class="{ 'minimized': isMinimized }">
    <div class="download-header">
      <div class="title">下载管理</div>
      <div class="actions">
        <button class="action-btn" @click="toggleMinimize">
          <i :class="isMinimized ? 'fas fa-expand' : 'fas fa-compress'"></i>
        </button>
        <button class="action-btn" @click="closeManager">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
    
    <div class="download-content" v-if="!isMinimized">
      <div class="download-controls">
        <button class="control-btn" @click="resumeAll">
          <i class="fas fa-play"></i> 全部开始
        </button>
        <button class="control-btn" @click="pauseAll">
          <i class="fas fa-pause"></i> 全部暂停
        </button>
        <button class="control-btn" @click="clearCompleted">
          <i class="fas fa-trash"></i> 清除已完成
        </button>
      </div>
      
      <div class="download-list">
        <div v-if="downloads.length === 0" class="empty-downloads">
          <i class="fas fa-download"></i>
          <p>暂无下载任务</p>
        </div>
        
        <div v-for="(item, index) in downloads" :key="index" class="download-item">
          <div class="file-info">
            <div class="file-type-icon">
              <i :class="getFileTypeIcon(item.filename)"></i>
            </div>
            <div class="file-details">
              <div class="filename">{{ item.filename }}</div>
              <div class="file-meta">
                <span class="file-size">{{ formatFileSize(item.totalBytes) }}</span>
                <span class="download-speed" v-if="item.state === 'progressing'">
                  {{ formatSpeed(item.speed) }}
                </span>
                <span class="status-text">{{ getStatusText(item) }}</span>
              </div>
            </div>
          </div>
          
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: `${item.percent}%` }"></div>
            </div>
            <div class="progress-text">{{ item.percent.toFixed(1) }}%</div>
          </div>
          
          <div class="item-actions">
            <button v-if="item.state === 'progressing'" class="item-btn pause" @click="pauseDownload(item)">
              <i class="fas fa-pause"></i>
            </button>
            <button v-if="item.state === 'interrupted'" class="item-btn resume" @click="resumeDownload(item)">
              <i class="fas fa-play"></i>
            </button>
            <button class="item-btn delete" @click="removeDownload(item)">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="isMinimized" class="minimized-info">
      <span v-if="activeDownloads > 0">{{ activeDownloads }}个下载中</span>
      <span v-else>无下载任务</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { ipcRenderer } from 'electron';

const isMinimized = ref(false);
const isVisible = ref(false);
const downloads = ref([]);

// 计算活跃下载数量
const activeDownloads = computed(() => {
  return downloads.value.filter(item => item.state === 'progressing').length;
});

// 切换最小化状态
const toggleMinimize = () => {
  isMinimized.value = !isMinimized.value;
};

// 关闭下载管理器
const closeManager = () => {
  isVisible.value = false;
  // 发送事件通知父组件
  emitter.emit('download-manager-closed');
};

// 暂停所有下载
const pauseAll = () => {
  ipcRenderer.send('download-pause-all');
};

// 恢复所有下载
const resumeAll = () => {
  ipcRenderer.send('download-resume-all');
};

// 清除已完成的下载
const clearCompleted = () => {
  ipcRenderer.send('download-clear-completed');
};

// 暂停单个下载
const pauseDownload = (item) => {
  ipcRenderer.send('download-pause', item.id);
};

// 恢复单个下载
const resumeDownload = (item) => {
  ipcRenderer.send('download-resume', item.id);
};

// 移除单个下载
const removeDownload = (item) => {
  ipcRenderer.send('download-remove', item.id);
};

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
};

// 格式化下载速度
const formatSpeed = (bytesPerSecond) => {
  if (!bytesPerSecond) return '0 KB/s';
  
  if (bytesPerSecond < 1024) {
    return bytesPerSecond.toFixed(2) + ' B/s';
  } else if (bytesPerSecond < 1024 * 1024) {
    return (bytesPerSecond / 1024).toFixed(2) + ' KB/s';
  } else {
    return (bytesPerSecond / (1024 * 1024)).toFixed(2) + ' MB/s';
  }
};

// 获取文件类型图标
const getFileTypeIcon = (filename) => {
  const extension = filename.split('.').pop().toLowerCase();
  
  const iconMap = {
    'pdf': 'fas fa-file-pdf',
    'doc': 'fas fa-file-word',
    'docx': 'fas fa-file-word',
    'xls': 'fas fa-file-excel',
    'xlsx': 'fas fa-file-excel',
    'ppt': 'fas fa-file-powerpoint',
    'pptx': 'fas fa-file-powerpoint',
    'zip': 'fas fa-file-archive',
    'rar': 'fas fa-file-archive',
    'jpg': 'fas fa-file-image',
    'jpeg': 'fas fa-file-image',
    'png': 'fas fa-file-image',
    'mp4': 'fas fa-file-video',
    'mp3': 'fas fa-file-audio',
    'exe': 'fas fa-file-code',
    'txt': 'fas fa-file-alt'
  };
  
  return iconMap[extension] || 'fas fa-file';
};

// 获取状态文本
const getStatusText = (item) => {
  const stateMap = {
    'progressing': '下载中',
    'completed': '已完成',
    'cancelled': '已取消',
    'interrupted': '已暂停',
    'failed': '下载失败'
  };
  
  return stateMap[item.state] || '未知状态';
};

// 监听下载更新事件
onMounted(() => {
  ipcRenderer.on('download-updated', (event, downloadItems) => {
    downloads.value = downloadItems;
  });
  
  // 初始获取下载列表
  ipcRenderer.send('get-downloads');
});

// 组件销毁前移除事件监听
onBeforeUnmount(() => {
  ipcRenderer.removeAllListeners('download-updated');
});

// 暴露方法给父组件
defineExpose({
  isVisible,
  toggleVisibility: () => {
    isVisible.value = !isVisible.value;
  },
  show: () => {
    isVisible.value = true;
  },
  hide: () => {
    isVisible.value = false;
  }
});
</script>

<style scoped>
.download-manager {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 400px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
  transition: all 0.3s ease;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.download-manager.minimized {
  width: 200px;
  height: auto;
}

.download-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #4a90e2;
  color: white;
  cursor: move;
}

.title {
  font-weight: 600;
  font-size: 16px;
}

.actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.2s;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.download-content {
  flex: 1;
  overflow-y: auto;
  max-height: calc(80vh - 48px);
}

.download-controls {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
}

.control-btn {
  padding: 6px 12px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.control-btn:hover {
  background: #e9e9e9;
}

.download-list {
  padding: 8px 0;
}

.empty-downloads {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #999;
}

.empty-downloads i {
  font-size: 32px;
  margin-bottom: 12px;
}

.download-item {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.download-item:last-child {
  border-bottom: none;
}

.file-info {
  display: flex;
  gap: 12px;
}

.file-type-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 20px;
}

.file-details {
  flex: 1;
  min-width: 0;
}

.filename {
  font-weight: 500;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #666;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: #eee;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #4a90e2;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: #666;
  width: 45px;
  text-align: right;
}

.item-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 4px;
}

.item-btn {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.item-btn:hover {
  background: #f5f5f5;
}

.item-btn.pause:hover {
  color: #f0ad4e;
  border-color: #f0ad4e;
}

.item-btn.resume:hover {
  color: #5cb85c;
  border-color: #5cb85c;
}

.item-btn.delete:hover {
  color: #d9534f;
  border-color: #d9534f;
}

.minimized-info {
  padding: 8px 16px;
  font-size: 13px;
  color: #666;
  text-align: center;
}

/* 添加拖动功能的样式 */
.download-header {
  -webkit-app-region: drag;
}

.download-header .actions {
  -webkit-app-region: no-drag;
}
</style> 