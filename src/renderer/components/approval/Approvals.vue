<template>
  <el-col :span="24">
      <el-table :data="tableData" style="width: 100%" border
          :header-cell-style="{ background: '#f5f7fa', color: '#333', fontWeight: 'bold' }">
          <el-table-column prop="id" label="案件编号" width="180" />
          <el-table-column prop="Pid" label="投诉专利编号" width="180" />
          <el-table-column prop="user" label="投诉用户" />
          <el-table-column prop="type" label="投诉类型" />
          <el-table-column prop="other" label="投诉详情" />
          <el-table-column prop="status" label="受理状态">
              <template #default="scope">
                  <el-tag :type="getStatusType(scope.row.status)">
                      {{ getStatusText(scope.row.status) }}
                  </el-tag>
              </template>
          </el-table-column>
          <el-table-column label="操作">
              <template #default="scope">
                  <el-button size="small" type='success' @click="handleEdit(scope.$index, scope.row)">
                      编辑
                  </el-button>
                  <el-button size="small" type="danger" @click="handleDelete(scope.$index, scope.row)">
                      删除
                  </el-button>
                  <el-button size="small" type="primary" @click="handleMore(scope.$index, scope.row)">
                      进度
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

      <!-- <div class="input-and-button">
          <el-button type="primary" @click="handleApply">投诉申请</el-button>
      </div> -->

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
import { ref, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMain, ElMessage, ElMessageBox } from 'element-plus';
import { queryAllComplaints, updateComplaintStatus, deleteComplaint } from '../../api/patentComplaints';

interface Complaint {
  id: string
  Pid: string
  user: string
  type: string
  other: string
  status: number
}

const tableData = ref<Complaint[]>([]);
const loading = ref(true);

// 获取所有投诉信息
const fetchComplaints = async () => {
  try {
    loading.value = true;
    const res = await queryAllComplaints();
    console.log(res);
    if (res) {
      tableData.value = res.map((item: any) => ({
        id: item.complaintId,
        Pid: item.intellectualPropertyId,
        user: item.userId,
        type: getComplaintTypeText(item.complaintType),
        other: item.complaintIntro,
        status: item.complaintProcess
      }));
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
</style>
