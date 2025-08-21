<template>
  <div class="achievement-evaluation">
    <!-- 评价统计 -->
    <div class="evaluation-stats" v-if="statistics.totalCount > 0">
      <div class="stats-item">
        <span class="stats-label">平均评分：</span>
        <el-rate v-model="statistics.averageRating" disabled show-score text-color="#ff9900" />
        <span class="stats-count">({{ statistics.totalCount }}条评价)</span>
      </div>
      <div class="rating-distribution">
        <div v-for="(count, rating) in statistics.ratingDistribution" :key="rating" class="rating-item">
          <span class="rating-label">{{ rating }}星</span>
          <el-progress 
            :percentage="getRatingPercentage(count)" 
            :stroke-width="8"
            :color="getProgressColor(rating)"
          />
          <span class="rating-count">{{ count }}</span>
        </div>
      </div>
    </div>

    <!-- 提交评价 -->
    <div class="submit-evaluation" v-if="canEvaluate">
      <el-card shadow="never">
        <template #header>
          <span>发表评价</span>
        </template>
        <el-form :model="evaluationForm" label-width="80px">
          <el-form-item label="评分">
            <el-rate v-model="evaluationForm.rating" :colors="colors" :max="5" />
          </el-form-item>
          <el-form-item label="评价内容">
            <el-input
              v-model="evaluationForm.evaluation"
              type="textarea"
              :rows="4"
              placeholder="请分享您对这项成果的看法和使用体验..."
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitEvaluation" :loading="submitting">
              提交评价
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 评价列表 -->
    <div class="evaluation-list">
      <h3>用户评价</h3>
      <div v-if="evaluations.length === 0" class="no-evaluations">
        <el-empty description="暂无评价，快来发表第一条评价吧" />
      </div>
      <div v-else>
        <el-card v-for="evaluation in evaluations" :key="evaluation.interactionId" class="evaluation-item" shadow="hover">
          <div class="evaluation-header">
            <div class="user-info">
              <el-avatar size="small">{{ evaluation.userName?.charAt(0) || 'U' }}</el-avatar>
              <span class="username">{{ evaluation.userName || '匿名用户' }}</span>
            </div>
            <div class="evaluation-meta">
              <el-rate v-model="evaluation.rating" disabled size="small" />
              <span class="evaluation-time">{{ formatTime(evaluation.interactionTime) }}</span>
            </div>
          </div>
          <div class="evaluation-content">
            {{ evaluation.evaluation }}
          </div>
          <div class="evaluation-actions" v-if="evaluation.userId === currentUserId">
            <el-button size="small" type="primary" @click="editEvaluation(evaluation)">
              编辑
            </el-button>
            <el-button size="small" type="danger" @click="deleteEvaluation(evaluation.interactionId)">
              删除
            </el-button>
          </div>
        </el-card>

        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="pagination.currentPage"
            v-model:page-size="pagination.pageSize"
            :total="pagination.total"
            :page-sizes="[5, 10, 20]"
            layout="total, sizes, prev, pager, next"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>

    <!-- 编辑评价对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑评价" width="500px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="评分">
          <el-rate v-model="editForm.rating" :colors="colors" :max="5" />
        </el-form-item>
        <el-form-item label="评价内容">
          <el-input
            v-model="editForm.evaluation"
            type="textarea"
            :rows="4"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="updateEvaluation" :loading="updating">
            保存修改
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  submitEvaluation,
  getAchievementEvaluations,
  updateEvaluation,
  deleteEvaluation,
  getEvaluationStatistics
} from '@renderer/api/evaluation'

const props = defineProps({
  achievementId: {
    type: Number,
    required: true
  },
  currentUserId: {
    type: Number,
    default: null
  },
  canEvaluate: {
    type: Boolean,
    default: true
  }
})

// 数据定义
const evaluations = ref([])
const statistics = ref({
  totalCount: 0,
  averageRating: 0,
  ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
})
const loading = ref(false)
const submitting = ref(false)
const updating = ref(false)

// 表单数据
const evaluationForm = reactive({
  achievementId: props.achievementId,
  rating: 0,
  evaluation: ''
})

const editForm = reactive({
  interactionId: null,
  rating: 0,
  evaluation: ''
})

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 样式配置
const colors = ref(['#99A9BF', '#F7BA2A', '#FF9900'])

// 加载评价列表
const loadEvaluations = async () => {
  loading.value = true
  try {
    const [evalResponse, statsResponse] = await Promise.all([
      getAchievementEvaluations(props.achievementId, pagination.currentPage, pagination.pageSize),
      getEvaluationStatistics(props.achievementId)
    ])

    if (evalResponse.data.code === 200) {
      evaluations.value = evalResponse.data.data.evaluations || []
      pagination.total = evalResponse.data.data.total || 0
    }

    if (statsResponse.data.code === 200) {
      statistics.value = statsResponse.data.data
    }
  } catch (error) {
    console.error('加载评价失败:', error)
    ElMessage.error('加载评价失败')
  } finally {
    loading.value = false
  }
}

