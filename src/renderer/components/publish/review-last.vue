<template>
  <div class="review-container">
    <!-- 待审核成果区域 -->
    <div class="section pending-section">
      <h2>待审核成果 
        <el-badge :value="pendingWorks.length" :max="99" type="warning" v-if="pendingWorks.length"/>
      </h2>
      <el-empty v-if="!pendingWorks.length" description="暂无待审核成果" />
      <el-card v-for="work in pendingWorks" :key="work.id" class="work-card">
        <div class="work-header">
          <h3>{{ work.achievementName }}</h3>
          <span class="submission-time">提交时间: {{ formatDate(work.uploadTime) }}</span>
        </div>
        <div class="work-info">
          <p>提交人: {{ work.userId }}</p>
          <p>类型: {{ work.achievementCategory }}</p>
        </div>
        <div class="work-actions">
          <el-button type="primary" @click="downloadWork(work)">下载查看</el-button>
          <el-button type="success" @click="showReviewDialog(work)">审核</el-button>
        </div>
      </el-card>
    </div>

    <!-- 已审核成果区域 -->
    <div class="section reviewed-section">
      <h2>已审核成果</h2>
      <el-empty v-if="!reviewedWorks.length" description="暂无已审核成果" />
      <el-card v-for="work in reviewedWorks" :key="work.id" class="work-card">
        <div class="work-header">
          <h3>{{ work.title }}</h3>
          <el-tag :type="work.status === 'approved' ? 'success' : 'danger'">
            {{ work.status === 'approved' ? '已通过' : '未通过' }}
          </el-tag>
        </div>
        <div class="work-info">
          <p>提交人: {{ work.author }}</p>
          <p>审核时间: {{ work.reviewTime }}</p>
          <p>审核意见: {{ work.comment }}</p>
        </div>
      </el-card>
    </div>

    <!-- 审核对话框 -->
    <el-dialog
      v-model="reviewDialogVisible"
      title="成果审核"
      width="500px"
    >
      <div class="review-form">
        <el-form :model="reviewForm" label-width="80px">
          <el-form-item label="审核结果">
            <el-radio-group v-model="reviewForm.status">
              <el-radio label="approved">通过</el-radio>
              <el-radio label="rejected">不通过</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="审核意见">
            <el-input
              v-model="reviewForm.comment"
              type="textarea"
              rows="4"
              placeholder="请输入审核意见..."
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="reviewDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitReview">提交审核</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getPendingWorks, submitAudit ,getUnauditedAchievements,downloadAuditFile} from '../../api/review'


// 待审核成果列表
const pendingWorks = ref([])
const pendingdLoading = ref(true)
const pendingError = ref(null)
// 已审核成果列表
const reviewedWorks = ref([])
// 审核对话框显示状态
const reviewDialogVisible = ref(false)
// 当前审核的成果
const currentWork = ref(null)
// 审核表单
const reviewForm = ref({
  status: '',  // 'approved' 或 'rejected'
  comment: ''
})

// Add pagination related refs
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const fetchUnauditedAchievements = async () => {
  try {
    pendingdLoading.value = true
    console.log('【Component】Fetching page', currentPage.value, 'with size', pageSize.value)
    
    const response = await getUnauditedAchievements(currentPage.value, pageSize.value)
    console.log('【Component】Raw response:', response)
    
    // Initialize pendingWorks as empty array
    pendingWorks.value = []
    
    if (!response) {
      console.error('【Component】No response received')
      return
    }

    // Handle direct array response
    if (Array.isArray(response)) {
      pendingWorks.value = response
      console.log('【Component】Processed pending works:', pendingWorks.value)
      
      // If backend doesn't provide total, use array length
      total.value = response.length
    } else {
      console.error('【Component】Unexpected response structure:', response)
      pendingError.value = '数据格式不正确'
    }
  } catch (err) {
    pendingError.value = '获取未审核数据失败'
    console.error('【Component】Error:', err)
    pendingWorks.value = []
  } finally {
    pendingdLoading.value = false
  }
}

