<template>
  <div class="upload-page">
    <div class="file-upload-container">
      <div 
        class="upload-zone"
        :class="{ 'drag-over': isDragging }"
        @dragenter.prevent="handleDragEnter"
        @dragleave.prevent="isDragging = false"
        @dragover.prevent
        @drop.prevent="handleDrop"
      >
        <div class="upload-icon">
          <i class="fas fa-cloud-upload-alt"></i>
        </div>
        <div class="upload-text">
          <p>拖拽文件到此处或</p>
          <button @click="triggerFileInput" class="select-file-btn">
            <i class="fas fa-folder-open"></i> 点击选择文件
          </button>
           <div class="support-text">支持格式：DOC/DOCX, PDF, JPG/PNG, ZIP/RAR, MP4</div>
        </div>
        <input 
          type="file" 
          ref="fileInput" 
          @change="handleFileSelect" 
          multiple
          accept=".doc,.docx,.pdf,.jpg,.jpeg,.png,.mp4,.zip,.rar"
          style="display: none"
        >
      </div>
      
      <div class="files-section" v-if="selectedFiles.length > 0">
        <div class="files-header">
          <div class="files-count">
            <i class="fas fa-file-alt"></i>
            已选择 {{ selectedFiles.length }} 个文件
            <span class="files-size">（总大小：{{ getTotalSize() }}）</span>
          </div>
          <div class="files-actions">
            <button @click="uploadAllFiles" 
                    :disabled="isUploading" 
                    class="action-button upload-btn">
              <i class="fas fa-cloud-upload-alt"></i> 
              {{ isUploading ? '上传中...' : '一键上传' }}
            </button>
            <button @click="clearAllFiles" 
                    :disabled="isUploading" 
                    class="action-button clear-btn">
              <i class="fas fa-trash-alt"></i> 
              清空列表
            </button>
          </div>
        </div>

        <div class="files-list">
          <div v-for="(file, index) in selectedFiles" 
               :key="index" 
               class="file-item">
            <div class="file-details">
              <div class="file-icon">
                <i :class="getFileIcon(file)"></i>
              </div>
              <div class="file-info">
                <div class="file-name">{{ file.name }}</div>
                <div class="file-meta">
                  <span class="file-size">{{ formatFileSize(file.size) }}</span>
                  <span class="file-type">{{ getFileType(file) }}</span>
                </div>
                <div class="progress-bar" v-if="file.uploadStatus">
                  <div class="progress" 
                       :style="{ width: file.progress + '%' }"
                       :class="getProgressClass(file)">
                  </div>
                  <span class="progress-text">{{ file.progress }}%</span>
                </div>
              </div>
            </div>
            
            <div class="file-actions">
              <button v-if="!file.uploading" 
                      @click="startUpload(index)" 
                      class="action-btn start-btn"
                      :disabled="file.uploadStatus === '上传成功'">
                <i class="fas fa-play"></i>
              </button>
              <button v-if="file.uploading" 
                      @click="pauseUpload(index)" 
                      class="action-btn pause-btn">
                <i class="fas fa-pause"></i>
              </button>
              <button @click="removeFile(index)" 
                      class="action-btn delete-btn"
                      :disabled="file.uploading">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 上传结果提示 -->
      <div v-if="uploadResult.show" 
           :class="['upload-result', uploadResult.hasError ? 'error' : 'success']">
        <div class="result-content">
          <i :class="uploadResult.hasError ? 'fas fa-exclamation-circle' : 'fas fa-check-circle'"></i>
          <div class="result-text">
            <p>上传完成！</p>
            <p>成功：{{ uploadResult.success }} 个文件</p>
            <p>失败：{{ uploadResult.failed }} 个文件</p>
          </div>
          <button @click="uploadResult.show = false" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div v-if="uploadResult.hasError" class="error-hint">
          提示：失败文件已保留，请重新上传
        </div>
      </div>
    </div>

    <!-- 添加确认弹窗 -->
    <div v-if="showConfirmDialog" class="dialog-overlay">
      <div class="confirm-dialog" :class="{ 'dialog-show': showConfirmDialog }">
        <div class="dialog-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div class="dialog-content">
          <h3 class="dialog-title">确认清空</h3>
          <p class="dialog-message">确定要清空所有文件吗？此操作不可恢复。</p>
        </div>
        <div class="dialog-actions">
          <button @click="cancelClear" class="dialog-btn cancel-btn">
            <i class="fas fa-times"></i> 取消
          </button>
          <button @click="confirmClear" class="dialog-btn confirm-btn">
            <i class="fas fa-check"></i> 确认
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { addFile, addAchievement } from '../../api/upload'
import { ElMessage } from 'element-plus'

