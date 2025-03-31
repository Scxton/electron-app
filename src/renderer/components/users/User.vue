<template>
    <div class="intellectual-property">
        <!-- 新增统计图表区域 -->
        <div class="chart-section">
            <div ref="chartRef" style="width: 100%; height: 400px;"></div>
        </div>
        <!-- 搜索栏 -->
        <div class="header-section">
            <el-button type="primary" @click="showAddDialog">
                <el-icon style="margin-right: 8px;"><Plus /></el-icon>
                添加产权
            </el-button>
            <!-- 修改过期提示 -->
            <div :class="['expiration-warning', isCollapsed ? 'collapsed' : '']" @click="toggleWarning">
                <el-icon color="#F56C6C"><Warning /></el-icon>
                <span v-if="!isCollapsed">
                    有{{ expiredCount }}条产权已过期，请及时处理。
                    <span class="view-link" @click.stop="showExpiredProperties">点击查看</span>
                </span>
                <el-icon class="close-icon" @click.stop="collapseWarning">
                    <Close />
                </el-icon>
            </div>
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
                <template #header>
                    <el-dropdown @command="handleStatusFilter">
                        <span class="el-dropdown-link">
                            产权状态<el-icon class="el-icon--right"><arrow-down /></el-icon>
                        </span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item command="all">全部</el-dropdown-item>
                                <el-dropdown-item command="normal">正常</el-dropdown-item>
                                <el-dropdown-item command="expired">过期</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </template>
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
                @size-change="handlePageSizeChange" @current-change="handleCurrentChange" :page-sizes="[10, 15, 20]"
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
                        <el-option label="发明专利" value="发明专利" />
                        <el-option label="实用新型专利" value="实用新型专利" />
                        <el-option label="外观设计专利" value="外观设计专利" />
                        <el-option label="其他" value="其他" />
                    </el-select>
                </el-form-item>
                <el-form-item label="所属单位">
                    <el-select
                        v-model="propertyForm.organizationId"
                        placeholder="请选择所属单位"
                        style="width: 100%;"
                        filterable
                    >
                        <el-option
                            v-for="org in organizationList"
                            :key="org.organizationId"
                            :label="org.organizationName"
                            :value="org.organizationId"
                        />
                    </el-select>
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
import { Search, Plus, ArrowDown, Warning, Close, Expand } from '@element-plus/icons-vue'
import { ref, onMounted, computed, watch } from 'vue'
import { queryAll, queryAllWithPagination, addProperty, editProperty, deleteProperty as apiDeleteProperty } from "../../api/properties"
import { ElMessage, ElMessageBox } from 'element-plus'
import { addLog } from '../../api/log'
import * as echarts from 'echarts'
import { getAllCompanies } from '../../api/companyInfo'

const tableData = ref([])   //产权信息列表
const total = ref(0)   //产权总数
const currentPage = ref(1)  // 当前页码
const pageSize = ref(10)  // 每页数量（可通过下拉框选择）

// 新增图表相关代码
const chartRef = ref(null)
let chartInstance = null

// 新增单位列表
const organizationList = ref([]);

// 获取单位信息
const fetchOrganizations = async () => {
    try {
        const response = await getAllCompanies();
        organizationList.value = response;
    } catch (error) {
        console.error('获取单位信息失败:', error);
        ElMessage.error('获取单位信息失败');
    }
};

// 统计专利类型数量
const countPropertyTypes = (data) => {
    const typeCounts = {
        发明专利: 0,
        实用新型专利: 0,
        外观设计专利: 0
    };
    
    data.forEach(item => {
        if (typeCounts.hasOwnProperty(item.intellectualPropertyType)) {
            typeCounts[item.intellectualPropertyType]++;
        }
    });
    
    return typeCounts;
}

// 初始化图表
const initChart = () => {
    if (chartRef.value) {
        chartInstance = echarts.init(chartRef.value)
        updateChart()
    }
}

