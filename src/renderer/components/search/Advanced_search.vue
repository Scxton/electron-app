<template>
  <div class="search-container">
    <!-- 搜索框区域 -->
    <div class="search-box">
      <el-input
        v-model="searchForm.keyword"
        placeholder="请输入检索关键词"
        class="search-input"
        clearable
        @input="handleInputChange">
        <template #prefix>
          <el-radio-group v-model="searchForm.searchType" size="small">
            <el-radio-button label="fuzzy">模糊查询</el-radio-button>
            <el-radio-button label="exact">精确查询</el-radio-button>
          </el-radio-group>
        </template>
        <template #append>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>检索
          </el-button>
        </template>
      </el-input>
    </div>

    <!-- 热门推荐 -->
    <div class="hot-words">
      <span class="label">热门推荐：</span>
      <el-tag
        v-for="tag in hotWords"
        :key="tag"
        class="hot-tag"
        @click="handleHotWordClick(tag)"
        :effect="searchForm.keyword === tag ? 'dark' : 'plain'">
        {{ tag }}
      </el-tag>
    </div>

    <!-- 筛选条件区域 -->
    <div class="filter-section">
      <el-form :model="searchForm" label-width="100px">
        <!-- 成果类型 -->
        <el-form-item label="成果类型：">
          <el-checkbox-group v-model="searchForm.types">
            <el-checkbox label="paper">论文</el-checkbox>
            <el-checkbox label="patent">专利</el-checkbox>
            <el-checkbox label="project">项目</el-checkbox>
            <el-checkbox label="report">报告</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <!-- 发布时间 -->
        <el-form-item label="发布时间：">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :shortcuts="dateShortcuts">
          </el-date-picker>
        </el-form-item>

        <!-- 来源机构 -->
        <el-form-item label="来源机构：">
          <el-select
            v-model="searchForm.organizations"
            multiple
            collapse-tags
            collapse-tags-tooltip
            placeholder="请选择来源机构">
            <el-option-group label="机构类型">
              <el-option label="高校" value="university"></el-option>
              <el-option label="研究所" value="institute"></el-option>
              <el-option label="机关" value="government"></el-option>
            </el-option-group>
          </el-select>
        </el-form-item>

        <!-- 关联路径 -->
        <el-form-item label="关联路径：">
          <el-cascader
            v-model="searchForm.path"
            :options="pathOptions"
            :props="{ multiple: true }"
            placeholder="请选择关联路径"
            clearable>
          </el-cascader>
        </el-form-item>
      </el-form>

      <!-- 操作按钮 -->
      <div class="filter-actions">
        <el-button @click="resetForm">
          <el-icon><RefreshLeft /></el-icon>清空条件
        </el-button>
      </div>
    </div>

    <!-- 已选条件展示 -->
    <div v-if="hasSelectedFilters" class="selected-filters">
      <span class="label">已选条件：</span>
      <el-tag
        v-if="searchForm.keyword"
        closable
        @close="clearKeyword">
        关键词：{{ searchForm.keyword }}
      </el-tag>
      <el-tag
        v-for="type in searchForm.types"
        :key="type"
        closable
        @close="removeType(type)">
        类型：{{ getTypeLabel(type) }}
      </el-tag>
      <el-tag
        v-if="searchForm.dateRange.length"
        closable
        @close="clearDateRange">
        时间：{{ formatDateRange }}
      </el-tag>
      <el-tag
        v-for="org in searchForm.organizations"
        :key="org"
        closable
        @close="removeOrganization(org)">
        机构：{{ getOrgLabel(org) }}
      </el-tag>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search, RefreshLeft } from '@element-plus/icons-vue'
import { fuzzySearchAchievements, preciseSearchAchievements } from '../../api/search';
const router = useRouter()

// 热门关键词
const hotWords = ['计算', '后端', '深度学习', '软件可重构', '硬件可重组']

// 搜索表单数据
const searchForm = reactive({
  keyword: '',
  searchType: 'fuzzy',
  types: [],
  dateRange: [],
  organizations: [],
  path: []
})

