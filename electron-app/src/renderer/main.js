import { createApp } from 'vue'
import App from './App.vue'
// 全局样式
// import '@renderer/common/styles/frame.styl'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import router from './router'

const app = createApp(App)
app.use(router) //注册路由
app.use(ElementPlus)
app.use(ElementPlus, {
    locale: zhCn
})
app.mount('#app')