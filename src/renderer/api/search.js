import request from '../http/request'

// Get achievements where audit_flag = 0
export function getAchievements() {
  const achievementTable = {
    auditFlag: 0  // 查询未审核的成果
  }
  console.log('Sending request for search achievements:', achievementTable)
  return request({
    url: '/achievementTable/querybylimit',
    method: 'post',
    data: achievementTable
  })
}

// Get all achievements
export function getAllAchievements() {
  console.log('Sending request for all achievements111111')
  return request({
    url: '/achievementTable/queryAll',
    method: 'get'
  })
}

// Fuzzy search for achievements
export function fuzzySearchAchievements(searchBody) {

  console.log('[API] 发送模糊搜索请求:', {
    url: '/achievementTable/fuzzyQuery',
    searchBody: searchBody
  })
  return request({
    url: '/achievementTable/fuzzyQuery',
    method: 'post',
    data: searchBody
  })
}

// Precise search for achievements
export function preciseSearchAchievements(searchQuery) {
  const achievementTable = {
    achievementName: searchQuery,
    achievementAbstract: searchQuery,
    remarks: searchQuery
  }
  console.log('[API] 发送精确搜索请求:', {
    url: '/achievementTable/querybylimit',
    achievementTable: achievementTable
  })
  return request({
    url: '/achievementTable/querybylimit',
    method: 'post',
    data: achievementTable
  })
}

// Get knowledge graph data
export function getKnowledgeGraph() {
  console.log('[API] 发送知识图谱请求')
  return request({
    url: '/knowledgegraph/getall',
    method: 'get'
  }).then(response => {
    console.log('[API] 知识图谱响应类型:', typeof response)
    console.log('[API] 知识图谱响应是否为数组:', Array.isArray(response))
    if (Array.isArray(response)) {
      console.log('[API] 知识图谱响应数组长度:', response.length)
      if (response.length > 0) {
        console.log('[API] 第一个元素:', response[0])
      }
    }
    
    // 直接返回响应数据，不做额外处理
    return response
  }).catch(error => {
    console.error('[API] 知识图谱请求错误:', error)
    throw error
  })
}

// Get knowledge graph data with filters
export function getKnowledgeGraphWithFilters(filters) {
  console.log('[API] 发送带筛选条件的知识图谱请求:', filters)
  return request({
    url: '/knowledgegraph/getbylimit',
    method: 'post',
    data: filters
  }).then(response => {
    console.log('[API] 带筛选条件的知识图谱响应:', response)
    return response
  }).catch(error => {
    console.error('[API] 带筛选条件的知识图谱请求错误:', error)
    throw error
  })
}

export function SearchtechnologyAchievements(searchBody) {

  console.log('[API] 发送模糊搜索请求:', {
    url: '/achievementTable/fuzzyQuery',
    searchBody: searchBody
  })
  return request({
    url: '/achievementTable/fuzzyQuery',
    method: 'post',
    data: searchBody
  })
}
export function SearchsubjectAchievements(searchBody) {

  console.log('[API] 发送模糊搜索请求:', {
    url: '/achievementTable/fuzzyQuery',
    searchBody: searchBody
  })
  return request({
    url: '/achievementTable/fuzzyQuery',
    method: 'post',
    data: searchBody
  })
}

// Get version history by achievement ID
export function getVersionHistoryById(achievementId) {
  console.log('[API] 发送版本历史查询请求:', {
    url: '/versionHistory/queryByAchievementId',
    params: { achievementId }
  })
  return request({
    url: `/versionHistory/queryByAchievementId`,
    method: 'get',
    params: { achievementId }
  })
}

// Get version history with pagination
export function getVersionHistoryWithPagination(versionHistory, pageNum = 1, pageSize = 10) {
  console.log('[API] 发送分页版本历史查询请求:', {
    url: '/versionHistory/querylimitWithPagination',
    data: versionHistory,
    params: { pageNum, pageSize }
  })
  return request({
    url: '/versionHistory/querylimitWithPagination',
    method: 'post',
    data: versionHistory,
    params: { pageNum, pageSize }
  })
}
