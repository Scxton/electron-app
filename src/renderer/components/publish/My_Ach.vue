<template>
  <div class="achievement-container">
    <div class="display-controls">
      <div class="filter-section">
        <div class="filter-group">
          <label>成果状态: </label>
          <div class="status-select-wrapper">
            <select v-model="selectedStatus" @change="filterAchievements" class="status-select">
              <option value="all">全部</option>
              <option value="0">待审核</option>
              <option value="1">已发布</option>
            </select>
            <i class="fas fa-chevron-down select-arrow"></i>
          </div>
        </div>
        <div class="statistics">
          <span class="stat-item">成果总数: {{ totalCount }}</span>
          <span class="stat-item">待审核: {{ pendingCount }}</span>
          <span class="stat-item">已发布: {{ publishedCount }}</span>
        </div>
        <div class="search-box">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="搜索成果名称" 
            @input="filterAchievements"
            class="search-input"
          />
          <i class="fas fa-search search-icon"></i>
        </div>
      </div>
      <div class="view-controls">
        <button 
          class="add-btn"
          @click="addAchievement"
        >
          <i class="fas fa-plus"></i> 添加成果
        </button>
        <div class="view-toggle">
          <button 
            class="view-btn" 
            :class="{ active: viewMode === 'card' }" 
            @click="viewMode = 'card'"
          >
            <i class="fas fa-th-large"></i> 卡片视图
          </button>
          <button 
            class="view-btn" 
            :class="{ active: viewMode === 'list' }" 
            @click="viewMode = 'list'"
          >
            <i class="fas fa-list"></i> 列表视图
          </button>
        </div>
      </div>
    </div>
    
    <div class="card-container" v-if="viewMode === 'card'">
      <div class="achievement-card" v-for="achievement in achievements" :key="achievement.id">
        <div class="card-header">
          <h3>{{ achievement.achievementName }}</h3>
          <span :class="['status-badge', getStatusClass(achievement.auditFlag)]">
            {{ getStatus(achievement.auditFlag) }}
          </span>
        </div>
        <div class="card-body">
          <div class="info-row">
            <span class="label">类型:</span>
            <span>{{ translateCategory(achievement.achievementCategory) }}</span>
          </div>
          <div class="info-row">
            <span class="label">单位:</span>
            <span>{{ achievement.organizationName }}</span>
          </div>
          <div class="info-row">
            <span class="label">下载次数:</span>
            <span>{{ achievement.achievementDownloadCount }}</span>
          </div>
          <div class="info-row">
            <span class="label">上传时间:</span>
            <span>{{ formatDate(achievement.uploadTime) }}</span>
          </div>
        </div>
        <div class="card-actions">
          <button class="edit-btn" @click="editAchievement(achievement)">
            <i class="fas fa-edit"></i> 修改
          </button>
        </div>
      </div>
    </div>

    <div class="list-container" v-else>
      <div class="list-header">
        <div class="list-column" style="font-weight: bold; text-align: center;">成果名称</div>
        <div class="list-column" style="font-weight: bold; text-align: center;">类型</div>
        <div class="list-column" style="font-weight: bold; text-align: center;">单位</div>
        <div class="list-column" style="font-weight: bold; text-align: center;">状态</div>
        <div class="list-column" style="font-weight: bold; text-align: center;">下载次数</div>
        <div class="list-column" style="font-weight: bold; text-align: center;">上传时间</div>
        <div class="list-column" style="font-weight: bold; text-align: center;">操作</div>
      </div>
      <div class="list-item" v-for="achievement in paginatedAchievements" :key="achievement.id">
        <div class="list-cell achievement-name">{{ achievement.achievementName }}</div>
        <div class="list-cell">{{ translateCategory(achievement.achievementCategory) }}</div>
        <div class="list-cell">{{ achievement.organizationName }}</div>
        <div class="list-cell">
          <span :class="['status-badge', getStatusClass(achievement.auditFlag)]">
            {{ getStatus(achievement.auditFlag) }}
          </span>
        </div>
        <div class="list-cell">{{ achievement.achievementDownloadCount }}</div>
        <div class="list-cell">{{ formatDate(achievement.uploadTime) }}</div>
        <div class="list-cell actions">
          <button class="edit-btn" @click="editAchievement(achievement)">
            编辑
          </button>
          <!-- <button class="delete-btn">
            删除
          </button> -->
        </div>
      </div>
      <div class="pagination-controls">
        <div class="page-size-select">
          <label>每页显示:</label>
          <select v-model="pageSize" @change="changePageSize">
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="20">20</option>
          </select>
        </div>
        <div class="page-buttons">
          <button 
            class="page-btn" 
            :disabled="currentPage === 1"
            @click="prevPage"
          >
            上一页
          </button>
          <span class="page-info">第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</span>
          <button 
            class="page-btn" 
            :disabled="currentPage === totalPages"
            @click="nextPage"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { queryAll } from '../../api/achieveInfo.js'
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

