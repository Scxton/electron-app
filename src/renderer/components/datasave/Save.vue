<template>
  <el-row :gutter="20" class="user-management">
    <!-- 修改为更精致的卡片式显示 -->
    <el-col :span="24" class="online-user">
      <el-card class="online-user-card">
        <div class="card-content">
          <span class="card-title">当前在线用户</span>
          <span class="card-count">{{ onlineUserCount }} 人</span>
        </div>
      </el-card>
    </el-col>
      <!-- <el-col :span="24" class="input-container">

          <el-input style="width: 280px" placeholder="Type something" :prefix-icon="Search" />
      </el-col> -->
      <!-- 输入框和按钮并列 -->
      <el-col :span="24" class="input-and-buttons">
          <div class="input-and-button">
              <el-button type="primary" @click="handleAddUser">添加用户</el-button>
              <el-input 
                  v-model="searchInput" 
                  style="width: 280px; margin-left: 20px;" 
                  placeholder="用户ID/用户名搜索"
                  :prefix-icon="Search"
                  @input="handleSearch" 
              />
          </div>
      </el-col>
  </el-row>  
  <el-col :span="24">
      <el-table :data="tableData" style="width: 100%" :row-class-name="tableRowClassName" border
          :header-cell-style="{ background: '#f5f7fa', color: '#333', fontWeight: 'bold' }">
          <el-table-column prop="userId" label="用户ID" width="150" />
          <el-table-column prop="userName" label="用户名称" width="150">
              <template #default="scope">
                  <span :class="{'online-user': scope.row.loginTime && scope.row.loginTime !== '-', 'offline-user': !scope.row.loginTime || scope.row.loginTime === '-'}">
                      {{ scope.row.userName }}
                  </span>
              </template>
          </el-table-column>
          <el-table-column prop="roleId" label="用户角色">
              <template #default="scope">
                  {{ scope.row.roleId === 1 ? '管理员' : scope.row.roleId === 2 ? '发布者' : '普通用户' }}
              </template>
          </el-table-column>
          <el-table-column label="申请时间" width="180">
              <template #default="scope">
                  {{ formatDate(scope.row.applicationTime) }}
              </template>
          </el-table-column>
          <el-table-column label="登录时间" width="180">
              <template #default="scope">
                  {{ scope.row.loginTime || '-' }}
              </template>
          </el-table-column>
          
          <el-table-column label="在线时长" width="150">
              <template #default="scope">
                  {{ scope.row.onlineDuration || '-' }}
              </template>
          </el-table-column>
          <el-table-column prop="userIntro" label="备注" />
          <el-table-column label="操作">
              <template #default="scope">
                  <el-button size="small" type='success' @click="handleEdit(scope.$index, scope.row)">
                      编辑
                  </el-button>
                  <el-button size="small" type="danger" @click="handleDelete(scope.$index, scope.row)">
                      删除
                  </el-button>
              </template>
          </el-table-column>
      </el-table>
  </el-col>
      <!-- 分页 -->
      <div style="margin-top: 30px;">
          <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" background
              @size-change="handlePageSizeChange" @current-change="handleCurrentChange" :page-sizes="[10, 15, 20]"
              layout="total, sizes, prev, pager, next, jumper" :total="total">
          </el-pagination>
      </div>
  
  <!-- 将对话框移到这里，避免在表格行内渲染 -->
  <el-dialog 
    :title="isEdit ? '编辑用户' : '添加用户'" 
    v-model="addDialogVisible" 
    width="500px"
    :before-close="cancelAdd"
    destroy-on-close
  >
    <el-form :model="form.value" label-width="120px">
      
      <el-form-item label="用户名称" label-position="right">
        <el-input v-model="form.userName"></el-input>
      </el-form-item>
      <el-form-item label="用户角色" label-position="right">
        <el-select v-model="form.roleId" placeholder="请选择角色">
          <el-option label="管理员" :value="1"></el-option>
          <el-option label="发布者" :value="2"></el-option>
          <el-option label="普通用户" :value="3"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="密码" label-position="right" v-if="!isEdit">
        <el-input v-model="form.userPwd" type="password"></el-input>
      </el-form-item>
      <el-form-item label="备注" label-position="right">
        <el-input v-model="form.userIntro" type="textarea"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleAdd">确定</el-button>
        <el-button @click="cancelAdd">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script setup>