export default {
  name: 'FileUpload',
  data() {
    return {
      selectedFiles: [],
      isDragging: false,
      isUploading: false,
      uploadResult: {
        show: false,
        success: 0,
        failed: 0,
        hasError: false
      },
      showConfirmDialog: false
    }
  },
  methods: {
    // 检查是否已填写表单
    checkFormData() {
      const savedFormData = localStorage.getItem('Ach_info')
      if (!savedFormData) {
        ElMessage.warning('请先返回上一步填写成果信息')
        return false
      }
      return true
    },
    
    // 修改文件选择方法
    triggerFileInput() {
      if (!this.checkFormData()) return
      this.$refs.fileInput.click()
    },
    
    handleFileSelect(event) {
      if (!this.checkFormData()) {
        event.target.value = '' // 清空选择
        return
      }
      const files = Array.from(event.target.files)
      this.addFiles(files)
    },
    
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },
    
    handleDrop(event) {
      if (!this.checkFormData()) return
      
      this.isDragging = false
      const files = Array.from(event.dataTransfer.files)
      this.addFiles(files)
    },

    addFiles(files) {
      const invalidFiles = []
      const validFiles = []
      
      files.forEach(file => {
        if (this.checkFileType(file)) {
          file.uploadStatus = ''
          validFiles.push(file)
        } else {
          invalidFiles.push(file.name)
        }
      })
      
      if (invalidFiles.length > 0) {
        ElMessage.warning({
          message: `不支持的文件类型：${invalidFiles.join(', ')}\n支持类型：DOC/DOCX, PDF, JPG/PNG, ZIP/RAR, MP4`,
          duration: 5000
        })
      }
      
      this.selectedFiles.push(...validFiles)
    },
    
    checkFileType(file) {
      const allowedTypes = ['doc', 'docx', 'pdf', 'jpg', 'jpeg', 'png', 'mp4', 'zip', 'rar']
      const fileExtension = file.name.split('.').pop().toLowerCase()
      return allowedTypes.includes(fileExtension)
    },

    removeFile(index) {
      this.selectedFiles.splice(index, 1)
    },

    getStatusClass(file) {
      if (file.uploadStatus.includes('成功')) return 'status-success'
      if (file.uploadStatus.includes('失败')) return 'status-error'
      if (file.uploadStatus.includes('上传中')) return 'status-progress'
      return ''
    },

    getStatusIcon(file) {
      if (file.uploadStatus.includes('成功')) return 'fas fa-check-circle'
      if (file.uploadStatus.includes('失败')) return 'fas fa-times-circle'
      if (file.uploadStatus.includes('上传中')) return 'fas fa-spinner fa-spin'
      return 'fas fa-info-circle'
    },

    getFileIcon(file) {
      const type = file.name.split('.').pop().toLowerCase()
      const icons = {
        pdf: 'fas fa-file-pdf',
        doc: 'fas fa-file-word',
        docx: 'fas fa-file-word',
        jpg: 'fas fa-file-image',
        jpeg: 'fas fa-file-image',
        png: 'fas fa-file-image',
        mp4: 'fas fa-file-video',
        zip: 'fas fa-file-archive',
        rar: 'fas fa-file-archive'
      }
      return icons[type] || 'fas fa-file'
    },

    getFileType(file) {
      const type = file.name.split('.').pop().toLowerCase()
      const types = {
        pdf: 'PDF文档',
        doc: 'Word文档',
        docx: 'Word文档',
        jpg: '图片',
        jpeg: '图片',
        png: '图片',
        mp4: '视频',
        zip: '压缩包',
        rar: '压缩包'
      }
      return types[type] || '未知类型'
    },

    getProgressClass(file) {
      if (file.uploadStatus === '上传成功') return 'progress-success'
      if (file.uploadStatus === '上传失败') return 'progress-error'
      return 'progress-active'
    },

    async startUpload(index) {
      const file = this.selectedFiles[index]
      if (!file || file.uploading) return

      try {
        file.uploading = true
        file.uploadStatus = '上传中'
        file.progress = 0

        // 获取表单数据
        const savedFormData = JSON.parse(localStorage.getItem('Ach_info'))
        if (!savedFormData) {
          ElMessage.error('请先填写成果信息')
          return
        }

        // 构建完整的表单对象
        const achievementData = {
          achievementName: savedFormData.title,
          achievementCategory: savedFormData.type,
          achievementVersion: savedFormData.version,
          achievementIntro: savedFormData.description,
          remarks: savedFormData.highlights,
          achievementForm: savedFormData.fileCount.toString(),
          achievementBelongingOrganizationId: savedFormData.achievementBelongingOrganization?.id || 0,
          organizationName: savedFormData.achievementBelongingOrganization?.name || '',
          projectId: savedFormData.projectId || 0,
          userId: savedFormData.userId || 0,
          templateId: savedFormData.templateId || 0,
          auditFlag: 0,
          subjectCategory: savedFormData.category,
          technologyCategory: savedFormData.techType
        }
        console.log('formData achievementData',achievementData)
        // 同时上传文件+表单数据
        await addFile([file], achievementData)
        console.log('上传成功')
        file.progress = 100
        file.uploadStatus = '上传成功'
        
        // 更新上传结果
        this.uploadResult.success++
        this.uploadResult.show = true
        
        // 从列表中移除已上传的文件
        this.selectedFiles = this.selectedFiles.filter((_, i) => i !== index)
      } catch (error) {
        console.error('Upload failed:', error)
        file.uploadStatus = '上传失败'
        file.progress = 0
        
        this.uploadResult.failed++
        this.uploadResult.hasError = true
        this.uploadResult.show = true
      } finally {
        file.uploading = false
      }
    },

    pauseUpload(index) {
      const file = this.selectedFiles[index]
      file.uploading = false
    },

    async uploadAllFiles() {
      if (this.isUploading) return
      this.isUploading = true
      
      try {
        // 重置上传结果
        this.uploadResult = {
          show: false,
          success: 0,
          failed: 0,
          hasError: false
        }

        const filesToUpload = this.selectedFiles.filter(
          file => !file.uploadStatus || file.uploadStatus === '上传失败'
        )

        // 获取表单数据
        const savedFormData = JSON.parse(localStorage.getItem('Ach_info'))
        if (!savedFormData) {
          ElMessage.error('请先填写成果信息')
          return
        }

        // 构建完整的表单对象
        const achievementData = {
          achievementName: savedFormData.title,
          achievementCategory: savedFormData.type,
          achievementVersion: savedFormData.version,
          achievementIntro: savedFormData.description,
          remarks: savedFormData.highlights,
          achievementForm: savedFormData.fileCount.toString(),
          achievementBelongingOrganizationId: savedFormData.achievementBelongingOrganization?.id || 0,
          organizationName: savedFormData.achievementBelongingOrganization?.name || '',
          projectId: savedFormData.projectId || 0,
          userId: savedFormData.userId || 0,
          templateId: savedFormData.templateId || 0,
          auditFlag: 0,
          subjectCategory: savedFormData.category,
          technologyCategory: savedFormData.techType
        }
        console.log('formData achievementData',achievementData)
        // 同时上传文件+表单数据
        await addFile(filesToUpload, achievementData)
        
        // 更新所有文件状态为成功
        filesToUpload.forEach(file => {
          file.progress = 100
          file.uploadStatus = '上传成功'
          file.uploading = false
        })
        
        this.uploadResult.success = filesToUpload.length
        this.uploadResult.show = true
      } catch (error) {
        console.error('Upload failed:', error)
        // 更新所有文件状态为失败
        filesToUpload.forEach(file => {
          file.uploadStatus = '上传失败'
          file.uploading = false
        })
        
        this.uploadResult.failed = filesToUpload.length
        this.uploadResult.hasError = true
        this.uploadResult.show = true
      }

      this.isUploading = false
    },

    getTotalSize() {
      const totalBytes = this.selectedFiles.reduce((acc, file) => acc + file.size, 0)
      return this.formatFileSize(totalBytes)
    },

    clearAllFiles() {
      if (this.isUploading) return
      this.showConfirmDialog = true
    },

    cancelClear() {
      this.showConfirmDialog = false
    },

    confirmClear() {
      this.selectedFiles = []
      this.uploadResult = {
        show: false,
        success: 0,
        failed: 0,
        hasError: false
      }
      this.showConfirmDialog = false
    },

    // 修改拖拽进入事件
    handleDragEnter(event) {
      event.preventDefault()
      if (!this.checkFormData()) return
      this.isDragging = true
    },

    async submitAllContent() {
      try {
        // 获取之前保存的表单数据
        const savedFormData = JSON.parse(localStorage.getItem('Ach_info'))
        
        if (!savedFormData) {
          ElMessage.error('未找到成果信息，请返回上一步重新填写')
          return
        }

        const achievementData = {
          achievementName: savedFormData.title,
          achievementCategory: savedFormData.type,
          achievementVersion: savedFormData.version,
          achievementIntro: savedFormData.description,
          remarks: savedFormData.highlights,
          achievementForm: savedFormData.fileCount.toString(),
          achievementBelongingOrganizationId: savedFormData.achievementBelongingOrganization?.id || 0,
          organizationName: savedFormData.achievementBelongingOrganization?.name || '',
          projectId: savedFormData.projectId || 0,
          userId: savedFormData.userId || 0,
          templateId: savedFormData.templateId || 0,
          auditFlag: 0,
          subjectCategory: savedFormData.category,
          technologyCategory: savedFormData.techType
        }
        console.log('achievementData.userId:', achievementData.userId)

        const response = await addAchievement(achievementData)
        
        if (response === 1 || (response && response.code === 200)) {
          ElMessage.success('成果信息提交成功')
          // 清除localStorage中的临时数据
          localStorage.removeItem('Ach_info')
        } else {
          throw new Error(response?.message || '提交失败')
        }
      } catch (error) {
        console.error('Submit Error:', error)
        ElMessage.error(`提交失败：${error.message}`)
      }
    }
  }
}
</script>

