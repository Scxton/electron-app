<template>
  <div class="discussion-container">
    <!-- 添加返回按钮 -->
    <div class="back-button" @click="goBack">
      <i class="el-icon-arrow-left"></i> 返回搜索结果
    </div>
    
    <!-- 成果详情内容 -->
    <div class="content-wrapper">
      <!-- 左侧主要内容区域 -->
      <div class="main-content">
        <!-- 成果概述部分 -->
        <div class="achievement-summary">
          <h1>{{ achievement.title }}</h1>
          <div class="basic-info">
            <div class="info-item">
              <i class="el-icon-collection-tag"></i>
              <span class="label">类别：</span>
              <span>{{ achievement.category }}</span>
            </div>
            <div class="info-item">
              <i class="el-icon-office-building"></i>
              <span class="label">来源单位：</span>
              <span>{{ achievement.organization }}</span>
            </div>
            <div class="info-item">
              <i class="el-icon-user"></i>
              <span class="label">负责人：</span>
              <span>{{ achievement.leader }}</span>
            </div>
            <div class="info-item">
              <i class="el-icon-date"></i>
              <span class="label">发布时间：</span>
              <span>{{ achievement.publishDate }}</span>
            </div>
          </div>
          <div class="achievement-stats">
            <div class="stat-item">
              <i class="el-icon-view"></i>
              <span>{{ achievement.views }} 浏览</span>
            </div>
            <div class="stat-item">
              <i class="el-icon-star-on"></i>
              <span>{{ achievement.rating }} 评分</span>
            </div>
            <div class="stat-item">
              <i class="el-icon-chat-dot-round"></i>
              <span>{{ achievement.reviewCount }} 评价</span>
            </div>
            <!-- 添加下载按钮 -->
            <div class="download-button" @click="downloadAchievement">
              <i class="el-icon-download"></i>
              <span>下载成果</span>
            </div>
          </div>
          <div class="description">
            <i class="el-icon-document"></i>
            <span class="label">成果简介：</span>
            <p>{{ achievement.description }}</p>
          </div>
        </div>

        <!-- 评分与评价部分 -->
        <div class="rating-section">
          <div class="section-header" @click="isReviewsCollapsed = !isReviewsCollapsed">
            <h2>
              <i class="el-icon-star-on"></i> 评分与评价
              <i :class="[
                'collapse-icon',
                isReviewsCollapsed ? 'el-icon-arrow-down' : 'el-icon-arrow-up'
              ]"></i>
            </h2>
          </div>

          <!-- 使用 v-show 控制内容显示 -->
          <div v-show="!isReviewsCollapsed">
            <div class="rating-summary" v-if="achievement.reviewCount > 0">
              <div class="average-rating">
                <span class="rating-value">{{ achievement.rating.toFixed(1) }}</span>
                <el-rate v-model="achievement.rating" disabled show-score />
              </div>
              <div class="review-count">
                共 {{ achievement.reviewCount }} 条评价
              </div>
            </div>
            
            <div class="rating-form">
              <h3>{{ isEditingReview ? '修改评价' : '发表评价' }}</h3>
              <div class="rating-stars">
                <el-rate v-model="newReview.rating" show-score />
              </div>
              <el-input
                type="textarea"
                v-model="newReview.content"
                :placeholder="isEditingReview ? '修改您的评价' : '写下您的评价'"
                :rows="3"
              />
              <el-button type="primary" @click="submitReview">
                <i class="el-icon-edit"></i> {{ isEditingReview ? '更新评价' : '发布评价' }}
              </el-button>
            </div>
            
            <!-- 评价列表 -->
            <div class="reviews-list">
              <div v-if="topReviews.length === 0" class="empty-reviews">
                暂无评价，成为第一个评价的用户吧！
              </div>
              <div v-for="review in topReviews" :key="review.id" class="review-item">
                <div class="review-header">
                  <span class="user-name">{{ review.userName }}</span>
                  <el-rate v-model="review.rating" disabled />
                </div>
                <p class="review-content">{{ review.content }}</p>
                <div class="review-footer">
                  <span class="review-date">{{ review.date }}</span>
                  <span class="likes">
                    <el-button type="text" @click="likeReview(review.id)">
                      <i class="el-icon-thumb"></i> {{ review.likes }}
                    </el-button>
                  </span>
                </div>
              </div>
              
              <!-- 添加分页组件 -->
              <div class="pagination-container" v-if="total > 0">
                <el-pagination
                  v-model:current-page="currentPage"
                  v-model:page-size="pageSize"
                  :page-sizes="[5, 10, 20, 50]"
                  :total="total"
                  layout="total, sizes, prev, pager, next"
                  @size-change="handleSizeChange"
                  @current-change="handlePageChange"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 讨论区部分 -->
        <div class="discussion-section">
          <div class="section-header">
            <h2><i class="el-icon-chat-dot-round"></i> 讨论区</h2>
            <el-button type="primary" @click="showNewDiscussionDialog">
              <i class="el-icon-plus"></i> 发起讨论
            </el-button>
          </div>
          
          <div class="discussions-list">
            <div v-for="discussion in discussions" :key="discussion.id" class="discussion-item">
              <h3>{{ discussion.title }}</h3>
              <div class="discussion-meta">
                <span class="author">{{ discussion.author }}</span>
                <span class="date">{{ discussion.date }}</span>
              </div>
              <p class="discussion-content">{{ discussion.content }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧相关推荐 -->
      <div class="related-content">
        <h2>相关推荐</h2>
        <div 
          v-for="item in relatedAchievements" 
          :key="item.id" 
          class="related-item"
          @click="navigateToAchievement(item.id)"
        >
          <h3>{{ item.title }}</h3>
          <el-rate v-model="item.rating" disabled />
          <p>{{ item.description }}</p>
        </div>
      </div>
    </div>

    <!-- 新讨论对话框 -->
    <el-dialog v-model="isDiscussionDialogVisible" title="发起新讨论">
      <el-input v-model="newDiscussion.title" placeholder="讨论标题" />
      <el-input
        type="textarea"
        v-model="newDiscussion.content"
        placeholder="讨论内容"
      />
      <span slot="footer" class="dialog-footer">
        <el-button @click="isDiscussionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitDiscussion">发布讨论</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script setup>
import { submitDownloadForm, downloadAchievements } from '../../api/download';
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
// 导入交互评价相关API
import { 
  queryEvaluationsByAchievementId, 
  addInteractionEvaluation, 
  updateInteractionEvaluation,
  getAverageRating,
  checkUserEvaluation,
  queryInteractionEvaluationList
} from '../../api/interaction'

const router = useRouter()
const route = useRoute()

// 接收父组件传递的成果数据
const props = defineProps({
  achievement: {
    type: Object,
    required: true
  }
})

// 定义事件
defineEmits(['back'])

// 成果数据
const achievement = ref({
  title: '',
  category: '',
  organization: '',
  leader: '',
  publishDate: '',
  views: 0,
  rating: 0,
  reviewCount: 0,
  description: ''
})

// 评价数据
const topReviews = ref([])
const userReview = ref(null)
const averageRating = ref(0)
const isEditingReview = ref(false)

const discussions = ref([
  {
    id: 1,
    title: '关于模型训练的问题',
    author: '陈工程师',
    date: '2024-03-15',
    content: '请问训练这个模型需要多少样本数据？硬件配置有什么要求吗？'
  },
  {
    id: 2,
    title: '部署环境说明',
    author: '技术支持小王',
    date: '2024-03-15',
    content: '建议使用RTX3060以上显卡，内存至少8GB。系统支持Windows和Linux环境。'
  },
  {
    id: 3,
    title: '关于算法优化的讨论',
    author: '研发主管',
    date: '2024-03-14',
    content: '我们在实际应用中发现，通过调整批处理大小可以显著提升处理速度。'
  }
])

const relatedAchievements = ref([
  {
    id: 1,
    title: '智能图像分割系统',
    rating: 4.5,
    description: '基于深度学习的图像分割技术，可用于医疗影像分析。'
  },
  {
    id: 2,
    title: '视频目标追踪系统',
    rating: 4.0,
    description: '实时视频流中的多目标追踪系统，适用于安防监控。'
  },
  {
    id: 3,
    title: '人脸识别访问控制',
    rating: 4.8,
    description: '企业级人脸识别系统，支持多场景应用。'
  }
])

const newReview = ref({
  rating: 0,
  content: ''
})

const newDiscussion = ref({
  title: '',
  content: ''
})

const isDiscussionDialogVisible = ref(false)

// 添加分页相关的响应式数据
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 在 script setup 中添加折叠状态
const isReviewsCollapsed = ref(false)

// 修改获取成果评价数据的方法
const fetchReviews = async (achievementId) => {
  try {
    console.log('获取成果评价数据:', achievementId)
    const response = await queryInteractionEvaluationList(
      { achievementId: achievementId },
      currentPage.value,
      pageSize.value
    )
    
    console.log('评价数据响应:', response)
    
    if (response) {
      const evaluationList = response  // 直接使用返回的数组
      
      // 更新总数
      total.value = evaluationList.length
      
      // 转换评价数据
      topReviews.value = evaluationList.map(review => ({
        id: review.interactionId,
        userId: review.userId,
        userName: review.userName || '匿名用户',
        rating: review.rating,
        content: review.evaluation,
        date: formatDate(review.interactionTime),
        likes: review.likes || 0
      }))
      
      // 计算平均评分
      if (evaluationList.length > 0) {
        const totalRating = evaluationList.reduce((sum, review) => sum + review.rating, 0)
        const averageRating = totalRating / evaluationList.length
        achievement.value.rating = Number(averageRating.toFixed(1))
      } else {
        achievement.value.rating = 0
      }
      
      console.log('成功获取评价数据:', topReviews.value)
      console.log('平均评分:', achievement.value.rating)
      
      // 更新评价计数
      achievement.value.reviewCount = total.value
    }
  } catch (error) {
    console.error('获取评价数据失败:', error)
    ElMessage.error('获取评价数据失败')
  }
}

// 添加日期格式化函数
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 添加分页变化处理函数
const handlePageChange = (newPage) => {
  currentPage.value = newPage
  const achievementId = route.params.id || 
                       (achievement.value && achievement.value.id) || 
                       route.query.id
  fetchReviews(achievementId)
}

const handleSizeChange = (newSize) => {
  pageSize.value = newSize
  currentPage.value = 1 // 重置到第一页
  const achievementId = route.params.id || 
                       (achievement.value && achievement.value.id) || 
                       route.query.id
  fetchReviews(achievementId)
}

// 检查当前用户是否已评价
const checkUserHasReviewed = async (achievementId) => {
  try {
    // 获取当前用户ID（示例，实际应从用户状态或本地存储获取）
    const userId = localStorage.getItem('userId') || '1'
    console.log('检查用户评价状态:', userId, achievementId)
    
    const response = await checkUserEvaluation(userId, achievementId)
    if (response.data && response.data.code === 200 && response.data.data) {
      // 用户已有评价，保存评价信息用于编辑
      userReview.value = response.data.data
      // 预填充评价表单
      newReview.value = {
        id: userReview.value.id,
        rating: userReview.value.rating,
        evaluation: userReview.value.content
      }
      isEditingReview.value = true
      console.log('用户已有评价:', userReview.value)
    } else {
      // 用户尚未评价
      userReview.value = null
      newReview.value = { rating: 0, content: '' }
      isEditingReview.value = false
      console.log('用户尚未评价')
    }
  } catch (error) {
    console.error('检查用户评价状态失败:', error)
  }
}

// 获取数据的方法
const fetchData = async () => {
  try {
    // 首先尝试从本地存储获取数据
    const storedAchievement = localStorage.getItem('currentAchievement')
    
    if (storedAchievement) {
      const parsedData = JSON.parse(storedAchievement)
      
      // 映射数据到组件需要的格式
      achievement.value = {
        title: parsedData.title || '',
        category: parsedData.type || '',
        organization: parsedData.organization || '',
        leader: parsedData.author || '',
        publishDate: parsedData.uploadDate || '',
        views: parsedData.views || 0,
        rating: 4.5, // 默认值，实际应用中应从API获取
        reviewCount: 0, // 默认值，实际应用中应从API获取
        description: parsedData.description || ''
      }
      
      console.log('从本地存储加载成果数据:', achievement.value)
      
      // 清除本地存储，避免数据持久化导致的问题
      localStorage.removeItem('currentAchievement')
    } else {
      // 如果本地存储没有数据，则尝试通过ID从API获取
      const achievementId = route.params.id || route.query.id
      
      if (achievementId) {
        console.log('通过ID获取成果数据:', achievementId)
        // TODO: 实现通过API获取成果详情的逻辑
        // 例如: const response = await getAchievementById(achievementId)
        //      achievement.value = mapApiResponseToAchievement(response)
      } else {
        ElMessage.error('未找到成果数据')
        router.push('/search') // 如果没有数据，返回搜索页面
      }
    }

    // 获取成果ID
    const achievementId = route.params.id || 
                         (achievement.value && achievement.value.id) || 
                         route.query.id
    
    if (achievementId) {
      // 获取评价数据
      await fetchReviews(achievementId)
      
      // 获取平均评分
      //await fetchAverageRating(achievementId)
      
      // 检查用户评价状态
      //await checkUserHasReviewed(achievementId)
    }
  } catch (error) {
    console.error('获取数据失败:', error)
    ElMessage.error('获取数据失败')
  }
}

// 添加返回搜索页面的方法
const goBack = () => {
  router.back()
}

// 提交新评价或更新评价
const submitReview = async () => {
  if (!newReview.value.rating || !newReview.value.content) {
    ElMessage.warning('请填写评分和评价内容')
    return
  }

  try {
    // 获取当前用户ID和用户名（示例，实际应从用户状态获取）
    const userId = localStorage.getItem('userId') || '1'
    const userName = localStorage.getItem('userName') || '当前用户'
    
    // 获取成果ID
    const achievementId = route.params.id || 
                         (achievement.value && achievement.value.id) || 
                         route.query.id
    
    if (!achievementId) {
      ElMessage.error('成果ID不存在')
      return
    }
    
    // 准备评价数据
    const reviewData = {
      userId,
      userName,
      achievementId,
      rating: newReview.value.rating,
      evaluation: newReview.value.content,
      tableStatus:true,
      interactionTime:new Date().toISOString()
    }
    
    let response
    
    if (isEditingReview.value && userReview.value) {
      // 更新评价
      console.log('更新评价:', reviewData)
      reviewData.id = userReview.value.id
      response = await updateInteractionEvaluation(reviewData)
      console.log('更新评价响应:', response)
      
      if (response === 1 || (response.data && response.data.code === 200)) {
        ElMessage.success('评价更新成功')
        console.log('评价更新成功:', response)
      }
    } else {
      // 添加新评价
      console.log('添加评价:', reviewData)
      response = await addInteractionEvaluation(reviewData)
      console.log('添加评价响应:', response)
      
      if (response === 1 || (response.data && response.data.code === 200)) {
        ElMessage.success('评价发布成功')
        console.log('评价发布成功:', response)
      }
    }
    
    // 重新获取评价数据和平均评分
    await fetchReviews(achievementId)
    await fetchAverageRating(achievementId)
    await checkUserHasReviewed(achievementId)
    
  } catch (error) {
    console.error('提交评价失败:', error)
    ElMessage.error('提交评价失败: ' + (error.message || '未知错误'))
  }
}

// 点赞评论
const likeReview = (reviewId) => {
  // TODO: 实现点赞逻辑
}

// 显示新讨论对话框
const showNewDiscussionDialog = () => {
  isDiscussionDialogVisible.value = true
}

// 提交新讨论
const submitDiscussion = () => {
  if (!newDiscussion.value.title || !newDiscussion.value.content) {
    ElMessage.warning('请填写讨论标题和内容')
    return
  }

  const discussion = {
    id: Date.now(),
    title: newDiscussion.value.title,
    author: '当前用户', // 实际应用中应该使用真实用户名
    date: new Date().toLocaleDateString(),
    content: newDiscussion.value.content
  }

  discussions.value.unshift(discussion)
  newDiscussion.value = { title: '', content: '' }
  isDiscussionDialogVisible.value = false
  ElMessage.success('讨论发布成功')
}

// 添加路由跳转方法
const navigateToAchievement = (achievementId) => {
  router.push(`/achievement/${achievementId}`)
}

// 添加下载成果方法
const downloadAchievement = async () => {
  try {
    // 获取当前成果ID
    const achievementId = route.params.id || 
                          (achievement.value && achievement.value.id) || 
                          route.query.id
    
    if (!achievementId) {
      ElMessage.error('成果ID不存在，无法下载')
      return
    }
    
    // 获取当前用户ID
    const userId = localStorage.getItem('userId') || '1'
    
    // 步骤1：提交下载表单
    console.log('提交下载表单:', achievementId, userId)
    const submitResult = await submitDownloadForm(achievementId, userId)
    console.log('下载表单提交结果:', submitResult)
    
    if (submitResult && Array.isArray(submitResult) && submitResult.length > 0) {
      // 步骤2：执行文件下载
      
      console.log('开始下载文件:', submitResult)
      await downloadAchievements(submitResult)
      ElMessage.success('下载成功')
    } else {
      ElMessage.error('获取文件名失败，无法下载')
    }
  } catch (error) {
    console.error('下载成果失败:', error)
    ElMessage.error('下载失败: ' + (error.message || '未知错误'))
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style lang="scss" scoped>
.discussion-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  background-color: #f9fafb;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  margin-bottom: 1rem;
  color: white;
  background-color: #4a90e2;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: #357abd;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
  }

  i {
    font-size: 0.9rem;
  }
}

.content-wrapper {
  display: grid;
  grid-template-columns: 2.5fr 1fr;
  gap: 1.5rem;
}

.main-content {
  flex: 2;
}

.achievement-summary {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
  
  h1 {
    color: #1a1a1a;
    margin-top: 0;
    margin-bottom: 1rem;
    font-size: 1.6rem;
  }

  .basic-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 1rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 6px;

    .info-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      
      i {
        color: #409EFF;
        font-size: 1.1rem;
      }

      .label {
        color: #666;
        font-weight: 500;
      }
    }
  }

  .achievement-stats {
    display: flex;
    gap: 2rem;
    padding: 0.8rem 0;
    border-top: 1px solid #eee;
    border-bottom: 1px solid #eee;
    margin: 1rem 0;

    .stat-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #666;

      i {
        color: #409EFF;
      }
    }
  }

  .description {
    margin-top: 1rem;
    
    i {
      color: #409EFF;
      margin-right: 0.5rem;
    }

    .label {
      color: #666;
      font-weight: 500;
    }

    p {
      margin-top: 0.5rem;
      color: #4a5568;
      line-height: 1.6;
    }
  }
}

