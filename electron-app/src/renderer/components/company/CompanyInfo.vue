<template>
  <div>
    <el-button type="primary" @click="showAddDialog = true">添加单位信息</el-button>
    <el-input v-model="searchKeyword" placeholder="请输入单位名称" @input="onSearch" class="mb-4" />
    <el-table :data="organizations" stripe>
      <el-table-column prop="organizationId" label="单位ID" width="150" />
      <el-table-column prop="organizationName" label="单位名称" width="250" />
      <el-table-column prop="organizationProjectCount" label="成果总数" width="150" />
      <el-table-column prop="organizationProjectTotalCount" label="项目总数" width="150" />
      <el-table-column label="操作" width="150">
        <template #default="scope">
          <el-link type="primary" @click="editOrganization(scope.row)">编辑</el-link>
          <el-link type="danger" @click="deleteOrganization(scope.row)">删除</el-link>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog title="添加单位信息" :visible.sync="visible">
      <el-form :model="form">
        <el-form-item label="单位名称" required>
          <el-input v-model="form.organizationName" />
        </el-form-item>
        <el-form-item label="成果总数" required>
          <el-input-number v-model="form.organizationProjectCount" />
        </el-form-item>
        <el-form-item label="项目总数" required>
          <el-input-number v-model="form.organizationProjectTotalCount" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="onSubmit">确定</el-button>
      </div>
    </el-dialog>
    <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="total"
      layout="prev, pager, next" class="mt-4" />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { getCompanyInfo } from '../../api/companyInfo';

export default {
  setup() {
    const organizations = ref([]);
    const searchKeyword = ref('');
    const currentPage = ref(1);
    const pageSize = ref(10);
    const total = ref(0);

    const form = {
      organizationName: '',
      organizationProjectCount: 0,
      organizationProjectTotalCount: 0,
    }

    const loadOrganizations = async () => {
      const response = await getCompanyInfo();
      organizations.value = response.data;
      total.value = response.data.length;
    };

    const onSubmit = async () => {
      await this.$emit('add', this.form);
      this.visible = false;
    }

    const onSearch = async () => {
      if (searchKeyword.value) {
        const response = await getCompanyInfo(searchKeyword.value);
        organizations.value = response.data;
        total.value = response.data.length;
      } else {
        getCompanyInfo();
      }
    };

    onMounted(() => {
      getCompanyInfo();
    });

    const editOrganization = (row) => {
      console.log('编辑:', row);
    };

    const deleteOrganization = (row) => {
      console.log('删除:', row);
    };

    return {
      organizations,
      searchKeyword,
      currentPage,
      pageSize,
      total,
      loadOrganizations,
      onSearch,
      editOrganization,
      deleteOrganization,
    };
  },
};
</script>