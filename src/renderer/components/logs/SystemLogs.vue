<template>
  <div class="log-container">
    <div class="display-controls">
      <div class="filter-section">
        <div class="search-box">
          <el-input
            v-model="searchText"
            placeholder="搜索日志内容"
            clearable
            @input="filterLogs"
          >
            <template #prefix>
              <i class="fas fa-search"></i>
            </template>
          </el-input>
        </div>
        <div class="statistics">
          <span class="stat-item">日志总数: {{ totalCount }}</span>
        </div>
      </div>
      <div class="view-controls">
        <button 
          class="add-btn"
          @click="showAddLogDialog"
        >
          <i class="fas fa-plus"></i> 添加日志
        </button>
      </div>
    </div>
    
    <div class="list-container">
      <div class="list-header">
        <div class="list-column">日志ID</div>
        <div class="list-column">日志内容</div>
        <div class="list-column">记录时间</div>
      </div>
      <div class="list-item" v-for="log in paginatedLogs" :key="log.logId">
        <div class="list-cell">{{ log.logId }}</div>
        <div class="list-cell">{{ log.logIntro }}</div>
        <div class="list-cell">{{ formatDate(log.logTime) }}</div>
      </div>
      <div class="pagination-controls">
        <div class="page-size-select">
          <label>每页显示:</label>
          <select v-model="pageSize" @change="changePageSize">
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="20">20</option>
          </select>
        </div>
        <div class="page-buttons">
          <button 
            class="page-btn" 
            :disabled="currentPage === 1"
            @click="prevPage"
          >
            上一页
          </button>
          <span class="page-info">第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</span>
          <button 
            class="page-btn" 
            :disabled="currentPage === totalPages"
            @click="nextPage"
          >
            下一页
          </button>
        </div>
      </div>
    </div>

    <!-- 添加日志弹窗 -->
    <el-dialog
      v-model="addDialogVisible"
      title="添加日志"
      width="30%"
    >
      <el-form :model="addForm" label-width="80px">
        <el-form-item label="用户ID">
          <el-input v-model="addForm.userId" />
        </el-form-item>
        <el-form-item label="日志内容">
          <el-input 
            v-model="addForm.logIntro" 
            type="textarea"
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="日志时间">
          <el-date-picker
            v-model="addForm.logTime"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAddLog">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { addLog } from '../../api/log.js'
import { ElMessage } from 'element-plus'

