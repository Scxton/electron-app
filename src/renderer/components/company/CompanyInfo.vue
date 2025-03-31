<template>
  <div class="company-container">
    <div class="header">
      <h1>单位信息管理</h1>
      <el-button type="primary" @click="showAddDialog">添加单位</el-button>
    </div>

    <!-- 新增：柱状图区域 -->
    <div class="chart-container">
      <div ref="chartRef" style="width: 100%; height: 400px;"></div>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
        v-model="searchQuery"
        placeholder="搜索单位名称"
        clearable
        @clear="handleSearch"
        @input="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <!-- 数据表格 -->
    <el-table
      v-loading="loading"
      :data="paginatedCompanies"
      border
      stripe
      style="width: 100%"
      class="company-table"
    >
      <el-table-column prop="id" label="单位ID" width="100" />
      <el-table-column prop="name" label="单位名称" />
      <el-table-column prop="address" label="单位地址" />
      <el-table-column prop="phone" label="单位电话" width="120" />
      <el-table-column prop="contactName" label="联系人" width="120" />
      <el-table-column prop="contactPhone" label="联系人电话" width="120" />
      <el-table-column prop="projectCount" label="项目数" width="100" />
      <el-table-column prop="achievementCount" label="成果数" width="100">
        <template #default="scope">
          <el-button type="text" @click="showAchievementStats(scope.row)">{{ scope.row.achievementCount }}</el-button>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button
            size="small"
            type="danger"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="filteredCompanies.length"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        prev-text="上一页"
        next-text="下一页"
        :pager-count="7"
      >
        <template #total>
          总计 {{ filteredCompanies.length }} 条
        </template>
        <template #sizes="{ handleSizeChange }">
          <el-select v-model="pageSize" @change="handleSizeChange">
            <el-option
              v-for="item in [10, 20, 50, 100]"
              :key="item"
              :value="item"
              :label="`${item}条/页`"
            />
          </el-select>
        </template>
        <template #jumper>
          前往 <el-input v-model.number="currentPage" size="small" style="width: 50px" /> 页
        </template>
      </el-pagination>
    </div>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加单位' : '编辑单位'"
      width="600px"
    >
      <el-form
        ref="companyFormRef"
        :model="companyForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="单位名称" prop="name">
          <el-input v-model="companyForm.name" placeholder="请输入单位名称" />
        </el-form-item>
        <el-form-item label="单位地址" prop="address">
          <el-input v-model="companyForm.address" placeholder="请输入单位地址" />
        </el-form-item>
        <el-form-item label="单位电话" prop="phone">
          <el-input v-model="companyForm.phone" placeholder="请输入单位电话" />
        </el-form-item>
        <el-form-item label="联系人" prop="contactName">
          <el-input v-model="companyForm.contactName" placeholder="请输入联系人姓名" />
        </el-form-item>
        <el-form-item label="联系人电话" prop="contactPhone">
          <el-input v-model="companyForm.contactPhone" placeholder="请输入联系人电话" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 删除确认对话框 -->
    <el-dialog
      v-model="deleteDialogVisible"
      title="确认删除"
      width="400px"
    >
      <p>确定要删除单位 "{{ companyToDelete?.name }}" 吗？此操作不可恢复。</p>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="confirmDelete">确认删除</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 修改：成果统计对话框 -->
    <el-dialog
      v-model="achievementStatsVisible"
      :title="`${selectedCompanyName} 年度成果统计`"
      width="800px"
    >
      <div ref="lineChartRef" style="width: 100%; height: 400px;"></div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="achievementStatsVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import {
  getAllCompanies,
  getCompanyById,
  addCompany,
  updateCompany,
  deleteCompany,
  countProjectsByOrganizationId,
  fuzzySearchAchievements
} from '../../api/companyInfo';
import { addLog } from '../../api/log';
import * as echarts from 'echarts';

// 数据状态
const companies = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = ref(10);

// 对话框状态
const dialogVisible = ref(false);
const dialogType = ref('add'); // 'add' 或 'edit'
const companyFormRef = ref(null);
const companyForm = ref({
  id: null,
  name: '',
  address: '',
  phone: '',
  contactName: '',
  contactPhone: '',
  projectCount: 0,
  achievementCount: 0  // 保留这两个字段用于显示，但不在表单中编辑
});

// 删除对话框
const deleteDialogVisible = ref(false);
const companyToDelete = ref(null);

