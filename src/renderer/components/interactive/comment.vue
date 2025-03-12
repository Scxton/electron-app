<template>
  <div class="research-result-page">
    <!-- 顶部导航 -->
    <el-header class="page-header">
      <div class="logo">研究成果平台</div>
      <div class="header-actions">
        <el-input 
          placeholder="搜索成果" 
          prefix-icon="Search" 
          class="search-input"
        />
        <el-badge :value="notifications" :max="99" class="notification-badge">
          <el-icon><Bell /></el-icon>
        </el-badge>
        <el-icon><Setting /></el-icon>
        <el-icon><User /></el-icon>
      </div>
    </el-header>

    <!-- 主内容区 -->
    <el-container class="main-content">
      <el-main>
        <el-row :gutter="20">
          <!-- 左侧成果详情 -->
          <el-col :span="16">
            <!-- 成果基本信息 -->
            <el-card class="result-detail">
              <template #header>
                <div class="card-header">成果详情</div>
              </template>
              <div class="result-content">
                <h2>基于深度学习的智能识别系统</h2>
                <p>这是一个创新性的研究成果，主要应用于人工智能领域...</p>
              </div>
            </el-card>

            <!-- 评分与评价区 -->
            <el-card class="rating-section">
              <template #header>
                <div class="card-header">评分与评价</div>
              </template>
              
              <!-- 星级评分 -->
              <div class="rating-stars">
                <el-rate 
                  v-model="userRating" 
                  :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
                  show-score
                />
              </div>

              <!-- 评价输入 -->
              <el-input 
                v-model="userComment" 
                type="textarea" 
                :rows="4" 
                placeholder="写下您的评价..."
                class="comment-input"
              />

              <!-- 标签选择 -->
              <div class="tag-section">
                <el-tag 
                  v-for="tag in availableTags" 
                  :key="tag"
                  @click="toggleTag(tag)"
                  :type="selectedTags.includes(tag) ? 'primary' : 'info'"
                  class="tag-item"
                >
                  {{ tag }}
                </el-tag>
              </div>

              <el-button type="primary" class="submit-comment">发布评价</el-button>

              <!-- 评价列表 -->
              <div class="comments-list">
                <el-card 
                  v-for="comment in comments" 
                  :key="comment.id" 
                  class="comment-item"
                  shadow="hover"
                >
                  <div class="comment-header">
                    <div class="user-info">
                      <el-avatar :size="32" icon="UserFilled" />
                      <span class="username">{{ comment.user }}</span>
                    </div>
                    <div class="comment-actions">
                      <el-button text @click="likeComment(comment)">
                        <el-icon><Like /></el-icon>
                        {{ comment.likes }}
                      </el-button>
                      <el-button text>
                        <el-icon><Warning /></el-icon>
                      </el-button>
                    </div>
                  </div>
                  <p class="comment-content">{{ comment.content }}</p>
                  <div class="comment-tags">
                    <el-tag 
                      v-for="tag in comment.tags" 
                      :key="tag" 
                      type="info" 
                      size="small"
                    >
                      {{ tag }}
                    </el-tag>
                  </div>
                </el-card>
              </div>
            </el-card>
          </el-col>

          <!-- 右侧推荐区 -->
          <el-col :span="8">
            <!-- 相关推荐 -->
            <el-card class="recommendations">
              <template #header>
                <div class="card-header">相关推荐</div>
              </template>
              <div class="recommendation-list">
                <el-card 
                  v-for="item in recommendations" 
                  :key="item.id" 
                  class="recommendation-item" 
                  shadow="hover"
                >
                  <div class="recommendation-content">
                    <h3>{{ item.title }}</h3>
                    <el-rate 
                      v-model="item.rating" 
                      disabled 
                      show-score 
                      text-color="#ff9900" 
                      score-template="{value}"
                    />
                    <p>{{ item.description }}</p>
                  </div>
                </el-card>
              </div>
            </el-card>

            <!-- 讨论区入口 -->
            <el-card class="discussion-section">
              <template #header>
                <div class="card-header">讨论区</div>
              </template>
              <el-button type="primary" plain class="start-discussion">
                <el-icon><ChatDotRound /></el-icon>
                发起讨论
              </el-button>
            </el-card>
          </el-col>
        </el-row>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { 
  Bell, Setting, User, Like, Warning, ChatDotRound 
} from '@element-plus/icons-vue'

// 通知数量
const notifications = ref(2)

// 用户评分
const userRating = ref(0)

// 用户评论
const userComment = ref('')

// 可选标签
const availableTags = ref([
  '易于部署', 
  '操作方便', 
  '性能优异', 
  '创新技术'
])

// 已选标签
const selectedTags = ref([])

// 切换标签选择
const toggleTag = (tag) => {
  if (selectedTags.value.includes(tag)) {
    selectedTags.value = selectedTags.value.filter(t => t !== tag)
  } else {
    selectedTags.value.push(tag)
  }
}

// 评论列表
const comments = ref([
  {
    id: 1, 
    user: '张三', 
    content: '这个成果非常实用', 
    likes: 23, 
    tags: ['易于部署', '操作方便']
  },
  {
    id: 2, 
    user: '李四', 
    content: '实现效果很好', 
    likes: 15, 
    tags: ['性能优异']
  }
])

// 点赞评论
const likeComment = (comment) => {
  comment.likes++
}

// 相关推荐
const recommendations = ref([
  {
    id: 1,
    title: '相似研究成果A',
    rating: 4.5,
    description: '基于深度学习的图像识别系统'
  },
  {
    id: 2,
    title: '相似研究成果B',
    rating: 4.2,
    description: '智能目标检测算法优化'
  }
])
</script>

<style lang="scss" scoped>
.research-result-page {
  background-color: #f5f5f5;
  height: 100vh;
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    background-color: white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    
    .header-actions {
      display: flex;
      align-items: center;
      gap: 15px;
      
      .search-input {
        width: 250px;
      }
      
      .notification-badge {
        cursor: pointer;
      }
    }
  }
  
  .main-content {
    padding: 20px;
  }
  
  .rating-section {
    margin-top: 20px;
    
    .rating-stars {
      margin-bottom: 15px;
    }
    
    .comment-input {
      margin: 15px 0;
    }
    
    .tag-section {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
      
      .tag-item {
        cursor: pointer;
      }
    }
    
    .comments-list {
      margin-top: 20px;
      
      .comment-item {
        margin-bottom: 15px;
        
        .comment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          
          .user-info {
            display: flex;
            align-items: center;
            gap: 10px;
          }
        }
        
        .comment-tags {
          display: flex;
          gap: 5px;
          margin-top: 10px;
        }
      }
    }
  }
  
  .recommendations {
    .recommendation-item {
      margin-bottom: 15px;
      cursor: pointer;
      
      .recommendation-content {
        h3 {
          margin-bottom: 10px;
        }
        
        p {
          color: #666;
          margin-top: 10px;
        }
      }
    }
  }
  
  .discussion-section {
    margin-top: 20px;
    
    .start-discussion {
      width: 100%;
    }
  }
}
</style>