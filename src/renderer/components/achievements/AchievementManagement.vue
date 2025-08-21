<template>
  <div class="achievement-management-container">
    <!-- 页面标题 -->
    <el-page-header title="成果管理" @back="goBack" />

    <!-- 操作栏 -->
    <div class="operation-bar">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input
            v-model="searchForm.achievementName"
            placeholder="请输入成果名称"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          />
        </el-col>
        <el-col :span="4">
          <el-select
            v-model="searchForm.achievementCategory"
            placeholder="成果类别"
            clearable
            @change="handleSearch"
          >
            <el-option label="学术论文" value="paper" />
            <el-option label="技术报告" value="technical_report" />
            <el-option label="专利" value="patent" />
            <el-option label="软件著作权" value="software_copyright" />
            <el-option label="数据集" value="dataset" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select
            v-model="searchForm.auditFlag"
            placeholder="审核状态"
            clearable
            @change="handleSearch"
          >
            <el-option label="待审核" :value="0" />
            <el-option label="审核通过" :value="1" />
            <el-option label="审核拒绝" :value="2" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="handleSearch"
          />
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetSearch">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 统计卡片 -->
    <div class="statistics-container">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon><Document /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ statistics.totalCount }}</div>
                <div class="stat-label">总成果数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon" style="color: #67C23A;">
                <el-icon><CircleCheck /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ statistics.approvedCount }}</div>
                <div class="stat-label">已发布</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon" style="color: #E6A23C;">
                <el-icon><Clock /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ statistics.pendingCount }}</div>
                <div class="stat-label">待审核</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon" style="color: #409EFF;">
                <el-icon><Download /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ statistics.totalDownloads }}</div>
                <div class="stat-label">总下载量</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>
        新建成果
      </el-button>
      <el-button type="success" @click="handleBatchApprove" :disabled="selectedAchievements.length === 0">
        <el-icon><Check /></el-icon>
        批量审核
      </el-button>
      <el-button type="danger" @click="handleBatchDelete" :disabled="selectedAchievements.length === 0">
        <el-icon><Delete /></el-icon>
        批量删除
      </el-button>
      <el-button @click="handleExport">
        <el-icon><Download /></el-icon>
        导出数据
      </el-button>
    </div>

    <!-- 成果列表 -->
    <el-card shadow="never">
      <el-table
        ref="achievementTableRef"
        :data="achievementList"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        stripe
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="achievementName" label="成果名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="achievementCategory" label="成果类别" width="120">
          <template #default="{ row }">
            <el-tag :type="getCategoryType(row.achievementCategory)">
              {{ getCategoryLabel(row.achievementCategory) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="userName" label="发布者" width="120" />
        <el-table-column prop="uploadTime" label="发布时间" width="160" />
        <el-table-column prop="auditFlag" label="审核状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getAuditStatusType(row.auditFlag)">
              {{ getAuditStatusLabel(row.auditFlag) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="achievementDownloadCount" label="下载量" width="80" align="center" />
        <el-table-column prop="searchCount" label="搜索量" width="80" align="center" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleView(row)">
              查看
            </el-button>
            <el-button type="success" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 审核对话框 -->
    <el-dialog v-model="auditDialogVisible" title="审核成果" width="500px">
      <el-form :model="auditForm" label-width="80px">
        <el-form-item label="审核结果">
          <el-radio-group v-model="auditForm.auditFlag">
            <el-radio :value="1">通过</el-radio>
            <el-radio :value="2">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核意见">
          <el-input
            v-model="auditForm.auditComment"
            type="textarea"
            :rows="4"
            placeholder="请输入审核意见"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="auditDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAudit">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="成果详情" width="800px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="成果名称">{{ currentAchievement.achievementName }}</el-descriptions-item>
        <el-descriptions-item label="成果编号">{{ currentAchievement.achievementNo }}</el-descriptions-item>
        <el-descriptions-item label="成果类别">{{ currentAchievement.achievementCategory }}</el-descriptions-item>
        <el-descriptions-item label="成果形式">{{ currentAchievement.achievementForm }}</el-descriptions-item>
        <el-descriptions-item label="所属项目">{{ currentAchievement.projectNo }}</el-descriptions-item>
        <el-descriptions-item label="发布者">{{ currentAchievement.userName }}</el-descriptions-item>
        <el-descriptions-item label="发布时间">{{ currentAchievement.uploadTime }}</el-descriptions-item>
        <el-descriptions-item label="下载量">{{ currentAchievement.achievementDownloadCount }}</el-descriptions-item>
        <el-descriptions-item label="简介" :span="2">{{ currentAchievement.achievementIntro }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Refresh,
  Plus,
  Check,
  Delete,
  Download,
  Document,
  CircleCheck,
  Clock
} from '@element-plus/icons-vue'
import {
  getAchievementList,
  batchDeleteAchievements,
  batchUpdateStatus,
  exportAchievements,
  getAchievementStatistics,
  submitForApproval
} from '@renderer/api/achievement'

const router = useRouter()

// 搜索表单
const searchForm = reactive({
  achievementName: '',
  achievementCategory: '',
  auditFlag: null,
  dateRange: []
})

// 统计数据
const statistics = ref({
  totalCount: 0,
  approvedCount: 0,
  pendingCount: 0,
  totalDownloads: 0
})

// 成果列表
const achievementList = ref([])
const selectedAchievements = ref([])
const loading = ref(false)

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 对话框
const auditDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const currentAchievement = ref({})

// 审核表单
const auditForm = reactive({
  achievementIds: [],
  auditFlag: 1,
  auditComment: ''
})

// 方法
const loadAchievements = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.currentPage,
      pageSize: pagination.pageSize,
      ...searchForm
    }

    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      params.startDate = searchForm.dateRange[0]
      params.endDate = searchForm.dateRange[1]
    }

    const response = await getAchievementList(params)
    if (response.data.code === 200) {
      achievementList.value = response.data.data.list
      pagination.total = response.data.data.total
    }
  } catch (error) {
    console.error('加载成果列表失败:', error)
    ElMessage.error('加载失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const loadStatistics = async () => {
  try {
    const response = await getAchievementStatistics()
    if (response.data.code === 200) {
      statistics.value = response.data.data
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

const handleSearch = () => {
  pagination.currentPage = 1
  loadAchievements()
}

const resetSearch = () => {
  searchForm.achievementName = ''
  searchForm.achievementCategory = ''
  searchForm.auditFlag = null
  searchForm.dateRange = []
  handleSearch()
}

const handleSelectionChange = (selection) => {
  selectedAchievements.value = selection
}

const handleSizeChange = (val) => {
  pagination.pageSize = val
  loadAchievements()
}

const handleCurrentChange = (val) => {
  pagination.currentPage = val
  loadAchievements()
}

const handleCreate = () => {
  router.push('/publish/achievement-publish')
}

const handleView = (row) => {
  currentAchievement.value = row
  detailDialogVisible.value = true
}

const handleEdit = (row) => {
  router.push(`/publish/edit/${row.achievementId}`)
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除成果 "${row.achievementName}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response = await batchDeleteAchievements([row.achievementId])
    if (response.data.code === 200) {
      ElMessage.success('删除成功')
      loadAchievements()
      loadStatistics()
    } else {
      ElMessage.error(response.data.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除成果失败:', error)
      ElMessage.error('删除失败，请稍后重试')
    }
  }
}

const handleBatchApprove = () => {
  auditForm.achievementIds = selectedAchievements.value.map(item => item.achievementId)
  auditForm.auditFlag = 1
  auditForm.auditComment = ''
  auditDialogVisible.value = true
}

const handleSubmitForApproval = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要提交 "${row.achievementName}" 进行审核吗？`,
      '提交审核确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    )

    const response = await submitForApproval(row.achievementId)
    if (response.data.code === 200) {
      ElMessage.success('提交审核成功')
      loadAchievements()
      loadStatistics()
    } else {
      ElMessage.error(response.data.message || '提交审核失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('提交审核失败:', error)
      ElMessage.error('提交审核失败，请稍后重试')
    }
  }
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedAchievements.value.length} 个成果吗？`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const achievementIds = selectedAchievements.value.map(item => item.achievementId)
    const response = await batchDeleteAchievements(achievementIds)
    if (response.data.code === 200) {
      ElMessage.success('批量删除成功')
      loadAchievements()
      loadStatistics()
    } else {
      ElMessage.error(response.data.message || '批量删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除成果失败:', error)
      ElMessage.error('批量删除失败，请稍后重试')
    }
  }
}

const submitAudit = async () => {
  try {
    const response = await batchUpdateStatus({
      achievementIds: auditForm.achievementIds,
      newStatus: auditForm.auditFlag,
      auditComment: auditForm.auditComment
    })

    if (response.data.code === 200) {
      ElMessage.success('审核操作成功')
      auditDialogVisible.value = false
      loadAchievements()
      loadStatistics()
    } else {
      ElMessage.error(response.data.message || '审核操作失败')
    }
  } catch (error) {
    console.error('审核操作失败:', error)
    ElMessage.error('审核操作失败，请稍后重试')
  }
}

const handleExport = async () => {
  try {
    const params = {
      ...searchForm
    }

    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      params.startDate = searchForm.dateRange[0]
      params.endDate = searchForm.dateRange[1]
    }

    const response = await exportAchievements(params)
    if (response.data.code === 200) {
      ElMessage.success('导出成功')
      // 下载文件逻辑
    } else {
      ElMessage.error(response.data.message || '导出失败')
    }
  } catch (error) {
    console.error('导出数据失败:', error)
    ElMessage.error('导出失败，请稍后重试')
  }
}

const getCategoryType = (category) => {
  const typeMap = {
    paper: 'primary',
    technical_report: 'success',
    patent: 'warning',
    software_copyright: 'info',
    dataset: 'danger',
    other: ''
  }
  return typeMap[category] || ''
}

const getCategoryLabel = (category) => {
  const labelMap = {
    paper: '学术论文',
    technical_report: '技术报告',
    patent: '专利',
    software_copyright: '软件著作权',
    dataset: '数据集',
    other: '其他'
  }
  return labelMap[category] || category
}

const getAuditStatusType = (status) => {
  const typeMap = {
    0: 'warning',
    1: 'success',
    2: 'danger'
  }
  return typeMap[status] || ''
}

const getAuditStatusLabel = (status) => {
  const labelMap = {
    0: '待审核',
    1: '已通过',
    2: '已拒绝'
  }
  return labelMap[status] || status
}

const goBack = () => {
  router.push('/home')
}

onMounted(() => {
  loadAchievements()
  loadStatistics()
})
</script>

<style scoped>
.achievement-management-container {
  padding: 20px;
}

.operation-bar {
  margin-bottom: 20px;
}

.statistics-container {
  margin-bottom: 20px;
}

.stat-card {
  height: 100%;
}

.stat-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-icon {
  font-size: 48px;
  color: #409EFF;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.action-buttons {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}
</style>