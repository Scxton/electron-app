<template>
  <div class="dialog-overlay" v-if="isVisible" @click.self="cancel">
    <div class="dialog-container">
      <div class="dialog-header">
        <h3>确认下载</h3>
        <button class="close-btn" @click="cancel">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="dialog-content">
        <p>确定将下载 {{ fileCount }} 个文件至:</p>
        <div class="download-path">
          <input type="text" v-model="downloadPath" class="path-input" readonly>
          <button class="browse-btn" @click="browsePath">
            <i class="fas fa-folder-open"></i> 浏览
          </button>
        </div>
        
        <div class="file-list" v-if="fileNames.length > 0">
          <div class="file-list-header">文件列表:</div>
          <div class="file-item" v-for="(file, index) in fileNames" :key="index">
            <i :class="getFileTypeIcon(file)"></i>
            <span class="file-name">{{ file }}</span>
          </div>
        </div>
      </div>
      
      <div class="dialog-footer">
        <button class="cancel-btn" @click="cancel">取消</button>
        <button class="confirm-btn" @click="confirm">确认下载</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { ipcRenderer } from 'electron';

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  fileNames: {
    type: Array,
    default: () => []
  },
  defaultPath: {
    type: String,
    default: 'C:/data/download/'
  }
});

const emit = defineEmits(['confirm', 'cancel']);

const downloadPath = ref(props.defaultPath);
const fileCount = computed(() => props.fileNames.length);

// 监听默认路径变化
watch(() => props.defaultPath, (newPath) => {
  downloadPath.value = newPath;
});

// 浏览文件夹
const browsePath = async () => {
  try {
    const result = await ipcRenderer.invoke('select-download-directory');
    if (result && !result.canceled && result.filePaths.length > 0) {
      downloadPath.value = result.filePaths[0];
    }
  } catch (error) {
    console.error('选择下载目录失败:', error);
  }
};

// 确认下载
const confirm = () => {
  emit('confirm', {
    path: downloadPath.value,
    files: props.fileNames
  });
};

// 取消下载
const cancel = () => {
  emit('cancel');
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
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
}

.dialog-container {
  width: 500px;
  max-width: 90vw;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.dialog-header {
  padding: 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-btn {
  background: transparent;
  border: none;
  color: #666;
  cursor: pointer;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #eee;
  color: #333;
}

.dialog-content {
  padding: 20px;
  flex: 1;
}

.dialog-content p {
  margin: 0 0 16px 0;
  font-size: 15px;
  color: #333;
}

.download-path {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.path-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: #f8f9fa;
}

.browse-btn {
  padding: 8px 12px;
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.browse-btn:hover {
  background: #e5e5e5;
}

.file-list {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 8px;
  margin-top: 16px;
}

.file-list-header {
  font-weight: 500;
  margin-bottom: 8px;
  color: #555;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-bottom: 1px solid #f0f0f0;
}

.file-item:last-child {
  border-bottom: none;
}

.file-item i {
  color: #666;
}

.file-name {
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dialog-footer {
  padding: 16px;
  background: #f8f9fa;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn, .confirm-btn {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.cancel-btn {
  background: white;
  border: 1px solid #ddd;
  color: #333;
}

.cancel-btn:hover {
  background: #f0f0f0;
}

.confirm-btn {
  background: #4a90e2;
  border: 1px solid #3a80d2;
  color: white;
}

.confirm-btn:hover {
  background: #3a80d2;
}
</style> 