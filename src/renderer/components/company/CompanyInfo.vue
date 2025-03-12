<template>
  <div class="company-container">
    <div class="header">
      <h1>公司信息管理</h1>
      <el-button type="primary" @click="showAddDialog">添加公司</el-button>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
        v-model="searchQuery"
        placeholder="搜索公司名称"
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
      <el-table-column prop="id" label="公司ID" width="100" />
      <el-table-column prop="name" label="公司名称" />
      <el-table-column prop="projectCount" label="项目数" width="120" />
      <el-table-column prop="achievementCount" label="成果数" width="120" />
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
      :title="dialogType === 'add' ? '添加公司' : '编辑公司'"
      width="500px"
    >
      <el-form
        ref="companyFormRef"
        :model="companyForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="公司名称" prop="name">
          <el-input v-model="companyForm.name" placeholder="请输入公司名称" />
        </el-form-item>
        <el-form-item label="项目数" prop="projectCount">
          <el-input-number v-model="companyForm.projectCount" :min="0" />
        </el-form-item>
        <el-form-item label="成果数" prop="achievementCount">
          <el-input-number v-model="companyForm.achievementCount" :min="0" />
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
      <p>确定要删除公司 "{{ companyToDelete?.name }}" 吗？此操作不可恢复。</p>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="confirmDelete">确认删除</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import {
  getAllCompanies,
  getCompanyById,
  addCompany,
  updateCompany,
  deleteCompany
} from '../../api/companyInfo';

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
  projectCount: 0,
  achievementCount: 0
});

// 删除对话框
const deleteDialogVisible = ref(false);
const companyToDelete = ref(null);

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入公司名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  projectCount: [
    { required: true, message: '请输入项目数', trigger: 'blur' },
    { type: 'number', min: 0, message: '项目数必须大于等于0', trigger: 'blur' }
  ],
  achievementCount: [
    { required: true, message: '请输入成果数', trigger: 'blur' },
    { type: 'number', min: 0, message: '成果数必须大于等于0', trigger: 'blur' }
  ]
};

// 计算属性：过滤后的公司列表
const filteredCompanies = computed(() => {
  if (!searchQuery.value) {
    return companies.value;
  }
  return companies.value.filter(company => 
    company.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// 计算属性：分页后的公司列表
const paginatedCompanies = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredCompanies.value.slice(start, end);
});

// 生命周期钩子
onMounted(() => {
  fetchCompanies();
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
    companies.value = backendData.map(item => ({
      id: item.organizationId,
      name: item.organizationName,
      projectCount: item.organizationProjectCount !== null ? item.organizationProjectCount : 0,
      achievementCount: item.organizationProjectTotalCount !== null ? item.organizationProjectTotalCount : 0,
      status: item.tableStatus
    }));
    
    console.log('Transformed company data:', companies.value);
  } catch (error) {
    console.error('获取公司列表出错:', error);
    ElMessage.error('获取公司列表出错');
  } finally {
    loading.value = false;
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
    projectCount: 0,
    achievementCount: 0
  };
  
  // 重置表单验证
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
    console.log('Deleting company with ID:', companyToDelete.value.id);
    const response = await deleteCompany(companyToDelete.value.id);
    
    console.log('Delete response:', typeof response);
    
    if (response === 1 || response === '1') {
      ElMessage.success('删除成功');
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
    
    console.log('Submitting form data:', companyForm.value);
    
    // 提交表单
    if (dialogType.value === 'add') {
      const response = await addCompany(companyForm.value);
      console.log('Add response:', response);
      
      if (response === 1 || response === '1') {
        ElMessage.success('添加成功');
        fetchCompanies();
        dialogVisible.value = false;
      } else {
        ElMessage.error('添加失败: ' + response.data.msg);
      }
    } else {
      const response = await updateCompany(companyForm.value);
      console.log('Update response:', typeof response);
      
      if (response === 1 || response === '1') {
        ElMessage.success('更新成功');
        fetchCompanies();
        dialogVisible.value = false;
      } else {
        ElMessage.error('更新失败: ' + response.data.msg);
      }
    }
  } catch (error) {
    console.error('提交表单出错:', error);
    ElMessage.error('提交表单出错: ' + (error.message || '未知错误'));
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
</style>
