import request from "../http/request";
import { ElMessage } from 'element-plus';

// 调试函数
const logApiCall = (action, data, response) => {
  console.group(`API Call: ${action}`);
  console.log('Request:', data);
  console.log('Response:', response);
  console.groupEnd();
};

// 根据ID获取日志记录
export function getLogById(id) {
  return request({
    url: '/logRecords/queryById',
    method: 'get',
    params: { id }
  }).then(response => {
    logApiCall('getLogById', { id }, response);
    return response;
  }).catch(error => {
    console.error('API Error - getLogById:', error);
    throw error;
  });
}

// 添加日志记录
export function addLog(data) {
    console.log("api data",data)
  return request({
    url: '/logRecords/add',
    method: 'post',
    data: data
  }).then(response => {
    logApiCall('addLog', data, response);
    return response;
  }).catch(error => {
    console.error('API Error - addLog:', error);
    throw error;
  });
}

// 更新日志记录
export function updateLog(data) {
  return request({
    url: '/logRecords/edit',
    method: 'put',
    data: data
  }).then(response => {
    logApiCall('updateLog', data, response);
    return response;
  }).catch(error => {
    console.error('API Error - updateLog:', error);
    throw error;
  });
}

// 删除日志记录
export function deleteLog(id) {
  return request({
    url: '/logRecords/delete',
    method: 'get',
    params: { id }
  }).then(response => {
    logApiCall('deleteLog', { id }, response);
    return response;
  }).catch(error => {
    console.error('API Error - deleteLog:', error);
    throw error;
  });
}

// 获取所有日志记录
export function queryAllLogs() {
  return request({
    url: '/logRecords/queryAll',
    method: 'get'
  }).then(response => {
    logApiCall('queryAllLogs', {}, response);
    return response;
  }).catch(error => {
    console.error('API Error - queryAllLogs:', error);
    throw error;
  });
}

// 分页获取日志记录
export function queryAllLogsWithPagination(pageNum = 1, pageSize = 10) {
  return request({
    url: '/logRecords/queryAllWithPagination',
    method: 'get',
    params: { pageNum, pageSize }
  }).then(response => {
    logApiCall('queryAllLogsWithPagination', { pageNum, pageSize }, response);
    return response;
  }).catch(error => {
    console.error('API Error - queryAllLogsWithPagination:', error);
    throw error;
  });
}
