<template>
  <div class="search-container">
    <!-- 搜索区域 -->
    <div class="search-header">
      <div class="search-box">
        <i class="fas fa-search search-icon"></i>
        <input 
          v-model="searchQuery" 
          class="search-input" 
          type="text" 
          placeholder="请输入搜索关键词"
          @keyup.enter="handleSearch"
        >
        <button class="search-button" @click="handleSearch">
          <span>搜索</span>
        </button>
      </div>
      
      <!-- 近期搜索记录 -->
      <div class="recent-searches" v-if="recentSearches.length">
        <span class="label">近期搜索：</span>
        <div class="search-tags">
          <el-tag
            v-for="search in recentSearches"
            :key="search"
            size="small"
            @click="searchQuery = search; handleSearch()"
          >
            {{ search }}
          </el-tag>
        </div>
      </div>
    </div>

    <!-- 首页推荐板块 -->
    <div class="dashboard" v-if="!searchResults.length && !selectedAchievement">
      <div class="dashboard-grid">
        <!-- 成果分类 -->
        <div class="dashboard-card categories">
          <div class="card-header">
            <i class="fas fa-th-large"></i>
            <h2>成果分类</h2>
          </div>
          <ul class="categories-list">
            <li v-for="category in categories" :key="category.name" 
                @click="handleCategoryClick(category)">
              <div class="category-icon">
                <i :class="category.icon"></i>
              </div>
              <div class="content">
                <span class="name">{{ category.displayName }}</span>
                <span class="count"><i class="fas fa-file-alt"></i> {{ category.count }}</span>
              </div>
            </li>
          </ul>
        </div>

        <!-- 技术分类 -->
        <div class="dashboard-card categories tech-categories">
          <div class="card-header">
            <i class="fas fa-code"></i>
            <h2>技术分类</h2>
          </div>
          <ul class="categories-list">
            <li v-for="tech in techCategories" :key="tech.name" 
                @click="handleTechCategoryClick(tech)">
              <div class="category-icon">
                <i :class="tech.icon"></i>
              </div>
              <div class="content">
                <span class="name">{{ tech.displayName }}</span>
                <span class="count"><i class="fas fa-file-code"></i> {{ tech.count }}</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 搜索结果或详情展示区域 -->
    <div v-if="!selectedAchievement" class="search-results" v-show="searchResults.length">
      <div class="results-header">
        <span class="result-count">找到 {{ searchResults.length }} 个结果</span>
        <div class="sort-container">
          <span class="sort-label">排序方式</span>
          <select v-model="sortBy" class="sort-select">
            <option value="newest">最新</option>
            <option value="relevance">相关度</option>
            <option value="views">浏览量</option>
          </select>
        </div>
      </div>

      <!-- 搜索结果列表 -->
      <div class="results-list">
        <div v-for="result in searchResults" 
             :key="result.id" 
             class="result-item"
             @click="showAchievementDetail(result)">
          <h3 class="result-title">{{ result.title }}</h3>
          <p class="result-description">{{ result.description }}</p>
          <div class="result-meta">
            <span class="meta-item">
              <i class="far fa-user"></i>
              {{ result.author }}
            </span>
            <span class="meta-item">
              <i class="far fa-calendar-alt"></i>
              {{ result.date }}
            </span>
            <span class="meta-item">
              <i class="far fa-eye"></i>
              {{ result.views }} 次浏览
            </span>
            <span class="meta-item">
              <el-rate v-model="result.rating" disabled show-score />
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 成果详情组件 -->
    <achievement-detail
      v-if="selectedAchievement"
      :achievement="selectedAchievement"
      @back="selectedAchievement = null"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AchievementDetail from './AchievementDetail.vue'
import { SearchsubjectAchievements } from  '../../api/search'

const searchQuery = ref('')
const searchResults = ref([])
const sortBy = ref('newest')
const selectedAchievement = ref(null)
const router = useRouter()

