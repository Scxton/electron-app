<template>
  <div class="download-settings-container">
    <!-- 基本设置 -->
    <el-card shadow="hover" class="settings-card">
      <template #header>
        <div class="card-header">
          <el-icon><Setting /></el-icon>
          <span>基本设置</span>
        </div>
      </template>

      <el-form label-width="150px" label-position="left">
        <!-- 默认下载路径 -->
        <el-form-item label="默认下载路径">
          <el-input 
            v-model="settings.defaultDownloadPath" 
            placeholder="请选择下载路径"
            readonly
          >
            <template #append>
              <el-button @click="selectDownloadPath">
                <el-icon><Folder /></el-icon>浏览
              </el-button>
            </template>
          </el-input>
        </el-form-item>

        <!-- 新建下载任务 -->
        <el-form-item label="新建下载任务时">
          <el-radio-group v-model="settings.downloadStartMode">
            <el-radio-button label="immediate">立即开始</el-radio-button>
            <el-radio-button label="manual">手动开始</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <!-- 下载完成后 -->
        <el-form-item label="下载完成后">
          <el-radio-group v-model="settings.downloadCompletedAction">
            <el-radio-button label="none">无操作</el-radio-button>
            <el-radio-button label="openFolder">打开文件位置</el-radio-button>
            <el-radio-button label="openFile">打开文件</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 智能下载 -->
    <el-card shadow="hover" class="settings-card">
      <template #header>
        <div class="card-header">
          <el-icon><Timer /></el-icon>
          <span>智能下载</span>
        </div>
      </template>

      <el-form label-width="150px" label-position="left">
        <!-- 智能下载计划 -->
        <el-form-item label="智能下载计划">
          <el-switch 
            v-model="settings.smartDownloadEnabled"
            active-text="启用"
            inactive-text="禁用"
          />
          <div v-if="settings.smartDownloadEnabled" class="time-range-picker">
            <el-time-picker
              v-model="settings.smartDownloadStartTime"
              placeholder="开始时间"
            />
            <span class="time-separator">至</span>
            <el-time-picker
              v-model="settings.smartDownloadEndTime"
              placeholder="结束时间"
            />
          </div>
        </el-form-item>

        <!-- 自动分类存储 -->
        <el-form-item label="自动分类存储">
          <el-switch 
            v-model="settings.autoClassificationEnabled"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 网络设置 -->
    <el-card shadow="hover" class="settings-card">
      <template #header>
        <div class="card-header">
          <el-icon><Connection /></el-icon>
          <span>网络设置</span>
        </div>
      </template>

      <el-form label-width="150px" label-position="left">
        <!-- 下载速度限制 -->
        <el-form-item label="下载速度限制">
          <el-input-number
            v-model="settings.downloadSpeedLimit"
            :min="0"
            :max="100"
            :step="1"
            controls-position="right"
          />
          <span class="unit-label">MB/s</span>
        </el-form-item>

        <!-- 智能限速 -->
        <el-form-item label="智能限速">
          <el-switch 
            v-model="settings.smartSpeedLimitEnabled"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 通知设置 -->
    <el-card shadow="hover" class="settings-card">
      <template #header>
        <div class="card-header">
          <el-icon><Notification /></el-icon>
          <span>通知设置</span>
        </div>
      </template>

      <el-form label-width="150px" label-position="left">
        <!-- 下载完成通知 -->
        <el-form-item label="下载完成通知">
          <el-switch 
            v-model="settings.downloadCompletedNotificationEnabled"
            active-text="启用"
            inactive-text="禁用"
          />
          <div 
            v-if="settings.downloadCompletedNotificationEnabled" 
            class="notification-preview"
          >
            预览：文件"研究报告.pdf"已下载完成
          </div>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作按钮 -->
    <div class="settings-actions">
      <el-button @click="resetToDefault">恢复默认</el-button>
      <el-button type="primary" @click="saveSettings">保存设置</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { 
  Setting, 
  Folder, 
  Timer, 
  Connection, 
  Notification 
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 设置数据
const settings = reactive({
  // 基本设置
  defaultDownloadPath: '',
  downloadStartMode: 'immediate',
  downloadCompletedAction: 'none',

  // 智能下载
  smartDownloadEnabled: false,
  smartDownloadStartTime: null,
  smartDownloadEndTime: null,
  autoClassificationEnabled: false,

  // 网络设置
  downloadSpeedLimit: 10,
  smartSpeedLimitEnabled: false,

  // 通知设置
  downloadCompletedNotificationEnabled: true
})

// 选择下载路径
const selectDownloadPath = () => {
  // 在实际应用中，这里会调用系统文件选择对话框
  ElMessageBox.prompt('请输入下载路径', '选择路径', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /.+/,
    inputErrorMessage: '请输入有效的路径'
  }).then(({ value }) => {
    settings.defaultDownloadPath = value
    ElMessage.success(`已选择下载路径：${value}`)
  }).catch(() => {
    ElMessage.info('取消选择')
  })
}

// 恢复默认设置
const resetToDefault = () => {
  ElMessageBox.confirm(
    '确定要将所有设置恢复为默认值吗?', 
    '恢复默认', 
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 重置为默认值
    Object.assign(settings, {
      defaultDownloadPath: '',
      downloadStartMode: 'immediate',
      downloadCompletedAction: 'none',
      smartDownloadEnabled: false,
      smartDownloadStartTime: null,
      smartDownloadEndTime: null,
      autoClassificationEnabled: false,
      downloadSpeedLimit: 10,
      smartSpeedLimitEnabled: false,
      downloadCompletedNotificationEnabled: true
    })
    ElMessage.success('已恢复默认设置')
  }).catch(() => {
    ElMessage.info('取消恢复')
  })
}

// 保存设置
const saveSettings = () => {
  // 在实际应用中，这里会调用后端 API 保存设置
  ElMessage.success('设置已保存')
}
</script>

<style scoped>
.download-settings-container {
  max-width: 1800px;
  margin: 0 auto;
  padding: 20px;
}

.settings-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
}

.card-header span {
  margin-left: 10px;
}

.time-range-picker {
  display: flex;
  align-items: center;
  margin-top: 10px;
}

.time-separator {
  margin: 0 10px;
}

.unit-label {
  margin-left: 10px;
  color: #909399;
}

.notification-preview {
  margin-top: 10px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  color: #909399;
}

.settings-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>