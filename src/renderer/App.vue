<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>


<script setup>

import { onMounted } from 'vue';
import { logoutTest } from './api/logout';

// const { ipcRenderer } = window.electron;

// ipcRenderer.send('user-login', localStorage.getItem('userId'),localStorage.getItem('username'))

// onMounted(() => {
//   ipcRenderer.on('logout-before-close', async () => {
//     console.log('收到主进程的注销请求')

//     // 请求后端登出接口
//     // 通知主进程可以退出
//     ipcRenderer.send('logout-finished')
//   })
// })

// export default {
//   name: 'App',
//   components: {
//     // Home,
//     // Login
//   },

// }


// onMounted(() => {

// })

// onBeforeUnmount(() => {
//   window.removeEventListener('beforeunload', handleLogoutBeforeUnload)
// })

// function handleLogoutBeforeUnload() {
//   const userName = localStorage.getItem('userName') || ''
//   if (userName) {
//     navigator.sendBeacon('/auth/logout', new URLSearchParams({ userName }))
//   }
// }

// onMounted(() => {
  // console.log('electron preload API:', window.electron)
  // if (window.electron?.receive) {
  //   window.electron.receive('app-close', async () => {
  //     const userId = localStorage.getItem('userId');
  //     const userName = localStorage.getItem('username')
  //     logoutTest(userId, userName)
  //     window.electron.send('force-close')
  //   })
  // } else {
  //   console.warn('window.electron.receive 不存在')
  // }
// })

</script>



<style>
/* @import url('./assets/css/'); */
* {
  padding: 0;
  margin: 0;
}

html,
body,
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  width: 100%;
  height: 100%;
}
</style>