// 新增的响应式数据
const recentSearches = ref(['深度学习', '图像识别', '目标检测'])
const categories = ref([
  { name: 'theory', displayName: '理论', icon: 'fas fa-brain', count: '156', id: 1 },
  { name: 'system', displayName: '系统', icon: 'fas fa-cogs', count: '238', id: 2 },
  { name: 'application', displayName: '应用', icon: 'fas fa-mobile-alt', count: '342', id: 3 },
  { name: 'integration', displayName: '集成', icon: 'fas fa-puzzle-piece', count: '185', id: 4 },
  { name: 'evaluation', displayName: '试验评估', icon: 'fas fa-clipboard-check', count: '127', id: 5 }
])

// 修改技术分类数据
const techCategories = ref([
  { name: 'frontend', displayName: '前端', icon: 'fas fa-desktop', count: '245', id: 1 },
  { name: 'backend', displayName: '后端', icon: 'fas fa-server', count: '312', id: 2 },
  { name: 'framework', displayName: '框架', icon: 'fas fa-cubes', count: '178', id: 3 },
  { name: 'computing', displayName: '计算', icon: 'fas fa-microchip', count: '203', id: 4 },
  { name: 'communication', displayName: '通信', icon: 'fas fa-network-wired', count: '167', id: 5 },
  { name: 'testing', displayName: '测试', icon: 'fas fa-vial', count: '145', id: 6 }
])

// 修改搜索处理函数
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    // 添加到最近搜索
    if (!recentSearches.value.includes(searchQuery.value)) {
      recentSearches.value.unshift(searchQuery.value)
      if (recentSearches.value.length > 5) {
        recentSearches.value.pop()
      }
    }
    
    // 跳转到搜索页面并传递搜索参数
    router.push({
      path: '/home/basicSearch',
      query: {
        advanced: JSON.stringify({
          keyword: searchQuery.value,
          searchType: 'fuzzy',
          types: []
        })
      }
    })
  } else {
    // 如果搜索框为空，仍然显示原有的搜索结果
    searchResults.value = [
      {
        id: 1,
        title: '基于深度学习的智能识别系统',
        description: '这是一个创新性的研究成果，主要应用于计算机视觉领域。该系统采用最新的深度学习算法，能够实现高精度的图像识别和分类。',
        author: '张三',
        date: '2024-03-15',
        views: 1234,
        rating: 4.5
      },
      {
        id: 2,
        title: '智能图像分割系统',
        description: '基于深度学习的图像分割技术，可用于医疗影像分析。',
        author: '李四',
        date: '2024-03-14',
        views: 890,
        rating: 4.2
      },
      // ... 更多搜索结果
    ]
  }
}

const showAchievementDetail = (achievement) => {
  selectedAchievement.value = achievement
}

// 修改分类点击处理函数
const handleCategoryClick = async (category) => {
  try {
    console.log('开始处理分类点击:', category)
    
    // 构造搜索参数
    const searchParams = {
      keyword: '', // 空关键词
      searchType: 'fuzzy',
      categorytypes: [category.name], // 使用分类名称
      dateRange: [],
      organizations: [],
      path: []
    }
    
    console.log('准备跳转，搜索参数:', searchParams)
    
    // 使用 router 跳转到 basic_search 页面
    router.push({
      path: '/home/basicSearch',
      query: {
        advanced: JSON.stringify(searchParams)
      }
    })
    
  } catch (error) {
    console.error('处理分类点击失败:', error)
  }
}

// 添加技术分类点击处理函数
const handleTechCategoryClick = async (tech) => {
  try {
    console.log('开始处理技术分类点击:', tech)
    
    // 构造搜索参数，使用 types 参数传递技术分类
    const searchParams = {
      keyword: '', // 空关键词
      searchType: 'fuzzy',
      technologytypes: [tech.name], // 使用技术分类名称
      dateRange: [],
      organizations: [],
      path: []
    }
    
    console.log('准备跳转，技术分类搜索参数:', searchParams)
    
    // 使用 router 跳转到 basic_search 页面
    router.push({
      path: '/home/basicSearch',
      query: {
        advanced: JSON.stringify(searchParams)
      }
    })
    
  } catch (error) {
    console.error('处理技术分类点击失败:', error)
  }
}

