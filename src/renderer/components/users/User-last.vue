<template>
    <div class="intellectual-property">
        <!-- 搜索栏 -->
        <div class="header-section">
            <el-button type="primary" @click="showAddDialog">
                <el-icon style="margin-right: 8px;"><Plus /></el-icon>
                添加产权
            </el-button>
            <el-input
                v-model="searchText"
                placeholder="请输入产权编号"
                style="width: 300px;"
                clearable
                @input="filterTable"
            >
                <template #prefix>
                    <el-icon><Search /></el-icon>
                </template>
            </el-input>
        </div>

        <!-- 知识产权表格 -->
        <el-table :data="filteredTableData" style="width: 100%;" :row-class-name="tableRowClassName">
            <el-table-column prop="intellectualNo" label="产权编号" width="150" />
            <el-table-column prop="intellectualName" label="产权名称" width="200" />
            <el-table-column prop="projectNo" label="所属项目编号" width="150" />
            <el-table-column prop="intellectualPropertyType" label="产权类型" width="150" />
            <el-table-column prop="organizationName" label="所属单位" width="150" />
            <el-table-column prop="renewalStatus" label="产权状态" width="150">
                <template #default="scope">
                    <span :class="['status-tag', scope.row.renewalStatus ? 'status-normal' : 'status-expired']">
                        {{ scope.row.renewalStatus ? '正常' : '过期' }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column label="操作">
                <template #default="scope">
                    <el-button size="small" @click="handleEditProperty(scope.row)">
                        编辑
                    </el-button>
                    <el-button size="small" type="danger" @click="deleteProperty(scope.row)">
                        删除
                    </el-button>
                    <el-button size="small" type="primary" v-if="scope.row.renewalStatus === false"
                        @click="renewProperty(scope.row)">
                        续期
                    </el-button>
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

        <!-- 续期对话框 -->
        <el-dialog v-model="renewDialogVisible" title="专利续期">
            <div>
                <p><strong>产权编号：</strong>{{ selectedProperty.intellectualNo }}</p>
                <p><strong>产权名称：</strong>{{ selectedProperty.intellectualName }}</p>
                <el-form-item label="新的过期时间">
                    <el-date-picker
                        v-model="renewDate"
                        type="date"
                        placeholder="选择新的过期时间"
                        format="YYYY-MM-DD"
                        value-format="YYYY-MM-DD"
                        style="width: 100%;"
                    />
                </el-form-item>
            </div>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="renewDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="confirmRenew">确认续期</el-button>
                </span>
            </template>
        </el-dialog>

        <!-- 添加/编辑产权对话框 -->
        <el-dialog v-model="propertyDialogVisible" :title="dialogMode === 'add' ? '添加产权信息' : '编辑产权信息'">
            <el-form :model="propertyForm" label-width="120px">
                <el-form-item label="产权编号">
                    <el-input v-model="propertyForm.intellectualNo" />
                </el-form-item>
                <el-form-item label="产权名称">
                    <el-input v-model="propertyForm.intellectualName" />
                </el-form-item>
                <el-form-item label="所属项目编号">
                    <el-input v-model="propertyForm.projectNo" />
                </el-form-item>
                <el-form-item label="产权类型">
                    <el-select v-model="propertyForm.intellectualPropertyType" placeholder="请选择产权类型" style="width: 100%;">
                        <el-option label="专利" value="专利" />
                        <el-option label="商标" value="商标" />
                        <el-option label="著作权" value="著作权" />
                        <el-option label="其他" value="其他" />
                    </el-select>
                </el-form-item>
                <el-form-item label="所属单位">
                    <el-input v-model="propertyForm.organizationName" />
                </el-form-item>
                <el-form-item label="生效时间">
                    <el-date-picker
                        v-model="propertyForm.applicationDate"
                        type="date"
                        placeholder="选择生效时间"
                        format="YYYY-MM-DD"
                        value-format="YYYY-MM-DD"
                        style="width: 100%;"
                    />
                </el-form-item>
                <el-form-item label="过期时间">
                    <el-date-picker
                        v-model="propertyForm.expirationDate"
                        type="date"
                        placeholder="选择过期时间"
                        format="YYYY-MM-DD"
                        value-format="YYYY-MM-DD"
                        style="width: 100%;"
                    />
                </el-form-item>
                <el-form-item label="产权状态">
                    <el-select v-model="propertyForm.renewalStatus" placeholder="请选择产权状态" style="width: 100%;">
                        <el-option label="正常" :value="true" />
                        <el-option label="过期" :value="false" />
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="propertyDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="saveProperty">保存</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { Search, Plus } from '@element-plus/icons-vue'
import { ref, onMounted, computed } from 'vue'
import { queryAll, queryAllWithPagination, addProperty, editProperty, deleteProperty as apiDeleteProperty } from "../../api/properties"
import { ElMessage, ElMessageBox } from 'element-plus'

const tableData = ref([])   //产权信息列表
const total = ref(0)   //产权总数
const currentPage = ref(1)  // 当前页码
const pageSize = ref(2)  // 每页数量（可通过下拉框选择）

//进入页面后，获取产权总数，获取第一页数据
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

// 搜索文本
const searchText = ref('');

// 过滤表格数据
const filteredTableData = computed(() => {
    if (!searchText.value) return tableData.value;
    return tableData.value.filter(item => 
        item.intellectualNo.includes(searchText.value)
    );
});

// 搜索过滤方法
const filterTable = () => {
    // 如果需要特殊处理可以在这里添加逻辑
};

// 续期对话框
const renewDialogVisible = ref(false);
const selectedProperty = ref({});
const renewDate = ref('');

// 表格行样式
const tableRowClassName = ({ row }) => {
    return row.renewalStatus === false ? 'expired-row' : '';
};

// 添加/编辑产权对话框
const propertyDialogVisible = ref(false);
const dialogMode = ref('add'); // 'add' 或 'edit'
const propertyForm = ref({
    id: 'null',
    intellectualNo: '',
    intellectualName: '',
    projectNo: '',
    intellectualPropertyType: '',
    organizationName: '',
    applicationDate: '',
    expirationDate: '',
    tableStatus: true,
    auditFlag: 1,
    
});

// 显示添加对话框
const showAddDialog = () => {
    dialogMode.value = 'add';
    propertyForm.value = {
        intellectualNo: '',
        intellectualName: '',
        projectNo: '',
        intellectualPropertyType: '',
        organizationName: '',
        applicationDate: '',
        expirationDate: '',
        tableStatus: true,
        auditFlag: 1,
       
    };
    propertyDialogVisible.value = true;
};

// 编辑操作
const handleEditProperty = (row) => {
    dialogMode.value = 'edit';
    propertyForm.value = { ...row }; // 复制行数据到表单
    propertyDialogVisible.value = true;
};

// 保存产权信息
const saveProperty = async () => {
    try {
        // 创建表单数据的副本，以便修改日期格式
        const formData = { ...propertyForm.value };
        
        // 处理日期格式，添加固定的时分秒
        if (formData.applicationDate) {
            formData.applicationDate = `${formData.applicationDate} 00:00:00`;
        }
        if (formData.expirationDate) {
            formData.expirationDate = `${formData.expirationDate} 00:00:00`;
        }
        
        if (dialogMode.value === 'add') {
            // 调用添加API
            await addProperty(formData);
            ElMessage.success('添加产权信息成功');
        } else {
            // 调用编辑API
            await editProperty(formData);
            ElMessage.success('编辑产权信息成功');
        }
        propertyDialogVisible.value = false;
        // 刷新表格数据
        initTableData();
    } catch (error) {
        ElMessage.error(`操作失败: ${error.message}`);
    }
};


// 删除操作
const deleteProperty = (row) => {
   
    ElMessageBox.confirm(
        `确定要删除产权 "${row.intellectualName}" 吗？`,
        '删除确认',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    )
    .then(async () => {
        try {
            await apiDeleteProperty(row.intellectualPropertyId);
            ElMessage.success('删除成功');
            // 刷新表格数据
            initTableData();
        } catch (error) {
            ElMessage.error(`删除失败: ${error.message}`);
        }
    })
    .catch(() => {
        ElMessage.info('已取消删除');
    });
};

// 续期操作
const renewProperty = (row) => {
    selectedProperty.value = { ...row };
    renewDate.value = ''; // 清空之前的日期
    renewDialogVisible.value = true;
};

// 确认续期
const confirmRenew = async () => {
    try {
        if (!renewDate.value) {
            ElMessage.warning('请选择新的过期时间');
            return;
        }

        // 创建要更新的数据对象
        const updateData = {
            ...selectedProperty.value,
            expirationDate: `${renewDate.value} 00:00:00`,
            renewalStatus: true
        };

        // 调用编辑API
        await editProperty(updateData);
        ElMessage.success('续期成功');
        renewDialogVisible.value = false;
        
        // 刷新表格数据
        initTableData();
    } catch (error) {
        ElMessage.error(`续期失败: ${error.message}`);
    }
};
</script>

<style scoped>
.intellectual-property {
    padding: 24px;
    background-color: #f5f7fa;
    min-height: 100vh;
}

.header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding: 20px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

/* 表格容器样式 */
.el-table {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    background-color: white;
}

/* 表格头部样式 */
:deep(.el-table__header) {
    background-color: #f5f7fa;
}

:deep(.el-table__header-row) {
    height: 50px;
}

/* 表格行样式 */
:deep(.el-table__row) {
    height: 60px;
}

/* 表格悬停效果 */
:deep(.el-table__row:hover) {
    background-color: #f5f7fa !important;
    transition: background-color 0.3s;
}

/* 过期行样式 */
.expired-row {
    background-color: #fef0f0 !important;
    color: #f56c6c;
}

/* 按钮样式 */
.el-button {
    border-radius: 6px;
    font-weight: 500;
    transition: all 0.3s;
}

.el-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 对话框样式 */
:deep(.el-dialog) {
    border-radius: 12px;
    overflow: hidden;
}

:deep(.el-dialog__header) {
    background-color: #f5f7fa;
    padding: 20px;
    margin: 0;
}

:deep(.el-dialog__body) {
    padding: 30px 20px;
}

:deep(.el-dialog__footer) {
    padding: 20px;
    border-top: 1px solid #ebeef5;
}

/* 表单样式 */
:deep(.el-form-item) {
    margin-bottom: 24px;
}

:deep(.el-input__wrapper),
:deep(.el-select),
:deep(.el-date-editor.el-input) {
    border-radius: 6px;
}

/* 分页器样式 */
.el-pagination {
    margin-top: 24px;
    padding: 20px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    display: flex;
    justify-content: center;
}

/* 搜索框样式 */
.el-input {
    transition: all 0.3s;
}

.el-input:focus-within {
    transform: translateY(-2px);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* 状态标签样式 */
.status-tag {
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 14px;
}

.status-normal {
    background-color: #f0f9eb;
    color: #67c23a;
}

.status-expired {
    background-color: #fef0f0;
    color: #f56c6c;
}

/* 动画效果 */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>

//增删改查完成