export default {
  setup() {
    const achievements = ref([])
    const allAchievements = ref([]) // Store all achievements
    const selectedStatus = ref('all')
    const router = useRouter()
    const viewMode = ref('card') // 'card' or 'list'
    const totalCount = ref(0)
    const pendingCount = ref(0)
    const publishedCount = ref(0)
    const currentPage = ref(1)
    const pageSize = ref(10)
    const totalPages = ref(1)
    const paginatedAchievements = ref([])
    const searchQuery = ref('')

    const updateStatistics = (achievements) => {
      totalCount.value = achievements.length
      pendingCount.value = achievements.filter(a => a.auditFlag == 0).length
      publishedCount.value = achievements.filter(a => a.auditFlag == 1).length
    }

    const fetchAchievements = async () => {
      try {
        const response = await queryAll()
        console.log(response)
        allAchievements.value = response
        filterAchievements()
        // updateStatistics(allAchievements.value) // Update statistics
      } catch (error) {
        console.error('Error fetching achievements:', error)
      }
    }

    const filterAchievements = () => {
      const userId = localStorage.getItem('userId');
      let filtered = allAchievements.value;
      
      // Filter by user ID
      filtered = filtered.filter(achievement => achievement.userId == userId);
      
      // Filter by status if not 'all'
      if (selectedStatus.value !== 'all') {
        filtered = filtered.filter(
          achievement => achievement.auditFlag == selectedStatus.value
        );
      }
      
      // Filter by search query
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(achievement => 
          achievement.achievementName.toLowerCase().includes(query)
        );
      }
      
      achievements.value = filtered;
      updateStatistics(filtered)
    }

    const formatDate = (timestamp) => {
      const date = new Date(timestamp);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    const translateCategory = (category) => {
      const translations = {
        paper: '论文',
        patent: '专利',
        project: '项目',
        report: '报告'
      };
      return translations[category] || category;
    }

    const getStatus = (auditFlag) => {
      switch (auditFlag) {
        case 0:
          return '待审核';
        case 1:
          return '已发布';
        default:
          return '待上传';
      }
    }

    const getStatusClass = (auditFlag) => {
      switch (auditFlag) {
        case 0:
          return 'pending';
        case 1:
          return 'published';
        default:
          return '';
      }
    }

    const editAchievement = (achievement) => {
      console.log('Editing achievement:', achievement) // 调试信息
      
      const queryParams = {
        id: achievement.achievementId,
        title: achievement.achievementName,
        type: achievement.achievementCategory,
        description: achievement.achievementIntro || '',
        version: achievement.achievementVersion || '',
        achievementBelongingOrganization: {
          id: achievement.achievementBelongingOrganization,
          name: achievement.organizationName
        },
        projectId: achievement.projectId || null,
        category: achievement.subjectCategory || '',
        techType: achievement.technologyCategory || '',
        highlights: achievement.remarks || '',
        fileCount: achievement.achievementForm || 1
      };
      
      console.log('Navigating with query params:', queryParams) // 调试信息
      
      router.push({
        path: '/publish/info',
        query: queryParams
      });
    }

    const addAchievement = () => {
      router.push({ path: '/publish/info' });
    }

    const updatePagination = () => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      paginatedAchievements.value = achievements.value.slice(start, end)
      totalPages.value = Math.ceil(achievements.value.length / pageSize.value)
    }

    const changePageSize = () => {
      currentPage.value = 1
      updatePagination()
    }

    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++
        updatePagination()
      }
    }

    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--
        updatePagination()
      }
    }

    watch(achievements, () => {
      updatePagination()
    })

    onMounted(() => {
      fetchAchievements()
    })

    return {
      achievements,
      selectedStatus,
      formatDate,
      translateCategory,
      getStatus,
      getStatusClass,
      filterAchievements,
      editAchievement,
      addAchievement,
      viewMode,
      totalCount,
      pendingCount,
      publishedCount,
      currentPage,
      pageSize,
      totalPages,
      paginatedAchievements,
      changePageSize,
      nextPage,
      prevPage,
      searchQuery
    }
  }
}
</script>

<style scoped>
.achievement-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.display-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.filter-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-select-wrapper {
  position: relative;
  display: inline-block;
  width: 200px;
}