// 新增状态
const achievementStatsVisible = ref(false);
const achievementStats = ref([]);
const lineChartRef = ref(null);
let lineChartInstance = null;
const selectedCompanyName = ref('');

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入单位名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入单位地址', trigger: 'blur' },
    { max: 200, message: '长度不能超过 200 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入单位电话', trigger: 'blur' },
    { pattern: /^[\d-]+$/, message: '请输入有效的电话号码', trigger: 'blur' }
  ],
  contactName: [
    { required: true, message: '请输入联系人姓名', trigger: 'blur' },
    { max: 50, message: '长度不能超过 50 个字符', trigger: 'blur' }
  ],
  contactPhone: [
    { required: true, message: '请输入联系人电话', trigger: 'blur' },
    { pattern: /^[\d-]+$/, message: '请输入有效的电话号码', trigger: 'blur' }
  ]
};

// 计算属性：过滤后的单位列表
const filteredCompanies = computed(() => {
  if (!searchQuery.value) {
    return companies.value;
  }
  return companies.value.filter(company => 
    company.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// 计算属性：分页后的单位列表
const paginatedCompanies = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredCompanies.value.slice(start, end);
});

// 新增：图表引用
const chartRef = ref(null);
let chartInstance = null;

// 新增：监听公司数据变化，更新图表
watch(companies, (newVal) => {
  if (newVal.length > 0) {
    updateChart();
  }
}, { deep: true });

// 修改：更新图表方法
const updateChart = () => {
  if (!chartInstance) return;

  const chartData = companies.value.map(company => ({
    name: company.name,
    value: company.achievementCount
  }));

  // 更新为现代配色方案
  const colors = [
    '#6C5B7B', '#C06C84', '#F67280', '#F8B195', // 柔和紫色系
    '#355C7D', '#A8E6CE', '#DCEDC2', '#FF8C94', // 清新蓝绿色系
    '#4A90E2', '#7ED321', '#BD10E0', '#F5A623', // 现代科技色
    '#50E3C2', '#B8E986', '#FFD300', '#FF6F61'  // 活力渐变色
  ];

  const option = {
    title: {
      text: '各单位成果数量统计',
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
      formatter: '{b}: {c} 项成果',
      backgroundColor: 'rgba(50,50,50,0.9)',
      borderColor: '#333',
      textStyle: {
        color: '#fff',
        fontSize: 14
      }
    },
    xAxis: {
      type: 'category',
      data: chartData.map(item => item.name),
      axisLabel: {
        rotate: 45,
        interval: 0,
        fontSize: 12,
        color: '#666',
        margin: 15
      },
      axisLine: {
        lineStyle: {
          color: '#dcdfe6'
        }
      },
      axisTick: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 12,
        color: '#666'
      },
      axisLine: {
        lineStyle: {
          color: '#dcdfe6'
        }
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0',
          type: 'dashed'
        }
      }
    },
    series: [{
      data: chartData.map(item => item.value),
      type: 'bar',
      itemStyle: {
        color: (params) => colors[params.dataIndex % colors.length],
        borderRadius: [6, 6, 0, 0] // 添加圆角效果
      },
      barMaxWidth: 50,
      label: {
        show: true,
        position: 'top',
        color: '#333',
        fontSize: 12,
        fontWeight: 'bold',
        formatter: '{c} 项',
        backgroundColor: 'rgba(255,255,255,0.8)',
        padding: [4, 6],
        borderRadius: 4,
        borderColor: '#eee',
        borderWidth: 1
      }
    }],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true,
      backgroundColor: '#fff'
    }
  };

  chartInstance.setOption(option);
};

// 生命周期钩子
onMounted(() => {
  fetchCompanies();
  chartInstance = echarts.init(chartRef.value);
  window.addEventListener('resize', () => {
    chartInstance.resize();
  });
});

