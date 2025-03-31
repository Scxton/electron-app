<template>
  <el-col :span="24">
      <!-- Add statistics cards -->
      <el-row :gutter="20" class="statistics-row">
          <el-col :span="4">
              <el-card shadow="hover" class="statistics-card">
                  <div class="statistics-content">
                      <div class="statistics-title">总投诉数</div>
                      <div class="statistics-number total">{{ totalComplaints }}</div>
                  </div>
              </el-card>
          </el-col>
          <el-col :span="4">
              <el-card shadow="hover" class="statistics-card">
                  <div class="statistics-content">
                      <div class="statistics-title infringement">侵权投诉</div>
                      <div class="statistics-number infringement">{{ infringementCount }}</div>
                  </div>
              </el-card>
          </el-col>
          <el-col :span="4">
              <el-card shadow="hover" class="statistics-card">
                  <div class="statistics-content">
                      <div class="statistics-title false-info">虚假信息</div>
                      <div class="statistics-number false-info">{{ falseInfoCount }}</div>
                  </div>
              </el-card>
          </el-col>
          <el-col :span="4">
              <el-card shadow="hover" class="statistics-card">
                  <div class="statistics-content">
                      <div class="statistics-title other">其他投诉</div>
                      <div class="statistics-number other">{{ otherCount }}</div>
                  </div>
              </el-card>
          </el-col>
      </el-row>

      <!-- Status statistics -->
      <el-row :gutter="20" class="statistics-row">
          <el-col :span="4">
              <el-card shadow="hover" class="statistics-card">
                  <div class="statistics-content">
                      <div class="statistics-title pending">未受理</div>
                      <div class="statistics-number pending">{{ pendingCount }}</div>
                  </div>
              </el-card>
          </el-col>
          <el-col :span="4">
              <el-card shadow="hover" class="statistics-card">
                  <div class="statistics-content">
                      <div class="statistics-title processing">受理中</div>
                      <div class="statistics-number processing">{{ processingCount }}</div>
                  </div>
              </el-card>
          </el-col>
          <el-col :span="4">
              <el-card shadow="hover" class="statistics-card">
                  <div class="statistics-content">
                      <div class="statistics-title completed">已完成</div>
                      <div class="statistics-number completed">{{ completedCount }}</div>
                  </div>
              </el-card>
          </el-col>
      </el-row>

      <el-table :data="paginatedData" style="width: 100%" border
          :header-cell-style="{ background: '#f5f7fa', color: '#333', fontWeight: 'bold' }">
          <el-table-column prop="id" label="案件编号" width="180" />
          <el-table-column prop="Pid" label="投诉专利编号" width="180" />
          <el-table-column prop="user" label="投诉用户" />
          <el-table-column prop="type" label="投诉类型">
              <template #header>
                  <el-dropdown @command="handleTypeFilter">
                      <span class="el-dropdown-link">
                          投诉类型<el-icon class="el-icon--right"><arrow-down /></el-icon>
                      </span>
                      <template #dropdown>
                          <el-dropdown-menu>
                              <el-dropdown-item command="all">全部</el-dropdown-item>
                              <el-dropdown-item command="infringement">侵权</el-dropdown-item>
                              <el-dropdown-item command="false_information">虚假信息</el-dropdown-item>
                              <el-dropdown-item command="other">其他</el-dropdown-item>
                          </el-dropdown-menu>
                      </template>
                  </el-dropdown>
              </template>
              <template #default="scope">
                  <el-tag :type="getTypeTagType(scope.row.type)">
                      {{ scope.row.type }}
                  </el-tag>
              </template>
          </el-table-column>
          <el-table-column prop="other" label="投诉详情" />
          <el-table-column prop="status" label="受理状态">
              <template #header>
                  <el-dropdown @command="handleStatusFilter">
                      <span class="el-dropdown-link">
                          受理状态<el-icon class="el-icon--right"><arrow-down /></el-icon>
                      </span>
                      <template #dropdown>
                          <el-dropdown-menu>
                              <el-dropdown-item command="all">全部</el-dropdown-item>
                              <el-dropdown-item command="0">未受理</el-dropdown-item>
                              <el-dropdown-item command="1">受理中</el-dropdown-item>
                              <el-dropdown-item command="2">已完成</el-dropdown-item>
                          </el-dropdown-menu>
                      </template>
                  </el-dropdown>
              </template>
              <template #default="scope">
                  <el-tag :type="getStatusType(scope.row.status)">
                      {{ getStatusText(scope.row.status) }}
                  </el-tag>
              </template>
          </el-table-column>
          <el-table-column label="操作">
              <template #default="scope">
                 
                  <el-button size="small" type="danger" @click="handleDelete(scope.$index, scope.row)">
                      删除
                  </el-button>
                  
                  <el-button size="small" type="info" @click="handleDownload(scope.$index, scope.row)">
                      下载
                  </el-button>
                  <div>
                      <el-dialog title="知识产权投诉申请" :visible.sync="addDialogVisible">
                          <el-form ref="form" :model="form" label-width="120px">
                              <!-- <el-form-item label="节点IP" label-position="right">
                      <el-input v-model="form.ip" ></el-input>
                  </el-form-item> -->
                              <el-form-item label="侵权专利名称" label-position="right">
                                  <el-input v-model="form.userId" disabled></el-input>
                              </el-form-item>
                              <el-form-item label="侵权专利编号" label-position="right">
                                  <el-input v-model="form.userName" disabled></el-input>
                              </el-form-item>
                              <el-form-item label="侵权方" label-position="right">
                                  <el-input v-model="form.userRole"></el-input>
                              </el-form-item>
                              <el-form-item label="投诉日期" label-position="right">
                                  <el-input v-model="form.comDate"></el-input>
                              </el-form-item>
                              <el-form-item label="侵权行为描述" label-position="right">
                                  <el-input v-model="form.description"></el-input>
                              </el-form-item>
                              <el-upload class="upload-demo" drag
                                  action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15" multiple>
                                  <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                                  <div class="el-upload__text">
                                      <em>点击此处上传证明材料</em>
                                  </div>
                              </el-upload>
                              <el-form-item>
                                  <el-button type="primary" @click="handleAdd">确定</el-button>
                                  <el-button @click="cancelAdd">取消</el-button>
                              </el-form-item>
                          </el-form>
                      </el-dialog>
                  </div>
              </template>
          </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[10, 15, 20]"
          :page-size="pageSize"
          :current-page="currentPage"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>

  </el-col>
  <!-- <div class="pag">
          <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
              :page-sizes="[5, 10, 20, 50, 100]" :current-page="currentPage" :page-size="pageSize"
              layout="total, sizes, prev, pager, next, jumper" :total="total" />
      </div> -->
  <!-- <el-col :span="24" class="input-container">

          <el-input style="width: 280px" placeholder="Type something" :prefix-icon="Search" />
      </el-col> -->
  <!-- 输入框和按钮并列 -->
  <div class="Applybutton">
      <el-button type="primary" @click="handleApply">专利投诉申请</el-button>
  </div>

