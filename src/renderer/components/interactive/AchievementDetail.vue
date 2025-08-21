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
              <span>{{
                achievement.category === 'patent' ? '专利' : 
                achievement.category === 'paper' ? '论文' : 
                achievement.category === 'technology' ? '技术类成果' :
                achievement.category === 'system' ? '系统类成果' :
                achievement.category === 'software' ? '软件类成果' :
                achievement.category === 'hardware' ? '硬件类成果' :
                achievement.category
              }}</span>
            </div>
            <div class="info-item">
              <i class="el-icon-office-building"></i>
              <span class="label">来源单位：</span>
              <span>{{ achievement.organization }}</span>
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
              <span>{{ achievement.views }} 次下载</span>
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
            <!-- 添加投诉按钮 -->
            <div class="complaint-button" @click="showComplaintDialog">
              <i class="el-icon-warning-outline"></i>
              <span>投诉</span>
            </div>
            <!-- 添加历史版本按钮 -->
            <div class="version-button" @click="showVersionHistory">
              <i class="el-icon-time"></i>
              <span>历史版本</span>
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
            <AchievementEvaluation
              :achievement-id="achievement.id"
              :current-user-id="currentUserId"
              :can-evaluate="canEvaluate"
            />
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

    <!-- 添加投诉对话框 -->
    <el-dialog
      v-model="isComplaintDialogVisible"
      title="投诉成果"
      width="500px"
    >
      <el-form :model="complaintForm" label-width="100px">
        <el-form-item label="投诉类型">
          <el-select v-model="complaintForm.complaintType" placeholder="请选择投诉类型">
            <el-option label="侵权" value="infringement" />
            <el-option label="虚假信息" value="false_information" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="投诉说明">
          <el-input
            type="textarea"
            v-model="complaintForm.complaintIntro"
            :rows="4"
            placeholder="请详细描述投诉原因..."
          />
        </el-form-item>
        <el-form-item label="证明材料">
          <el-upload
            v-model:file-list="fileList"
            multiple
            :limit="5"
            :before-upload="(file) => {
              const isAllowed = ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type);
              if (!isAllowed) {
                ElMessage.warning('仅支持上传图片（JPEG/PNG）和PDF格式的文件');
              }
              return isAllowed;
            }"
            :http-request="handleUpload"
          >
            <el-button type="primary">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">
                仅支持上传图片（JPEG/PNG）和PDF格式的文件，最多5个文件
              </div>
            </template>
          </el-upload>
        </el-form-item>
        <div class="contact-info">
          如有其他需求请联系管理员：王老师，电话：12345
        </div>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="isComplaintDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitComplaintForm">提交投诉</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 修改历史版本对话框 -->
    <el-dialog
      v-model="isVersionDialogVisible"
      title="历史版本"
      width="70%"
      class="version-history-dialog"
    >
      <template #header="{ close, titleId, titleClass }">
        <div class="dialog-header">
          <h3 :id="titleId" :class="titleClass">
            <i class="el-icon-time"></i>
            历史版本记录
          </h3>
          <el-button
            class="close-btn"
            type="text"
            @click="close"
          >
            <i class="el-icon-close"></i>
          </el-button>
        </div>
      </template>

      <div class="version-history-content">
        <el-table
          v-loading="loadingVersions"
          :data="versionHistory"
          style="width: 100%"
          :header-cell-style="{
            background: '#f5f7fa',
            color: '#606266',
            fontWeight: 'bold'
          }"
          :row-class-name="tableRowClassName"
        >
          <el-table-column 
            prop="versionNumber" 
            label="版本号" 
            width="120"
            align="center"
          >
            <template #default="scope">
              <span class="version-tag">{{ scope.row.versionNumber }}</span>
            </template>
          </el-table-column>
          
          <el-table-column 
            prop="updateTime" 
            label="更新时间" 
            width="180"
            align="center"
          >
            <template #default="scope">
              <span class="update-time">{{ formatDate(scope.row.updateTime) }}</span>
            </template>
          </el-table-column>
          
          <el-table-column 
            prop="updateContent" 
            label="更新内容"
            show-overflow-tooltip
          >
            <template #default="scope">
              <div class="update-content">{{ scope.row.updateContent }}</div>
            </template>
          </el-table-column>

          <!-- 添加下载操作列 -->
          <el-table-column
            label="操作"
            width="100"
            align="center"
            fixed="right"
          >
            <template #default="scope">
              <el-button
                type="primary"
                size="small"
                @click="downloadVersion(scope.row)"
                :loading="scope.row.downloading"
              >
                <i class="el-icon-download"></i>
                下载
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-container" v-if="versionTotal > 0">
          <el-pagination
            v-model:current-page="versionCurrentPage"
            v-model:page-size="versionPageSize"
            :page-sizes="[5, 10, 20, 50]"
            :total="versionTotal"
            layout="total, sizes, prev, pager, next"
            @size-change="handleVersionSizeChange"
            @current-change="handleVersionPageChange"
            background
          />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { submitDownloadForm, downloadAchievements } from '../../api/download';
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import AchievementEvaluation from '../evaluation/AchievementEvaluation.vue';
// 导入交互评价相关API
import { 
  queryEvaluationsByAchievementId, 
  addInteractionEvaluation, 
  updateInteractionEvaluation,
  getAverageRating,
  checkUserEvaluation,
  queryInteractionEvaluationList
} from '../../api/interaction'
import { submitComplaint } from '../../api/patentComplaints'
import { addLog } from '../../api/log'
import { getVersionHistoryWithPagination } from '../../api/search'

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
  id: null,
  title: '',
  category: '',
  organization: '',
  publishDate: '',
  views: 0,
  rating: 0,
  reviewCount: 0,
  description: ''
})

