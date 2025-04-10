<template>
  <div class="achievement-container">
    <div class="display-controls">
      <div class="filter-section">
        <div class="search-box">
          <el-input v-model="searchText" placeholder="搜索成果名称或发布单位" clearable @input="filterAchievements">
            <template #prefix>
              <i class="fas fa-search"></i>
            </template>
          </el-input>
        </div>
        <label>成果状态: </label>
        <div class="status-select-wrapper">
          <select v-model="selectedStatus" @change="filterAchievements" class="status-select">
            <option value="all">全部</option>
            <option value="0">待审核</option>
            <option value="1">已发布</option>
          </select>
          <i class="fas fa-chevron-down select-arrow"></i>
        </div>
        <div class="statistics">
          <span class="stat-item">成果总数: {{ totalCount }}</span>
          <span class="stat-item">待审核: {{ pendingCount }}</span>
          <span class="stat-item">已发布: {{ publishedCount }}</span>
        </div>
      </div>
      <div class="view-controls">
        <button class="review-btn" @click="showReviewModal">
          <i class="fas fa-clipboard-check"></i> 待审核成果
        </button>
        <button class="add-btn" @click="addAchievement">
          <i class="fas fa-plus"></i> 添加成果
        </button>
      </div>
    </div>

    <!-- 添加统计图 -->
    <div class="chart-container">
      <div ref="chart" class="chart" style="width: 100%; height: 400px;"></div>
      <div id="download-chart" class="chart" style="width: 100%; height: 400px; margin-top: 20px;"></div>
    </div>

    <div class="list-container">
      <div class="list-header">
        <div class="list-column">成果名称</div>
        <div class="list-column">成果类型</div>
        <div class="list-column">发布单位</div>
        <div class="list-column">成果状态</div>
        <div class="list-column">当前版本</div>
        <div class="list-column">下载次数</div>
        <div class="list-column">上传时间</div>
        <div class="list-column">操作</div>
      </div>
      <div class="list-item" v-for="achievement in paginatedAchievements" :key="achievement.id">
        <div class="list-cell achievement-name">
          <a href="#" @click.prevent="showVersionHistory(achievement)">{{ achievement.achievementName }}</a>
        </div>
        <div class="list-cell">{{ translateCategory(achievement.achievementCategory) }}</div>
        <div class="list-cell">{{ achievement.organizationName }}</div>
        <div class="list-cell">
          <span :class="['status-badge', getStatusClass(achievement.auditFlag)]">
            {{ getStatus(achievement.auditFlag) }}
          </span>
        </div>
        <div class="list-cell">{{ achievement.achievementVersion || '-' }}</div>
        <div class="list-cell">{{ achievement.achievementDownloadCount }}</div>
        <div class="list-cell">{{ formatDate(achievement.uploadTime) }}</div>
        <div class="list-cell actions">
          <button class="edit-btn" @click="editAchievement(achievement)">
            编辑
          </button>
          <button class="delete-btn" @click="deleteAchievement(achievement)">
            删除
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
          <button class="page-btn" :disabled="currentPage === 1" @click="prevPage">
            上一页
          </button>
          <span class="page-info">第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</span>
          <button class="page-btn" :disabled="currentPage === totalPages" @click="nextPage">
            下一页
          </button>
        </div>
      </div>
    </div>

    <!-- 审核弹窗 -->
    <el-dialog v-model="reviewModalVisible" title="待审核成果" width="80%" fullscreen>
      <review-component />
    </el-dialog>

    <!-- 编辑弹窗 -->
    <el-dialog v-model="editDialogVisible" title="编辑成果信息" width="30%">
      <el-form :model="editForm" label-width="120px">
        <el-form-item label="成果名称">
          <el-input v-model="editForm.achievementName" />
        </el-form-item>
        <el-form-item label="成果类型">
          <el-select v-model="editForm.achievementCategory">
            <el-option label="论文" value="paper" />
            <el-option label="专利" value="patent" />
            <el-option label="项目" value="project" />
            <el-option label="报告" value="report" />
          </el-select>
        </el-form-item>
        <el-form-item label="版本号">
          <el-input v-model="editForm.achievementVersion" />
        </el-form-item>
        <el-form-item label="成果简介">
          <el-input v-model="editForm.achievementIntro" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="发布单位">
          <el-select v-model="editForm.organizationId" filterable clearable placeholder="请选择发布单位"
            :loading="companyLoading">
            <el-option v-for="company in companies" :key="company.value" :label="company.label"
              :value="company.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleEditSubmit">确认</el-button>
      </template>
    </el-dialog>

    <!-- 版本历史弹窗 -->
    <el-dialog v-model="versionHistoryVisible" title="历史版本" width="60%">
      <div v-if="loadingVersions" class="loading-container">
        <i class="fas fa-spinner fa-spin"></i> 加载中...
      </div>
      <div v-else>
        <div v-if="versionHistory.length === 0" class="no-data">
          暂无历史版本记录
        </div>
        <div v-else class="version-history-container">
          <div class="version-list-header">
            <div class="version-column">版本号</div>
            <div class="version-column">上传时间</div>
            <div class="version-column">版本说明</div>
            <div class="version-column">操作</div>
          </div>
          <div class="version-list-item" v-for="version in versionHistory" :key="version.id">
            <div class="version-cell">{{ version.versionNumber }}</div>
            <div class="version-cell">{{ formatDate(version.updateTime) }}</div>
            <div class="version-cell">{{ version.versionDescription || '无' }}</div>
            <div class="version-cell actions">
              <button class="download-btn" @click="downloadVersion(version)">
                <i class="fas fa-download"></i> 下载
              </button>
            </div>
          </div>
        </div>

        <div class="version-pagination">
          <el-pagination v-model:current-page="versionCurrentPage" v-model:page-size="versionPageSize"
            :page-sizes="[5, 10, 20]" layout="total, sizes, prev, pager, next" :total="versionTotal"
            @size-change="handleVersionSizeChange" @current-change="handleVersionCurrentChange" />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { queryAll, update, deleteItem, queryAllDownloadRecords } from '../../api/achieveInfo.js'
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import ReviewComponent from '../publish/review.vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { getAllCompanies } from '../../api/companyInfo'
import { addLog } from '../../api/log.js'
import * as echarts from 'echarts'
import { getVersionHistoryWithPagination } from '../../api/search.js'
import { downloadAchievements } from '../../api/download.js'