// Add pagination handler
const handlePageChange = (page) => {
  console.log('【Component】Page changed to:', page)
  currentPage.value = page
  fetchUnauditedAchievements()
}

// 初始化数据
onMounted(async () => {
  console.log('Component mounted, starting data fetch...')
  fetchUnauditedAchievements()
})


// 格式化日期
const formatDate = (date) => {
  return new Date(date).toLocaleString()
}

// 下载成果
const downloadWork = async (work) => {
  try {
    console.log('开始下载文件:', work)
    console.log('文件名:', work.approvalType)
    if (!work.approvalType) {
      ElMessage.warning('文件名不存在')
      return
    }
  
    const response = await downloadAuditFile(work.approvalType)
    
   

    ElMessage.success('下载成功')
  } catch (error) {
    console.error('文件下载失败:', error)
    ElMessage.error('文件下载失败')
  }
}

// 显示审核对话框
const showReviewDialog = (work) => {
  console.log('显示审核对话框，当前成果:', work)
  currentWork.value = work
  // 重置表单
  reviewForm.value = {
    status: '',
    comment: ''
  }
  reviewDialogVisible.value = true
}

// 提交审核
const submitReview = async () => {
  if (!reviewForm.value.status) {
    ElMessage.warning('请选择审核结果')
    return
  }
  if (!reviewForm.value.comment.trim()) {
    ElMessage.warning('请填写审核意见')
    return
  }

  try {
    // 根据审核结果设置 operationId（0-通过，3-不通过）
    const operationId = reviewForm.value.status === 'approved' ? 0 : 3
    const approvalId = currentWork.value.approvalId
    console.log('提交审核ID:', operationId, approvalId)

    // 添加详细的调试日志
    console.log('准备提交审核:', {
      currentWork: currentWork.value,
      operationId,
      approvalId,
      status: reviewForm.value.status,
      comment: reviewForm.value.comment
    })

    if (!approvalId) {
      throw new Error('缺少审核记录ID(approvalId)')
    }

    const response = await submitAudit(operationId, approvalId)
    console.log('审核提交响应:', response)
    console.log('审核提交响应:', response.code)

    if (response) {
      // 将审核过的成果添加到已审核列表
      const reviewedWork = {
        id: currentWork.value.achievementId,
        title: currentWork.value.approvalType,
        author: currentWork.value.userId,
        status: reviewForm.value.status,
        comment: reviewForm.value.comment,
        reviewTime: new Date().toLocaleString()
      }
      console.log('添加到已审核列表:', reviewedWork)
      reviewedWorks.value.unshift(reviewedWork)

      // 从待审核列表中移除
      console.log('从待审核列表移除ID:', currentWork.value.id)
      pendingWorks.value = pendingWorks.value.filter(
        work => work.id !== currentWork.value.id
      )

      reviewDialogVisible.value = false
      ElMessage.success(response.message || '审核提交成功')
      
      // 刷新待审核列表
      await fetchUnauditedAchievements()
    } else {
      throw new Error(response.message || '审核提交失败')
    }
  } catch (error) {
    console.error('审核提交失败:', error)
    console.error('错误详情:', {
      message: error.message,
      stack: error.stack,
      response: error.response
    })
    ElMessage.error(`审核提交失败: ${error.message}`)
  }
}
</script>

<style scoped>
.review-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.section {
  margin-bottom: 30px;
}

.section h2 {
  margin-bottom: 20px;
  font-weight: 500;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
}

.work-card {
  margin-bottom: 16px;
}

.work-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.work-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.submission-time {
  color: #999;
  font-size: 14px;
}

.work-info {
  margin-bottom: 16px;
}

.work-info p {
  margin: 8px 0;
  color: #666;
}

.work-actions {
  display: flex;
  gap: 12px;
}

.review-form {
  padding: 20px 0;
}
</style>
<!-- //审核与下载都完成，需新增下载记录。 -->