// 关联路径选项
const pathOptions = [
  {
    label: '作者',
    value: 'author',
    children: [
      { label: '论文', value: 'paper' },
      { label: '专利', value: 'patent' }
    ]
  },
  {
    label: '机构',
    value: 'organization',
    children: [
      { label: '项目', value: 'project' },
      { label: '成果', value: 'achievement' }
    ]
  }
]

// 日期快捷选项
const dateShortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '最近一月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  }
]

// 计算已选条件
const hasSelectedFilters = computed(() => {
  return searchForm.keyword || 
         searchForm.types.length > 0 || 
         searchForm.dateRange.length > 0 || 
         searchForm.organizations.length > 0
})

// 格式化日期范围显示
const formatDateRange = computed(() => {
  if (!searchForm.dateRange.length) return ''
  const start = searchForm.dateRange[0].toISOString().split('T')[0]
  const end = searchForm.dateRange[1].toISOString().split('T')[0]
  return `${start} 至 ${end}`
})

// 获取类型标签
const getTypeLabel = (type) => {
  const typeMap = {
    paper: '论文',
    patent: '专利',
    project: '项目',
    report: '报告'
  }
  return typeMap[type] || type
}

// 获取机构标签
const getOrgLabel = (org) => {
  const orgMap = {
    university: '高校',
    institute: '研究所',
    government: '机关'
  }
  return orgMap[org] || org
}

// 输入变化处理
const handleInputChange = (value) => {
  // 这里可以实现输入联想功能
}

// 热门词点击
const handleHotWordClick = (word) => {
  searchForm.keyword = word
  handleSearch()
}

// 处理搜索
const handleSearch = () => {
  console.groupCollapsed('[Advanced Search] 开始处理搜索请求')
  try {
    console.debug('原始表单数据:', JSON.parse(JSON.stringify(searchForm)))
    
    // 构建搜索配置
    const searchConfig = {
      keyword: searchForm.keyword,
      searchType: searchForm.searchType || 'fuzzy', // 默认模糊查询
      types: searchForm.types,
      dateRange: searchForm.dateRange.map(date => {
        const isoDate = date.toISOString()
        console.log(`转换日期: ${date} → ${isoDate}`)
        return isoDate
      }),
      organizations: searchForm.organizations,
      path: searchForm.path
    }

    console.debug('构建的搜索配置:', searchConfig)
    const queryString = JSON.stringify(searchConfig)
    console.log('生成的查询字符串:', queryString)

    router.push({
      path: '/home/basicSearch/',
      query: { advanced: queryString }
    })

    console.log('[Advanced Search] 路由跳转完成')
  } catch (error) {
    console.error('[Advanced Search] 处理搜索时发生错误:', error)
  } finally {
    console.groupEnd()
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(searchForm, {
    keyword: '',
    searchType: 'fuzzy',
    types: [],
    dateRange: [],
    organizations: [],
    path: []
  })
}

// 清除已选条件
const clearKeyword = () => searchForm.keyword = ''
const clearDateRange = () => searchForm.dateRange = []
const removeType = (type) => {
  const index = searchForm.types.indexOf(type)
  if (index > -1) searchForm.types.splice(index, 1)
}
const removeOrganization = (org) => {
  const index = searchForm.organizations.indexOf(org)
  if (index > -1) searchForm.organizations.splice(index, 1)
}
</script>

<style lang="css" scoped>
.search-container {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.search-box {
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
}

.hot-words {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.label {
  color: #606266;
  margin-right: 10px;
}

.hot-tag {
  margin: 0 8px 8px 0;
  cursor: pointer;
}

.filter-section {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 4px;
  margin-bottom: 20px;
}

.filter-actions {
  margin-top: 20px;
  text-align: right;
}

.selected-filters {
  margin-top: 20px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

:deep(.el-tag) {
  margin-right: 8px;
}

@media (max-width: 768px) {
  .search-container {
    padding: 10px;
  }

  .filter-section {
    padding: 10px;
  }
}
</style>