// 更新图表数据
const updateChart = () => {
    const typeCounts = countPropertyTypes(tableData.value);
    
    const option = {
        title: {
            text: '知识产权类型统计',
            left: 'center',
            textStyle: {
                fontSize: 18,
                fontWeight: 'bold'
            }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        xAxis: {
            type: 'category',
            data: Object.keys(typeCounts),
            axisLabel: {
                fontSize: 14
            }
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                fontSize: 14
            }
        },
        series: [{
            name: '数量',
            type: 'bar',
            data: Object.values(typeCounts),
            itemStyle: {
                color: (params) => {
                    // 为不同类型设置不同颜色
                    const colors = {
                        '发明专利': '#5470C6',
                        '实用新型专利': '#91CC75',
                        '外观设计专利': '#EE6666',
                        '其他': '#FAC858'
                    };
                    return colors[Object.keys(typeCounts)[params.dataIndex]] || '#73C0DE';
                }
            },
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            },
            barWidth: '40%'
        }]
    };
    
    chartInstance.setOption(option);
};

// 初始化时创建图表
onMounted(() => {
    initChart()
    fetchOrganizations()
})

// 监听表格数据变化，更新图表
watch(tableData, () => {
    updateChart()
}, { deep: true })

//进入页面后，获取产权总数，获取第一页数据
onMounted(async () => {
    tableData.value = await queryAll()   //链接后端请求获取数据
    total.value = tableData.value.length
    fetchData()
})

// 添加状态筛选相关的变量和方法
const currentStatusFilter = ref('all')

// 修改 fetchData 方法
const fetchData = async () => {
    try {
        const allData = await queryAll()
        // 根据状态筛选
        let filteredData = allData
        if (currentStatusFilter.value === 'normal') {
            filteredData = allData.filter(item => item.renewalStatus === true)
        } else if (currentStatusFilter.value === 'expired') {
            filteredData = allData.filter(item => item.renewalStatus === false)
        }
        
        // 更新总数
        total.value = filteredData.length
        
        // 手动进行分页
        const start = (currentPage.value - 1) * pageSize.value
        const end = start + pageSize.value
        tableData.value = filteredData.slice(start, end)
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
const searchText = ref('')

// 过滤表格数据
const filteredTableData = computed(() => {
    if (!searchText.value) return tableData.value
    return tableData.value.filter(item => 
        item.intellectualNo.includes(searchText.value)
    )
})

// 搜索过滤方法
const filterTable = () => {
    // 如果需要特殊处理可以在这里添加逻辑
}

// 续期对话框
const renewDialogVisible = ref(false)
const selectedProperty = ref({})
const renewDate = ref('')

// 表格行样式
const tableRowClassName = ({ row }) => {
    return row.renewalStatus === false ? 'expired-row' : ''
}

// 添加/编辑产权对话框
const propertyDialogVisible = ref(false)
const dialogMode = ref('add') // 'add' 或 'edit'
const propertyForm = ref({
    id: 'null',
    intellectualNo: '',
    intellectualName: '',
    projectNo: '',
    intellectualPropertyType: '',
    organizationId: '',
    organizationName: '',
    applicationDate: '',
    expirationDate: '',
    tableStatus: true,
    auditFlag: 1,
    
})

// 显示添加对话框
const showAddDialog = () => {
    dialogMode.value = 'add'
    propertyForm.value = {
        intellectualNo: '',
        intellectualName: '',
        projectNo: '',
        intellectualPropertyType: '',
        organizationId: '',
        organizationName: '',
        applicationDate: '',
        expirationDate: '',
        tableStatus: true,
        auditFlag: 1,
       
    }
    propertyDialogVisible.value = true
}

// 编辑操作
const handleEditProperty = (row) => {
    dialogMode.value = 'edit'
    propertyForm.value = { ...row } // 复制行数据到表单
    propertyDialogVisible.value = true
}

// 保存产权信息
const saveProperty = async () => {
    try {
        // 获取选中的单位名称
        const selectedOrg = organizationList.value.find(
            org => org.organizationId === propertyForm.value.organizationId
        );
        propertyForm.value.organizationName = selectedOrg?.organizationName || '';
        
        // 创建表单数据的副本，以便修改日期格式
        const formData = { ...propertyForm.value }
        
        // 处理日期格式，添加固定的时分秒
        if (formData.applicationDate) {
            formData.applicationDate = `${formData.applicationDate} 00:00:00`
        }
        if (formData.expirationDate) {
            formData.expirationDate = `${formData.expirationDate} 00:00:00`
        }
        
        if (dialogMode.value === 'add') {
            // 调用添加API
            await addProperty(formData)
            ElMessage.success('添加产权信息成功')
            // 添加日志
            await addLog({
                userId: localStorage.getItem('userId'),
                logIntro: `添加产权信息：${propertyForm.value.intellectualName}`,
                logTime: new Date().toISOString().split('T')[0],
                tableStatus: true
            })
        } else {
            // 调用编辑API
            await editProperty(formData)
            ElMessage.success('编辑产权信息成功')
            // 添加日志
            await addLog({
                userId: localStorage.getItem('userId'),
                logIntro: `编辑产权信息：${propertyForm.value.intellectualName}`,
                logTime: new Date().toISOString().split('T')[0],
                tableStatus: true
            })
        }
        propertyDialogVisible.value = false
        // 刷新表格数据
        initTableData()
    } catch (error) {
        ElMessage.error(`操作失败: ${error.message}`)
    }
}


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
            await apiDeleteProperty(row.intellectualPropertyId)
            ElMessage.success('删除成功')
            // 添加日志
            await addLog({
                userId: localStorage.getItem('userId'),
                logIntro: `删除产权信息：${row.intellectualName}`,
                logTime: new Date().toISOString().split('T')[0],
                tableStatus: true
            })
            // 刷新表格数据
            initTableData()
        } catch (error) {
            ElMessage.error(`删除失败: ${error.message}`)
        }
    })
    .catch(() => {
        ElMessage.info('已取消删除')
    })
}

