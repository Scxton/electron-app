<template>
    <el-row :gutter="20" class="achievement-management">
        <el-col :span="24" class="input-and-buttons">
            <div class="input-and-button">
                <el-button type="primary" @click="handleAddAchievement">添加成果</el-button>
                <el-input 
                    v-model="searchInput" 
                    style="width: 280px; margin-left: 20px;" 
                    placeholder="成果名称搜索"
                    :prefix-icon="Search"
                    @input="handleSearch" 
                />
            </div>
        </el-col>
    </el-row>  
    <el-col :span="24">
        <el-table :data="tableData" style="width: 100%" :row-class-name="tableRowClassName" border
            :header-cell-style="{ background: '#f5f7fa', color: '#333', fontWeight: 'bold' }">
            <el-table-column prop="achievementId" label="成果ID" width="100" />
            <el-table-column prop="achievementName" label="成果名称" width="180" />
            <el-table-column prop="achievementIntro" label="成果简介" />
            <el-table-column prop="status" label="状态" width="120">
                <template #default="scope">
                    <el-tag :type="getStatusType(scope.row.status)">
                        {{ getStatusText(scope.row.status) }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="上传时间" width="180">
                <template #default="scope">
                    {{ formatDate(scope.row.uploadTime) }}
                </template>
            </el-table-column>
            <el-table-column label="操作" width="220">
                <template #default="scope">
                    <el-button size="small" type="success" @click="handleEdit(scope.$index, scope.row)">
                        编辑
                    </el-button>
                    <el-button size="small" type="danger" @click="handleDelete(scope.$index, scope.row)">
                        删除
                    </el-button>
                    <el-button size="small" type="primary" @click="handleView(scope.$index, scope.row)">
                        查看
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
    </el-col>
    
    <!-- 分页 -->
    <div style="margin-top: 30px;">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" background
            @size-change="handlePageSizeChange" @current-change="handleCurrentChange" :page-sizes="[5, 10, 20]"
            layout="total, sizes, prev, pager, next, jumper" :total="total">
        </el-pagination>
    </div>
    
    <!-- 编辑/添加成果对话框 -->
    <el-dialog 
      :title="isEdit ? '编辑成果' : '添加成果'" 
      v-model="dialogVisible" 
      width="500px"
      :before-close="cancelDialog"
      destroy-on-close
    >
      <el-form :model="form" label-width="120px">
        <el-form-item label="成果名称" label-position="right">
          <el-input v-model="form.achievementName"></el-input>
        </el-form-item>
        <el-form-item label="成果简介" label-position="right">
          <el-input v-model="form.achievementIntro" type="textarea" :rows="4"></el-input>
        </el-form-item>
        <el-form-item label="成果状态" label-position="right">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option label="待上传" :value="0"></el-option>
            <el-option label="已上传" :value="1"></el-option>
            <el-option label="待审批" :value="2"></el-option>
            <el-option label="已审批" :value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="文件上传" label-position="right" v-if="!isEdit || form.status === 0">
          <el-upload
            class="upload-demo"
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :file-list="fileList"
          >
            <el-button type="primary">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">请上传成果相关文件</div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm">确定</el-button>
          <el-button @click="cancelDialog">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  
    <!-- 查看成果详情对话框 -->
    <el-dialog 
      title="成果详情" 
      v-model="viewDialogVisible" 
      width="600px"
      :before-close="closeViewDialog"
    >
      <div v-if="currentAchievement">
        <h3>{{ currentAchievement.achievementName }}</h3>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="成果ID">{{ currentAchievement.achievementId }}</el-descriptions-item>
          <el-descriptions-item label="成果简介">{{ currentAchievement.achievementIntro }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentAchievement.status)">
              {{ getStatusText(currentAchievement.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="上传时间">{{ formatDate(currentAchievement.uploadTime) }}</el-descriptions-item>
          <el-descriptions-item label="文件">
            <el-button type="primary" size="small" @click="downloadFile" v-if="currentAchievement.filePath">
              下载文件
            </el-button>
            <span v-else>暂无文件</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </template>
  
  <script setup>
  import { Search } from '@element-plus/icons-vue'
  import { ref, onMounted, reactive } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import axios from 'axios'
  
  // 定义响应式变量
  const tableData = ref([])
  const total = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const searchInput = ref('')
  const originalTableData = ref([])
  const dialogVisible = ref(false)
  const viewDialogVisible = ref(false)
  const isEdit = ref(false)
  const fileList = ref([])
  const currentAchievement = ref(null)
  
  // 表单数据
  const form = ref({
    achievementId: '',
    achievementName: '',
    achievementIntro: '',
    status: 0,
    userId: '', // 当前用户ID
    uploadTime: new Date(),
    filePath: ''
  })
  
  // 模拟API调用 - 实际项目中应替换为真实API
  const fetchUserAchievements = async (pageNum, pageSize, searchTerm = '') => {
    try {
      // 这里应该是真实的API调用
      // const response = await axios.get(`/api/achievement/queryAllWithOthers?pageNum=${pageNum}&pageSize=${pageSize}&userId=${getCurrentUserId()}`);
      // return response.data.data;
      
      // 模拟数据
      const mockData = [
        { achievementId: 1, achievementName: '科研成果A', achievementIntro: '这是一个重要的科研成果', status: 0, uploadTime: '2023-05-15', userId: 1, filePath: '' },
        { achievementId: 2, achievementName: '论文B', achievementIntro: '发表在重要期刊的论文', status: 1, uploadTime: '2023-06-20', userId: 1, filePath: 'path/to/file.pdf' },
        { achievementId: 3, achievementName: '专利C', achievementIntro: '一项创新专利', status: 2, uploadTime: '2023-07-10', userId: 1, filePath: 'path/to/patent.pdf' },
        { achievementId: 4, achievementName: '项目D', achievementIntro: '重点项目成果', status: 3, uploadTime: '2023-08-05', userId: 1, filePath: 'path/to/project.zip' },
        { achievementId: 5, achievementName: '软件E', achievementIntro: '软件著作权', status: 1, uploadTime: '2023-09-12', userId: 1, filePath: 'path/to/software.exe' },
      ];
      
      // 模拟搜索过滤
      let filteredData = mockData;
      if (searchTerm) {
        filteredData = mockData.filter(item => 
          item.achievementName.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // 模拟分页
      const start = (pageNum - 1) * pageSize;
      const end = start + pageSize;
      return {
        data: filteredData.slice(start, end),
        total: filteredData.length
      };
    } catch (error) {
      console.error('获取成果数据失败:', error);
      return { data: [], total: 0 };
    }
  };
  
  // 获取当前用户ID - 实际项目中应从用户会话或存储中获取
  const getCurrentUserId = () => {
    // 实际项目中应从存储或会话中获取
    return 1; // 模拟用户ID
  };
  
  // 初始化数据
  onMounted(async () => {
    await fetchData();
  });
  
  // 获取分页数据
  const fetchData = async () => {
    try {
      const result = await fetchUserAchievements(currentPage.value, pageSize.value, searchInput.value);
      tableData.value = result.data;
      total.value = result.total;
    } catch (error) {
      console.error('获取数据失败:', error);
      ElMessage.error('获取成果数据失败');
    }
  };
  
  // 分页处理函数
  const handlePageSizeChange = (newSize) => {
    pageSize.value = newSize;
    currentPage.value = 1;
    fetchData();
  };
  
  const handleCurrentChange = (newPage) => {
    currentPage.value = newPage;
    fetchData();
  };
  
  // 搜索处理
  const handleSearch = () => {
    currentPage.value = 1;
    fetchData();
  };
  
  // 表格行样式
  const tableRowClassName = ({ row }) => {
    if (row.status === 3) {
      return 'success-row';
    } else if (row.status === 2) {
      return 'warning-row';
    }
    return '';
  };
  
  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) return dateString;
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };
  
  // 获取状态文本
  const getStatusText = (status) => {
    const statusMap = {
      0: '待上传',
      1: '已上传',
      2: '待审批',
      3: '已审批'
    };
    return statusMap[status] || '未知状态';
  };
  
  // 获取状态标签类型
  const getStatusType = (status) => {
    const typeMap = {
      0: 'info',
      1: 'primary',
      2: 'warning',
      3: 'success'
    };
    return typeMap[status] || '';
  };
  
  // 添加成果
  const handleAddAchievement = () => {
    isEdit.value = false;
    form.value = {
      achievementId: '',
      achievementName: '',
      achievementIntro: '',
      status: 0,
      userId: getCurrentUserId(),
      uploadTime: new Date(),
      filePath: ''
    };
    fileList.value = [];
    dialogVisible.value = true;
  };
  
  // 编辑成果
  const handleEdit = (index, row) => {
    isEdit.value = true;
    form.value = JSON.parse(JSON.stringify(row));
    fileList.value = row.filePath ? [{ name: '当前文件', url: row.filePath }] : [];
    dialogVisible.value = true;
  };
  
  // 删除成果
  const handleDelete = (index, row) => {
    ElMessageBox.confirm(
      '确定要删除该成果吗？',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
      .then(async () => {
        try {
          // 实际项目中应调用删除API
          // const response = await axios.delete(`/api/achievement/delete/${row.achievementId}`);
          
          // 模拟删除成功
          ElMessage({
            type: 'success',
            message: '删除成功',
          });
          fetchData(); // 重新加载数据
        } catch (error) {
          console.error('删除成果失败:', error);
          ElMessage.error('删除失败');
        }
      })
      .catch(() => {
        ElMessage({
          type: 'info',
          message: '已取消删除',
        });
      });
  };
  
  // 查看成果详情
  const handleView = (index, row) => {
    currentAchievement.value = row;
    viewDialogVisible.value = true;
  };
  
  // 关闭查看对话框
  const closeViewDialog = () => {
    viewDialogVisible.value = false;
    currentAchievement.value = null;
  };
  
  // 文件变更处理
  const handleFileChange = (file) => {
    fileList.value = [file];
  };
  
  // 下载文件
  const downloadFile = () => {
    if (currentAchievement.value && currentAchievement.value.filePath) {
      // 实际项目中应调用下载API或使用适当的下载方法
      ElMessage.success('开始下载文件');
    }
  };
  
  // 提交表单
  const submitForm = async () => {
    try {
      // 处理文件上传
      if (fileList.value.length > 0) {
        // 实际项目中应调用上传API
        // const formData = new FormData();
        // formData.append('file', fileList.value[0].raw);
        // const uploadResponse = await axios.post('/api/upload', formData);
        // form.value.filePath = uploadResponse.data.filePath;
        
        // 模拟文件路径
        form.value.filePath = `path/to/uploaded/${fileList.value[0].name || 'file'}`;
      }
      
      if (isEdit.value) {
        // 编辑成果
        // const response = await axios.put('/api/achievement/update', form.value);
        ElMessage.success('成果更新成功');
      } else {
        // 添加成果
        // const response = await axios.post('/api/achievement/add', form.value);
        ElMessage.success('成果添加成功');
      }
      
      dialogVisible.value = false;
      fetchData(); // 重新加载数据
    } catch (error) {
      console.error('提交表单失败:', error);
      ElMessage.error(isEdit.value ? '编辑失败' : '添加失败');
    }
  };
  
  // 取消对话框
  const cancelDialog = () => {
    dialogVisible.value = false;
    fileList.value = [];
  };
  </script>
  
  <style>
  .achievement-management {
    margin: 20px 0;
    background-color: #f5f7fa;
    border-radius: 8px;
    padding: 15px;
  }
  
  .input-and-button {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .el-table .warning-row {
    --el-table-tr-bg-color: var(--el-color-warning-light-9);
  }
  
  .el-table .success-row {
    --el-table-tr-bg-color: var(--el-color-success-light-9);
  }
  
  /* 对话框样式 */
  .el-dialog {
    margin: 0 auto !important;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }
  
  .el-dialog__header {
    background-color: #e8f0fe;
    padding: 15px 20px;
  }
  
  .el-dialog__title {
    color: #1a73e8;
    font-weight: 600;
  }
  
  .el-dialog__body {
    max-height: 70vh;
    overflow-y: auto;
    background-color: #ffffff;
    padding: 20px;
  }
  
  /* 表单样式 */
  .el-form-item {
    margin-bottom: 18px;
  }
  
  .el-select {
    width: 100%;
  }
  
  .el-input, .el-textarea {
    width: 100%;
  }
  
  /* 表格样式 */
  .el-table {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
  
  .el-table th {
    background-color: #e8f0fe !important;
    color: #1a73e8 !important;
    font-weight: 600 !important;
  }
  
  .el-table td {
    color: #333333;
  }
  
  /* 按钮样式 */
  .el-button--primary {
    background-color: #1a73e8;
    border-color: #1a73e8;
  }
  
  .el-button--primary:hover {
    background-color: #1565c0;
    border-color: #1565c0;
  }
  
  /* 分页样式 */
  .el-pagination {
    margin-top: 20px;
    padding: 10px;
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
  
  /* 上传组件样式 */
  .upload-demo {
    width: 100%;
  }
  
  .el-upload__tip {
    color: #909399;
    font-size: 12px;
    margin-top: 7px;
  }
  </style>