<style scoped>
.file-upload-container {
  width: 100%;
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  border-radius: 16px;
  background-color: #ffffff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.upload-zone {
  padding: 40px 20px;
  text-align: center;
  border: 2px dashed #6366f1;
  border-radius: 12px;
  background-color: #f5f7ff;
  transition: all 0.3s ease;
}

.drag-over {
  border-color: #4f46e5;
  background-color: #eef2ff;
}

.upload-icon {
  font-size: 64px;
  color: #6366f1;
  margin-bottom: 20px;
}

.select-file-btn {
  padding: 12px 24px;
  background-color: #6366f1;
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.select-file-btn:hover {
  background-color: #4f46e5;
  transform: translateY(-2px);
}

.file-item {
  margin-top: 15px;
  padding: 15px;
  background-color: #f8fafc;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
}

.file-item:hover {
  background-color: #f1f5f9;
}

.file-details {
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
}

.file-icon {
  font-size: 24px;
  color: #6366f1;
  width: 40px;
  text-align: center;
}

.file-info {
  flex: 1;
}

.file-name {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
}

.file-meta {
  display: flex;
  gap: 12px;
  color: #64748b;
  font-size: 0.9em;
}

.progress-bar {
  margin-top: 8px;
  height: 6px;
  background-color: #e2e8f0;
  border-radius: 3px;
  position: relative;
  overflow: hidden;
}

.progress {
  height: 100%;
  transition: width 0.3s ease;
}

.progress-active {
  background-color: #6366f1;
}

.progress-success {
  background-color: #22c55e;
}

.progress-error {
  background-color: #ef4444;
}

.progress-text {
  position: absolute;
  right: 0;
  top: -18px;
  font-size: 0.8em;
  color: #64748b;
}

.file-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 8px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.start-btn {
  background-color: #22c55e;
  color: white;
}

.pause-btn {
  background-color: #eab308;
  color: white;
}

.delete-btn {
  background-color: #ef4444;
  color: white;
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  filter: brightness(110%);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.upload-all-btn {
  margin-top: 20px;
  padding: 14px 28px;
  background-color: #6366f1;
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  width: 100%;
  font-size: 16px;
  transition: all 0.3s ease;
}

.upload-all-btn:hover:not(:disabled) {
  background-color: #4f46e5;
  transform: translateY(-2px);
}

.upload-all-btn:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
}

.upload-result {
  margin-top: 20px;
  padding: 16px;
  border-radius: 12px;
  animation: slideIn 0.3s ease;
}

.upload-result.success {
  background-color: #f0fdf4;
  border: 1px solid #86efac;
}

.upload-result.error {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
}

.result-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.result-content i {
  font-size: 24px;
}

.success .result-content i {
  color: #22c55e;
}

.error .result-content i {
  color: #ef4444;
}

.result-text {
  flex: 1;
}

.result-text p {
  margin: 2px 0;
  color: #374151;
}

.close-btn {
  padding: 8px;
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  transition: color 0.2s ease;
}

.close-btn:hover {
  color: #374151;
}

.error-hint {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #fecaca;
  color: #ef4444;
  font-size: 0.9em;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 640px) {
  .file-upload-container {
    margin: 10px;
    padding: 10px;
  }

  .file-item {
    flex-direction: column;
    gap: 10px;
  }

  .file-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .upload-result {
    margin: 10px;
    padding: 12px;
  }

  .result-content {
    flex-direction: column;
    text-align: center;
  }

  .close-btn {
    position: absolute;
    top: 8px;
    right: 8px;
  }
}

/* 文件区域样式 */
.files-section {
  margin-top: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}

/* 文件列表头部样式 */
.files-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.files-count {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1e293b;
  font-weight: 500;
}

.files-count i {
  color: #6366f1;
}

.files-size {
  color: #64748b;
  font-weight: normal;
  margin-left: 4px;
}

.files-actions {
  display: flex;
  gap: 12px;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.upload-btn {
  background-color: #6366f1;
  color: white;
}

.upload-btn:hover:not(:disabled) {
  background-color: #4f46e5;
  transform: translateY(-1px);
}

.clear-btn {
  background-color: #ef4444;
  color: white;
}

.clear-btn:hover:not(:disabled) {
  background-color: #dc2626;
  transform: translateY(-1px);
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 调整文件列表样式 */
.files-list {
  padding: 20px;
  max-height: calc(100vh - 400px);
  overflow-y: auto;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .files-header {
    flex-direction: column;
    gap: 12px;
  }

  .files-actions {
    width: 100%;
  }

  .action-button {
    flex: 1;
    justify-content: center;
  }
}

/* 添加文件数量徽章动画 */
@keyframes countUpdate {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.files-count {
  animation: countUpdate 0.3s ease when files-length changes;
}

/* 弹窗遮罩层 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

/* 确认弹窗 */
.confirm-dialog {
  background: white;
  border-radius: 16px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  animation: slideIn 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

/* 警告图标 */
.dialog-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #fff3e5;
  display: flex;
  justify-content: center;
  align-items: center;
}

.dialog-icon i {
  font-size: 32px;
  color: #f59e0b;
}

/* 弹窗内容 */
.dialog-content {
  text-align: center;
}

.dialog-title {
  color: #1e293b;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.dialog-message {
  color: #64748b;
  font-size: 1rem;
  margin: 0;
  line-height: 1.5;
}

/* 按钮区域 */
.dialog-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
  width: 100%;
}

.dialog-btn {
  flex: 1;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.cancel-btn {
  background-color: #f1f5f9;
  color: #64748b;
}

.cancel-btn:hover {
  background-color: #e2e8f0;
  transform: translateY(-1px);
}

.confirm-btn {
  background-color: #ef4444;
  color: white;
}

.confirm-btn:hover {
  background-color: #dc2626;
  transform: translateY(-1px);
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式调整 */
@media (max-width: 640px) {
  .confirm-dialog {
    padding: 20px;
    gap: 16px;
  }

  .dialog-icon {
    width: 50px;
    height: 50px;
  }

  .dialog-icon i {
    font-size: 24px;
  }

  .dialog-title {
    font-size: 1.25rem;
  }

  .dialog-message {
    font-size: 0.875rem;
  }

  .dialog-btn {
    padding: 10px 20px;
    font-size: 0.875rem;
  }
}

/* 添加焦点效果 */
.dialog-btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
}

/* 添加按钮按下效果 */
.dialog-btn:active {
  transform: translateY(1px);
}
</style>
<!-- 功能正常，尝试改为vue3 -->