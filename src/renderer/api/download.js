import request from "../http/request";
import fileDownload from 'js-file-download'
import axios from 'axios'
import { getToken } from '../http/token'
// 提交下载表单
export function submitDownloadForm(achievementIds, userId) {
  console.log('【api】提交下载表单，参数：', { achievementIds, userId });
  // console.log('achievementIds类型:', Array.isArray(achievementIds) ? 'Array' : typeof achievementIds);
  
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
export function downloadAchievements(fileNames, achievementIds = [], downloadPath = '') {
  console.log('【api】开始下载成果文件，文件名：', fileNames);
  
  // 如果fileNames是数组，转换为逗号分隔的字符串
  const fileNamesStr = Array.isArray(fileNames) ? fileNames.join(',') : fileNames;
  
  // 将下载任务添加到全局事件或本地存储
  // addDownloadTask(fileNames, achievementIds);
  
  console.log('【api】下载请求参数 fileNames:', fileNamesStr);
  console.log('【api】下载请求参数类型:', typeof fileNamesStr);
  let progress = 0;
  return axios({
    url: 'http://localhost:8082/achievement/download',
    method: 'post',
    params: {
      fileNames: fileNamesStr,
      downloadPath: downloadPath // 添加下载路径参数，后端可以用来保存文件
    },
    responseType: 'blob', // 指定响应类型为blob

    // onDownloadProgress: (progressEvent) => {
    //   progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
    // },
    headers: {
      'Accept': 'application/octet-stream',  // 添加Accept头
      // 'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization' : "Bearer " + getToken('token')
    },
    timeout: 60000 // 增加超时时间到60秒
  }).then(response => {
    // 后端直接返回文件内容，这里只需检查响应是否为blob类型
    console.log('【API】成功获取文件内容:', fileNames);
    console.log('【API】下载进度:', progress);
    // 更新下载任务状态为成功
    // updateDownloadTaskStatus(fileNames, true);
    
    return response.data;
  }, error => {
    console.log('错误', error.message);
    
    // 更新下载任务状态为失败
    // updateDownloadTaskStatus(fileNames, false);
    
    throw error;
  });
}

// 添加新的下载任务到本地存储
function addDownloadTask(fileNames, achievementIds) {
  let files = Array.isArray(fileNames) ? fileNames : [fileNames];
  let ids = Array.isArray(achievementIds) ? achievementIds : [achievementIds];
  
  // 确保achievementIds与fileNames长度匹配
  if (ids.length < files.length) {
    // 如果achievementIds不足，用文件名代替
    ids = files.map((file, index) => ids[index] || file);
  }
  
  const activeTasks = JSON.parse(localStorage.getItem('activeTasks') || '[]');
  
  // 为每个文件创建下载任务
  files.forEach((fileName, index) => {
    const task = {
      id: Date.now() + index, // 创建唯一ID
      fileName: fileName,
      achievementId: ids[index],
      status: 'downloading',
      startTime: new Date().toISOString(),
      progress: 0
    };
    
    activeTasks.push(task);
  });
  
  localStorage.setItem('activeTasks', JSON.stringify(activeTasks));
  
  // 触发自定义事件，通知Download.vue有新的下载任务
  const event = new CustomEvent('download-tasks-updated');
  window.dispatchEvent(event);
}

// 更新下载任务状态
function updateDownloadTaskStatus(fileNames, isSuccess) {
  let files = Array.isArray(fileNames) ? fileNames : [fileNames];
  const activeTasks = JSON.parse(localStorage.getItem('activeTasks') || '[]');
  let updated = false;
  
  // 更新状态
  files.forEach(fileName => {
    const taskIndex = activeTasks.findIndex(task => task.fileName === fileName);
    if (taskIndex !== -1) {
      activeTasks[taskIndex].status = isSuccess ? 'completed' : 'error';
      activeTasks[taskIndex].progress = isSuccess ? 100 : 0;
      activeTasks[taskIndex].endTime = new Date().toISOString();
      updated = true;
    }
  });
  
  if (updated) {
    localStorage.setItem('activeTasks', JSON.stringify(activeTasks));
    
    // 触发自定义事件，通知Download.vue有下载任务状态更新
    const event = new CustomEvent('download-tasks-updated');
    window.dispatchEvent(event);
  }
}

// 分页查询下载历史记录
export function queryDownloadHistory(pageNum = 1, pageSize = 10) {
  console.log('【api】查询下载历史，参数：', { pageNum, pageSize });
  
  return request({
    url: '/downloadRecords/queryAllWithPagination',
    method: 'get',
    params: {
      pageNum,
      pageSize
    }
  }).then(response => {
    console.log('【api】下载历史查询成功：', response);
    return response;
  }).catch(error => {
    console.error('【api】下载历史查询失败：', error);
    throw error;
  });
}

// 查询所有下载历史记录（不分页）
export function queryAllDownloadHistory() {
  console.log('【api】查询所有下载历史记录');
  
  return request({
    url: '/downloadRecords/queryAll',
    method: 'get'
  }).then(response => {
    console.log('【api】所有下载历史查询成功：', response);
    return response;
  }).catch(error => {
    console.error('【api】所有下载历史查询失败：', error);
    throw error;
  });
}

// 根据ID删除下载记录
export function deleteDownloadRecordById(id) {
  console.log('【api】删除下载记录，ID：', id);
  
  return request({
    url: '/downloadRecords/delete/id',
    method: 'delete',
    params: {
      id
    }
  }).then(response => {
    console.log('【api】下载记录删除成功：', response);
    return response;
  }).catch(error => {
    console.error('【api】下载记录删除失败：', error);
    throw error;
  });
}

// 删除成果文件
export function deleteAchievementFile(fileName) {
  console.log('【api】开始删除成果文件，文件名：', fileName);
  
  return request({
    url: '/achievement/deletefile',
    method: 'post',
    params: {
      fileName
    }
  }).then(response => {
    console.log('【api】文件删除成功：', response);
    return response;
  }).catch(error => {
    console.error('【api】文件删除失败：', error);
    throw error;
  });
}
