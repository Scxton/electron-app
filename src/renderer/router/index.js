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
    name: '系统信息',
    component: () => import('@renderer/views/home/Home.vue'),
    redirect: '/home/dash',
    iconClass: 'fa fa-users',
    children: [{
        path: '/home/dash',
        name: '数据中心',
        iconClass: 'fa fa-line-chart',
        component: () => import('@renderer/components/dash/Dashboard.vue')
    }]
  },
  {
    path: '/publish',
    name: '成果上传',
    iconClass: 'fa fa-cloud-upload',
    component: () => import('@renderer/views/home/Home.vue'),  
    children: [
      
      {
        path: '/publish/myAch',
        name: '我的成果',
        iconClass: 'fa fa-upload',
        component: () => import('@renderer/components/publish/My_Ach.vue')
      },
      {
        path: '/publish/myComplaint',
        name: '我的投诉',
        iconClass: 'fa fa-upload',
        component: () => import('@renderer/components/publish/My_Complaint.vue')
      },
      {
        path: '/publish/chooseTemplate',
        name: '模板选择',
        iconClass: 'fa fa-upload',
        component: () => import('@renderer/components/publish/Template.vue')
      },
      {
        path: '/publish/info',
        name: '成果信息',
        iconClass: 'fa fa-upload',
        component: () => import('@renderer/components/publish/Ach_info.vue')
      },
      
      {
        path: '/publish/upload',
        name: '成果选择',
        iconClass: 'fa fa-upload',
        component: () => import('@renderer/components/publish/Upload_test.vue')
      },
      // {
      //   path: '/publish/review',
      //   name: '成果审核',
      //   iconClass: 'fa fa-review',
      //   component: () => import('@renderer/components/publish/review.vue')
      // }
      
      
    ]
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
    path: '/searche',
    name: '成果检索',
    iconClass: 'fa fa-bar-chart',
    component: () => import('@renderer/views/home/Home.vue'),
    children: [
      {
        path: '/home/basicSearch',
        name: '基础检索',
        iconClass: 'fa fa-line-chart',
        component: () => import('@renderer/components/search/Basic_search.vue')
      },
      {
        path: '/home/advancedSearch',
        name: '高级检索',
        iconClass: 'fa fa-line-chart',
        component: () => import('@renderer/components/search/Advanced_search.vue')
      },
      {
        path: '/home/KnowledgeGraph',
        name: '知识图谱',
        iconClass: 'fa fa-line-chart',
        // component: () => import('@renderer/components/search/Knowledge_graphv2.vue')
        component: () => import('@renderer/components/search/kg.vue')
      },
      {
        path: '/home/User_settings',
        name: '用户设置',
        iconClass: 'fa fa-line-chart',
        component: () => import('@renderer/components/search/User_settings.vue')
      }
    ]
  },
  {
    path: '/application',
    name: '成果应用',
    iconClass: 'fa fa-bar-chart',
    component: () => import('@renderer/views/home/Home.vue'),
    children: [
      {
        path: '/home/download',
        name: '成果下载',
        iconClass: 'fa fa-line-chart',
        component: () => import('@renderer/components/application/Download.vue')
    },
    // {
    //   path: '/home/history',
    //   name: '下载历史',
    //   iconClass: 'fa fa-line-chart',
    //   component: () => import('@renderer/components/application/History.vue')
    // },
    {
      path: '/home/settings',
      name: '应用设置',
      iconClass: 'fa fa-line-chart',
      component: () => import('@renderer/components/application/Settings.vue')
    }
    ]
    
  },
  {
    path: '/interactive',
    name: '成果互动',
    iconClass: 'fa fa-bar-chart',
    component: () => import('@renderer/views/home/Home.vue'),
    children: [
      {
        path: '/home/resultpage',
        name: '成果结果页',
        iconClass: 'fa fa-line-chart',
        component: () => import('@renderer/components/interactive/SearchAndInteractive.vue')
      },
      {
        path: '/home/achievementDetail',
        name: '成果详情页',
        iconClass: 'fa fa-line-chart',
        component: () => import('@renderer/components/interactive/AchievementDetail.vue')
      }
    ]
  },

  // {
  //   path: '/propertyService',
  //   name: '产权服务',
  //   iconClass: 'fa fa-bar-chart',
  //   component: () => import('@renderer/views/home/Home.vue'),
  //   children: [
  //     {
  //       path: '/home/propertyService1',
  //       name: '投诉信息',
  //       iconClass: 'fa fa-line-chart',
  //       component: () => import('@renderer/components/propertyService/Complaint.vue')
  //     },
  //     {
  //       path: '/home/propertyService2',
  //       name: '受理情况',
  //       iconClass: 'fa fa-line-chart',
  //       component: () => import('@renderer/components/propertyService/Manual.vue')
  //     },
  //     {
  //       path: '/home/propertyService3',
  //       name: '产权信息',
  //       iconClass: 'fa fa-line-chart',
  //       component: () => import('@renderer/components/propertyService/Properties.vue')
  //     }]
  // },
  {
    path: '/achievements',
    name: '成果管理',
    iconClass: 'fa fa-wrench',
    component: () => import('@renderer/views/home/Home.vue'),
    children: [
      {
        path: '/home/projects',
        name: '项目信息表',
        iconClass: 'fa fa-wrench',
        component: () => import('@renderer/components/achievements/project.vue')
      },
      {
        path: '/home/achievements',
        name: '成果信息表',
        iconClass: 'fa fa-wrench',
        component: () => import('@renderer/components/achievements/AchieveInfo.vue')
      }]
  },
  {
    path: '/approval',
    name: '投诉管理',
    iconClass: 'fa fa-user',
    component: () => import('@renderer/views/home/Home.vue'),
    children: [{
      path: '/home/approval',
      name: '投诉信息',
      iconClass: 'fa fa-user',
      component: () => import('@renderer/components/approval/Approvals.vue')
    }]
  },
  {
    path: '/users',
    name: '产权服务',
    iconClass: 'fa fa-user',
    component: () => import('@renderer/views/home/Home.vue'),
    children: [
      {
        path: '/home/user',
        name: '知识产权信息',
        iconClass: 'fa fa-user',
        component: () => import('@renderer/components/users/User.vue')
      },
      // {
      //   path: '/home/user',
      //   name: '用户权限管理',
      //   iconClass: 'fa fa-user',
      //   component: () => import('@renderer/components/users/usrController.vue')
      // }
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
    name: '用户管理',
    iconClass: 'fa fa-wrench',
    component: () => import('@renderer/views/home/Home.vue'),
    children: [
      {
        path: '/home/datasave',
        name: '用户管理',
        iconClass: 'fa fa-wrench',
        component: () => import('@renderer/components/datasave/Save.vue')
      },
      {
        path: '/home/logs',
        name: '系统日志',
        iconClass: 'fa fa-file-text-o',
        component: () => import('@renderer/components/logs/SystemLogs.vue')
      },
      {
        path: '/home/deleteRecords',
        name: '数据恢复',
        iconClass: 'fa fa-wrench',
        component: () => import('@renderer/components/datasave/DeleteRecords.vue')
      }]
  },
  {
    path: '/logs',
    name: '日志管理',
    iconClass: 'fa fa-file-text-o',
    component: () => import('@renderer/views/home/Home.vue'),
    children: [
      {
        path: '/home/logs',
        name: '系统日志',
        iconClass: 'fa fa-file-text-o',
        component: () => import('@renderer/components/logs/SystemLogs.vue')
      }
    ]
  }
]
const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
