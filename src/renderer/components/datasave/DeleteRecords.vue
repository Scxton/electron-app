<template>
    <div class="search-button">
        <el-input v-model="search" style="width: 280px; margin-left: 20px;" placeholder="成果查询" :prefix-icon="Search" />
    </div>

    <el-table :data="filterTableData" style="width: 100%">
        <el-table-column prop="resultNumber" label="成果编号" width="150" />
        <el-table-column prop="resultName" label="成果名称" width="200" />
        <el-table-column prop="projectNumber" label="项目编号" width="150" />
        <el-table-column prop="publisher" label="发布用户" width="150" />
        <el-table-column prop="organization" label="所属单位" width="150" />
        <el-table-column prop="downloads" label="下载次数" />
        <el-table-column label="操作" width="200">
            <template #default="scope">
                <el-button link type="primary" size="small" @click="resultRestore(scope.$index, scope.row)">
                    恢复
                </el-button>
                <el-button link type="primary" size="small" @click="permanentDelete(scope.$index, scope.row)">
                    永久删除
                </el-button>
            </template>
        </el-table-column>
    </el-table>

    <div class="restore-button">
        <el-button type="primary" @click="onekeyRestore">一键恢复</el-button>
    </div>

    <div class="pagination-button">
        <el-pagination background layout="prev, pager, next" :total="100" />
    </div>
</template>

<script lang="ts" setup>
import { Search } from '@element-plus/icons-vue'
import { computed, ref } from 'vue'

interface User {
    resultNumber: string
    resultName: string
    projectNumber: string
    publisher: string
    organization: string
    downloads: number
}

const search = ref('')
const filterTableData = computed(() =>
    tableData.filter(
        (data) =>
            !search.value ||
            data.resultName.toLowerCase().includes(search.value.toLowerCase())
    )
)
const handleClick = () => {
    console.log('click')
}
const resultRestore = (index: number, row: User) => {
    console.log(index, row)
}
const permanentDelete = (index: number, row: User) => {
    console.log(index, row)
}
const onekeyRestore = (index: number, row: User) => {
    console.log(index, row)
}

const tableData: User[] = [
    { resultNumber: 'CG-001', resultName: '发明专利', projectNumber: 'XM-001', publisher: 'Anny', organization: 'cetc32', downloads: 55 },
    { resultNumber: 'CG-002', resultName: '国防专利', projectNumber: 'XM-002', publisher: 'Bob', organization: 'cetc15', downloads: 44 },
    { resultNumber: 'CG-003', resultName: '实用专利', projectNumber: 'XM-003', publisher: 'Candy', organization: 'cetc10', downloads: 22 },
    { resultNumber: 'CG-004', resultName: '期刊论文', projectNumber: 'XM-004', publisher: 'Douge', organization: 'cetc14', downloads: 6 },
    { resultNumber: 'CG-005', resultName: '项目代码', projectNumber: 'XM-005', publisher: 'Emma', organization: 'cetc28', downloads: 2 },
    { resultNumber: 'CG-006', resultName: '外观专利', projectNumber: 'XM-006', publisher: 'Honey', organization: 'cetc32', downloads: 4 },
]
</script>

<style>
.search-button {
    display: flex;
    justify-content: flex-end;
}

.restore-button {
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
    height: 15vh;
    /*可以根据实际情况设置高度，这里为了示例设为视口高度，确保有足够空间展示居下效果 */
}

.pagination-button {
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
    height: 15vh;
    /*可以根据实际情况设置高度，这里为了示例设为视口高度，确保有足够空间展示居下效果 */
}
</style>