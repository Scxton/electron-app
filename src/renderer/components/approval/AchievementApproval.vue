<template>
  <div class="achievement-approval-container">
    <!-- 页面标题 -->
    <el-page-header title="成果审核管理" @back="goBack" />

    <!-- 统计卡片 -->
    <div class="statistics-container">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon" style="color: #409EFF;">
                <el-icon><Document /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ statistics.totalPending }}</div>
                <div class="stat-label">待审核</div>
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
                <div class="stat-value">{{ statistics.todayApproved }}</div>
                <div class="stat-label">今日已审核</div>
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
                <div class="stat-value">{{ statistics.avgProcessingTime }}h</div>
                <div class="stat-label">平均处理时间</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon" style="color: #F56C6C;">
                <el-icon><Close /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ statistics.rejectionRate }}%</div>
                <div class="stat-label">拒绝率</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 操作栏 -->
    <div class="operation-bar">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            v-model="searchForm.achievementName"
            placeholder="搜索成果名称"
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
            v-model="searchForm.priority"
            placeholder="优先级"
            clearable
            @change="handleSearch"
          >
            <el-option label="高" value="high" />
            <el-option label="中" value="medium" />
            <el-option label="低" value="low" />
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
        <el-col :span="2">
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 待审核列表 -->
    <el-card shadow="never">
      <el-table
        :data="approvalList"
        v-loading="loading"
        stripe
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="achievementName" label="成果名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="achievementCategory" label="类别" width="100">
          <template #default="{ row }">
            <el-tag :type="getCategoryType(row.achievementCategory)">
              {{ getCategoryLabel(row.achievementCategory) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="userName" label="发布者" width="120" />
        <el-table-column prop="uploadTime" label="提交时间" width="160" />
        <el-table-column prop="priority" label="优先级" width="80">
          <template #default="{ row }">
            <el-tag :type="getPriorityType(row.priority)">
              {{ getPriorityLabel(row.priority) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button type="primary" size="small" @click="handleViewDetail(row)">
                查看
              </el-button>
              <el-button type="success" size="small" @click="handleApprove(row)">
                审核
              </el-button>
            </div>
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

    <!-- 审核详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="成果审核详情"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-row :gutter="20">
        <el-col :span="16">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="成果名称">{{ currentAchievement.achievementName }}</el-descriptions-item>
            <el-descriptions-item label="成果编号">{{ currentAchievement.achievementNo }}</el-descriptions-item>
            <el-descriptions-item label="成果类别">{{ getCategoryLabel(currentAchievement.achievementCategory) }}</el-descriptions-item>
            <el-descriptions-item label="成果形式">{{ currentAchievement.achievementForm }}</el-descriptions-item>
            <el-descriptions-item label="所属项目">{{ currentAchievement.projectName }}</el-descriptions-item>
            <el-descriptions-item label="发布者">{{ currentAchievement.userName }}</el-descriptions-item>
            <el-descriptions-item label="提交时间">{{ currentAchievement.uploadTime }}</el-descriptions-item>
            <el-descriptions-item label="简介">{{ currentAchievement.achievementIntro }}</el-descriptions-item>
          </el-descriptions>
        </el-col>
        <el-col :span="8">
          <el-card class="file-preview">
            <template #header>
              <span>文件预览</span>
            </template>
            <div class="file-list">
              <div v-for="file in currentAchievement.files" :key="file.fileId" class="file-item">
                <el-icon><Document /></el-icon>
                <span>{{ file.fileName }}</span>
                <el-button size="small" @click="previewFile(file)">预览</el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="handleReject">拒绝</el-button>
          <el-button type="primary" @click="handleApproveSubmit">通过</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 拒绝理由对话框 -->
    <el-dialog
      v-model="rejectDialogVisible"
      title="拒绝理由"
      width="500px"
    >
      <el-form :model="rejectForm" label-width="80px">
        <el-form-item label="拒绝理由">
          <el-input
            v-model="rejectForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请输入拒绝理由"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="rejectDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="submitReject">确认拒绝</el-button>
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
  Document,
  CircleCheck,
  Clock,
  Close
} from '@element-plus/icons-vue'
import {
  getPendingApprovals,
  getApprovalStatistics,
  approveAchievement,
  rejectAchievement,
  getApprovalDetail
} from '@renderer/api/approval'

const router = useRouter()

// 数据定义
const approvalList = ref([])
const statistics = ref({
  totalPending: 0,
  todayApproved: 0,
  avgProcessingTime: 0,
  rejectionRate: 0
})
const loading = ref(false)

// 搜索表单
const searchForm = reactive({
  achievementName: '',
  achievementCategory: '',
  priority: '',
  dateRange: []
})

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 对话框
const detailDialogVisible = ref(false)
const rejectDialogVisible = ref(false)
const currentAchievement = ref({})

// 拒绝表单
const rejectForm = reactive({
  achievementId: null,
  reason: ''
})

// 获取类别标签类型
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

// 获取优先级类型
const getPriorityType = (priority) => {
  const typeMap = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }
  return typeMap[priority] || 'info'
}

const getPriorityLabel = (priority) => {
  const labelMap = {
    high: '高',
    medium: '中',
    low: '低'
  }
  return labelMap[priority] || priority
}

// 加载待审核列表
const loadApprovalList = async () => {
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

    const response = await getPendingApprovals(params)
    if (response.data.code === 200) {
      approvalList.value = response.data.data.list || []
      pagination.total = response.data.data.total || 0
    }
  } catch (error) {
    console.error('加载待审核列表失败:', error)
    ElMessage.error('加载失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 加载统计数据
const loadStatistics = async () => {
  try {
    const response = await getApprovalStatistics()
    if (response.data.code === 200) {
      statistics.value = response.data.data
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1
  loadApprovalList()
}

// 分页处理
const handleSizeChange = (val) => {
  pagination.pageSize = val
  loadApprovalList()
}

const handleCurrentChange = (val) => {
  pagination.currentPage = val
  loadApprovalList()
}

// 查看详情
const handleViewDetail = async (row) => {
  try {
    const response = await getApprovalDetail(row.achievementId)
    if (response.data.code === 200) {
      currentAchievement.value = response.data.data
      detailDialogVisible.value = true
    }
  } catch (error) {
    console.error('获取详情失败:', error)
    ElMessage.error('获取详情失败')
  }
}

// 批准
const handleApprove = (row) => {
  currentAchievement.value = row
  detailDialogVisible.value = true
}

const handleApproveSubmit = async () => {
  try {
    const response = await approveAchievement(currentAchievement.value.achievementId)
    if (response.data.code === 200) {
      ElMessage.success('审核通过')
      detailDialogVisible.value = false
      loadApprovalList()
      loadStatistics()
    } else {
      ElMessage.error(response.data.message || '审核失败')
    }
  } catch (error) {
    console.error('审核失败:', error)
    ElMessage.error('审核失败')
  }
}

// 拒绝
const handleReject = () => {
  rejectForm.achievementId = currentAchievement.value.achievementId
  rejectForm.reason = ''
  rejectDialogVisible.value = true
}

const submitReject = async () => {
  if (!rejectForm.reason.trim()) {
    ElMessage.warning('请输入拒绝理由')
    return
  }

  try {
    const response = await rejectAchievement({
      achievementId: rejectForm.achievementId,
      reason: rejectForm.reason
    })
    if (response.data.code === 200) {
      ElMessage.success('已拒绝')
      rejectDialogVisible.value = false
      detailDialogVisible.value = false
      loadApprovalList()
      loadStatistics()
    } else {
      ElMessage.error(response.data.message || '拒绝失败')
    }
  } catch (error) {
    console.error('拒绝失败:', error)
    ElMessage.error('拒绝失败')
  }
}

// 预览文件
const previewFile = (file) => {
  window.open(file.fileUrl, '_blank')
}

// 返回
const goBack = () => {
  router.push('/home')
}

onMounted(() => {
  loadApprovalList()
  loadStatistics()
})
</script>

<style scoped>
.achievement-approval-container {
  padding: 20px;
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

.operation-bar {
  margin-bottom: 20px;
}

.file-preview {
  height: 100%;
}

.file-list {
  .file-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px;
    border-bottom: 1px solid #eee;
    
    &:last-child {
      border-bottom: none;
    }
  }
}

.action-buttons {
  display: flex;
  gap: 5px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

:deep(.el-card) {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>