// 方法
const fetchCompanies = async () => {
  loading.value = true;
  try {
    const response = await getAllCompanies();
    console.log('API Response:', typeof response);

    // 检查响应格式，适应不同的返回结构
    let backendData = [];
    if (Array.isArray(response)) {
      // 直接返回数组的情况
      backendData = response;
    } 
    
    // 转换数据，处理null值
    companies.value = await Promise.all(backendData.map(async item => {
      // 获取每个单位的成果数量
      const achievementCount = await getAchievementCount(item.organizationId);
      const projectCount = await getProjectCount(item.organizationId);    
      // 更新数据库中的achievementCount  
      try {
        await updateCompany({
          id: item.organizationId,
          achievementCount: achievementCount || 0,
          projectCount: projectCount || 0
        });
      } catch (error) {
        console.error('更新单位成果数量出错:', error);
      }
      
      return {
        id: item.organizationId,
        name: item.organizationName,
        address: item.organizationAddress || '',
        phone: item.organizationPhone || '',
        contactName: item.contactsName || '',
        contactPhone: item.contactsPhone || '',
        projectCount: projectCount || 0,
        achievementCount: achievementCount || 0,
        status: item.tableStatus
      };
    }));
    
    console.log('Transformed company data:', companies.value);
  } catch (error) {
    console.error('获取单位列表出错:', error);
    ElMessage.error('获取单位列表出错');
  } finally {
    loading.value = false;
  }
};
const getProjectCount = async (organizationId) => {
  try {
    const response = await countProjectsByOrganizationId(organizationId);
    if (response ) {
      return response;
    }
    console.warn(`Invalid project count response for organizationId: ${organizationId}`, response);
    return 0;
  } catch (error) {
    console.error('获取项目数量出错:', error);
    return 0;
  }
};
// 新增方法：获取单位成果数量
const getAchievementCount = async (organizationId) => {
  try {
    const searchBody = { 
      achievementBelongingOrganizations: [organizationId]
    };
    // console.log('Search body:', searchBody);
    const response = await fuzzySearchAchievements(searchBody);
    console.log('Response for organizationId:', organizationId, response);
    
    if (!response || !Array.isArray(response)) {
      console.warn(`Invalid response for organizationId: ${organizationId}`, response);
      return 0;
    }
    
    return response.length;
  } catch (error) {
    console.error('获取成果数量出错:', error);
    return 0;
  }
};    

const handleSearch = () => {
  currentPage.value = 1;  
};  

const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1;
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
};

const resetForm = () => {
  companyForm.value = {
    id: null,
    name: '',
    address: '',
    phone: '',
    contactName: '',
    contactPhone: '',
    projectCount: 0,
    achievementCount: 0  // 保留这两个字段用于显示，但不在表单中编辑
  };
  
  if (companyFormRef.value) {
    companyFormRef.value.resetFields();
  }
};

const showAddDialog = () => {
  dialogType.value = 'add';
  resetForm();
  dialogVisible.value = true;
};

const handleEdit = (row) => {
  dialogType.value = 'edit';
  companyForm.value = { ...row };
  dialogVisible.value = true;
  
  console.log('Editing company:', row);
};

const handleDelete = (row) => {
  companyToDelete.value = row;
  deleteDialogVisible.value = true;
  
  console.log('Preparing to delete company:', row);
  console.log('Delete company ID:', row.id);
};

const confirmDelete = async () => {
  if (!companyToDelete.value) return;
  
  try {
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('username');
    console.log('Deleting company with ID:', companyToDelete.value.id);
    const response = await deleteCompany(companyToDelete.value.id);
    
    console.log('Delete response:', typeof response);
    
    if (response === 1 || response === '1') {
      ElMessage.success('删除成功');
      // 添加日志
      await addLog({
        userId: userId,
        logIntro: `删除单位: ${companyToDelete.value.name}`,
        logTime: new Date().toISOString().split('T')[0],
        tableStatus: true
      });
      fetchCompanies();
    } else {
      ElMessage.error('删除失败: ' + response.data.msg);
    }
  } catch (error) {
    console.error('删除出错:', error);
    ElMessage.error('删除出错');
  } finally {
    deleteDialogVisible.value = false;
    companyToDelete.value = null;
  }
};

const submitForm = async () => {
  if (!companyFormRef.value) {
    console.error('Form reference not found');
    return;
  }
  
  try {
    // 表单验证
    await companyFormRef.value.validate();
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('username');
    console.log('Submitting form data:', companyForm.value);
    console.log("companyForm.value",companyForm.value);
    // 提交表单
    if (dialogType.value === 'add') {
      const response = await addCompany(companyForm.value);
      
      if (response ) {
        ElMessage.success('添加成功');
        // 添加日志
        await addLog({
          userId:userId ,
          logIntro: `添加单位: ${companyForm.value.name}`,
          logTime: new Date().toISOString().split('T')[0],
          tableStatus: true
        });
        fetchCompanies();
        dialogVisible.value = false;
      } else {
        ElMessage.error('添加失败: ' + response.msg);
      }
    } else {
      const response = await updateCompany(companyForm.value);
      console.log('Update response:', typeof response);
      const userId = localStorage.getItem('userId');
      const userName = localStorage.getItem('username');
      if (response) {
        ElMessage.success('更新成功');
        // 添加日志
        await addLog({
          userId:userId,
          logIntro: `更新单位信息: ${companyForm.value.name}`,
          logTime: new Date().toISOString().split('T')[0],
          tableStatus: true
        });
        fetchCompanies();
        dialogVisible.value = false;
      } else {
        ElMessage.error('更新失败: ' + response.msg);
      }
    }
  } catch (error) {
    console.error('提交表单出错:', error);
    ElMessage.error('提交表单出错: ' + (error.message || '未知错误'));
  }
};