export default {
  components: {
    ReviewComponent
  },
  setup() {
    const achievements = ref([])
    const allAchievements = ref([]) // Store all achievements
    const selectedStatus = ref('all')
    const router = useRouter()
    const viewMode = ref('list') // Remove 'card' option
    const totalCount = ref(0)
    const pendingCount = ref(0)
    const publishedCount = ref(0)
    const currentPage = ref(1)
    const pageSize = ref(10)
    const totalPages = ref(1)
    const paginatedAchievements = ref([])
    const reviewModalVisible = ref(false)
    const editDialogVisible = ref(false)
    const editForm = ref({
      id: '',
      achievementName: '',
      achievementCategory: '',
      achievementVersion: '',
      achievementIntro: '',
      organizationId: ''
    })
    const companies = ref([])
    const companyLoading = ref(false)
    const searchText = ref('')
    const chart = ref(null)
    const versionHistoryVisible = ref(false)
    const loadingVersions = ref(false)
    const versionHistory = ref([])
    const versionCurrentPage = ref(1)
    const versionPageSize = ref(10)
    const versionTotal = ref(0)
    const currentAchievement = ref(null)

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
      let filtered = allAchievements.value;

      // Filter by search text
      if (searchText.value) {
        const searchLower = searchText.value.toLowerCase()
        filtered = filtered.filter(achievement =>
          achievement.achievementName.toLowerCase().includes(searchLower) ||
          achievement.organizationName.toLowerCase().includes(searchLower)
        )
      }

      // Filter by status if not 'all'
      if (selectedStatus.value !== 'all') {
        filtered = filtered.filter(
          achievement => achievement.auditFlag == selectedStatus.value
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
          return '待审核';
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
      editForm.value = {
        achievementId: achievement.achievementId,
        achievementName: achievement.achievementName,
        achievementCategory: achievement.achievementCategory,
        achievementVersion: achievement.achievementVersion || '',
        achievementIntro: achievement.achievementIntro || '',
        organizationId: achievement.organizationId
      }
      editDialogVisible.value = true
    }

    const handleEditSubmit = async () => {
      try {
        console.log('Submitting edit form:', editForm.value)

        // Validate required fields
        if (!editForm.value.achievementName || !editForm.value.achievementCategory) {
          ElMessageBox.alert('成果名称和成果类型是必填项', '操作失败', {
            confirmButtonText: '确定',
            type: 'error'
          })
          return
        }

        // Call update API
        const response = await update(editForm.value)
        console.log('Update API response:', response)

        // Check if update was successful
        if (response) {
          editDialogVisible.value = false
          await fetchAchievements() // 重新获取数据
          console.log('Achievements refreshed successfully')

          // Add log for edit operation
          await addLog({
            userId: localStorage.getItem('userId'),
            logIntro: `编辑成果: ${editForm.value.achievementName}`,
            logTime: new Date().toISOString().split('T')[0],
            tableStatus: true
          });

          // 使用弹窗显示成功信息
          ElMessageBox.alert('编辑成功', '操作成功', {
            confirmButtonText: '确定',
            type: 'success'
          })
        } else {
          // 显示更详细的错误信息
          const errorMsg = response?.message || '更新失败，请检查网络连接或联系管理员'
          throw new Error(errorMsg)
        }
      } catch (error) {
        console.error('Error updating achievement:', error)
        ElMessageBox.alert('更新失败：' + (error.message || '未知错误'), '操作失败', {
          confirmButtonText: '确定',
          type: 'error'
        })
      }
    }

    const addAchievement = () => {
      // Add log for add operation

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

    const showReviewModal = () => {
      reviewModalVisible.value = true
    }

    const deleteAchievement = async (achievement) => {
      try {
        // 二次确认弹窗
        await ElMessageBox.confirm(
          `确定要删除成果 "${achievement.achievementName}" 吗？`,
          '删除确认',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        // 调用删除接口
        const response = await deleteItem(achievement.achievementId)
        console.log('Delete API response:', response)

        if (response) {
          // Add log for delete operation
          await addLog({
            userId: localStorage.getItem('userId'),
            logIntro: `删除成果: ${achievement.achievementName}`,
            logTime: new Date().toISOString().split('T')[0],
            tableStatus: true
          });
          // 删除成功提示
          ElMessageBox.alert('删除成功', '操作成功', {
            confirmButtonText: '确定',
            type: 'success'
          })
          // 重新获取数据
          await fetchAchievements()
        } else {
          throw new Error(response?.message || '删除失败')
        }
      } catch (error) {
        // 用户取消删除时不显示错误
        if (error !== 'cancel') {
          console.error('Error deleting achievement:', error)
          ElMessageBox.alert('删除失败：' + (error.message || '未知错误'), '操作失败', {
            confirmButtonText: '确定',
            type: 'error'
          })
        }
      }
    }

    const fetchCompanies = async () => {
      try {
        companyLoading.value = true
        const response = await getAllCompanies()
        companies.value = response.map(company => ({
          value: company.organizationId,
          label: company.organizationName
        }))
      } catch (error) {
        console.error('Error fetching companies:', error)
        ElMessage.error('获取公司信息失败')
      } finally {
        companyLoading.value = false
      }
    }

    const initChart = () => {
      const myChart = echarts.init(chart.value)

      // 统计各类型成果数量
      const typeCounts = allAchievements.value.reduce((acc, achievement) => {
        acc[achievement.achievementCategory] = (acc[achievement.achievementCategory] || 0) + 1
        return acc
      }, {})

      const option = {
        title: {
          text: '成果类型统计',
          left: 'center',
          textStyle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: '#333'
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)',
          backgroundColor: 'rgba(50, 50, 50, 0.9)',
          borderColor: '#333',
          textStyle: {
            color: '#fff',
            fontSize: 14
          }
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          top: 'center',
          textStyle: {
            color: '#666',
            fontSize: 14
          },
          itemWidth: 14,
          itemHeight: 14,
          itemGap: 20
        },
        series: [
          {
            name: '成果类型',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['50%', '55%'],
            avoidLabelOverlap: true,
            itemStyle: {
              borderRadius: 8,
              borderColor: '#fff',
              borderWidth: 2,
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.3)'
            },
            label: {
              show: true,
              formatter: '{b|{b}}\n{c} ({d}%)',
              rich: {
                b: {
                  fontSize: 14,
                  lineHeight: 20,
                  color: '#333'
                }
              }
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 16,
                fontWeight: 'bold'
              },
              itemStyle: {
                shadowBlur: 20,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            data: Object.entries(typeCounts).map(([name, value]) => ({
              name: translateCategory(name),
              value,
              itemStyle: {
                color: getCategoryColor(name),
                shadowBlur: 10,
                shadowOffsetY: 3,
                shadowColor: 'rgba(0, 0, 0, 0.3)'
              }
            })),
            animationType: 'scale',
            animationEasing: 'elasticOut',
            animationDelay: function (idx) {
              return Math.random() * 200;
            }
          }
        ]
      }

      myChart.setOption(option)
    }

    const getCategoryColor = (category) => {
      const colors = {
        paper: '#5470C6',
        patent: '#91CC75',
        project: '#FAC858',
        report: '#EE6666'
      }
      return colors[category] || '#73C0DE'
    }

    const processDownloadStats = async () => {
      try {
        const response = await queryAllDownloadRecords();
        const downloadRecords = response;

        // 按年统计下载数量
        const yearlyStats = downloadRecords.reduce((acc, record) => {
          const year = new Date(record.downloadTime).getFullYear();
          acc[year] = (acc[year] || 0) + 1;
          return acc;
        }, {});

        // 将统计结果转换为数组格式
        const years = Object.keys(yearlyStats).sort();
        const data = years.map(year => ({
          year: parseInt(year),
          count: yearlyStats[year]
        }));

        // 绘制折线图
        const chartDom = document.getElementById('download-chart');
        const myChart = echarts.init(chartDom);

        const option = {
          title: {
            text: '年度成果下载统计',
            left: 'center',
            textStyle: {
              fontSize: 18,
              fontWeight: 'bold',
              color: '#333'
            }
          },
          tooltip: {
            trigger: 'axis',
            formatter: '{b}年: {c}次',
            backgroundColor: 'rgba(50, 50, 50, 0.9)',
            borderColor: '#333',
            textStyle: {
              color: '#fff',
              fontSize: 14
            }
          },
          xAxis: {
            type: 'category',
            data: data.map(item => item.year),
            axisLabel: {
              formatter: '{value}年'
            }
          },
          yAxis: {
            type: 'value',
            axisLabel: {
              formatter: '{value} 次'
            }
          },
          series: [{
            data: data.map(item => item.count),
            type: 'line',
            smooth: true,
            lineStyle: {
              width: 3,
              color: '#5470C6'
            },
            itemStyle: {
              color: '#5470C6'
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{
                  offset: 0, color: 'rgba(84, 112, 198, 0.7)' // 起始颜色
                }, {
                  offset: 1, color: 'rgba(84, 112, 198, 0)' // 结束颜色
                }]
              }
            }
          }]
        };

        myChart.setOption(option);
      } catch (error) {
        console.error('Error processing download stats:', error);
      }
    };

    const showVersionHistory = async (achievement) => {
      currentAchievement.value = achievement
      versionHistoryVisible.value = true
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

        const response = await getVersionHistoryWithPagination(
          versionHistoryData,
          versionCurrentPage.value,
          versionPageSize.value
        )

        console.log('Version history response:', response)

        if (Array.isArray(response)) {
          versionHistory.value = response
          versionTotal.value = response.length // This might need adjustment if backend provides total count
        } else if (response && Array.isArray(response.data)) {
          versionHistory.value = response.data
          versionTotal.value = response.total || response.data.length
        } else {
          versionHistory.value = []
          versionTotal.value = 0
        }
      } catch (error) {
        console.error('Error fetching version history:', error)
        ElMessageBox.alert('获取版本历史失败', '错误', {
          confirmButtonText: '确定',
          type: 'error'
        })
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
        // Construct the filename in the required format: AchievementName+AchievementVersion+.zip
        const fileName = `${currentAchievement.value.achievementName}${version.versionNumber}.zip`;

        console.log('Downloading version file:', fileName);

        // Call the downloadAchievements API with the constructed filename
        downloadAchievements(fileName);

        // Show success message
        ElMessage({
          message: '文件开始下载',
          type: 'success',
          duration: 2000,
          showClose: true
        });

        // Add log for download operation
        addLog({
          userId: localStorage.getItem('userId'),
          logIntro: `下载成果版本: ${currentAchievement.value.achievementName} (${version.versionNumber})`,
          logTime: new Date().toISOString().split('T')[0],
          tableStatus: true
        }).catch(error => {
          console.error('Error logging download action:', error);
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

    watch(achievements, () => {
      updatePagination()
    })

    watch(allAchievements, () => {
      if (chart.value) {
        initChart()
      }
    })

    onMounted(() => {
      fetchAchievements()
      fetchCompanies() // 获取公司数据
      processDownloadStats() // 新增
      nextTick(() => {
        initChart()
      })
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
      reviewModalVisible,
      showReviewModal,
      editDialogVisible,
      editForm,
      handleEditSubmit,
      deleteAchievement,
      companies,
      companyLoading,
      searchText,
      chart,
      versionHistoryVisible,
      versionHistory,
      loadingVersions,
      versionCurrentPage,
      versionPageSize,
      versionTotal,
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
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.search-box {
  width: 300px;
  margin-right: 20px;
}

.search-box .el-input__prefix {
  display: flex;
  align-items: center;
  padding-left: 8px;
  color: #999;
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

.status-select:hover+.select-arrow {
  color: #409eff;
}

.view-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.review-btn {
  padding: 8px 16px;
  background-color: #e6a23c;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.review-btn:hover {
  background-color: #ebb563;
}

.review-btn i {
  margin-right: 6px;
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
  font-weight: 600;
  color: #606266;
  border-bottom: 1px solid #ebeef5;
}

.list-column {
  flex: 1;
  padding: 0 8px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
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

.edit-btn,
.delete-btn {
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
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: inline-block;
  min-width: 60px;
  text-align: center;
}

/* 待审核状态 */
.list-cell .status-badge.pending {
  background-color: #fff3e0;
  color: #ff9800;
  border: 1px solid #ffe0b2;
  animation: pulsePending 1.5s infinite;
}

/* 已发布状态 */
.list-cell .status-badge.published {
  background-color: #e8f5e9;
  color: #4caf50;
  border: 1px solid #c8e6c9;
  animation: pulsePublished 1.5s infinite;
}

@keyframes pulsePending {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 152, 0, 0.2);
  }

  70% {
    box-shadow: 0 0 0 8px rgba(255, 152, 0, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(255, 152, 0, 0);
  }
}

@keyframes pulsePublished {
  0% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.2);
  }

  70% {
    box-shadow: 0 0 0 8px rgba(76, 175, 80, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
  }
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
  margin-left: 20px;
  display: flex;
  gap: 15px;
}

.stat-item {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
}

.stat-item:nth-child(1) {
  /* 成果总数 */
  background-color: #f0f9ff;
  color: #409eff;
  border: 1px solid #d6e9ff;
}

.stat-item:nth-child(2) {
  /* 待审核 */
  background-color: #fff0f0;
  color: #f56c6c;
  border: 1px solid #ffd6d6;
}

.stat-item:nth-child(3) {
  /* 已发布 */
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

/* Remove card view related styles */
.card-container,
.achievement-card,
.card-header,
.card-body,
.info-row,
.card-actions {
  display: none;
}

/* 添加统计图样式 */
.chart-container {
  margin: 20px 0;
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* Version History Styles */
.version-history-container {
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  background-color: #fff;
  margin-bottom: 20px;
}

.version-list-header {
  display: flex;
  background-color: #f5f7fa;
  padding: 12px 16px;
  font-weight: 600;
  color: #606266;
  border-bottom: 1px solid #ebeef5;
}

.version-column {
  flex: 1;
  padding: 0 8px;
  text-align: center;
}

.version-list-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
  transition: background-color 0.3s ease;
}

.version-list-item:hover {
  background-color: #f5f7fa;
}

.version-list-item:last-child {
  border-bottom: none;
}

.version-cell {
  flex: 1;
  padding: 0 8px;
  color: #606266;
  text-align: center;
}

.download-btn {
  padding: 6px 12px;
  background-color: #409eff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.download-btn:hover {
  background-color: #66b1ff;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  color: #909399;
  font-size: 16px;
}

.loading-container i {
  margin-right: 10px;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #909399;
  font-size: 16px;
}

.version-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.achievement-name a {
  color: #409eff;
  text-decoration: none;
  transition: color 0.3s ease;
}

.achievement-name a:hover {
  color: #66b1ff;
  text-decoration: underline;
}
</style>