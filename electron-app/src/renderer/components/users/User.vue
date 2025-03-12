<template>
    <el-row :gutter="20" class="user-management">
        <!-- <el-col :span="24" class="input-container">

            <el-input style="width: 280px" placeholder="Type something" :prefix-icon="Search" />
        </el-col> -->
        <!-- 输入框和按钮并列 -->
        <el-col :span="24" class="input-and-buttons">
            <div class="input-and-button">
                <el-button type="primary" @click="handleAddUser">添加用户</el-button>
                <el-input v-model="input" style="width: 280px; margin-left: 20px;" placeholder="用户ID搜索"
                    :prefix-icon="Search" />
            </div>
        </el-col>
    </el-row>  
    <el-col :span="24">
        <el-table :data="tableData" style="width: 100%" :row-class-name="tableRowClassName" border
            :header-cell-style="{ background: '#f5f7fa', color: '#333', fontWeight: 'bold' }">
            <el-table-column prop="userId" label="用户ID" width="150" />
            <el-table-column prop="userName" label="用户名称" width="150" />
            <el-table-column prop="roleId" label="用户角色" />
            <el-table-column prop="userStatus" label="状态" />
            <el-table-column prop="applicationTime" label="申请时间" />
            <el-table-column prop="userIntro" label="备注" />
            <el-table-column label="操作">
                <template #default="scope">
                    <el-button size="small" type='success' @click="handleEdit(scope.$index, scope.row)">
                        编辑
                    </el-button>
                    <el-button size="small" type="danger" @click="handleDelete(scope.$index, scope.row)">
                        删除
                    </el-button>
                    <el-button size="small" type="primary" @click="handleMore(scope.$index, scope.row)">
                        更多
                    </el-button>
                    <div>
                        <el-dialog title="用户账号添加" :visible.sync="addDialogVisible">
                            <el-form ref="form" :model="form" label-width="120px">
                                <!-- <el-form-item label="节点IP" label-position="right">
                        <el-input v-model="form.ip" ></el-input>
                    </el-form-item> -->
                                <el-form-item label="用户ID" label-position="right">
                                    <el-input v-model="form.userId" disabled></el-input>
                                </el-form-item>
                                <el-form-item label="用户名称" label-position="right">
                                    <el-input v-model="form.userName" disabled></el-input>
                                </el-form-item>
                                <el-form-item label="用户角色" label-position="right">
                                    <el-input v-model="form.roleId"></el-input>
                                </el-form-item>
                                <el-form-item label="用户状态" label-position="right">
                                    <el-input v-model="form.userStatus"></el-input>
                                </el-form-item>
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
    </el-col>
        <!-- 分页 -->
        <div style="margin-top: 30px;">
            <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" background
                @size-change="handlePageSizeChange" @current-change="handleCurrentChange" :page-sizes="[2, 8, 15]"
                layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </div>
</template>

<script setup>
import { Search } from '@element-plus/icons-vue'
import { ref, onMounted, computed } from 'vue'
import { queryAll, queryAllWithPagination } from "../../api/getUser"

const tableData = ref([])   //用户信息列表
const total = ref(0)   //用户总数
const currentPage = ref(1)  // 当前页码
const pageSize = ref(2)  // 每页数量（可通过下拉框选择）

//进入页面后，获取用户总数，获取第一页数据
onMounted(async () => {
    tableData.value = await queryAll()   //链接后端请求获取数据
    total.value = tableData.value.length
    fetchData()
})

// 分页获取数据
const fetchData = async () => {
    try {
        tableData.value = await queryAllWithPagination(currentPage.value, pageSize.value)
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

// interface User {
//     userId: string
//     userName: string
//     roleId: string
//     userStatus: string
//     applicationTime: Date
//     userIntro: string
// }

// const tableRowClassName = ({
//     row,
//     rowIndex,
// }: {
//     row: User
//     rowIndex: number
// }) => {
//     if (row.userStatus === '在线') {
//         return 'success-row'
//     } else if (row.userStatus === '离线') {
//         return ' '
//     }
// }

// const handleEdit = (index: number, row: User) => {
//     console.log(index, row)
// }
// const handleDelete = (index: number, row: User) => {
//     console.log(index, row)
// }

// const handleMore = (index: number, row: User) => {
//     console.log(index, row)
// }

const input = ref('')

const handleAddUser = () => {
    console.log('添加用户')
}

// const currentPageData = () => {
//     const start = () => (currentPage.value - 1) * pageSize.value;
//     const end = () => start() + pageSize.value;
//     return tableData.slice(start(), end());
// }

const addDialogVisible = ref(false)

const form = ref({
    userId: '',
    userName: '',
    roleId: '',
    userStatus: ''
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

/* 添加全局间距样式 */
.user-management {
    margin: 20px 0;
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
</style>