// 提交评价
const submitEvaluation = async () => {
  if (!evaluationForm.rating) {
    ElMessage.warning('请选择评分')
    return
  }
  if (!evaluationForm.evaluation.trim()) {
    ElMessage.warning('请填写评价内容')
    return
  }

  submitting.value = true
  try {
    const response = await submitEvaluation(evaluationForm)
    if (response.data.code === 200) {
      ElMessage.success('评价提交成功')
      evaluationForm.rating = 0
      evaluationForm.evaluation = ''
      await loadEvaluations()
    } else {
      ElMessage.error(response.data.message || '评价提交失败')
    }
  } catch (error) {
    console.error('提交评价失败:', error)
    ElMessage.error('评价提交失败')
  } finally {
    submitting.value = false
  }
}

// 编辑评价
const editEvaluation = (evaluation) => {
  editForm.interactionId = evaluation.interactionId
  editForm.rating = evaluation.rating
  editForm.evaluation = evaluation.evaluation
  editDialogVisible.value = true
}

// 更新评价
const updateEvaluation = async () => {
  if (!editForm.rating) {
    ElMessage.warning('请选择评分')
    return
  }
  if (!editForm.evaluation.trim()) {
    ElMessage.warning('请填写评价内容')
    return
  }

  updating.value = true
  try {
    const response = await updateEvaluation(editForm.interactionId, editForm)
    if (response.data.code === 200) {
      ElMessage.success('评价更新成功')
      editDialogVisible.value = false
      await loadEvaluations()
    } else {
      ElMessage.error(response.data.message || '评价更新失败')
    }
  } catch (error) {
    console.error('更新评价失败:', error)
    ElMessage.error('评价更新失败')
  } finally {
    updating.value = false
  }
}

// 删除评价
const deleteEvaluation = async (evaluationId) => {
  try {
    await ElMessageBox.confirm('确定要删除这条评价吗？', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await deleteEvaluation(evaluationId)
    if (response.data.code === 200) {
      ElMessage.success('评价删除成功')
      await loadEvaluations()
    } else {
      ElMessage.error(response.data.message || '评价删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除评价失败:', error)
      ElMessage.error('评价删除失败')
    }
  }
}

// 计算评分百分比
const getRatingPercentage = (count) => {
  const total = statistics.value.totalCount
  return total > 0 ? Math.round((count / total) * 100) : 0
}

// 获取进度条颜色
const getProgressColor = (rating) => {
  const colors = {
    1: '#F56C6C',
    2: '#E6A23C',
    3: '#409EFF',
    4: '#67C23A',
    5: '#409EFF'
  }
  return colors[rating] || '#409EFF'
}

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  return date.toLocaleString('zh-CN')
}

// 分页处理
const handleSizeChange = (val) => {
  pagination.pageSize = val
  loadEvaluations()
}

const handleCurrentChange = (val) => {
  pagination.currentPage = val
  loadEvaluations()
}

// 对话框状态
const editDialogVisible = ref(false)

// 监听achievementId变化
watch(() => props.achievementId, (newId) => {
  if (newId) {
    evaluationForm.achievementId = newId
    loadEvaluations()
  }
})

onMounted(() => {
  loadEvaluations()
})
</script>

<style scoped>
.achievement-evaluation {
  padding: 20px 0;
}

.evaluation-stats {
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stats-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.stats-count {
  color: #666;
  font-size: 14px;
}

.rating-distribution {
  margin-top: 15px;
}

.rating-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.rating-label {
  width: 40px;
  text-align: right;
  font-size: 14px;
}

.rating-count {
  width: 30px;
  text-align: left;
  font-size: 14px;
  color: #666;
}

.submit-evaluation {
  margin-bottom: 30px;
}

.evaluation-list h3 {
  margin-bottom: 20px;
  color: #303133;
}

.evaluation-item {
  margin-bottom: 15px;
}

.evaluation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.username {
  font-weight: 500;
  color: #303133;
}

.evaluation-meta {
  display: flex;
  align-items: center;
  gap: 15px;
}

.evaluation-time {
  font-size: 12px;
  color: #909399;
}

.evaluation-content {
  margin-bottom: 10px;
  line-height: 1.6;
  color: #606266;
}

.evaluation-actions {
  text-align: right;
}

.no-evaluations {
  text-align: center;
  padding: 40px 0;
}

.pagination-container {
  margin-top: 20px;
  text-align: center;
}

:deep(.el-rate) {
  display: inline-block;
}
</style>