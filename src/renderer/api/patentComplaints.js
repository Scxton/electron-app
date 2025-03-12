//投诉相关接口
import request from "../http/request";

// 提交投诉
export const submitComplaint = (complaintData) => {
  console.log('[API]开始提交投诉请求:', complaintData)
  return request({
    url: '/patentComplaints/insertComplaint',
    method: 'post',
    data: complaintData

    // data: {
    //   ...complaintData,
    //   complaintProcess: 0, // 默认为未受理状态
    //   tableStatus: true
    // }
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
