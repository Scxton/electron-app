//投诉相关接口
import request from "../http/request";
import fileDownload from 'js-file-download'
import axios from 'axios'
import { getToken } from '../http/token'
// 提交投诉（支持文件上传）
export const submitComplaint = (files, complaintData) => {
  console.log('[API]开始提交投诉请求:', { files, complaintData })
  
  const formData = new FormData()
  
  // 添加文件
  files.forEach(file => {
    formData.append('file', file)
  })
  
  // 添加投诉数据（转换为JSON字符串）
  const complaintBlob = new Blob(
    [JSON.stringify(complaintData)],
    { type: 'application/json' }
  )
  formData.append('patentComplaints', complaintBlob)

  return request({
    url: '/patentComplaints/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }).then(response => {
    console.log('[API]投诉请求响应:', response)
    return response
  }).catch(error => {
    console.error('[API]投诉请求失败:', error)
    throw error
  })
}


export function queryAllComplaints() {
  console.log('API调用: queryAllComplaints() - 开始请求所有投诉信息')
  const startTime = performance.now()
  
  return request({
      method: 'get',
      url: '/patentComplaints/queryAll',
      params: {},
      mock: false
  }).then(response => {
      const endTime = performance.now()
      console.log(`API调用: queryAllComplaints() - 完成, 耗时: ${(endTime - startTime).toFixed(2)}ms, 返回记录数: ${response?.data?.length || 0}`)
      return response
  }).catch(error => {
      console.error('API调用: queryAllComplaints() - 失败:', error)
      throw error
  })
}

// 更新投诉状态
export const updateComplaintStatus = (complaintId, status) => {
  console.log('[API]开始更新投诉状态:', { complaintId, status })
  return request({
    url: `/patentComplaints/complaintId`,
    method: 'get',
    params: {
      complaintId,
      status
    }
  }).then(response => {
    console.log('[API]状态更新响应:', response)
    return response
  }).catch(error => {
    console.error('[API]状态更新失败:', error)
    throw error
  })
}



// 下载投诉证明材料
export function downloadComplaintFile(fileName) {
  console.log('[API]开始下载投诉证明材料，文件名：', fileName);
  
  return axios({
    url: 'http://localhost:8082/patentComplaints/download',
    method: 'post',
    params: {
      fileName: fileName
    },
    responseType: 'blob',
    headers: {
      'Accept': 'application/octet-stream',
      'Authorization' : "Bearer " + getToken('token')
    },
    timeout: 60000
  }).then(response => {
    fileDownload(response.data, fileName);
    console.log('[API]投诉证明材料下载成功:', fileName);
    return response.data;
  }).catch(error => {
    console.error('[API]投诉证明材料下载失败:', error);
    throw error;
  });
}

// 根据用户ID查询投诉
export function queryComplaintByUserId(userId) {
  console.log('API调用: queryComplaintByUserId() - 开始请求用户投诉信息，用户ID：', userId)
  const startTime = performance.now()
  
  return request({
      method: 'get',
      url: '/patentComplaints/queryByuserId',
      params: {
          userId
      },
      mock: false
  }).then(response => {
      const endTime = performance.now()
      console.log(`API调用: queryComplaintByUserId() - 完成, 耗时: ${(endTime - startTime).toFixed(2)}ms`)
      return response
  }).catch(error => {
      console.error('API调用: queryComplaintByUserId() - 失败:', error)
      throw error
  })
}

// 根据ID删除投诉
export function deleteComplaintById(complaintId) {
  console.log('API调用: deleteComplaintById() - 开始删除投诉，投诉ID：', complaintId)
  const startTime = performance.now()
  
  return request({
      method: 'get',
      url: '/patentComplaints/deleteById',
      params: {
          complaintId
      },
      mock: false
  }).then(response => {
      const endTime = performance.now()
      console.log(`API调用: deleteComplaintById() - 完成, 耗时: ${(endTime - startTime).toFixed(2)}ms`)
      return response
  }).catch(error => {
      console.error('API调用: deleteComplaintById() - 失败:', error)
      throw error
  })
}