// 当前用户ID和权限
const currentUserId = computed(() => {
  return parseInt(localStorage.getItem('userId') || '1')
})

const canEvaluate = computed(() => {
  // 检查用户是否已登录且有权限评价
  return localStorage.getItem('userId') != null
})

// 评价数据
const topReviews = ref([])
const userReview = ref(null)
const averageRating = ref(0)
const isEditingReview = ref(false)

const discussions = ref([
  {
    id: 1,
    title: '理论来源探讨',
    author: '12345',
    date: '2025-03-15',
    content: '理论依据是什么？'
  },
  {
    id: 2,
    title: '是否可拓展',
    author: '11111',
    date: '2025-03-15',
    content: '理论是否能拓展到前端'
  },

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

// 添加投诉相关的响应式数据
const isComplaintDialogVisible = ref(false)
const complaintForm = ref({
  complaintId: '',
  intellectualPropertyId:'',
  complaintTime: '',
  userId: '',
  complaintType: '',
  complaintIntro: '',
  complaintProcess: 0,
  tableStatus: true,
});

// 在data/ref中添加文件列表
const fileList = ref([])

// 添加版本历史相关的响应式数据
const isVersionDialogVisible = ref(false)
const versionHistory = ref([])
const loadingVersions = ref(false)
const versionCurrentPage = ref(1)
const versionPageSize = ref(10)
const versionTotal = ref(0)

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
        id: parsedData.achievementId || parsedData.id,
        title: parsedData.title || '',
        category: parsedData.type || '',
        organization: 'cetc32',
        publishDate: parsedData.uploadDate || '',
        views: parsedData.views || 0,
        rating: 4.5,
        reviewCount: 0,
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

// 添加日志记录函数
const logAction = async (action) => {
  try {
    const userId = localStorage.getItem('userId') || '1'
    const today = new Date()
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    
    const logData = {
      userId: userId,
      logIntro: action,
      logTime: formattedDate,
      tableStatus: true
    }
    
    await addLog(logData)
  } catch (error) {
    console.error('记录日志失败:', error)
  }
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
      
      if (response ) {
        ElMessage.success('评价更新成功')
        console.log('评价更新成功:', response)
      }
    } else {
      // 添加新评价
      console.log('添加评价:', reviewData)
      response = await addInteractionEvaluation(reviewData)
      console.log('添加评价响应:', response)
      
      if (response ) {
        ElMessage.success('评价发布成功')
        console.log('评价发布成功:', response)
      }
    }
    
    // 重新获取评价数据和平均评分
    await fetchReviews(achievementId)
    // await fetchAverageRating(achievementId)
    await checkUserHasReviewed(achievementId)
    
    await logAction(isEditingReview.value ? `更新评价：${achievement.value.title}` : `添加评价：${achievement.value.title}`)
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

  logAction(`发起讨论：${newDiscussion.value.title}`)
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
      const response = await downloadAchievements(submitResult)
      console.log('下载API响应类型:', response);
        
        // 创建Blob对象
        const blob = new Blob([response], { type: response.type || 'application/octet-stream' });
        
        // 设置文件名 - 单个文件使用原文件名，多个文件使用时间戳命名的zip
        let fileName;
        if (submitResult.length === 1) {
            fileName = submitResult[0];
        } else {
            const now = new Date();
            const timestamp = now.toISOString().replace(/[:.]/g, '-').substring(0, 19);
            fileName = `批量下载_${timestamp}.zip`;
        }
        
        // 使用更隐蔽的方式下载文件
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.style.display = 'none'; // 隐藏链接元素
        document.body.appendChild(link);
        
        // 模拟点击但不触发可见的系统对话框
        link.click();
        
        // 延迟一段时间后移除链接（确保下载开始）
        setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);
        }, 100);
        
      












      
      ElMessage.success('下载成功')
    } else {
      ElMessage.error('获取文件名失败，无法下载')
    }

    await logAction(`下载成果：${achievement.value.title}`)
  } catch (error) {
    console.error('下载成果失败:', error)
    ElMessage.error('下载失败: ' + (error.message || '未知错误'))
  }
}

