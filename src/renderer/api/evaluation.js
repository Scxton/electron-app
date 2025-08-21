import request from '../http/request'

/**
 * 评价和互动API模块
 * 处理成果评价、评分、互动相关的所有API请求
 */

/**
 * 提交评价
 * @param {Object} evaluation 评价数据
 * @returns {Promise} 提交结果
 */
export const submitEvaluation = (evaluation) => {
  return request({
    url: '/api/evaluation/submit',
    method: 'post',
    data: evaluation
  })
}

/**
 * 获取成果的评价列表
 * @param {number} achievementId 成果ID
 * @param {number} pageNum 页码
 * @param {number} pageSize 每页数量
 * @returns {Promise} 评价列表
 */
export const getAchievementEvaluations = (achievementId, pageNum = 1, pageSize = 10) => {
  return request({
    url: `/api/evaluation/achievement/${achievementId}`,
    method: 'get',
    params: { pageNum, pageSize }
  })
}

/**
 * 获取我的评价
 * @param {number} pageNum 页码
 * @param {number} pageSize 每页数量
 * @returns {Promise} 我的评价列表
 */
export const getMyEvaluations = (pageNum = 1, pageSize = 10) => {
  return request({
    url: '/api/evaluation/my-evaluations',
    method: 'get',
    params: { pageNum, pageSize }
  })
}

/**
 * 更新评价
 * @param {number} evaluationId 评价ID
 * @param {Object} evaluation 更新数据
 * @returns {Promise} 更新结果
 */
export const updateEvaluation = (evaluationId, evaluation) => {
  return request({
    url: `/api/evaluation/update/${evaluationId}`,
    method: 'put',
    data: evaluation
  })
}

/**
 * 删除评价
 * @param {number} evaluationId 评价ID
 * @returns {Promise} 删除结果
 */
export const deleteEvaluation = (evaluationId) => {
  return request({
    url: `/api/evaluation/delete/${evaluationId}`,
    method: 'delete'
  })
}

/**
 * 获取评价统计
 * @param {number} achievementId 成果ID
 * @returns {Promise} 评价统计信息
 */
export const getEvaluationStatistics = (achievementId) => {
  return request({
    url: `/api/evaluation/statistics/${achievementId}`,
    method: 'get'
  })
}