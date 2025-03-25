import request from '../http/request'
import fileDownload from 'js-file-download'
import axios from 'axios'
import { getToken } from '../http/token'
export function getPendingWorks() {
  return request({
    method: 'get',
    url: '/achievementTable/queryAll',
    mock: false
  })
}

export function submitAudit(operationId, approvalId) {
  console.log('Sending audit request with params:', { operationId, approvalId })
  return request({
    url: '/achievement/AuditComplete',
    method: 'post',
    params: {  // 使用params而不是data，因为后端使用@RequestParam
      operationId,
      approvalId
    }
  })
}

export function getUnauditedAchievements(pageNum = 1, pageSize = 10) {
  console.log('【API】Fetching unaudited achievements - Page:', pageNum, 'Size:', pageSize)
  return request({
    url: '/approvalRecords/queryAllWithPaginationForApproval',
    method: 'get',
    params: {
      pageNum,
      pageSize
    }
  }).then(response => {
    console.log('【API】Unaudited achievements response:', response)
    return response
  }).catch(error => {
    console.error('【API】Error fetching unaudited achievements:', error)
    throw error
  })
}

export function downloadAuditFile(fileName) {
  console.log('【API】Downloading audit file:', fileName)
  axios({
    url: 'http://localhost:8082/achievement/downloadtoAudit',
    method: 'post',
    params: { fileName },
    responseType: 'blob',  // 确保设置响应类型为blob
    headers: {
      'Accept': 'application/octet-stream',  // 添加Accept头
      // 'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization' : "Bearer " + getToken('token')
    }
  })
  .then(response => {
    fileDownload(response.data, fileName)
    console.log('【API】Audit file download successful:', fileName)
    console.log('[api]', response.data)
    return response.data
  }, error => {
    console.log('错误', error.message)
  })
}

export function getAllApprovalRecords() {
  console.log('【API】Fetching all approval records')
  return request({
    url: '/approvalRecords/queryAll',
    method: 'get'
  }).then(response => {
    console.log('【API】All approval records response:', response)
    return response
  }).catch(error => {
    console.error('【API】Error fetching all approval records:', error)
    throw error
  })
}

export function getAllApprovalRecordsWithPagination(pageNum = 1, pageSize = 10) {
  console.log('【API】Fetching all approval records with pagination - Page:', pageNum, 'Size:', pageSize)
  return request({
    url: '/approvalRecords/queryAllWithPagination',
    method: 'get',
    params: {
      pageNum,
      pageSize
    }
  }).then(response => {
    console.log('【API】All approval records with pagination response:', response)
    return response
  }).catch(error => {
    console.error('【API】Error fetching all approval records with pagination:', error)
    throw error
  })
}