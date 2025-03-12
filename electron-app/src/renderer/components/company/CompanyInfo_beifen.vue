<template>
    <div class="input-and-button">
      <el-input v-model="search" style="width: 280px; margin-left: 20px;" placeholder="请输入单位ID" :prefix-icon="Search" />
    </div>
  
    <el-table :data="filterTableData" style="width: 100%">
      <el-table-column label="单位ID" prop="id" />
      <el-table-column label="单位名称" prop="name" />
      <el-table-column label="单位项目总数" prop="numProj" />
      <el-table-column label="项目成果总数" prop="numAchiev" />
      <el-table-column label="历年项目与成果">
        <template #default>
          <el-button link type="primary" size="small" @click="handleClick">
            查看
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <el-button size="small" type="success" @click="handleEdit(scope.$index, scope.row)">
            编辑
          </el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.$index, scope.row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="page-and-button">
      <el-pagination background layout="prev, pager, next" :total="100" />
    </div>
  </template>
  
  <script setup>
  
  import { Search } from '@element-plus/icons-vue'
  import { onMounted, ref } from 'vue'
  import { getCompanyInfo } from "../../api/companyInfo"
  
  const filterTableData = ref([])
  onMounted(async () => {
    filterTableData.value = await getCompanyInfo()
  }
  )
  
  // const tableData: User[] = [
  //   {
  //     id: 'D-001',
  //     name: 'CETC32',
  //     numProj: 100,
  //     numAchiev: 1500,
  //   },
  //   {
  //     id: 'D-002',
  //     name: 'CETC14',
  //     numProj: 100,
  //     numAchiev: 1500,
  //   },
  //   {
  //     id: 'D-003',
  //     name: 'CETC15',
  //     numProj: 100,
  //     numAchiev: 1500,
  //   },
  //   {
  //     id: 'D-004',
  //     name: 'CETC10',
  //     numProj: 100,
  //     numAchiev: 1500,
  //   },
  //   {
  //     id: 'D-004',
  //     name: 'CETC10',
  //     numProj: 100,
  //     numAchiev: 1500,
  //   },
  //   {
  //     id: 'D-004',
  //     name: 'CETC10',
  //     numProj: 100,
  //     numAchiev: 1500,
  //   },
  // ]
  </script>
  
  <style>
  .input-and-button {
    display: flex;
    justify-content: flex-end;
  }
  
  .page-and-button {
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
    height: 20vh;
    /*可以根据实际情况设置高度，这里为了示例设为视口高度，确保有足够空间展示居下效果 */
  }
  </style>