.rating-section,
.discussion-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
  padding: 1.5rem;
  
  .section-header {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #eee;
    
    h2 {
      margin: 0;
      font-size: 1.2rem;
      i {
        margin-right: 0.5rem;
        color: #409EFF;
      }
    }
  }

  .el-textarea {
    margin: 1rem 0;
  }

  .el-button {
    margin-bottom: 1.5rem;
  }
}

.review-item,
.discussion-item {
  padding: 1.2rem;
  border-bottom: 1px solid #eee;
  transition: background-color 0.3s;

  &:hover {
    background-color: #f8f9fa;
  }

  &:last-child {
    border-bottom: none;
  }
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;

  .user-name {
    font-weight: 600;
    color: #2c3e50;
  }
}

.review-content {
  color: #4a5568;
  line-height: 1.6;
  margin: 0.8rem 0;
}

.review-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #718096;
  font-size: 0.9rem;

  .review-date {
    color: #a0aec0;
  }
}

.related-content {
  flex: 1;
  
  h2 {
    color: #1a1a1a;
    margin-top: 0;
    margin-bottom: 1.5rem;
    font-size: 1.4rem;
  }
}

.related-item {
  padding: 1.2rem;
  margin-bottom: 0.8rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
  }

  h3 {
    color: #2c3e50;
    margin-bottom: 0.8rem;
    font-size: 1.1rem;
  }

  p {
    color: #718096;
    font-size: 0.9rem;
    margin-top: 0.8rem;
    line-height: 1.5;
  }
}