// 显示投诉对话框
const showComplaintDialog = () => {
  console.log('打开投诉对话框')
  const today = new Date();
  const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  complaintForm.value = {
    intellectualPropertyId: 22,
    complaintTime: formattedDate, 
    userId: 1,
    complaintProcess: 0,
    tableStatus: true,
    complaintType: '',
    complaintIntro: ''
  }
 isComplaintDialogVisible.value = true
}

// 修改后的submitComplaintForm方法
const submitComplaintForm = async () => {
  console.log('开始提交投诉表单')
  
  // 获取选择的文件
  const selectedFiles = fileList.value.map(file => file.raw || file) // 获取原始文件对象
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
  
  // 检查文件类型
  const invalidFiles = selectedFiles.filter(file => !allowedTypes.includes(file.type))
  if (invalidFiles.length > 0) {
    ElMessage.warning('仅支持上传图片（JPEG/PNG）和PDF格式的文件')
    return
  }

  if (!complaintForm.value.complaintType || !complaintForm.value.complaintIntro) {
    console.warn('表单验证失败：类型或说明为空')
    ElMessage.warning('请填写完整的投诉信息')
    return
  }

  try {
    const userId = localStorage.getItem('userId') || '1'
    const achievementId = route.params.id || 
                         (achievement.value && achievement.value.id) || 
                         route.query.id
    
    console.log('当前用户ID:', userId)
    console.log('当前成果ID:', achievementId)
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // 准备投诉数据
    const complaintData = {
      intellectualPropertyId: achievementId,
      complaintTime: formattedDate, 
      userId: parseInt(userId),
      complaintProcess: 0,
      tableStatus: true,
      complaintType: complaintForm.value.complaintType,
      complaintIntro: complaintForm.value.complaintIntro
    }
    
    console.log('准备提交的投诉数据:', complaintData)

    // 调用支持文件上传的API
    const response = await submitComplaint(selectedFiles, complaintData)
    console.log('投诉提交响应:', response)
    
    if (response) {
      console.log('投诉提交成功')
      ElMessage.success('投诉提交成功')
      isComplaintDialogVisible.value = false
      // 重置表单
      complaintForm.value = {
        complaintType: '',
        complaintIntro: ''
      }
      fileList.value = [] // 清空文件列表
      console.log('表单已重置')
    } else {
      console.error('投诉提交失败:', response)
      ElMessage.error('投诉提交失败')
    }

    await logAction(`提交投诉：${achievement.value.title}`)
  } catch (error) {
    console.error('提交投诉失败:', error)
    console.error('错误详情:', {
      message: error.message,
      stack: error.stack
    })
    ElMessage.error('提交投诉失败: ' + (error.message || '未知错误'))
  }
}

// 添加自定义上传方法
const handleUpload = async (options) => {
  const { file, onSuccess, onError } = options;
  
  try {
    // 这里可以添加文件上传逻辑
    // 由于我们会在submitComplaintForm中统一上传，这里只需标记文件为成功
    onSuccess();
  } catch (error) {
    onError(error);
  }
}

// 获取版本历史数据
const fetchVersionHistory = async () => {
  // 从路由参数或当前成果对象中获取成果ID
  const achievementId = route.params.id || 
                       (achievement.value && achievement.value.id) || 
                       route.query.id
  
  if (!achievementId) {
    ElMessage.warning('无法获取成果ID')
    return
  }
  
  loadingVersions.value = true
  try {
    const versionHistoryData = {
      achievementId: achievementId  // 使用当前成果的ID
    }
    
    console.log('Fetching version history for achievement:', achievementId)
    
    const response = await getVersionHistoryWithPagination(
      versionHistoryData, 
      versionCurrentPage.value, 
      versionPageSize.value
    )
    
    console.log('Version history response:', response)
    
    if (Array.isArray(response)) {
      versionHistory.value = response
      versionTotal.value = response.length
    } else if (response && Array.isArray(response.data)) {
      versionHistory.value = response.data
      versionTotal.value = response.total || response.data.length
    } else {
      versionHistory.value = []
      versionTotal.value = 0
    }
  } catch (error) {
    console.error('Error fetching version history:', error)
    ElMessage.error('获取版本历史失败')
    versionHistory.value = []
    versionTotal.value = 0
  } finally {
    loadingVersions.value = false
  }
}