export default {
  setup() {
    const logs = ref([])
    const allLogs = ref([])
    const totalCount = ref(0)
    const currentPage = ref(1)
    const pageSize = ref(10)
    const totalPages = ref(1)
    const paginatedLogs = ref([])
    const searchText = ref('')
    const addDialogVisible = ref(false)
    const addForm = ref({
      userId: '',
      logIntro: '',
      logTime: ''
    })

    // 模拟日志数据
    const mockLogs = [
      { logId: 1, logIntro: '系统启动成功', logTime: Date.now() - 3600000 },
      { logId: 2, logIntro: '用户登录成功', logTime: Date.now() - 1800000 },
      { logId: 3, logIntro: '数据同步完成', logTime: Date.now() - 900000 },
      { logId: 4, logIntro: '系统更新检查', logTime: Date.now() - 600000 },
      { logId: 5, logIntro: '备份任务完成', logTime: Date.now() - 300000 },
      // 可以继续添加更多模拟数据
    ]

    const fetchLogs = async () => {
      try {
        // 使用模拟数据代替API调用
        allLogs.value = mockLogs
        filterLogs()
      } catch (error) {
        console.error('Error fetching logs:', error)
      }
    }

    const filterLogs = () => {
      let filtered = allLogs.value;
      
      if (searchText.value) {
        const searchLower = searchText.value.toLowerCase()
        filtered = filtered.filter(log => 
          log.logIntro.toLowerCase().includes(searchLower)
        )
      }
      
      logs.value = filtered;
      totalCount.value = filtered.length
      updatePagination()
    }

    const formatDate = (timestamp) => {
      const date = new Date(timestamp);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    }

    const updatePagination = () => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      paginatedLogs.value = logs.value.slice(start, end)
      totalPages.value = Math.ceil(logs.value.length / pageSize.value)
    }

    const changePageSize = () => {
      currentPage.value = 1
      updatePagination()
    }

    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++
        updatePagination()
      }
    }

    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--
        updatePagination()
      }
    }

    const showAddLogDialog = () => {
      addForm.value = {
        userId: '',
        logIntro: '',
        tableStatus:true,
        logTime: new Date().toISOString().split('T')[0]
      }
      addDialogVisible.value = true
    }

    const handleAddLog = async () => {
      try {
        console.group('添加日志调试信息');
        console.log('当前表单数据:', addForm.value);
        
        if (!addForm.value.userId || !addForm.value.logIntro || !addForm.value.logTime) {
          console.warn('验证失败: 用户ID、日志内容或时间为空');
          ElMessage.warning('用户ID、日志内容和时间不能为空');
          return;
        }

        console.log('开始调用addLog接口...');
        const response = await addLog({
          userId: addForm.value.userId,
          logIntro: addForm.value.logIntro,
          logTime: addForm.value.logTime,
          tableStatus:true
        });
        console.log('接口响应:', response);

        if (response) {
          console.log('日志添加成功');
          ElMessage.success('日志添加成功');
          addDialogVisible.value = false;
          console.log('关闭弹窗，重新获取日志列表...');
          await fetchLogs();
        } else {
          console.warn('接口返回空响应');
        }
      } catch (error) {
        console.error('添加日志时发生错误:', error);
        ElMessage.error('日志添加失败');
      } finally {
        console.groupEnd();
      }
    }

    watch(logs, () => {
      updatePagination()
    })

    onMounted(() => {
      fetchLogs()
    })

    return {
      logs,
      totalCount,
      currentPage,
      pageSize,
      totalPages,
      paginatedLogs,
      changePageSize,
      nextPage,
      prevPage,
      searchText,
      filterLogs,
      formatDate,
      addDialogVisible,
      addForm,
      showAddLogDialog,
      handleAddLog
    }
  }
}
</script>

<style scoped>
.log-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.display-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.filter-section {
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.search-box {
  width: 300px;
  margin-right: 20px;
}

.list-container {
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  background-color: #fff;
}

.list-header {
  display: flex;
  background-color: #f5f7fa;
  padding: 12px 16px;
  font-weight: 600;
  color: #606266;
  border-bottom: 1px solid #ebeef5;
}

.list-column {
  flex: 1;
  padding: 0 8px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.list-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
  transition: background-color 0.3s ease;
}

.list-item:hover {
  background-color: #f5f7fa;
}

.list-item:nth-child(even) {
  background-color: #fafafa;
}

.list-item:nth-child(even):hover {
  background-color: #f5f7fa;
}

.list-cell {
  flex: 1;
  padding: 0 8px;
  color: #606266;
}

.pagination-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-top: 1px solid #ebeef5;
}

.page-size-select {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-size-select select {
  padding: 6px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #fff;
  cursor: pointer;
}

.page-buttons {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-btn {
  padding: 6px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-btn:hover:not(:disabled) {
  background-color: #f5f7fa;
  border-color: #c0c4cc;
}

.page-info {
  font-size: 14px;
  color: #606266;
}

.statistics {
  margin-left: 20px;
  display: flex;
  gap: 15px;
}

.stat-item {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  background-color: #f0f9ff;
  color: #409eff;
  border: 1px solid #d6e9ff;
}

.view-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.add-btn {
  padding: 8px 16px;
  background-color: #67c23a;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.add-btn:hover {
  background-color: #85ce61;
}

.add-btn i {
  margin-right: 6px;
}
</style>
