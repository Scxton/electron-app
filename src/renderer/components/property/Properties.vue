<template>
  <div class="property-container">
    <div class="header">
      <button class="add-btn" @click="handleAdd">添加产权</button>
      <div class="search">
        <input type="text" placeholder="产权搜索" v-model="searchTerm" @input="handleSearch" />
      </div>
    </div>

    <table class="property-table">
      <thead>
        <tr>
          <th>产权编号</th>
          <th>产权名称</th>
          <th>申请注册号</th>
          <th>产权类型</th>
          <th>所属单位</th>
          <th>产权状态</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in propertyList" :key="item.id">
          <td>{{ item.id }}</td>
          <td>{{ item.name }}</td>
          <td>{{ item.registrationNo }}</td>
          <td>{{ item.type }}</td>
          <td>{{ item.unit }}</td>
          <td>{{ item.status }}</td>
          <td class="actions">
            <button class="btn btn-view" @click="handleView(item)">查看</button>
            <button class="btn btn-edit" @click="handleEdit(item)">编辑</button>
            <button class="btn btn-delete" @click="handleDelete(item)">删除</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="pagination">
      <button :disabled="currentPage === 1" @click="prevPage">上一页</button>
      <span>第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</span>
      <button :disabled="currentPage === totalPages" @click="nextPage">下一页</button>
      <select v-model="pageSize" @change="handlePageSizeChange">
        <option :value="10">10条/页</option>
        <option :value="20">20条/页</option>
        <option :value="50">50条/页</option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { queryAll, queryAllWithPagination } from '../../api/properties';

// 响应式状态
const propertyList = ref([]);
const totalItems = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchTerm = ref('');
const loading = ref(false);

// 计算属性
const totalPages = computed(() => {
  return Math.ceil(totalItems.value / pageSize.value);
});

// 方法
const fetchData = async () => {
  loading.value = true;
  console.log('开始获取产权数据...');
  try {
    console.log('调用 queryAll API...');
    const result = await queryAll();
    console.log('API 返回结果:', result);
    
    if (result && result.data) {
      console.log('获取到产权数据条数:', result.data.length);
      propertyList.value = result.data || [];
      totalItems.value = propertyList.value.length;
    } else {
      console.warn('API 返回数据为空或格式不正确:', result);
      propertyList.value = [];
      totalItems.value = 0;
    }
  } catch (error) {
    console.error('获取产权信息失败:', error);
    console.error('错误详情:', error.message);
    if (error.response) {
      console.error('服务器响应:', error.response.data);
      console.error('状态码:', error.response.status);
    }
  } finally {
    console.log('数据获取完成，loading 状态设为 false');
    loading.value = false;
  }
};

const handleView = (item) => {
  console.log('查看产权详情:', item);
  // 实现查看详情功能，例如导航到详情页或显示模态框
};

const handleEdit = (item) => {
  console.log('编辑产权:', item);
  // 实现编辑功能，例如导航到编辑页或显示编辑模态框
};

const handleDelete = (item) => {
  console.log('删除产权:', item.id);
  if (confirm(`确认删除产权"${item.name}"?`)) {
    // 调用删除API
    // deleteItem(item.id).then(() => {
    //   fetchData(); // 删除成功后刷新数据
    // }).catch(error => {
    //   console.error('删除失败:', error);
    // });
    
    // 模拟删除成功
    fetchData();
  }
};

const handleAdd = () => {
  console.log('添加新产权');
  // 实现添加功能，例如导航到添加页或显示添加模态框
};

const handleSearch = () => {
  console.log('搜索:', searchTerm.value);
  currentPage.value = 1; // 重置到第一页
  fetchData();
};

const handlePageSizeChange = () => {
  currentPage.value = 1; // 改变每页显示数量时重置到第一页
  fetchData();
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    fetchData();
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchData();
  }
};

// 监听搜索词变化
watch(searchTerm, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    // 可以添加防抖逻辑
    handleSearch();
  }
});

// 组件挂载时获取数据
onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.property-container {
  padding: 20px;
  width: 100%;
}

.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.add-btn {
  background-color: #1890ff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.search input {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #d9d9d9;
  width: 200px;
}

.property-table {
  width: 100%;
  border-collapse: collapse;
}

.property-table th, .property-table td {
  padding: 12px 8px;
  text-align: center;
  border-bottom: 1px solid #e8e8e8;
}

.property-table th {
  background-color: #fafafa;
  font-weight: 500;
}

.property-table tr:hover {
  background-color: #f5f5f5;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.btn {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: white;
}

.btn-view {
  background-color: #1890ff;
}

.btn-edit {
  background-color: #52c41a;
}

.btn-delete {
  background-color: #f5222d;
}

.pagination {
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.pagination button {
  padding: 6px 12px;
  background-color: #f0f0f0;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
}

.pagination button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.pagination select {
  padding: 6px;
  border-radius: 4px;
  border: 1px solid #d9d9d9;
}
</style>