// 新增方法：获取年度成果统计
const getAchievementStats = async (organizationId) => {
  try {
    const searchBody = {
      achievementBelongingOrganizations: [organizationId]
    };
    const response = await fuzzySearchAchievements(searchBody);
    
    if (!response || !Array.isArray(response)) {
      return [];
    }
    
    // 按年份统计
    const yearMap = new Map();
    response.forEach(achievement => {
      if (achievement.uploadTime) {
        const year = new Date(achievement.uploadTime).getFullYear();
        yearMap.set(year, (yearMap.get(year) || 0) + 1);
      }
    });
    
    // 转换为数组并排序（修改排序逻辑）
    return Array.from(yearMap.entries())
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => a.year - b.year); // 改为从小到大排序
  } catch (error) {
    console.error('获取年度成果统计出错:', error);
    return [];
  }
};

// 新增方法：初始化折线图
const initLineChart = () => {
  if (lineChartInstance) return;
  lineChartInstance = echarts.init(lineChartRef.value);
  window.addEventListener('resize', () => {
    lineChartInstance.resize();
  });
};

// 修改：更新折线图数据
const updateLineChart = (stats) => {
  if (!lineChartInstance) return;

  const option = {
    title: {
      text: '年度成果数量趋势',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333'
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c} 项成果',
      backgroundColor: 'rgba(50,50,50,0.9)',
      borderColor: '#333',
      textStyle: {
        color: '#fff',
        fontSize: 14
      }
    },
    xAxis: {
      type: 'category',
      data: stats.map(item => item.year),
      axisLabel: {
        fontSize: 12,
        color: '#666'
      },
      axisLine: {
        lineStyle: {
          color: '#dcdfe6'
        }
      },
      axisTick: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 12,
        color: '#666'
      },
      axisLine: {
        lineStyle: {
          color: '#dcdfe6'
        }
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0',
          type: 'dashed'
        }
      }
    },
    series: [{
      data: stats.map(item => item.count),
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: {
        width: 3,
        color: '#1a73e8'
      },
      itemStyle: {
        color: '#1a73e8',
        borderColor: '#fff',
        borderWidth: 2
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0, color: 'rgba(26, 115, 232, 0.2)' 
          }, {
            offset: 1, color: 'rgba(26, 115, 232, 0)'
          }]
        }
      }
    }],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true
    }
  };

  lineChartInstance.setOption(option);
};

// 修改：显示成果统计
const showAchievementStats = async (row) => {
  if (row.achievementCount === 0) return;
  
  loading.value = true;
  try {
    selectedCompanyName.value = row.name;
    const stats = await getAchievementStats(row.id);
    achievementStatsVisible.value = true;
    
    // 初始化折线图
    await nextTick();
    initLineChart();
    updateLineChart(stats);
  } catch (error) {
    ElMessage.error('获取成果统计失败');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.company-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background-color: #ffffff;
  padding: 16px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.header h1 {
  margin: 0;
  font-size: 24px;
  color: #333333;
  font-weight: 600;
}

.search-bar {
  margin-bottom: 20px;
  max-width: 400px;
  background-color: #ffffff;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.company-table {
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  background-color: #ffffff;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  background-color: #ffffff;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 新增样式 */
:deep(.el-table th) {
  background-color: #e8f0fe !important;
  color: #1a73e8 !important;
  font-weight: 600;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background-color: #f9fafc;
}

:deep(.el-button--primary) {
  background-color: #1a73e8;
  border-color: #1a73e8;
}

:deep(.el-button--primary:hover) {
  background-color: #1565d4;
  border-color: #1565d4;
}

:deep(.el-dialog__header) {
  background-color: #e8f0fe;
  padding: 16px 20px;
  margin-right: 0;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-dialog__title) {
  color: #1a73e8;
  font-weight: 600;
}

:deep(.el-dialog__body) {
  padding: 24px 20px;
}

:deep(.el-form-item__label) {
  color: #333333;
  font-weight: 500;
}

:deep(.el-pagination) {
  --el-pagination-button-color: #333333;
  --el-pagination-hover-color: #1a73e8;
}

:deep(.el-input__inner) {
  border-color: #dcdfe6;
}

:deep(.el-input__inner:focus) {
  border-color: #1a73e8;
}

:deep(.el-tag) {
  border-radius: 4px;
}

/* 修改：图表容器样式 */
.chart-container {
  background-color: #ffffff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
  border: 1px solid #ebeef5;
}
</style>
