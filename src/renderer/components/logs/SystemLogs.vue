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
        <div class="type-filter">
          <el-select
            v-model="selectedLogType"
            placeholder="按操作类型筛选"
            clearable
            @change="filterLogs"
          >
            <el-option
              v-for="type in logTypes"
              :key="type"
              :label="type"
              :value="type"
            />
          </el-select>
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
        <button 
          class="add-btn export-btn"
          @click="exportLogs"
        >
          <i class="fas fa-download"></i> 导出日志
        </button>
      </div>
    </div>
    
    <!-- 将图表容器移动到最上方 -->
    <div class="chart-container">
      <div ref="chart" class="chart" style="width: 100%; height: 400px;"></div>
    </div>

    <div class="list-container">
      <div class="list-header">
        <div class="list-column">日志ID</div>
        <div class="list-column">操作用户</div>
        <div class="list-column">日志内容</div>
        <div class="list-column">记录时间</div>
        <div class="list-column">操作</div>
      </div>
      <div class="list-item" v-for="log in paginatedLogs" :key="log.logId">
        <div class="list-cell">{{ log.logId }}</div>
        <div class="list-cell">{{ log.userId }}</div>
        <div class="list-cell">{{ log.logIntro }}</div>
        <div class="list-cell">{{ formatDate(log.logTime) }}</div>
        <div class="list-cell">
          <el-button
            type="primary"
            size="small"
            @click="showEditLogDialog(log)"
          >
            编辑
          </el-button>
          <el-button
            type="danger"
            size="small"
            @click="handleDeleteLog(log.logId)"
          >
            删除
          </el-button>
        </div>
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

    <!-- 编辑日志弹窗 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑日志"
      width="30%"
    >
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="用户ID">
          <el-input v-model="editForm.userId" />
        </el-form-item>
        <el-form-item label="日志内容">
          <el-input 
            v-model="editForm.logIntro" 
            type="textarea"
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="日志时间">
          <el-date-picker
            v-model="editForm.logTime"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleEditLog">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { addLog, queryAllLogs, deleteLog, updateLog } from '../../api/log.js'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'

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
    const editDialogVisible = ref(false)
    const editForm = ref({
      logId: '',
      userId: '',
      logIntro: '',
      logTime: ''
    })
    const chart = ref(null)
    const selectedLogType = ref('')
    const logTypes = ref([
      '成果操作',
      '单位操作',
      '模板操作',
      '投诉操作',
      '用户操作',
      '产权操作',
      '交互操作'
    ])

    const fetchLogs = async () => {
      try {
        // Replace mock data with API call
        const response = await queryAllLogs();
        allLogs.value = response || [];
        filterLogs();
      } catch (error) {
        console.error('Error fetching logs:', error);
        ElMessage.error('获取日志失败');
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
      
      if (selectedLogType.value) {
        const typeKeywords = {
          '成果操作': '成果',
          '单位操作': '单位',
          '模板操作': '模板',
          '投诉操作': '投诉',
          '用户操作': '用户',
          '产权操作': '产权',
          '交互操作': '评价'
        };
        
        const keyword = typeKeywords[selectedLogType.value];
        if (keyword) {
          filtered = filtered.filter(log => 
            log.logIntro.includes(keyword)
          );
        }
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
      return `${year}-${month}-${day}`;
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

    const handleDeleteLog = async (logId) => {
      try {
        const confirm = await ElMessageBox.confirm(
          '确定要删除这条日志吗？',
          '警告',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }
        );

        if (confirm) {
          console.log('开始调用deleteLog接口...',logId);
          await deleteLog(logId);
          ElMessage.success('日志删除成功');
          await fetchLogs();
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除日志时发生错误:', error);
          ElMessage.error('日志删除失败');
        }
      }
    }

    const showEditLogDialog = (log) => {
      editForm.value = {
        logId: log.logId,
        userId: log.userId,
        logIntro: log.logIntro,
        logTime: new Date(log.logTime).toISOString().split('T')[0]
      }
      editDialogVisible.value = true
    }

    const handleEditLog = async () => {
      try {
        if (!editForm.value.userId || !editForm.value.logIntro || !editForm.value.logTime) {
          ElMessage.warning('用户ID、日志内容和时间不能为空');
          return;
        }

        const response = await updateLog(editForm.value);
        if (response) {
          ElMessage.success('日志更新成功');
          editDialogVisible.value = false;
          await fetchLogs();
        }
      } catch (error) {
        console.error('更新日志时发生错误:', error);
        ElMessage.error('日志更新失败');
      }
    }

    const classifyLogs = (logs) => {
      const categories = {
        '成果操作': 0,
        '单位操作': 0,
        '模板操作': 0,
        '投诉操作': 0,
        '用户操作': 0,
        '产权操作': 0,
        '交互操作': 0
      }

      logs.forEach(log => {
        if (log.logIntro.includes('单位')) {
          categories['单位操作']++
        } else if (log.logIntro.includes('模板')) {
          categories['模板操作']++
        } else if (log.logIntro.includes('成果')) {
          categories['成果操作']++
        } else if (log.logIntro.includes('投诉')) {
          categories['投诉操作']++
        } else if (log.logIntro.includes('用户')) {
          categories['用户操作']++
        } else if (log.logIntro.includes('产权')) {
          categories['产权操作']++
        } else if (log.logIntro.includes('评价')) {
          categories['交互操作']++
        }
      })

      return categories
    }

    const renderChart = () => {
      const categories = classifyLogs(allLogs.value)
      const chartInstance = echarts.init(chart.value)
      
      const colors = [
        '#5470C6', // 成果操作
        '#91CC75', // 单位操作
        '#FAC858', // 模板操作
        '#EE6666', // 投诉操作
        '#73C0DE', // 用户操作
        '#3BA272', // 产权操作
        '#FC8452'  // 评价操作
      ]

      const option = {
        title: {
          text: '日志操作分类统计',
          left: 'center',
          textStyle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: '#333'
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: (params) => {
            return `${params[0].name}<br/>
                    数量: ${params[0].value}`
          }
        },
        xAxis: {
          type: 'category',
          data: Object.keys(categories),
          axisLabel: {
            rotate: 45,
            fontSize: 14,
            fontWeight: 'bold',
            color: '#666',
            margin: 15
          },
          axisLine: {
            lineStyle: {
              color: '#ccc'
            }
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            fontSize: 14,
            color: '#666'
          },
          axisLine: {
            lineStyle: {
              color: '#ccc'
            }
          },
          splitLine: {
            lineStyle: {
              type: 'dashed'
            }
          }
        },
        series: [{
          data: Object.values(categories),
          type: 'bar',
          itemStyle: {
            color: (params) => colors[params.dataIndex]
          },
          barWidth: '60%',
          label: {
            show: true,
            position: 'top',
            fontSize: 14,
            fontWeight: 'bold',
            color: '#333'
          }
        }],
        grid: {
          containLabel: true,
          left: '3%',
          right: '3%',
          bottom: '10%',
          top: '15%'
        }
      }

      chartInstance.setOption(option)
    }

    const exportLogs = () => {
      const content = logs.value.map(log => 
        `日志ID: ${log.logId}, 用户ID: ${log.userId}, 内容: ${log.logIntro}, 时间: ${formatDate(log.logTime)}`
      ).join('\n');
      
      const blob = new Blob([content], { type: 'text/plain' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `logs_${new Date().toISOString().slice(0,10)}.txt`;
      link.click();
      URL.revokeObjectURL(link.href);
      
      ElMessage.success('日志导出成功');
    }

    watch(logs, () => {
      updatePagination()
    })

    watch(allLogs, () => {
      renderChart()
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
      handleAddLog,
      handleDeleteLog,
      editDialogVisible,
      editForm,
      showEditLogDialog,
      handleEditLog,
      chart,
      exportLogs,
      selectedLogType,
      logTypes
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

.type-filter {
  width: 200px;
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

.list-cell:last-child {
  flex: 0.5;
  display: flex;
  justify-content: center;
  align-items: center;
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

.export-btn {
  background-color: #409eff;
}

.export-btn:hover {
  background-color: #66b1ff;
}

.chart-container {
  margin: 20px 0 40px 0;
  padding: 30px;
  background-color: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.chart {
  margin-top: 20px;
}
</style>
