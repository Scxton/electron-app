import request from "../http/request";
import fileDownload from 'js-file-download'
import axios from 'axios'
import { getToken } from '../http/token'
//查询所有模板数据
export function queryAll() {
    return request({
        method: 'get',
        url: '/achievementCheckTemplate/queryAll',
        params: {
            
        },
        mock: false
    })
}

//根据成果ID删除数据库中的成果条目
export function deleteItem(id) {
    return request({
        method: 'get',
        url: '/achievementCheckTemplate/delete',
        params: {
            "id": id
        },
        mock: false
    })
}

//分页查询所有模板数据
export function queryAllWithPagination(pageNum, pageSize) {
    return request({
        method: 'get',
        url: '/achievementCheckTemplate/queryAllWithPagination',
        params: {
            "pageNum": pageNum,
            "pageSize": pageSize
        },
        mock: false
    })
}

// Add template to database
export function addTemplate(templateData) {
    return request({
        method: 'post',
        url: '/achievementCheckTemplate/add',
        data: templateData,
        mock: false
    })
}
export const updateTemplate = (template) => {
    return request({
      url: '/achievementCheckTemplate/edit',
      method: 'post',
      data: template
    })
  }

export function Upload_template(formData) {
    return request({
        url: '/template/upload',
        method: 'post',
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

// 提交下载表单
export function submitDownload(templateId, userId) {
  console.log('【api】提交模板下载表单，参数：', { templateId, userId });
  
  return request({
    url: '/template/downloadPage',
    method: 'post',
    params: {
      templateId,
      userId
    }
  }).then(response => {
    console.log('【api】模板下载表单提交成功：', response);
    return response;
  }).catch(error => {
    console.error('【api】模板下载表单提交失败：', error);
    throw error;
  });
}

// 下载模板文件
export function downloadTemplateFile(fileName) {
  console.log('【api】开始下载模板文件，文件名：', fileName);
  
  return axios({
    url: 'http://localhost:8082/template/download',
    method: 'post',
    params: {
      fileName: fileName
    },
    responseType: 'blob',
    headers: {
      'Accept': 'application/octet-stream',
      'Authorization': "Bearer " + getToken('token')
    },
    timeout: 60000
  }).then(response => {
    fileDownload(response.data, fileName);
    console.log('【API】Template file download successful:', fileName);
    return response.data;
  }).catch(error => {
    console.error('【API】Template download failed:', error);
    throw error;
  });
}