</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { Search, ArrowDown } from '@element-plus/icons-vue'
import { ElMain, ElMessage, ElMessageBox } from 'element-plus';
import { queryAllComplaints, updateComplaintStatus, deleteComplaint, downloadComplaintFile } from '../../api/patentComplaints';

interface Complaint {
  id: string
  Pid: string
  user: string
  type: string
  other: string
  status: number
  fileName?: string
}

const tableData = ref<Complaint[]>([]);
const loading = ref(true);
const allComplaints = ref<Complaint[]>([]);
const selectedType = ref('all');
const selectedStatus = ref('all');

// Add these new refs
const currentPage = ref(1);
const pageSize = ref(10);
const total = computed(() => tableData.value.length);

// Update the tableData computed property
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return tableData.value.slice(start, end);
});

// Add pagination event handlers
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  currentPage.value = 1;
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
};

// 获取所有投诉信息
const fetchComplaints = async () => {
  try {
    loading.value = true;
    const res = await queryAllComplaints();
    console.log(res);
    if (res) {
      const mappedData = res.map((item: any) => ({
        id: item.complaintId,
        Pid: item.intellectualPropertyId,
        user: item.userId,
        type: getComplaintTypeText(item.complaintType),
        other: item.complaintIntro,
        status: item.complaintProcess,
        fileName: item.fileName
      }));
      allComplaints.value = mappedData;
      tableData.value = mappedData;
    }
  } catch (error) {
    console.error('获取投诉信息失败:', error);
    ElMessage.error('获取投诉信息失败');
  } finally {
    loading.value = false;
  }
};

