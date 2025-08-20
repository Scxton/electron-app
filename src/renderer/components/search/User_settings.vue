<template>
  <div class="settings-container">
    <h2><el-icon><Setting /></el-icon> 检索设置</h2>
    
    <div class="settings-grid">
      <!-- 左侧列 -->
      <div class="settings-column">
        <!-- 默认显示数量设置 -->
        <div class="setting-section">
          <h3>
            <el-icon><List /></el-icon>
            每页显示数量
          </h3>
          <el-select v-model="settings.pageSize" placeholder="选择每页显示数量">
            <el-option v-for="size in pageSizes" 
              :key="size" 
              :label="`${size}条/页`" 
              :value="size" />
          </el-select>
        </div>

        <!-- 默认排序方式 -->
        <div class="setting-section">
          <h3>
            <el-icon><Sort /></el-icon>
            默认排序方式
          </h3>
          <el-radio-group v-model="settings.defaultSort">
            <el-radio label="time">
              <el-icon><Timer /></el-icon> 时间排序
            </el-radio>
            <el-radio label="citations">
              <el-icon><StarFilled /></el-icon> 下载量排序
            </el-radio>
          </el-radio-group>
        </div>

        <!-- 成果类型优先级 -->
        <div class="setting-section">
          <h3>
            <el-icon><Files /></el-icon>
            成果类型优先显示
          </h3>
          <el-checkbox-group v-model="settings.priorityTypes" class="compact-checkbox-group">
            <el-checkbox label="technology">
              <el-icon><Cpu /></el-icon> 技术类成果
            </el-checkbox>
            <el-checkbox label="system">
              <el-icon><DataAnalysis /></el-icon> 系统类成果
            </el-checkbox>
            <el-checkbox label="software">
              <el-icon><Monitor /></el-icon> 软件类成果
            </el-checkbox>
            <el-checkbox label="hardware">
              <el-icon><Cpu /></el-icon> 硬件类成果
            </el-checkbox>
          </el-checkbox-group>
        </div>
      </div>

      <!-- 右侧列 -->
      <div class="settings-column">
        <!-- 搜索历史设置 -->
        <div class="setting-section">
          <h3>
            <el-icon><Clock /></el-icon>
            搜索历史
          </h3>
          <div class="history-settings">
            <el-form-item label="保存历史记录数量" class="compact-form-item">
              <el-input-number 
                v-model="settings.historyLimit" 
                :min="0" 
                :max="100" 
                :step="5"
                controls-position="right" />
              <span class="description">
                <el-icon><InfoFilled /></el-icon>
                设置为0则不保存历史
              </span>
            </el-form-item>
            <el-switch
              v-model="settings.autoSaveHistory"
              active-text="自动保存搜索历史"
              inactive-text="手动保存搜索历史" />
          </div>
        </div>

        <!-- 默认搜索范围 -->
        <div class="setting-section">
          <h3>
            <el-icon><Search /></el-icon>
            默认搜索范围
          </h3>
          <el-checkbox-group v-model="settings.defaultSearchScopes" class="compact-checkbox-group">
            <el-checkbox label="title">
              <el-icon><Edit /></el-icon> 成果名称
            </el-checkbox>
            <el-checkbox label="abstract">
              <el-icon><Reading /></el-icon> 成果简介
            </el-checkbox>
            <el-checkbox label="keywords">
              <el-icon><Key /></el-icon> 关键词
            </el-checkbox>
          </el-checkbox-group>
        </div>

        <!-- 高级过滤器默认值 -->
        <div class="setting-section">
          <h3>
            <el-icon><Filter /></el-icon>
            高级过滤器默认值
          </h3>
          <el-form-item label="时间范围" class="compact-form-item">
            <el-select v-model="settings.defaultTimeRange" placeholder="选择默认时间范围">
              <el-option label="全部时间" value="all">
                <el-icon><Calendar /></el-icon> 全部时间
              </el-option>
              <el-option label="最近一年" value="1year">
                <el-icon><Timer /></el-icon> 最近一年
              </el-option>
              <el-option label="最近三年" value="3years">
                <el-icon><Timer /></el-icon> 最近三年
              </el-option>
              <el-option label="最近五年" value="5years">
                <el-icon><Timer /></el-icon> 最近五年
              </el-option>
            </el-select>
          </el-form-item>
        </div>
      </div>
    </div>

    <!-- 保存按钮 -->
    <div class="actions">
      <el-button type="primary" @click="saveSettings">
        <el-icon><Check /></el-icon> 保存设置
      </el-button>
      <el-button @click="resetSettings">
        <el-icon><Refresh /></el-icon> 重置默认
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Setting, List, Sort, Timer, Aim, StarFilled, 
  Files, Document, Medal, Collection, Monitor,
  Clock, InfoFilled, Search, Edit, Reading,
  Key, User, Filter, Calendar, Check, Refresh,
  Cpu, DataAnalysis
} from '@element-plus/icons-vue'

// 页面大小选项
const pageSizes = [5, 20, 30, 50, 100]

// 设置数据
const settings = ref({
  pageSize: 20,
  defaultSort: 'time',
  priorityTypes: ['technology'],
  historyLimit: 50,
  autoSaveHistory: true,
  defaultSearchScopes: ['title', 'abstract', 'keywords'],
  defaultTimeRange: 'all'
})

