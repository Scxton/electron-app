import request from "../http/request";
import { ElMessage } from 'element-plus';

// 调试函数
const logApiCall = (action, data, response) => {
  console.group(`API Call: ${action}`);
  console.log('Request:', data);
  console.log('Response:', response);
  console.groupEnd();
};

// 获取所有公司信息
export function getAllCompanies() {
  return request({
    url: '/organizationInfo/queryAll',
    method: 'get'
  }).then(response => {
    logApiCall('getAllCompanies', null, response);
    return response;
  }).catch(error => {
    console.error('API Error - getAllCompanies:', error);
    throw error;
  });
}

// 根据ID获取公司信息
export function getCompanyById(id) {
  return request({
    url: '/organizationInfo/queryById',
    method: 'get',
    params: { id }
  }).then(response => {
    logApiCall('getCompanyById', { id }, response);
    return response;
  }).catch(error => {
    console.error('API Error - getCompanyById:', error);
    throw error;
  });
}

// 添加公司信息
export function addCompany(data) {
  // 转换为后端需要的格式
  const apiData = {
    organizationId: data.id,
    organizationName: data.name,
    organizationProjectCount: data.projectCount,
    organizationProjectTotalCount: data.achievementCount,
    organizationAddress: data.address,
    organizationPhone: data.phone,
    contactsName:data.contactName,
    contactsPhone:data.contactPhone,
    tableStatus: true
  };
  
  return request({ 
    url: '/organizationInfo/add',
    method: 'post',
    data: apiData
  }).then(response => {
    logApiCall('addCompany', apiData, response);
    return response;
  }).catch(error => {
    console.error('API Error - addCompany:', error);
    throw error;
  });
}

// 更新公司信息
export function updateCompany(data) {
  // 转换为后端需要的格式
  const apiData = {
    organizationId: data.id,
    organizationName: data.name,
    organizationProjectCount: data.projectCount,
    organizationProjectTotalCount: data.achievementCount,
    organizationAddress: data.address,
    organizationPhone: data.phone,
    contactsName:data.contactName,
    contactsPhone:data.contactPhone,
    tableStatus: true
  };
  
  return request({
    url: '/organizationInfo/edit',
    method: 'post',
    data: apiData
  }).then(response => {
    logApiCall('updateCompany', apiData, response);
    return response;
  }).catch(error => {
    console.error('API Error - updateCompany:', error);
    throw error;
  });
}

// 删除公司信息
export function deleteCompany(id) {
  return request({
    url: '/organizationInfo/delete',
    method: 'get',
    params: { id }
  }).then(response => {
    logApiCall('deleteCompany', { id }, response);
    return response;
  }).catch(error => {
    console.error('API Error - deleteCompany:', error);
    throw error;
  });
}

export function fuzzySearchAchievements(searchBody) {

  // console.log('[API] 发送模糊搜索请求:', {
  //   url: '/achievementTable/fuzzyQuery',
  //   searchBody: searchBody
  // })
  return request({
    url: '/achievementTable/fuzzyQuery',
    method: 'post',
    data: searchBody
  })
}

// 获取所有下载记录
export function getAllDownloadRecords() {
  return request({
    url: '/downloadRecords/queryAll',
    method: 'get'
  }).then(response => {
    logApiCall('getAllDownloadRecords', null, response);
    return response;
  }).catch(error => {
    console.error('API Error - getAllDownloadRecords:', error);
    throw error;
  });
}

// 根据机构ID获取项目数量
export function countProjectsByOrganizationId(organizationId) {
  console.log('[API] 发送获取项目数量请求:', {
    url: '/countProjectsByOrganizationId',
    params: { organizationId }
  })
  return request({
    url: '/projectRecords/countProjectsByOrganizationId',
    method: 'get',
    params:  {organizationId} 
  }).then(response => {
    logApiCall('countProjectsByOrganizationId', { organizationId }, response);
    return response;
  }).catch(error => {
    console.error('API Error - countProjectsByOrganizationId:', error);
    throw error;
  });
}  

// 根据机构ID获取成果数量
export function countAchievementsByOrganizationId(organizationId) {
  return request({
    url: '/projectRecords/countAchievementsByOrganizationId',
    method: 'get',
    params: { organizationId }
  }).then(response => {
    logApiCall('countAchievementsByOrganizationId', { organizationId }, response);
    return response;
  }).catch(error => {
    console.error('API Error - countAchievementsByOrganizationId:', error);
    throw error;
  });
}
    