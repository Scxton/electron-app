<template>
  <div class="home">
    <Header />
    <el-container class="content">
      <Menu />
      <el-container>
        <el-main>
          <el-breadcrumb>
            <Breadcrumb />
          </el-breadcrumb>
          <!-- <div class="cont"></div> -->
          <router-view></router-view>
        </el-main>
        <el-footer>
          <Footer />
        </el-footer>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'
//import { gotoPath } from '@renderer/api'
import { ElMessageBox } from 'element-plus'
import Header from '../../components/common/Header.vue'
import Footer from '../../components/common/Footer.vue'
import Menu from '../../components/common/Menu.vue'
import Breadcrumb from '../../components/common/Breadcrumb.vue'

export default {
  components: {
    Header,
    Footer,
    Menu,
    Breadcrumb
  },
  data() {
    return {}
  }
}
// router钩子，返回路由器实例
// const router = useRouter()

// const { ipcRenderer } = window.electron

// 登录
// const goto = (path) => {
//     router.push('path')
// }

// 读取目录文件列表
// const readDir = () => {
//     // 给主进程发送消息
//     ipcRenderer.send('readDir', { msg: 'test' })
//     // 通过preload接收主进程的回调信息
//     window.api.readDirReply((event, result) => {
//         if (!result.canceled) {
//             console.log(result)
//         } else {
//             console.log('取消选择操作。')
//         }
//     })
// }

// 获取Electron版本号 - 给主进程发送消息并异步等待结果
// const getElectronVersion = () => {
//     ipcRenderer.invoke('getElectronVersion').then((result) => {
//         ElMessageBox.alert(result, 'Electron版本号', {
//             confirmButtonText: 'OK'
//         })
//     })
// }
</script>

<style scoped lang="scss">
.home {
  width: 100%;
  height: 100%;

  .content {
    position: absolute;
    width: 100%;
    top: 60px;
    bottom: 0;

    .cont {
      margin: 20px 0;
    }
  }
}
</style>
