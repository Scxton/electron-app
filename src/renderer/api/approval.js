import request from '../http/request'

/**
 * 成果审核API模块
 * 处理成果审核相关的所有API请求
 */

/**
 * 获取待审核列表
 * @param {Object} params 查询参数
 * @returns {Promise} 待审核列表
 */
export const getPendingApprovals = (params) => {
  return request({
    url: '/api/achievement/approval/pending',
    method: 'get',
    params
  })
}

/**
 * 获取审核统计信息
 * @returns {Promise} 审核统计信息
 */
export const getApprovalStatistics = () => {
  return request({
    url: '/api/achievement/approval/statistics',
    method: 'get'
  })
}

/**
 * 获取审核详情
 * @param {number} achievementId 成果ID
 * @returns {Promise} 审核详情
 */
export const getApprovalDetail = (achievementId) => {
  return request({
    url: `/api/achievement/approval/detail/${achievementId}`,
    method: 'get'
  })
}

/**
 * 审核通过
 * @param {number} achievementId 成果ID
 * @returns {Promise} 审核结果
 */
export const approveAchievement = (achievementId) => {
  return request({
    url: `/api/achievement/approval/approve/${achievementId}`,
    method: 'post'
  })
}

/**
 * 审核拒绝
 * @param {Object} params 拒绝参数
 * @returns {Promise} 审核结果
 */
export const rejectAchievement = (params) => {
  return request({
    url: '/api/achievement/approval/reject',
    method: 'post',
    data: params
  })
}

/**
 * 批量审核通过
 * @param {Array} achievementIds 成果ID数组
 * @returns {Promise} 批量审核结果
 */
export const batchApprove = (achievementIds) => {
  return request({
    url: '/api/achievement/approval/batch-approve',
    method: 'post',
    data: achievementIds
  })
}

/**
 * 获取审核历史
 * @param {number} achievementId 成果ID
 * @returns {Promise} 审核历史
 */
export const getAuditHistory = (achievementId) => {
  return request({
    url: `/api/achievement/approval/history/${achievementId}`,
    method: 'get'
  })
}

/**
 * 获取我的审核记录
 * @param {Object} params 查询参数
 * @returns {Promise} 审核记录
 */
export const getMyAuditHistory = (params) => {
  return request({
    url: '/api/achievement/approval/my-history',
    method: 'get',
    params
  })
}

/**
 * 获取审核状态
 * @param {number} achievementId 成果ID
 * @returns {Promise} 审核状态
 */
export const getAuditStatus = (achievementId) => {
  return request({
    url: `/api/achievement/approval/status/${achievementId}`,
    method: 'get'
  })
}