// 获取状态文本
const getStatusText = (status: number) => {
  switch (status) {
    case 0:
      return '未受理';
    case 1:
      return '受理中';
    case 2:
      return '已完成';
    default:
      return '未知状态';
  }
};

// 获取状态标签类型
const getStatusType = (status: number) => {
  switch (status) {
    case 0:
      return 'info';
    case 1:
      return 'warning';
    case 2:
      return 'success';
    default:
      return '';
  }
};

// 获取投诉类型文本
const getComplaintTypeText = (type: string) => {
  switch (type) {
    case 'infringement':
      return '侵权';
    case 'false_information':
      return '虚假信息';
    case 'other':
      return '其他';
    default:
      return '未知类型';
  }
};

onMounted(() => {
  fetchComplaints();
});

const handleEdit = (index: number, row: Complaint) => {
  ElMessageBox.confirm('是否确认受理该投诉?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await updateComplaintStatus(row.id, row.status)
      ElMessage({
        type: 'success',
        message: '受理成功'
      })
      // 刷新数据
      await fetchComplaints()
    } catch (error) {
      console.error('受理失败:', error)
      ElMessage.error('受理失败')
    }
  }).catch(() => {
    ElMessage({
      type: 'info',
      message: '已取消受理'
    })
  })
}
const handleDelete = (index: number, row: Complaint) => {
  ElMessageBox.confirm('确认删除该投诉信息?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteComplaint(row.id)
      ElMessage({
        type: 'success',
        message: '删除成功'
      })
      // 刷新数据
      await fetchComplaints()
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }).catch(() => {
    ElMessage({
      type: 'info',
      message: '已取消删除'
    })
  })
}

const handleMore = (index: number, row: Complaint) => {
  console.log(index, row)
}

const handleApply = () => {
  console.log('专利投诉申请')
  ElMessageBox.confirm('此操作将进行专利投诉, 是否继续?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
  }).then(() => {
      ElMessage({
          type: 'success',
          message: '申请成功!',
      })

  }).catch(() => {
      ElMessage({
          type: 'info',
          message: '已取消',
      })
  })
}

const cancelApply = () => {
  console.log('取消')

}
// const currentPage = ref(1);
// const pageSize = ref(10);
// const total = tableData.length;

// const handleSizeChange = (val: number) => {
//     console.log(`每页 ${val} 条`);
//     pageSize.value = val
//     currentPage.value = 1
// };

// const handleCurrentChange = (val: number) => {
//     console.log(`当前页: ${currentPage}`);
//     currentPage.value = val

// };



// const currentPageData = () => {
//     const start = () => (currentPage.value - 1) * pageSize.value;
//     const end = () => start() + pageSize.value;
//     return tableData.slice(start(), end());
// }

const addDialogVisible = ref(false)

const form = ref({
  userId: '',
  userName: '',
  userRole: '',
  comDate: '',
  description: '',
})

const handleAdd = () => {
  console.log(form)
}

const cancelAdd = () => {
  console.log('取消')
}

const handleTypeFilter = (command: string) => {
  selectedType.value = command;
  let filteredData = [...allComplaints.value];
  
  // First apply type filter
  if (command !== 'all') {
    filteredData = filteredData.filter(item => {
      const complaintType = Object.entries(getComplaintTypeMap()).find(([_, value]) => value === item.type)?.[0];
      return complaintType === command;
    });
  }
  
  // Then apply status filter if active
  if (selectedStatus.value !== 'all') {
    filteredData = filteredData.filter(item => item.status === parseInt(selectedStatus.value));
  }
  
  tableData.value = filteredData;
};

const handleStatusFilter = (command: string) => {
  selectedStatus.value = command;
  let filteredData = [...allComplaints.value];
  
  // First apply type filter if active
  if (selectedType.value !== 'all') {
    filteredData = filteredData.filter(item => {
      const complaintType = Object.entries(getComplaintTypeMap()).find(([_, value]) => value === item.type)?.[0];
      return complaintType === selectedType.value;
    });
  }
  
  // Then apply status filter
  if (command !== 'all') {
    filteredData = filteredData.filter(item => item.status === parseInt(command));
  }
  
  tableData.value = filteredData;
};