// 续期操作
const renewProperty = (row) => {
    selectedProperty.value = { ...row }
    renewDate.value = '' // 清空之前的日期
    renewDialogVisible.value = true
}

// 确认续期
const confirmRenew = async () => {
    try {
        if (!renewDate.value) {
            ElMessage.warning('请选择新的过期时间')
        }

        // 创建要更新的数据对象
        const updateData = {
            ...selectedProperty.value,
            expirationDate: `${renewDate.value} 00:00:00`,
            renewalStatus: true
        }

        // 调用编辑API
        await editProperty(updateData)
        ElMessage.success('续期成功')
        // 添加日志
        await addLog({
            userId: localStorage.getItem('userId'),
            logIntro: `续期产权信息：${selectedProperty.value.intellectualName}`,
            logTime: new Date().toISOString().split('T')[0],
            tableStatus: true
        })
        renewDialogVisible.value = false
        
        // 刷新表格数据
        initTableData()
    } catch (error) {
        ElMessage.error(`续期失败: ${error.message}`)
    }
}

// 添加状态筛选处理方法
const handleStatusFilter = (command) => {
    currentStatusFilter.value = command
    currentPage.value = 1 // 重置页码
    fetchData()
}

// 计算过期产权数量
const expiredCount = computed(() => {
  return tableData.value.filter(item => item.renewalStatus === false).length;
});

// 修改状态控制
const isCollapsed = ref(false);

// 新增关闭并折叠函数
const collapseWarning = () => {
  isCollapsed.value = true;
  handleStatusFilter('all');
};

// 修改切换提示函数
const toggleWarning = () => {
  if (isCollapsed.value) {
    isCollapsed.value = false;
  } else {
    isCollapsed.value = !isCollapsed.value;
  }
};

// 修改显示过期产权函数
const showExpiredProperties = () => {
  isCollapsed.value = false; // 确保提示信息展开
  handleStatusFilter('expired');
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

/* 添加下拉菜单样式 */
.el-dropdown-link {
    cursor: pointer;
    display: flex;
    align-items: center;
    color: #606266;
}

.el-dropdown-link:hover {
    color: #409EFF;
}

/* 新增图表区域样式 */
.chart-section {
    margin-bottom: 24px;
    padding: 20px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

/* 修改过期提示样式 */
.expiration-warning {
  margin-left: 20px;
  padding: 8px 16px;
  background-color: #fef0f0;
  border-radius: 4px;
  color: #f56C6C;
  display: flex;
  align-items: center;
  font-size: 14px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  padding-right: 40px; /* 为关闭按钮留出空间 */
}

/* 确保折叠状态下的点击区域 */
.expiration-warning.collapsed {
  cursor: pointer;
  padding: 8px;
  width: 40px;
  justify-content: center;
}

.expiration-warning.collapsed .el-icon:not(.close-icon) {
  margin-right: 0;
}

.expiration-warning.collapsed .view-link,
.expiration-warning.collapsed > span {
  display: none;
}

/* 修改关闭按钮样式 */
.close-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
}

.close-icon:hover {
  color: #909399;
}
</style>

//增删改查完成