import { Search } from '@element-plus/icons-vue'
import { ref, onMounted, reactive, nextTick } from 'vue'
import { queryAll, queryAllWithPagination, addUser, editUser, deleteUser, getOnlineDuration, LogInTimeByUsername } from "../../api/getUser"
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOnlineUserCount } from "../../api/user" // 导入API
import { addLog } from "../../api/log"

const tableData = ref([])   //用户信息列表
const total = ref(0)   //用户总数
const currentPage = ref(1)  // 当前页码
const pageSize = ref(10)  // 每页数量（可通过下拉框选择）
const searchInput = ref('')  // 新增搜索输入框的响应式变量
const originalTableData = ref([])  // 保存原始数据
const onlineUserCount = ref(0) // 在线用户数

//进入页面后，获取用户总数，获取第一页数据
onMounted(async () => {
    originalTableData.value = await queryAll()   //保存原始数据
    tableData.value = originalTableData.value    //显示数据
    total.value = tableData.value.length
    fetchData()
    fetchOnlineUsers()
})

// 分页获取数据
const fetchData = async () => {
    try {
        if (searchInput.value) {
            const start = (currentPage.value - 1) * pageSize.value
            const end = start + pageSize.value
            tableData.value = originalTableData.value
                .filter(item => 
                    item.userId.toString().toLowerCase().includes(searchInput.value.toLowerCase()) || 
                    item.userName.toLowerCase().includes(searchInput.value.toLowerCase())
                )
                .slice(start, end)
        } else {
            tableData.value = await queryAllWithPagination(currentPage.value, pageSize.value)
        }
        
        // 获取每个用户的登录时间并更新在线状态
        for (const user of tableData.value) {
            try {
                const response = await LogInTimeByUsername(user.userName)
                if (response ) {
                    user.loginTime = response
                    user.tableStatus = true
                    // 如果用户在线，获取在线时长
                    const durationResponse = await getOnlineDuration(user.userName)
                    if (durationResponse ) {
                        user.onlineDuration = durationResponse
                    } else {
                        user.onlineDuration = '-'
                    }
                } else {
                    user.loginTime = '-'
                    user.tableStatus = false
                    user.onlineDuration = '-' // 用户不在线，直接设置为-
                }
            } catch (error) {
                console.error('获取用户信息失败:', error)
                user.loginTime = '-'
                user.tableStatus = false
                user.onlineDuration = '-'
            }
        }
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
  tableData.value = await queryAll()
  total.value = tableData.value.length
  fetchData()
}

const input = ref('')

// 添加对话框相关
const addDialogVisible = ref(false)
const isEdit = ref(false) // 标记是编辑还是添加

// 使用ref来管理表单数据
const form = ref({
  userId: '',
  userName: '',
  roleId: '',
  userPwd: '',
  userIntro: '',
  tableStatus: true,
  applicationTime: new Date()
})

// 表格行样式
const tableRowClassName = ({ row }) => {
  if (row.userStatus === 1) {
    return 'success-row'
  } else {
    return ''
  }
}

// 格式化日期函数
const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  // 检查日期是否有效
  if (isNaN(date.getTime())) return dateString;
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

// 打开添加用户对话框
const handleAddUser = () => {
  isEdit.value = false
  // 重置表单数据
  form.value = {
    userId: '',
    userName: '',
    roleId: '',
    userPwd: '',
    userIntro: '',
    tableStatus: true,
    applicationTime: new Date()
  }
  addDialogVisible.value = true
  console.log('添加用户表单数据:', form.value)
}

// 打开编辑用户对话框
const handleEdit = (index, row) => {
  isEdit.value = true
  // 将行数据复制到表单
  form.value = JSON.parse(JSON.stringify(row))
  addDialogVisible.value = true
  console.log('编辑用户表单数据:', form.value)
}

// 删除用户
const handleDelete = (index, row) => {
  ElMessageBox.confirm(
    '确定要删除该用户吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      try {
        const response = await deleteUser(row.userId)
        if (response === 1 || response === '1') {
          // 添加日志
          await addLog({
            userId: localStorage.getItem('userId'),
            logIntro: `删除用户：${row.userName}`,
            logTime: formatDate(new Date()),
            tableStatus: true
          })
          ElMessage({
            type: 'success',
            message: '删除成功',
          })
          initTableData() // 重新加载数据
        } else {
          ElMessage.error('删除失败')
        }
      } catch (error) {
        console.error('删除用户出错:', error)
        ElMessage.error('删除失败')
      }
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '已取消删除',
      })
    })
}