const getComplaintTypeMap = () => ({
  'infringement': '侵权',
  'false_information': '虚假信息',
  'other': '其他'
});

// Add computed properties for statistics
const totalComplaints = computed(() => allComplaints.value.length);

const infringementCount = computed(() => 
  allComplaints.value.filter(complaint => complaint.type === '侵权').length
);

const falseInfoCount = computed(() => 
  allComplaints.value.filter(complaint => complaint.type === '虚假信息').length
);

const otherCount = computed(() => 
  allComplaints.value.filter(complaint => complaint.type === '其他').length
);

// Add new function to get type tag color
const getTypeTagType = (type: string) => {
  switch (type) {
    case '侵权':
      return 'danger';
    case '虚假信息':
      return 'warning';
    case '其他':
      return 'info';
    default:
      return '';
  }
};

// Add computed properties for status statistics
const pendingCount = computed(() => 
  allComplaints.value.filter(complaint => complaint.status === 0).length
);

const processingCount = computed(() => 
  allComplaints.value.filter(complaint => complaint.status === 1).length
);

const completedCount = computed(() => 
  allComplaints.value.filter(complaint => complaint.status === 2).length
);

// 添加下载处理函数
const handleDownload = async (index: number, row: Complaint) => {
  try {
    const fileName = row.fileName; // 直接从投诉信息中获取文件名
    if (!fileName) {
      ElMessage.warning('该投诉没有可下载的文件');
      return;
    }
    await downloadComplaintFile(fileName);
    ElMessage({
      type: 'success',
      message: '文件下载成功'
    });
  } catch (error) {
    console.error('文件下载失败:', error);
    ElMessage.error('文件下载失败');
  }
};

</script>

<style>
.el-table .warning-row {
  --el-table-tr-bg-color: var(--el-color-warning-light-9);
}

.el-table .success-row {
  --el-table-tr-bg-color: var(--el-color-success-light-9);
}

/* .el-table .error-row {
  --el-table-tr-bg-color: var(--el-color-error-light-9);
} */

/* .input-container {
  text-align: right;
  margin-bottom: 20px;

} */
.el-table{
  margin-top: 20px;
}
.Applybutton {
  display: flex;
  text-align: right;
  margin-bottom: 20px;
  margin-top: 20px;
}

.pag {
  display: flex;
  justify-content: flex-end;
  /* 右对齐 */
  align-items: center;
  margin-top: 20px;
  width: 100%;
  box-sizing: border-box;
  /* 确保自适应 */
}

.el-dropdown-link {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Add new styles */
.statistics-row {
  margin-bottom: 20px;
}

.statistics-card {
  height: 120px;
  border-radius: 8px;
  transition: all 0.3s ease;
  background: #ffffff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.statistics-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.1);
}

.statistics-content {
  text-align: center;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}

.statistics-title {
  font-size: 16px;
  margin-bottom: 15px;
  font-weight: 500;
}

.statistics-number {
  font-size: 32px;
  font-weight: bold;
  font-family: 'Arial', sans-serif;
}

/* Type statistics colors */
.statistics-title.total,
.statistics-number.total {
  color: #303133;
}

.statistics-title.infringement,
.statistics-number.infringement {
  color: #F56C6C;
}

.statistics-title.false-info,
.statistics-number.false-info {
  color: #E6A23C;
}

.statistics-title.other,
.statistics-number.other {
  color: #909399;
}

/* Status statistics colors */
.statistics-title.pending,
.statistics-number.pending {
  color: #909399;
}

.statistics-title.processing,
.statistics-number.processing {
  color: #E6A23C;
}

.statistics-title.completed,
.statistics-number.completed {
  color: #67C23A;
}

/* Add spacing between statistics rows */
.statistics-row + .statistics-row {
  margin-top: 30px;
}

/* Add responsive padding */
@media screen and (min-width: 768px) {
  .statistics-row {
    padding: 0 20px;
  }
}

/* Add pagination styles */
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
