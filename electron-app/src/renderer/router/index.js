import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  // 精确匹配 #/login，指向Login页面
  {
    path: '/login',
    name: 'Login',
    hidden: true,
    component: () => import('@renderer/views/login/Login.vue')
  },
  {
    path: '/',
    redirect: '/login',
    hidden: true,
    component: () => import('@renderer/views/login/Login.vue')
  },
  // 未匹配，则跳转至Login页面
  { path: '/:pathMatch(.*)', redirect: '/login', hidden: true },
  {
    path: '/home',
    name: '系统首页',
    component: () => import('@renderer/views/home/Home.vue'),
    iconClass: 'fa fa-users',
    children: [
      {
      path: '/home/dash',
      name: '监控中心',
      iconClass: 'fa fa-line-chart',
      component: () => import('@renderer/components/dash/Dashboard.vue')
    },
    {
      path: '/home/data',
      name: '统计数据',
      iconClass: 'fa fa-line-chart',
      component: () => import('@renderer/components/dash/Data.vue')
    }]
  },
  {
    path: '/template',
    name: '成果模板',
    iconClass: 'fa fa-bar-chart',
    component: () => import('@renderer/views/home/Home.vue'),
    children: [
      {
        path: '/home/template',
        name: '模板上传',
        iconClass: 'fa fa-line-chart',
        component: () => import('@renderer/components/templates/Upload.vue')
      },
      {
        path: '/home/templateInfo',
        name: '模板信息',
        iconClass: 'fa fa-line-chart',
        component: () => import('@renderer/components/templates/TemplateInfo.vue')
      }]
  },
  {
    path: '/propertyService',
    name: '产权服务',
    iconClass: 'fa fa-bar-chart',
    component: () => import('@renderer/views/home/Home.vue'),
    children: [
      {
        path: '/home/propertyService1',
        name: '投诉信息',
        iconClass: 'fa fa-line-chart',
        component: () => import('@renderer/components/propertyService/Complaint.vue')
      },
      {
        path: '/home/propertyService2',
        name: '受理情况',
        iconClass: 'fa fa-line-chart',
        component: () => import('@renderer/components/propertyService/Manual.vue')
      },
      {
        path: '/home/propertyService3',
        name: '产权信息',
        iconClass: 'fa fa-line-chart',
        component: () => import('@renderer/components/propertyService/Properties.vue')
      }]
  },
  {
    path: '/achievements',
    name: '成果信息',
    iconClass: 'fa fa-wrench',
    component: () => import('@renderer/views/home/Home.vue'),
    children: [
      {
        path: '/home/achievements',
        name: '成果信息',
        iconClass: 'fa fa-wrench',
        component: () => import('@renderer/components/achievements/AchieveInfo.vue')
      }]
  },
  {
    path: '/approval',
    name: '审批管理',
    iconClass: 'fa fa-user',
    component: () => import('@renderer/views/home/Home.vue'),
    children: [{
      path: '/home/approval',
      name: '成果审批',
      iconClass: 'fa fa-user',
      component: () => import('@renderer/components/approval/Approvals.vue')
    }]
  },
  {
    path: '/users',
    name: '用户中心',
    iconClass: 'fa fa-user',
    component: () => import('@renderer/views/home/Home.vue'),
    children: [
      {
        path: '/home/user',
        name: '权限管理',
        iconClass: 'fa fa-user',
        component: () => import('@renderer/components/users/User.vue')
      }
    ]
  },
  {
    path: '/company',
    name: '平台单位',
    iconClass: 'fa fa-wrench',
    component: () => import('@renderer/views/home/Home.vue'),
    children: [
      {
        path: '/home/company',
        name: '单位信息',
        iconClass: 'fa fa-wrench',
        component: () => import('@renderer/components/company/CompanyInfo.vue')
      }]
  },
  {
    path: '/datasave',
    name: '数据备份',
    iconClass: 'fa fa-wrench',
    component: () => import('@renderer/views/home/Home.vue'),
    children: [
      {
        path: '/home/datasave',
        name: '数据备份',
        iconClass: 'fa fa-wrench',
        component: () => import('@renderer/components/datasave/Save.vue')
      },
      {
        path: '/home/deleteRecords',
        name: '数据恢复',
        iconClass: 'fa fa-wrench',
        component: () => import('@renderer/components/datasave/DeleteRecords.vue')
      }]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
