<template>
  <div class="complaints-container">
    <div class="header-stats">
      <div class="stat-box total">成果总数: {{ complaints.length }}</div>
      <div class="stat-box pending">待审核: {{ getPendingCount() }}</div>
      <div class="stat-box published">已发布: {{ getCompletedCount() }}</div>
    </div>

    <div class="complaints-table">
      <table>
        <thead>
          <tr>
            <th>知识产权ID</th>
            <th>投诉类型</th>
            <th>投诉简介</th>
            <th>状态</th>
            <th>投诉时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="complaint in paginatedComplaints" :key="complaint.complaintId">
            <td>{{ complaint.intellectualPropertyId }}</td>
            <td>{{ getComplaintTypeText(complaint.complaintType) }}</td>
            <td>{{ complaint.complaintIntro }}</td>
            <td>
              <span class="status-badge" :class="getStatusClass(complaint.complaintProcess)">
                {{ getStatusText(complaint.complaintProcess) }}
              </span>
            </td>
            <td>{{ formatDate(complaint.complaintTime) }}</td>
            <td>
              <button 
                class="delete-btn" 
                :class="{ disabled: complaint.complaintProcess === 1 }"
                :disabled="complaint.complaintProcess === 1"
                :title="complaint.complaintProcess === 1 ? '受理中的投诉无法删除' : ''"
                @click="handleDelete(complaint.complaintId)"
              >
                删除
              </button>
            </td>
          </tr>
          <tr v-if="complaints.length === 0">
            <td colspan="6" class="no-data">暂无投诉数据</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination">
      <span>每页显示:</span>
      <select v-model="pageSize">
        <option value="10">10</option>
        <option value="20">20</option>
        <option value="50">50</option>
      </select>
      <div class="page-info">第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</div>
      <div class="page-controls">
        <button @click="prevPage" :disabled="currentPage === 1">上一页</button>
        <button @click="nextPage" :disabled="currentPage === totalPages">下一页</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { queryComplaintByUserId, deleteComplaintById } from '../../api/patentComplaints';

export default {
  name: 'MyComplaints',
  setup() {
    const complaints = ref([]);
    const loading = ref(false);
    const error = ref(null);
    const currentPage = ref(1);
    const pageSize = ref(10);

    const fetchComplaints = async () => {
      loading.value = true;
      error.value = null;
      
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          throw new Error('用户未登录');
        }
        
        const response = await queryComplaintByUserId(userId);
        complaints.value = response || [];
      } catch (err) {
        console.error('获取投诉列表失败:', err);
        error.value = err.message || '获取投诉列表失败';
      } finally {
        loading.value = false;
      }
    };

    const paginatedComplaints = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value;
      const end = start + pageSize.value;
      return complaints.value.slice(start, end);
    });

    const totalPages = computed(() => {
      return Math.ceil(complaints.value.length / pageSize.value) || 1;
    });

    const getStatusText = (process) => {
      switch (process) {
        case 0: return '未受理';
        case 1: return '受理中';
        case 2: return '已完成';
        default: return '未知状态';
      }
    };

    const getStatusClass = (process) => {
      switch (process) {
        case 0: return 'pending';
        case 1: return 'processing';
        case 2: return 'completed';
        default: return '';
      }
    };

    const getPendingCount = () => {
      return complaints.value.filter(c => c.complaintProcess === 1).length;
    };

    const getCompletedCount = () => {
      return complaints.value.filter(c => c.complaintProcess === 2).length;
    };

    const formatDate = (dateString) => {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    };

    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++;
      }
    };

    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--;
      }
    };

    const handleDelete = async (complaintId) => {
      try {
        await deleteComplaintById(complaintId);
        // 删除成功后重新获取列表
        await fetchComplaints();
      } catch (err) {
        console.error('删除投诉失败:', err);
      }
    };

    const getComplaintTypeText = (type) => {
      switch (type) {
        case 'infringement':
          return '侵权';
        case 'false_information':
          return '虚假信息';
        case 'other':
          return '其他';
        default:
          return '未知类型';
      }
    };

    onMounted(() => {
      fetchComplaints();
    });

    return {
      complaints,
      loading,
      error,
      currentPage,
      pageSize,
      paginatedComplaints,
      totalPages,
      getStatusText,
      getStatusClass,
      getPendingCount,
      getCompletedCount,
      formatDate,
      nextPage,
      prevPage,
      handleDelete,
      getComplaintTypeText,
    };
  }
}
</script>

<style scoped>
.complaints-container {
  padding: 20px;
  font-family: Arial, sans-serif;
}

.header-stats {
  display: flex;
  margin-bottom: 20px;
}

.stat-box {
  padding: 8px 16px;
  border-radius: 4px;
  margin-right: 10px;
  font-size: 14px;
}

.total {
  background-color: #e6f7ff;
}

.pending {
  background-color: #fff7e6;
}

.published {
  background-color: #e6ffe6;
}

.complaints-table {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px 8px;
  text-align: left;
  border-bottom: 1px solid #ebeef5;
}

th {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 500;
}

tr:hover {
  background-color: #f5f7fa;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status-badge.pending {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.status-badge.processing {
  background-color: #ecf5ff;
  color: #409eff;
}

.status-badge.completed {
  background-color: #f0f9eb;
  color: #67c23a;
}

.delete-btn {
  background-color: #fef0f0;
  color: #f56c6c;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
}

.delete-btn:hover:not(.disabled) {
  background-color: #f56c6c;
  color: white;
}

.delete-btn.disabled {
  background-color: #f4f4f5;
  color: #909399;
  cursor: not-allowed;
}

.no-data {
  text-align: center;
  color: #909399;
  padding: 20px;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 20px;
}

.pagination select {
  margin: 0 10px;
  padding: 5px;
}

.page-info {
  margin: 0 15px;
}

.page-controls button {
  padding: 5px 10px;
  margin-left: 5px;
  background-color: #f4f4f5;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
}

.page-controls button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
