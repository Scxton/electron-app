<template>
    <div class="intellectual-property">
        <!-- 搜索栏 -->
        <div class="header-section">
            <el-input v-model="searchText" placeholder="请输入产权编号" style="width: 300px;" clearable @input="filterTable">
                <template #prefix>
                    <i class="el-icon-search"></i>
                </template>
            </el-input>
        </div>

        <!-- 知识产权表格 -->
        <el-table :data="tableData" style="width: 100%;" :row-class-name="tableRowClassName">
            <el-table-column prop="intellectualNo" label="产权编号" width="150" />
            <el-table-column prop="intellectualName" label="产权名称" width="200" />
            <el-table-column prop="projectNo" label="所属项目编号" width="150" />
            <el-table-column prop="intellectualPropertyType" label="产权类型" width="150" />
            <el-table-column prop="organizationName" label="所属单位" width="150" />
            <el-table-column prop="renewalStatus" label="产权状态" width="150" />
            <el-table-column label="操作">
                <template #default="scope">
                    <el-button size="small" @click="editProperty(scope.row)">
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
        <el-dialog title="专利续期" :visible.sync="renewDialogVisible">
            <div>
                <p><strong>产权编号：</strong>{{ selectedProperty.intellectualNo }}</p>
                <p><strong>产权名称：</strong>{{ selectedProperty.intellectualName }}</p>
                <el-date-picker v-model="renewDate" type="date" placeholder="选择续期日期" style="width: 100%;" />
            </div>
            <div slot="footer" class="dialog-footer">
                <el-button @click="renewDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="confirmRenew">确认续期</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script setup>
import { Search } from '@element-plus/icons-vue'
import { ref, onMounted, computed } from 'vue'
import { queryAll, queryAllWithPagination } from "../../api/properties"

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

// 续期对话框
const renewDialogVisible = ref(false);
const selectedProperty = ref({});
const renewDate = ref('');

// 表格行样式
const tableRowClassName = ({ row }) => {
    return row.renewalStatus === '到期' ? 'expired-row' : '';
};

// 编辑操作
const editProperty = (row) => {
    console.log('编辑:', row);
    // 可调用后端接口更新数据
};

// 删除操作
const deleteProperty = (row) => {
    console.log('删除:', row);
    properties.value = properties.value.filter((item) => item !== row);
};

// 续期操作
const renewProperty = (row) => {
    selectedProperty.value = row;
    renewDialogVisible.value = true;
};

// 确认续期
const confirmRenew = () => {
    console.log('续期确认:', selectedProperty.value, renewDate.value);
    selectedProperty.value.renewalStatus = '正常'; // 更新状态
    renewDialogVisible.value = false;
};

// export default {
//     name: 'IntellectualProperty',
//     setup() {

//         // 知识产权数据
//         const properties = ref([
//             { intellectualNo: 'CQ-001-1', intellectualName: '发明专利', projectNo: 'DL-001-1', intellectualPropertyType: '发明专利', organizationName: 'cetc32', renewalStatus: '正常' },
//             { intellectualNo: 'CQ-002-1', intellectualName: '国内专利', projectNo: 'DL-001-1', intellectualPropertyType: '国内专利', organizationName: 'cetc32', renewalStatus: '正常' },
//             { intellectualNo: 'CQ-003-1', intellectualName: '实用专利', projectNo: 'DL-001-1', intellectualPropertyType: '实用专利', organizationName: 'cetc32', renewalStatus: '到期' },
//             { intellectualNo: 'CQ-004-1', intellectualName: '期刊论文', projectNo: 'DL-001-1', intellectualPropertyType: '期刊论文', organizationName: 'cetc32', renewalStatus: '到期' },
//         ]);

//         // 过滤后的数据
//         const tableData = computed(() => {
//             const filtered = properties.value.filter(
//                 (item) => item.intellectualNo.includes(searchText.value)
//             );
//             const start = (currentPage.value - 1) * pageSize.value;
//             return filtered.slice(start, start + pageSize.value);
//         });

//         return {
//             searchText,
//             currentPage,
//             pageSize,
//             properties,
//             tableData,
//             renewDialogVisible,
//             selectedProperty,
//             renewDate,
//             tableRowClassName,
//             editProperty,
//             deleteProperty,
//             renewProperty,
//             confirmRenew,
//         };
//     },
// };
</script>

<style scoped>
.header-section {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 20px;
    margin-top: 20px;
}

.dialog-footer {
    text-align: right;
}

.expired-row {
    background-color: #e9a3a3;
    /* 红色背景 */
}
</style>