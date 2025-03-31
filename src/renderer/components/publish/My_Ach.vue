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
            <span class="label">版本:</span>
            <span>{{ achievement.achievementVersion || '1.0' }}</span>
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
          <button class="update-btn" @click="showUpdateDialog(achievement)">
            <i class="fas fa-arrow-up"></i> 更新版本
          </button>
        </div>
      </div>
    </div>

    <div class="list-container" v-else>
      <div class="list-header">
        <div class="list-column" style="font-weight: bold; text-align: center;">成果名称</div>
        <div class="list-column" style="font-weight: bold; text-align: center;">类型</div>
        <div class="list-column" style="font-weight: bold; text-align: center;">单位</div>
        <div class="list-column" style="font-weight: bold; text-align: center;">版本</div>
        <div class="list-column" style="font-weight: bold; text-align: center;">状态</div>
        <div class="list-column" style="font-weight: bold; text-align: center;">下载次数</div>
        <div class="list-column" style="font-weight: bold; text-align: center;">上传时间</div>
        <div class="list-column" style="font-weight: bold; text-align: center;">操作</div>
      </div>
      <div class="list-item" v-for="achievement in paginatedAchievements" :key="achievement.id">
        <div class="list-cell achievement-name" @click="showVersionHistory(achievement)">
          {{ achievement.achievementName }}
        </div>
        <div class="list-cell">{{ translateCategory(achievement.achievementCategory) }}</div>
        <div class="list-cell">{{ achievement.organizationName }}</div>
        <div class="list-cell">{{ achievement.achievementVersion || '1.0' }}</div>
        <div class="list-cell">
          <span :class="['status-badge', getStatusClass(achievement.auditFlag)]">
            {{ getStatus(achievement.auditFlag) }}
          </span>
        </div>
        <div class="list-cell">{{ achievement.achievementDownloadCount }}</div>
        <div class="list-cell">{{ formatDate(achievement.uploadTime) }}</div>
        <div class="list-cell actions">
          <button class="update-btn" @click="showUpdateDialog(achievement)">
            更新版本
          </button>
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

    <div class="modal-overlay" v-if="showUpdateModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">更新版本</h3>
          <button class="modal-close-btn" @click="showUpdateModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">成果名称</label>
            <div class="info-display">{{ selectedAchievement?.achievementName }}</div>
          </div>
          <div class="form-group version-group">
            <div class="version-item">
              <label class="form-label">当前版本</label>
              <div class="info-display current-version">
                <span class="version-tag">v{{ selectedAchievement?.achievementVersion || '1.0' }}</span>
              </div>
            </div>
            <div class="version-item">
              <label class="form-label">新版本 <span class="required">*</span></label>
              <input 
                type="text" 
                v-model="newVersion" 
                class="version-input" 
                placeholder="请输入新版本号"
              />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">上传文件 <span class="required">*</span></label>
            <div class="file-upload-wrapper">
              <input 
                type="file" 
                multiple 
                @change="handleFileChange" 
                class="file-input"
                accept=".pdf,.doc,.docx,.zip,.rar"
              />
              <div class="file-upload-prompt">
                <i class="fas fa-cloud-upload-alt upload-icon"></i>
                <div class="upload-text">
                  <span class="primary-text">点击或拖拽文件到此区域上传</span>
                  <span class="secondary-text">支持 PDF、Word、压缩包等格式</span>
                </div>
              </div>
            </div>
            <div class="selected-files" v-if="updateFiles.length > 0">
              <div class="file-item" v-for="(file, index) in updateFiles" :key="index">
                <i class="fas fa-file-alt"></i>
                <span class="file-name">{{ file.name }}</span>
                <button class="remove-file" @click="removeFile(index)">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn cancel-btn" @click="showUpdateModal = false">取消</button>
          <button class="btn primary-btn" @click="submitUpdate">
            <i class="fas fa-arrow-up"></i> 提交更新
          </button>
        </div>
      </div>
    </div>

    <div class="modal-overlay" v-if="showVersionHistoryModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">版本历史</h3>
          <button class="modal-close-btn" @click="showVersionHistoryModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="version-history-list">
            <div v-if="loadingVersions" class="loading-state">加载中...</div>
            <div v-else-if="versionHistory.length === 0" class="empty-state">暂无版本历史</div>
            <div v-else v-for="version in versionHistory" :key="version.id" class="version-item">
              <div class="version-info">
                <span class="version-number">{{ version.versionNumber }}</span>
                <span class="version-date">{{ formatDate(version.updateTime) }}</span>
                <button class="download-btn" @click="downloadVersion(version)">
                  <i class="fas fa-download"></i> 下载
                </button>
              </div>
            </div>
          </div>
          <div class="pagination-controls" v-if="versionHistory.length > 0">
            <div class="page-size-select">
              <label>每页显示:</label>
              <select v-model="versionPageSize" @change="handleVersionSizeChange">
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
              </select>
            </div>
            <div class="page-buttons">
              <button 
                class="page-btn" 
                :disabled="versionCurrentPage === 1"
                @click="handleVersionCurrentChange(versionCurrentPage - 1)"
              >
                上一页
              </button>
              <span class="page-info">
                第 {{ versionCurrentPage }} 页 / 共 {{ Math.ceil(versionTotal / versionPageSize) }} 页
              </span>
              <button 
                class="page-btn" 
                :disabled="versionCurrentPage >= Math.ceil(versionTotal / versionPageSize)"
                @click="handleVersionCurrentChange(versionCurrentPage + 1)"
              >
                下一页
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { queryAll } from '../../api/achieveInfo.js'
import { ref, onMounted, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { upgradeToAudit } from '../../api/upload.js'
import { getVersionHistoryWithPagination } from '../../api/search'
import { downloadAchievements } from '../../api/download.js'
import { ElMessage } from 'element-plus'

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
    const showUpdateModal = ref(false)
    const selectedAchievement = ref(null)
    const newVersion = ref('')
    const updateFiles = ref([])
    const showVersionHistoryModal = ref(false)
    const currentAchievement = ref(null)
    const versionHistory = ref([])
    const versionCurrentPage = ref(1)
    const versionPageSize = ref(10)
    const versionTotal = ref(0)
    const loadingVersions = ref(false)
    const previousAchievements = ref(new Map()) // 存储上一次的成果状态

    const updateStatistics = (achievements) => {
      totalCount.value = achievements.length
      pendingCount.value = achievements.filter(a => a.auditFlag == 0||a.auditFlag ==2).length
      publishedCount.value = achievements.filter(a => a.auditFlag == 1).length
    }

    const fetchAchievements = async () => {
      try {
        console.log('Fetching achievements...')
        const response = await queryAll()
        console.log('Fetched achievements:', response)
        allAchievements.value = response
        
        // 检查审核状态变化
        checkAuditStatus(response)
        
        filterAchievements()
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
        case 2:
          return '待更新';
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
        case 2:
          return 'needs-update';
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

    const showUpdateDialog = (achievement) => {
      selectedAchievement.value = achievement
      newVersion.value = ''
      updateFiles.value = []
      showUpdateModal.value = true
    }

    const handleFileChange = (event) => {
      updateFiles.value = Array.from(event.target.files)
    }
    

    const submitUpdate = async () => {
      console.log('submitUpdate')
      const selectedFiles = updateFiles.value.map(file => file.raw || file)
      if (!newVersion.value) {
        alert('请输入新版本号')
        return
      }
      if (updateFiles.value.length === 0) {
        alert('请选择要上传的文件')
        return
      }

      try {
        await upgradeToAudit(
          selectedFiles,
          selectedAchievement.value.achievementId,
          newVersion.value
        )
        alert('版本更新成功')
        showUpdateModal.value = false
        fetchAchievements() // 刷新数据
      } catch (error) {
        console.error('版本更新失败:', error)
        alert('版本更新失败')
      }
    }

    const removeFile = (index) => {
      updateFiles.value.splice(index, 1)
    }

    const showVersionHistory = async (achievement) => {
      currentAchievement.value = achievement
      showVersionHistoryModal.value = true
      versionCurrentPage.value = 1
      await fetchVersionHistory()
    }

    const fetchVersionHistory = async () => {
      if (!currentAchievement.value) return
      
      loadingVersions.value = true

      try {
        const versionHistoryData = {
          achievementId: currentAchievement.value.achievementId
         
        }
        console.log(versionHistoryData)
        const response = await getVersionHistoryWithPagination(
          versionHistoryData,
          versionCurrentPage.value,
          versionPageSize.value
        )
        
        if (Array.isArray(response)) {
          versionHistory.value = response
          versionTotal.value = response.length
        } else if (response && Array.isArray(response.data)) {
          versionHistory.value = response
          versionTotal.value = response.total || response.data.length
        } else {
          versionHistory.value = []
          versionTotal.value = 0
        }
      } catch (error) {
        console.error('Error fetching version history:', error)
        versionHistory.value = []
        versionTotal.value = 0
      } finally {
        loadingVersions.value = false
      }
    }

    const handleVersionSizeChange = (size) => {
      versionPageSize.value = size
      fetchVersionHistory()
    }

    const handleVersionCurrentChange = (page) => {
      versionCurrentPage.value = page
      fetchVersionHistory()
    }

    const downloadVersion = (version) => {
      if (!currentAchievement.value) return;
      
      try {
        // 构造文件名格式：成果名称+版本号+.zip
        const fileName = `${currentAchievement.value.achievementName}${version.versionNumber}.zip`;
        
        console.log('Downloading version file:', fileName);
        
        // 调用下载API
        downloadAchievements(fileName);
        
        // 显示成功消息
        ElMessage({
          message: '文件开始下载',
          type: 'success',
          duration: 2000,
          showClose: true
        });
      } catch (error) {
        console.error('Error downloading version:', error);
        ElMessage({
          message: '下载失败，请稍后重试',
          type: 'error',
          duration: 3000,
          showClose: true
        });
      }
    }

    // 检查审核状态变化并显示通知
    const checkAuditStatus = (currentAchievements) => {
      console.log('Checking audit status for achievements:', currentAchievements)
      console.log('Previous achievements state:', previousAchievements.value)
      
      currentAchievements.forEach(achievement => {
        const prev = previousAchievements.value.get(achievement.achievementId)
        console.log(`Checking achievement: ${achievement.achievementName}`, {
          current: {
            id: achievement.achievementId,
            tableStatus: achievement.tableStatus,
            auditFlag: achievement.auditFlag
          },
          previous: prev
        })
        
        if (prev) {
          // 检查是否通过审核
          if (achievement.tableStatus && 
              (prev.auditFlag === 0 || prev.auditFlag === 2) && 
              achievement.auditFlag === 1) {
            console.log('Audit passed condition met:', {
              tableStatus: achievement.tableStatus,
              prevAuditFlag: prev.auditFlag,
              currentAuditFlag: achievement.auditFlag
            })
            ElMessage({
              message: `您的成果"${achievement.achievementName} v${achievement.achievementVersion || '1.0'}"已通过审核`,
              type: 'success',
              duration: 5000
            })
          }
          
          // 检查是否被驳回
          if (achievement.tableStatus && 
              prev.auditFlag === 1 && 
              achievement.auditFlag === 0) {
            console.log('Audit rejected condition met:', {
              tableStatus: achievement.tableStatus,
              prevAuditFlag: prev.auditFlag,
              currentAuditFlag: achievement.auditFlag
            })
            ElMessage({
              message: `您的成果"${achievement.achievementName} v${achievement.achievementVersion || '1.0'}"已被驳回，请重新上传`,
              type: 'error',
              duration: 5000
            })
          }
        } else {
          console.log('No previous state found for achievement:', achievement.achievementId)
        }
        
        // 更新存储的状态
        previousAchievements.value.set(achievement.achievementId, {
          auditFlag: achievement.auditFlag,
          tableStatus: achievement.tableStatus
        })
      })
    }

    // 在组件卸载时保存状态
    onUnmounted(() => {
      console.log('Component unmounting, saving achievement states...')
      // 可以考虑将状态保存到 localStorage
      localStorage.setItem('previousAchievementStates', 
        JSON.stringify(Array.from(previousAchievements.value.entries())))
    })

    // 在组件挂载时恢复状态
    onMounted(() => {
      console.log('Component mounting...')
      // 尝试从 localStorage 恢复之前的状态
      const savedStates = localStorage.getItem('previousAchievementStates')
      if (savedStates) {
        console.log('Found saved achievement states:', savedStates)
        previousAchievements.value = new Map(JSON.parse(savedStates))
      }
      fetchAchievements()
    })

    watch(achievements, () => {
      updatePagination()
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
      searchQuery,
      showUpdateModal,
      selectedAchievement,
      newVersion,
      showUpdateDialog,
      handleFileChange,
      submitUpdate,
      updateFiles,
      removeFile,
      showVersionHistoryModal,
      versionHistory,
      versionCurrentPage,
      versionPageSize,
      versionTotal,
      loadingVersions,
      showVersionHistory,
      handleVersionSizeChange,
      handleVersionCurrentChange,
      downloadVersion
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

.status-badge.needs-update {
  background-color: #fff0f0;
  color: #f56c6c;
}

.status-badge.needs-update::before {
  content: "🔄";
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

.card-actions .update-btn {
  padding: 8px 16px;
  background-color: #e6f7ff;
  color: #1890ff;
  border: 1px solid #91d5ff;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.card-actions .update-btn:hover {
  background-color: #bae7ff;
  color: #096dd9;
}

.card-actions .update-btn i {
  font-size: 14px;
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
  width: 90%;
  max-width: 600px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #ebeef5;
}

.modal-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.modal-close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #909399;
  cursor: pointer;
  transition: color 0.2s;
}

.modal-close-btn:hover {
  color: #606266;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.required {
  color: #f56c6c;
  margin-left: 4px;
}

.info-display {
  padding: 12px;
  background: #f5f7fa;
  border-radius: 6px;
  color: #303133;
  font-size: 14px;
}

.version-group {
  display: flex;
  gap: 24px;
}

.version-item {
  flex: 1;
}

.current-version {
  display: flex;
  align-items: center;
}

.version-tag {
  display: inline-block;
  padding: 4px 8px;
  background: #e6f7ff;
  color: #1890ff;
  border-radius: 4px;
  font-weight: 500;
}

.version-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s;
}

.version-input:focus {
  outline: none;
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.file-upload-wrapper {
  position: relative;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  transition: all 0.3s;
  background: #fafafa;
}

.file-upload-wrapper:hover {
  border-color: #409eff;
  background: #f5faff;
}

.upload-icon {
  font-size: 32px;
  color: #409eff;
  margin-bottom: 12px;
}

.upload-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.primary-text {
  color: #303133;
  font-size: 14px;
  font-weight: 500;
}

.secondary-text {
  color: #909399;
  font-size: 12px;
}

.selected-files {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 6px;
  font-size: 14px;
}

.file-item i {
  color: #409eff;
  margin-right: 8px;
}

.file-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remove-file {
  background: none;
  border: none;
  color: #909399;
  cursor: pointer;
  padding: 4px;
  transition: color 0.2s;
}

.remove-file:hover {
  color: #f56c6c;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s;
}

.cancel-btn {
  border: 1px solid #dcdfe6;
  background: #fff;
  color: #606266;
}

.cancel-btn:hover {
  color: #409eff;
  border-color: #c6e2ff;
  background: #ecf5ff;
}

.primary-btn {
  background: #409eff;
  color: #fff;
  border: none;
}

.primary-btn:hover {
  background: #66b1ff;
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

.update-btn {
  background-color: #e6f7ff;
  color: #1890ff;
  border: 1px solid #91d5ff;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.update-btn:hover {
  background-color: #bae7ff;
  color: #096dd9;
}

.version-history-list {
  max-height: 400px;
  overflow-y: auto;
}

.version-item {
  padding: 12px;
  border-bottom: 1px solid #ebeef5;
}

.version-item:last-child {
  border-bottom: none;
}

.version-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.version-number {
  font-weight: 500;
  color: #409eff;
}

.version-date {
  color: #909399;
  font-size: 0.9em;
}

.loading-state, .empty-state {
  padding: 24px;
  text-align: center;
  color: #909399;
}

.achievement-name {
  cursor: pointer;
  color: #409eff;
}

.achievement-name:hover {
  text-decoration: underline;
}

.download-btn {
  padding: 4px 12px;
  background-color: #e6f7ff;
  color: #1890ff;
  border: 1px solid #91d5ff;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.download-btn:hover {
  background-color: #bae7ff;
  color: #096dd9;
}

.download-btn i {
  font-size: 12px;
}
</style>
