<template>
  <div class="upload-container">
    <div 
      class="drop-zone"
      @dragover.prevent="dragOver = true"
      @dragleave="dragOver = false"
      @drop="onDrop"
      :class="{ 'dragover': dragOver }"
    >
      <span>拖拽文件到此区域 或</span>
      <input
        type="file"
        multiple
        @change="onFileSelect"
        ref="fileInput"
        hidden
      />
      <button @click="triggerFileSelect">选择文件</button>
    </div>

    <div class="file-list" v-if="files.length">
      <div v-for="(file, index) in files" :key="file.name + index" class="file-item">
        <span>{{ file.name }} ({{ formatSize(file.size) }})</span>
        <button @click="removeFile(index)">移除</button>
      </div>
    </div>

    <div class="upload-controls">
      <input 
        type="text" 
        v-model="achievementName"
        placeholder="请输入成果名称"
        required
      />
      <button 
        @click="uploadFiles"
        :disabled="!files.length || !achievementName"
      >
        一键上传
      </button>
    </div>

    <div v-if="progress > 0" class="progress-bar">
      <div :style="{ width: progress + '%' }"></div>
    </div>

    <div v-if="message" :class="['message', messageType]">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { uploadToAudit } from '../../api/up_test';
const dragOver = ref(false);
const files = ref([]);
const achievementName = ref('');
const progress = ref(0);
const message = ref('');
const messageType = ref('');
const fileInput = ref(null);

const formatSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const onDrop = (e) => {
  e.preventDefault();
  dragOver.value = false;
  addFiles(e.dataTransfer.files);
};

const triggerFileSelect = () => {
  fileInput.value.click();
};

const onFileSelect = (e) => {
  addFiles(e.target.files);
  e.target.value = null; // 允许重复选择相同文件
};

const addFiles = (newFiles) => {
  const existingNames = files.value.map(f => f.name);
  const filtered = Array.from(newFiles).filter(f => !existingNames.includes(f.name));
  files.value = [...files.value, ...filtered];
};

const removeFile = (index) => {
  files.value.splice(index, 1);
};

const uploadFiles = async () => {
  const formData = new FormData();
  files.value.forEach(file => {
    formData.append('file', file);
  });
  formData.append('achievementName', achievementName.value);
  formData.append('userId', 1); // 根据实际情况获取用户ID

  try {
    const response = await axios.post('/achievement/uploadtoAudit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: progressEvent => {
        progress.value = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
      }
    });

    if (response.data.type === 'success') {
      showMessage('上传成功，等待审核', 'success');
      files.value = [];
      achievementName.value = '';
    } else {
      showMessage(response.data.message || '上传失败', 'error');
    }
  } catch (error) {
    showMessage(error.response?.data?.message || '上传请求失败', 'error');
  } finally {
    progress.value = 0;
  }
};

const showMessage = (msg, type) => {
  message.value = msg;
  messageType.value = type;
  setTimeout(() => {
    message.value = '';
    messageType.value = '';
  }, 5000);
};
</script>

<style scoped>
.upload-container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.drop-zone {
  border: 2px dashed #ccc;
  padding: 2rem;
  text-align: center;
  transition: border-color 0.3s;
}

.dragover {
  border-color: #2196F3;
  background-color: #f5f5f5;
}

.file-list {
  margin-top: 1rem;
}

.file-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  border-bottom: 1px solid #eee;
}

.progress-bar {
  height: 10px;
  background: #eee;
  margin-top: 1rem;
  border-radius: 5px;
  overflow: hidden;
}

.progress-bar div {
  height: 100%;
  background: #2196F3;
  transition: width 0.3s ease;
}

.message {
  margin-top: 1rem;
  padding: 0.5rem;
  border-radius: 4px;
}

.message.success {
  background: #dff0d8;
  color: #3c763d;
}

.message.error {
  background: #f2dede;
  color: #a94442;
}

.upload-controls {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
}
</style>