// 显示版本历史对话框
const showVersionHistory = () => {
  isVersionDialogVisible.value = true
  fetchVersionHistory()
}

// 处理版本历史分页变化
const handleVersionPageChange = (newPage) => {
  versionCurrentPage.value = newPage
  fetchVersionHistory()
}

const handleVersionSizeChange = (newSize) => {
  versionPageSize.value = newSize
  versionCurrentPage.value = 1
  fetchVersionHistory()
}

// 添加表格行的样式
const tableRowClassName = ({ row, rowIndex }) => {
  return rowIndex % 2 === 0 ? 'even-row' : 'odd-row'
}

// 添加下载版本方法
const downloadVersion = async (version) => {
  if (!achievement.value) return
  
  try {
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
    // 构造文件名：成果名称+版本号+.zip
    const fileName = `${achievement.value.title}${version.versionNumber}.zip`
    
    console.log('Downloading version file:', fileName)
    
    // 调用下载API
    const response = await downloadAchievements(fileName)
    console.log('下载API响应类型:', response);
        
        // 创建Blob对象
        const blob = new Blob([response], { type: response.type || 'application/octet-stream' });
        
        // 设置文件名 - 单个文件使用原文件名，多个文件使用时间戳命名的zip
        // let fileName;
        // if (submitResult.length === 1) {
        //     fileName = submitResult[0];
        // } else {
        //     const now = new Date();
        //     const timestamp = now.toISOString().replace(/[:.]/g, '-').substring(0, 19);
        //     fileName = `批量下载_${timestamp}.zip`;
        // }
        
        // 使用更隐蔽的方式下载文件
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.style.display = 'none'; // 隐藏链接元素
        document.body.appendChild(link);
        
        // 模拟点击但不触发可见的系统对话框
        link.click();
        
        // 延迟一段时间后移除链接（确保下载开始）
        setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);
        }, 100);
        
    
    // 显示成功消息
    ElMessage({
      message: '文件开始下载',
      type: 'success',
      duration: 2000,
      showClose: true
    })
    
    // 记录下载日志
    await addLog({
      userId: localStorage.getItem('userId'),
      logIntro: `下载成果版本: ${achievement.value.title} (${version.versionNumber})`,
      logTime: new Date().toISOString().split('T')[0],
      tableStatus: true
    })
  } catch (error) {
    console.error('Error downloading version:', error)
    ElMessage({
      message: '下载失败，请稍后重试',
      type: 'error',
      duration: 3000,
      showClose: true
    })
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

.complaint-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #f56c6c;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #e64242;
    transform: translateY(-2px);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  }
  
  i {
    font-size: 1.1rem;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.contact-info {
  margin-top: 1rem;
  padding: 0.8rem;
  background-color: #f5f7fa;
  border-radius: 4px;
  color: #606266;
  font-size: 0.9rem;
  text-align: center;
}

.version-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #909399;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #606266;
    transform: translateY(-2px);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  }
  
  i {
    font-size: 1.1rem;
  }
}

// 版本历史表格样式
.el-table {
  margin-bottom: 1rem;
}

// 添加新的样式
.version-history-dialog {
  :deep(.el-dialog__body) {
    padding: 20px;
  }
  
  .dialog-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px;
    background: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;
    margin: -20px -20px 20px;
    
    h3 {
      margin: 0;
      font-size: 18px;
      color: #303133;
      display: flex;
      align-items: center;
      gap: 8px;
      
      i {
        color: #409EFF;
      }
    }
    
    .close-btn {
      padding: 0;
      font-size: 20px;
      
      &:hover {
        color: #409EFF;
      }
    }
  }
  
  .version-history-content {
    .version-tag {
      display: inline-block;
      padding: 2px 8px;
      background: #409EFF;
      color: white;
      border-radius: 12px;
      font-size: 13px;
    }
    
    .update-time {
      color: #606266;
    }
    
    .update-content {
      line-height: 1.5;
      color: #303133;
      
      &:hover {
        color: #409EFF;
      }
    }
  }
  
  :deep(.el-table) {
    border-radius: 8px;
    overflow: hidden;
    
    .even-row {
      background-color: #fafafa;
    }
    
    .odd-row {
      background-color: white;
    }
    
    tr:hover > td {
      background-color: #f0f7ff !important;
    }
  }
  
  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: center;
    
    :deep(.el-pagination) {
      padding: 0;
      button:not(:disabled) {
        background-color: #f4f4f5;
        
        &:hover {
          color: #409EFF;
        }
      }
      
      .el-pagination__sizes {
        margin-right: 15px;
      }
    }
  }
}

// 添加下载按钮样式
.el-button {
  padding: 6px 12px;
  
  &.el-button--small {
    font-size: 12px;
  }
  
  i {
    margin-right: 4px;
  }
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
}
</style>