import request from "../http/request";
import fileDownload from 'js-file-download'
import axios from 'axios'
import { getToken } from '../http/token'
// 提交下载表单
export function submitDownloadForm(achievementIds, userId) {
  console.log('【api】提交下载表单，参数：', { achievementIds, userId });
  console.log('achievementIds类型:', Array.isArray(achievementIds) ? 'Array' : typeof achievementIds);
  
  // 将数组转换为逗号分隔的字符串
  const achievementIdsStr = Array.isArray(achievementIds) ? achievementIds.join(',') : achievementIds;
  
  return request({
    url: '/achievement/downloadPage',
    method: 'post',
    params: {
      achievementIds: achievementIdsStr,
      userId
    }
  }).then(response => {
    console.log('【api】下载表单提交成功：', response);
    return response;
  }).catch(error => {
    console.error('【api】下载表单提交失败：', error);
    throw error;
  });
}

// 下载单个或多个成果文件
export function downloadAchievements(fileNames) {
  console.log('【api】开始下载成果文件，文件名：', fileNames);
  
  // 如果fileNames是数组，转换为逗号分隔的字符串
  const fileNamesStr = Array.isArray(fileNames) ? fileNames.join(',') : fileNames;
  
  console.log('【api】下载请求参数 fileNames:', fileNamesStr);
  console.log('【api】下载请求参数类型:', typeof fileNamesStr);
  
  axios({
    url: 'http://localhost:8082/achievement/download',
    method: 'post',
    params: {
      fileNames: fileNamesStr
    },
    responseType: 'blob', // 指定响应类型为blob
    headers: {
      'Accept': 'application/octet-stream',  // 添加Accept头
      // 'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization' : "Bearer " + getToken('token')
    },
    timeout: 60000 // 增加超时时间到60秒
  }).then(response => {
    // 后端直接返回文件内容，这里只需检查响应是否为blob类型
    fileDownload(response.data, fileNames)
    console.log('【API】Audit file download successful:', fileNames)
    console.log('[api]', response.data)
    return response.data
  },error => {
    console.log('错误', error.message)
  })
}