onMounted(() => {
  // 初始化数据
})
</script>

<style lang="scss" scoped>
.search-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  
  @media (max-width: 1440px) {
    padding: 1.5rem;
  }
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
}

.search-header {
  margin-bottom: 2rem;
}

.search-box {
  position: relative;
  display: flex;
  max-width: 800px;
  margin: 0 auto;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  background: white;
  
  @media (max-width: 768px) {
    flex-direction: column;
    
    .search-input {
      border-radius: 12px;
      margin-bottom: 1rem;
    }
    
    .search-button {
      width: 100%;
      border-radius: 12px;
    }
  }
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}

.search-input {
  flex: 1;
  padding: 16px 16px 16px 45px;
  border: 2px solid transparent;
  border-radius: 12px 0 0 12px;
  font-size: 16px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #4a90e2;
  }
}

.search-button {
  padding: 0 30px;
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  color: white;
  border: none;
  border-radius: 0 12px 12px 0;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, #357abd 0%, #2868a9 100%);
  }
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.result-item {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.result-title {
  color: #2c3e50;
  margin-bottom: 0.8rem;
}

.result-description {
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.6;
}

.result-meta {
  display: flex;
  gap: 1.5rem;
  color: #888;
  font-size: 0.9rem;

  .meta-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
}

.sort-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.sort-select {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #4a90e2;
  }
}

.recent-searches {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;

  .label {
    color: #666;
  }

  .search-tags {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    
    .search-tags {
      margin-top: 0.5rem;
    }
  }
}

.dashboard {
  margin-top: 2rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;  // 增加卡片之间的间距
}

.dashboard-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.1);
  }

  .card-header {
    display: flex;
    align-items: center;
    margin-bottom: 1.5rem;
    gap: 0.8rem;

    i {
      font-size: 1.4rem;
    }

    h2 {
      margin: 0;
      font-size: 1.3rem;
      font-weight: 600;
      color: #2c3e50;
    }
  }
}

// 成果分类样式
.categories {
  .card-header i {
    color: #4a90e2;
  }

  .categories-list {
    list-style: none;
    padding: 0;

    li {
      display: flex;
      align-items: center;
      padding: 1rem;
      margin-bottom: 0.8rem;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
      border: 1px solid #eee;

      &:hover {
        background-color: #f8f9fa;
        transform: translateX(5px);
        border-color: #4a90e2;
      }
    }

    .category-icon {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      background: #f0f7ff;
      margin-right: 1rem;
      color: #4a90e2;
      font-size: 1.2rem;
    }

    .content {
      flex: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .name {
        font-size: 1.1rem;
        color: #2c3e50;
        font-weight: 500;
      }

      .count {
        color: #666;
        font-size: 0.9rem;
        i { 
          margin-right: 0.5rem;
          color: #4a90e2;
        }
      }
    }
  }
}

// 技术分类特定样式
.tech-categories {
  .card-header i {
    color: #42b883;  // 使用不同的主题色
  }

  .categories-list {
    .category-icon {
      background: #f0fff4;  // 更改图标背景色
      color: #42b883;      // 更改图标颜色
    }

    li:hover {
      border-color: #42b883;  // 更改悬停边框颜色
    }

    .count i {
      color: #42b883;  // 更改计数图标颜色
    }
  }
}

// 添加暗色模式支持（可选）
@media (prefers-color-scheme: dark) {
  .dashboard-card {
    background: #1a1a1a;
    
    h2, h3 {
      color: #fff;
    }
    
    p {
      color: #ccc;
    }
  }
  
  .search-input {
    background: #1a1a1a;
    color: #fff;
    
    &::placeholder {
      color: #666;
    }
  }
  
 
}
</style> 

//按成果类别查询成果，但是按技术类别查询失败
//各种查询成功