// 提交表单（添加或编辑用户）
const handleAdd = async () => {
  try {
    let response
    if (isEdit.value) {
      // 编辑用户
      response = await editUser(form.value)
      // 添加日志
      await addLog({
        userId: localStorage.getItem('userId'),
        logIntro: `编辑用户：${form.value.userName}`,
        logTime: formatDate(new Date()),
        tableStatus: true
      })
    } else {
      // 添加用户
      response = await addUser(form.value)
      // 添加日志
      await addLog({
        userId: localStorage.getItem('userId'),
        logIntro: `添加用户：${form.value.userName}`,
        logTime: formatDate(new Date()),
        tableStatus: true
      })
    }
    console.log("response ",response)
    if (response) {
      ElMessage({
        type: 'success',
        message: isEdit.value ? '编辑成功' : '添加成功',
      })
      addDialogVisible.value = false
      initTableData() // 重新加载数据
    } else {
      ElMessage.error(isEdit.value ? '编辑失败1' : '添加失败')
    }
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error(isEdit.value ? '编辑失败2' : '添加失败')
  }
}

// 取消添加/编辑
const cancelAdd = () => {
  addDialogVisible.value = false
}

// 添加搜索处理函数
const handleSearch = () => {
    if (!searchInput.value) {
        // 如果搜索框为空，恢复原始数据
        fetchData()
        return
    }

    const searchTerm = searchInput.value.toLowerCase()
    const filteredData = originalTableData.value.filter(item => 
        item.userId.toString().toLowerCase().includes(searchTerm) || 
        item.userName.toLowerCase().includes(searchTerm)
    )
    
    tableData.value = filteredData
    total.value = filteredData.length
    currentPage.value = 1  // 重置到第一页
}

// 获取在线用户数
const fetchOnlineUsers = async () => {
  try {
    const response = await getOnlineUserCount()
    if (response ) {
      onlineUserCount.value = response
    }
  } catch (error) {
    console.error('获取在线用户数失败:', error)
  }
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

/* 添加全局间距样式 */
.user-management {
  position: relative; /* 添加相对定位以支持绝对定位的子元素 */
  margin: 20px 0;
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 15px;
}

/* .input-container {
  text-align: right;
  margin-bottom: 20px;

} */

.input-and-button {
  display: flex;
  justify-content: space-between;
  /* 左右对齐 */
  align-items: center;
  /* 垂直居中 */
  margin-bottom: 20px;
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

/* 添加样式确保对话框正常显示 */
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

/* 确保表单元素在对话框中正常显示 */
.el-form-item {
  margin-bottom: 18px;
}

.el-select {
  width: 100%;
}

/* 确保输入框可以正常工作 */
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

/* 标签样式 */
.el-tag {
  border-radius: 4px;
}

/* 修改在线用户样式为更精致的卡片 */
.online-user {
  position: relative;
  margin-bottom: 20px;
  color: #67c23a; /* 在线用户绿色 */
  font-weight: 500;
}

.online-user-card {
  width: 180px;
  background: linear-gradient(135deg, #67c23a, #5daf34);
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.online-user-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
}

.card-title {
  font-size: 14px;
  color: white;
  font-weight: 500;
  margin-bottom: 8px;
}

.card-count {
  font-size: 24px;
  color: white;
  font-weight: 600;
}

.offline-user {
  color: #909399; /* 离线用户灰色 */
}
</style>