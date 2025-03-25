import request from "../http/request";

// 通过ID查询项目记录
export const getProjectById = (id) => {
  return request({
    url: '/projectRecords/queryById',
    method: 'get',
    params: { id }
  });
};

// 添加新项目记录
export const addProject = (projectData) => {
  return request({
    url: '/projectRecords/add',
    method: 'post',
    data: projectData
  });
};

// 编辑项目记录
export const editProject = (projectData) => {
  return request({
    url: '/projectRecords/edit',
    method: 'put',
    data: projectData
  });
};

// 删除项目记录
export const deleteProject = (id) => {
  return request({
    url: '/projectRecords/delete',
    method: 'get',
    params: { id }
  });
};

// 获取所有项目记录
export const getAllProjects = () => {
  return request({
    url: '/projectRecords/queryAll',
    method: 'get'
  });
};

// 分页获取项目记录
export const getProjectsWithPagination = (pageNum = 1, pageSize = 10) => {
  return request({
    url: '/projectRecords/queryAllWithPagination',
    method: 'get',
    params: { pageNum, pageSize }
  });
};



