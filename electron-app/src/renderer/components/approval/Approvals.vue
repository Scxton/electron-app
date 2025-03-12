<template>
  <!-- <div id="node-red-container">
      <iframe id="node-red-iframe" src="http://127.0.0.1:1880"></iframe>
    </div> -->
  <div class="approval-page">
    <!-- 搜索框 -->
    <div class="header-section">
      <el-input v-model="searchText" placeholder="请输入成果编号或成果名称" style="width: 300px;" clearable
        @input="filterApprovals">
        <template #prefix>
          <i class="el-icon-search"></i>
        </template>
      </el-input>
    </div>

    <!-- 待审批成果信息表格 -->
    <div style="margin-top: 10px">
      <el-table :data="filteredApprovals" style="width: 100%;">
        <el-table-column prop="achievementId" label="成果编号" width="150" />
        <el-table-column prop="approvalId" label="成果名称" width="200" />
        <el-table-column prop="approvalType" label="项目编号" width="150" />
        <el-table-column prop="userId" label="发布用户" width="150" />
        <el-table-column prop="approvalTime" label="所属单位" width="150" />
        <el-table-column prop="approvalStatus" label="成果状态" width="100" />
        <el-table-column label="操作">
          <template #default="scope">
            <el-button size="small" type="success" @click="approve(scope.row)">
              审批
            </el-button>
            <el-button size="small" type="danger" @click="reject(scope.row)">
              驳回
            </el-button>
            <el-button size="small" @click="viewDetails(scope.row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div style="margin-top: 30px;">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" background
          @size-change="handlePageSizeChange" @current-change="handleCurrentChange" :page-sizes="[2, 8, 15]"
          layout="total, sizes, prev, pager, next, jumper" :total="total">
        </el-pagination>
      </div>
    </div>
    <!-- <el-pagination style="margin-top: 20px; text-align: right;" @size-change="handleSizeChange"
      @current-change="handleCurrentChange" :current-page="currentPage" :page-size="pageSize"
      :total="filteredApprovals.length" layout="total, sizes, prev, pager, next, jumper"></el-pagination> -->

    <!-- 详情对话框 -->
    <!-- <el-dialog title="成果详情" :visible.sync="detailsDialogVisible">
      <div>
        <p><strong>成果编号：</strong>{{ selectedResult.achievementId }}</p>
        <p><strong>成果名称：</strong>{{ selectedResult.approvalId }}</p>
        <p><strong>项目编号：</strong>{{ selectedResult.approvalType }}</p>
        <p><strong>发布用户：</strong>{{ selectedResult.userId }}</p>
        <p><strong>所属单位：</strong>{{ selectedResult.approvalTime }}</p>
        <p><strong>成果状态：</strong>{{ selectedResult.approvalStatus }}</p>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="detailsDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog> -->
  </div>
</template>
  
<script setup>
// export default {
//   name: 'NodeRed'
// }
// import { ElMessage, ElMessageBox } from 'element-plus'
// import { Search, Plus, } from '@element-plus/icons-vue'
import { ref, onMounted } from 'vue'
import { queryAll, queryAllWithPaginationForApproval } from "../../api/approvals"

const filteredApprovals = ref([])   //待审批成果数据列表
const total = ref(0)   //待审批成果总数据量
const currentPage = ref(1)  // 当前页码
const pageSize = ref(2)  // 每页数量（可通过下拉框选择）

//进入页面后，获取待审批成果总数量，获取第一页数据
onMounted(async () => {
  filteredApprovals.value = await queryAll()   //链接后端请求获取数据
  total.value = filteredApprovals.value.length
  fetchData()
})

// 分页获取数据
const fetchData = async () => {
  try {
    filteredApprovals.value = await queryAllWithPaginationForApproval(currentPage.value, pageSize.value)
  } catch (error) {
    console.error('Error fetching data: ', error)
  }
}

const handlePageSizeChange = (newSize) => {
  currentPage.value = 1
  pageSize.value = newSize
  fetchData()
}

const handleCurrentChange = (newPage) => {
  currentPage.value = newPage
  fetchData()
}

const initTableData = async () => {
  filteredApprovals.value = await queryAll()
  total.value = filteredApprovals.value.length
  fetchData()
}

// // 详情对话框
// const detailsDialogVisible = ref(false);
// const selectedResult = ref({});

// // 审批操作
// const approve = (row) => {
//   console.log('审批通过:', row);
//   approvals.value = approvals.value.filter((item) => item !== row);
//   logOperation('审批通过', row);
// };

// // 驳回操作
// const reject = (row) => {
//   console.log('驳回成果:', row);
//   approvals.value = approvals.value.filter((item) => item !== row);
//   logOperation('驳回', row);
// };

// // 查看详情
// const viewDetails = (row) => {
//   selectedResult.value = row;
//   detailsDialogVisible.value = true;
// };

// // 记录操作日志
// const logOperation = (action, row) => {
//   console.log(`记录日志: ${action}`, row);
//   // 调用后端接口记录日志
//   // axios.post('/api/logs', { action, result: row });
// };


// export default {
//   name: 'ApprovalPage',
//   setup() {
//     const searchText = ref('');
//     const currentPage = ref(1);
//     const pageSize = ref(5);

//     // 待审批成果数据
//     const approvals = ref([
//       { achievementId: 'ZL-001-1', approvalId: '发明专利1', approvalType: 'DL-001-1', userId: 'Candice', approvalTime: 'cetc32', approvalStatus: '待审批' },
//       { achievementId: 'ZL-002-1', approvalId: '国内专利', approvalType: 'DL-001-1', userId: 'Aiden Carlson', approvalTime: 'cetc32', approvalStatus: '待审批' },
//       { achievementId: 'ZL-003-1', approvalId: '实用专利', approvalType: 'DL-001-1', userId: '卢元新', approvalTime: 'cetc32', approvalStatus: '待审批' },
//       { achievementId: 'ZL-001-1', approvalId: '期刊论文', approvalType: 'DL-001-1', userId: '安援', approvalTime: 'cetc32', approvalStatus: '待审批' },
//       { achievementId: 'DM-001-1', approvalId: '项目物件1', approvalType: 'DL-001-1', userId: 'Carlos Rios', approvalTime: 'cetc32', approvalStatus: '待审批' },
//     ]);

//     // 过滤后的数据
//     const filteredApprovals = computed(() => {
//       const filtered = approvals.value.filter(
//         (item) =>
//           item.achievementId.includes(searchText.value) ||
//           item.approvalId.includes(searchText.value)
//       );
//       const start = (currentPage.value - 1) * pageSize.value;
//       return filtered.slice(start, start + pageSize.value);
//     });

//     return {
//       searchText,
//       currentPage,
//       pageSize,
//       approvals,
//       filteredApprovals,
//       detailsDialogVisible,
//       selectedResult,
//       approve,
//       reject,
//       viewDetails,
//     };
//   },
// };
</script>
  
<style scoped>
/* #node-red-container, #node-red-iframe {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
  }
  #node-red-iframe {
    border: none;
  } */
.header-section {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
  margin-top: 20px;
}

.dialog-footer {
  text-align: right;
}
</style>
  