// 初始化设置
onMounted(() => {
  const savedSettings = localStorage.getItem('searchSettings')
  if (savedSettings) {
    settings.value = JSON.parse(savedSettings)
  }
})

// 保存设置
const saveSettings = () => {
  localStorage.setItem('searchSettings', JSON.stringify(settings.value))
  ElMessage.success('设置保存成功')
  // 触发全局事件，通知其他组件设置已更新
  window.dispatchEvent(new CustomEvent('searchSettingsUpdated', {
    detail: settings.value
  }))
}

// 重置设置
const resetSettings = () => {
  settings.value = {
    pageSize: 20,
    defaultSort: 'time',
    priorityTypes: ['technology'],
    historyLimit: 50,
    autoSaveHistory: true,
    defaultSearchScopes: ['title', 'abstract', 'keywords'],
    defaultTimeRange: 'all'
  }
  ElMessage.success('设置已重置')
}
</script>

<style lang="scss" scoped>
.settings-container {
  width: 100%;
  min-height: calc(100vh - 40px); // 减去上下margin
  margin: 20px auto;
  padding: clamp(15px, 2vw, 25px);
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

h2 {
  color: #2c3e50;
  margin-bottom: clamp(15px, 2vh, 25px);
  padding-bottom: 8px;
  border-bottom: 2px solid #eef2f7;
  font-size: clamp(1.2rem, 2vw, 1.5rem);
  font-weight: 600;
  letter-spacing: 0.5px;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 450px), 1fr));
  gap: clamp(15px, 2vw, 25px);
  margin-bottom: clamp(15px, 2vh, 25px);
}

.setting-section {
  margin-bottom: clamp(12px, 1.5vh, 20px);
  padding: clamp(12px, 1.5vw, 20px);
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: #eef2f7;
  }

  h3 {
    margin-bottom: clamp(10px, 1.5vh, 15px);
    color: #2c3e50;
    font-size: clamp(0.9rem, 1.5vw, 1.1rem);
    font-weight: 600;
    letter-spacing: 0.3px;
  }
}

.compact-checkbox-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 8px;

  :deep(.el-checkbox) {
    margin-right: 0;
    font-size: clamp(0.85rem, 1.3vw, 1rem);
  }
}

.compact-form-item {
  margin-bottom: 8px;

  :deep(.el-form-item__label) {
    font-size: clamp(0.85rem, 1.3vw, 1rem);
    color: #606266;
  }
}

.el-select {
  width: clamp(160px, 20vw, 200px);
}

.el-radio-group {
  display: flex;
  flex-direction: column;
  gap: 8px;

  :deep(.el-radio) {
    font-size: clamp(0.85rem, 1.3vw, 1rem);
    margin-right: 0;
  }
}

.history-settings {
  display: flex;
  flex-direction: column;
  gap: 12px;

  :deep(.el-switch__label) {
    font-size: clamp(0.85rem, 1.3vw, 1rem);
  }
}

.description {
  margin-left: 8px;
  color: #909399;
  font-size: clamp(0.75rem, 1.1vw, 0.9rem);
}

.actions {
  margin-top: clamp(15px, 2vh, 25px);
  padding-top: clamp(12px, 1.5vh, 20px);
  border-top: 2px solid #eef2f7;
  text-align: center;

  .el-button {
    margin: 0 8px;
    padding: clamp(8px, 1vw, 12px) clamp(20px, 2.5vw, 30px);
    font-size: clamp(0.85rem, 1.3vw, 1rem);
    
    &--primary {
      background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
      
      &:hover {
        background: linear-gradient(135deg, #357abd 0%, #2868a9 100%);
      }
    }
  }
}

// 响应式调
@media screen and (max-width: 768px) {
  .settings-container {
    margin: 10px;
    padding: 15px;
  }

  .settings-grid {
    grid-template-columns: 1fr;
  }

  .el-select {
    width: 100%;
  }

  .actions {
    .el-button {
      width: calc(50% - 10px);
      margin: 0 5px;
    }
  }
}

// 深色主题适配
@media (prefers-color-scheme: dark) {
  .settings-container {
    background: #1a1a1a;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
  }

  .setting-section {
    background: #2a2a2a;

    &:hover {
      background: #333333;
    }
  }

  h2, h3 {
    color: #e0e0e0;
  }

  .description {
    color: #a0a0a0;
  }
}

h2, h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .el-icon {
    font-size: 1.2em;
    color: var(--el-color-primary);
  }
}

.el-radio, .el-checkbox {
  display: flex;
  align-items: center;
  gap: 4px;
  
  .el-icon {
    margin-right: 4px;
    font-size: 1.1em;
    color: var(--el-color-primary);
  }
}

.description {
  display: flex;
  align-items: center;
  gap: 4px;
  
  .el-icon {
    color: var(--el-color-info);
  }
}

// 深色模式下的图标颜色调整
@media (prefers-color-scheme: dark) {
  h2, h3 {
    .el-icon {
      color: var(--el-color-primary-light-3);
    }
  }
  
  .el-radio, .el-checkbox {
    .el-icon {
      color: var(--el-color-primary-light-3);
    }
  }
}
</style>


//当前版本完成了设置的显示数量、排序方式、优先显示类型，其他未进行设置