.status-select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fff;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.status-select:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.status-select:focus {
  outline: none;
  border-color: #409eff;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
}

.select-arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #666;
  font-size: 12px;
  transition: color 0.3s ease;
}

.status-select:hover + .select-arrow {
  color: #409eff;
}

.view-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.add-btn {
  padding: 8px 16px;
  background-color: #67c23a;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.add-btn:hover {
  background-color: #85ce61;
}

.add-btn i {
  margin-right: 6px;
}

.view-toggle {
  display: flex;
  gap: 10px;
}

.view-btn {
  padding: 8px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background-color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.view-btn:hover {
  border-color: #409eff;
  color: #409eff;
}

.view-btn.active {
  background-color: #409eff;
  color: #fff;
  border-color: #409eff;
}

.card-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.achievement-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;
}

.achievement-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.card-header {
  padding: 16px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.status-badge.pending {
  background-color: #fff3e0;
  color: #ff9800;
}

.status-badge.pending::before {
  content: "⏳";
}

.status-badge.published {
  background-color: #e8f5e9;
  color: #4caf50;
}

.status-badge.published::before {
  content: "✔️";
}

.card-body {
  padding: 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  color: #666;
  font-weight: 500;
}

.card-actions {
  padding: 16px;
  border-top: 1px solid #e9ecef;
  text-align: right;
}

.edit-btn {
  padding: 8px 16px;
  background-color: #409eff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.edit-btn:hover {
  background-color: #66b1ff;
}

.edit-btn i {
  margin-right: 6px;
}

.list-container {
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  background-color: #fff;
}

.list-header {
  display: flex;
  background-color: #f5f7fa;
  padding: 12px 16px;
  font-weight: 500;
  color: #606266;
  border-bottom: 1px solid #ebeef5;
}

.list-column {
  flex: 1;
  padding: 0 8px;
  text-align: left;
}

.list-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
  transition: background-color 0.3s ease;
}

.list-item:hover {
  background-color: #f5f7fa;
}

.list-item:nth-child(even) {
  background-color: #fafafa;
}

.list-item:nth-child(even):hover {
  background-color: #f5f7fa;
}

.list-cell {
  flex: 1;
  padding: 0 8px;
  color: #606266;
}

.achievement-name {
  font-weight: 500;
  color: #303133;
}

.actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.edit-btn, .delete-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
}

.edit-btn {
  background-color: #f0f9ff;
  color: #1890ff;
  border: 1px solid #d6e9ff;
}

.edit-btn:hover {
  background-color: #e6f7ff;
  color: #0076e4;
}

.delete-btn {
  background-color: #fff0f0;
  color: #f56c6c;
  border: 1px solid #ffd6d6;
}

.delete-btn:hover {
  background-color: #fef0f0;
  color: #e64242;
}

/* Status badge in list view */
.list-cell .status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: normal;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #fff;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: modalFadeIn 0.3s ease;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-title {
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

.modal-close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  font-size: 20px;
  transition: color 0.3s ease;
}

.modal-close-btn:hover {
  color: #333;
}

.modal-body {
  margin-bottom: 20px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.statistics {
  display: flex;
  gap: 15px;
  padding: 10px 0;
}

.stat-item {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
}

.stat-item:nth-child(1) { /* 成果总数 */
  background-color: #f0f9ff;
  color: #409eff;
  border: 1px solid #d6e9ff;
}

.stat-item:nth-child(2) { /* 待审核 */
  background-color: #fff0f0;
  color: #f56c6c;
  border: 1px solid #ffd6d6;
}

.stat-item:nth-child(3) { /* 已发布 */
  background-color: #e8f5e9;
  color: #67c23a;
  border: 1px solid #c2e7b0;
}

.pagination-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-top: 1px solid #ebeef5;
}

.page-size-select {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-size-select select {
  padding: 6px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #fff;
  cursor: pointer;
}

.page-buttons {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-btn {
  padding: 6px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-btn:hover:not(:disabled) {
  background-color: #f5f7fa;
  border-color: #c0c4cc;
}

.page-info {
  font-size: 14px;
  color: #606266;
}

.search-box {
  width: 100%;
  max-width: 300px;
}

.search-input {
  width: 100%;
  padding: 10px 15px 10px 35px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #409eff;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-size: 14px;
  pointer-events: none;
}

.list-header .list-column {
  font-weight: bold;
  text-align: center;
}

@media (max-width: 768px) {
  .filter-group {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .statistics {
    flex-direction: column;
    gap: 8px;
  }
  
  .search-box {
    max-width: 100%;
  }
}
</style>