.discussion-meta {
  display: flex;
  gap: 1rem;
  color: #718096;
  font-size: 0.9rem;
  margin-bottom: 0.8rem;
}

.section-header {
  cursor: pointer;
  user-select: none;
  padding: 1rem;
  border-radius: 8px;
  transition: background-color 0.3s;

  &:hover {
    background-color: #f5f7fa;
  }

  h2 {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0;
    
    .collapse-icon {
      font-size: 1.2rem;
      color: #409EFF;
      transition: all 0.3s ease;
      margin-left: 8px;
      
      &.el-icon-arrow-down {
        transform: rotate(0deg);
      }
      
      &.el-icon-arrow-up {
        transform: rotate(180deg);
      }
    }

    &:hover .collapse-icon {
      color: #66b1ff;
      transform: scale(1.1);
    }
  }

  // 添加提示文本
  &:after {
    content: "点击展开/收起";
    font-size: 0.8rem;
    color: #909399;
    margin-left: 0.5rem;
    opacity: 0;
    transition: opacity 0.3s;
  }

  &:hover:after {
    opacity: 1;
  }
}

// 对话框样式
.el-dialog {
  .el-dialog__body {
    padding: 20px;
  }

  .el-input + .el-input,
  .el-input + .el-textarea {
    margin-top: 1rem;
  }
}

.el-button {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  
  i {
    font-size: 1.1em;
  }
}

@media (max-width: 768px) {
  .content-wrapper {
    grid-template-columns: 1fr;
  }
  
  .related-content {
    margin-top: 1rem;
  }
}

.rating-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 1rem 0;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  
  .average-rating {
    display: flex;
    flex-direction: column;
    
    .rating-value {
      font-size: 2.5rem;
      font-weight: bold;
      color: #f0ad4e;
    }
  }
  
  .review-count {
    color: #6c757d;
  }
}

.rating-form {
  margin: 1.5rem 0;
  padding: 1.5rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  
  h3 {
    margin-top: 0;
    color: #495057;
  }
}

.empty-reviews {
  padding: 2rem;
  text-align: center;
  color: #6c757d;
  font-style: italic;
}

/* 添加分页样式 */
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.download-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #67c23a;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-left: auto;
  
  &:hover {
    background-color: #5daf34;
    transform: translateY(-2px);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  }
  
  i {
    font-size: 1.1rem;
  }
}
</style>
//未添加投诉功能