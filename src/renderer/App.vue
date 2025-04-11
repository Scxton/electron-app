<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>


<script setup>

import { onMounted } from 'vue';
import { logoutTest } from './api/logout';

// onMounted(() => {
  // ipcRenderer.on('force-close', () => {
  // const userName = localStorage.getItem('userName')
  // if (userName) {
  //   navigator.sendBeacon('http://localhost:8007/auth/logout', new URLSearchParams({ userName }))
  // }

//   window.electron.receive('app-close', async () => {
//     const userName = localStorage.getItem('userName')

//     if (userName) {
//       try {
//         // 用 fetch 而不是 navigator.sendBeacon 以保证兼容性
//         await fetch('http://localhost:8007/auth/logout', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/x-www-form-urlencoded'
//           },
//           body: new URLSearchParams({ userName })
//         })
//       } catch (err) {
//         console.error('注销请求失败:', err)
//       }
//     }
//     ipcRenderer.send('force-close')
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
//   console.log('electron preload API:', window.electron)
//   if (window.electron?.receive) {
//     window.electron.receive('app-close', async () => {
//       const userId = localStorage.getItem('userId');
//       const userName = localStorage.getItem('username')
//       logoutTest(userId, userName)
//       window.electron.send('force-close')
//     })
//   } else {
//     console.warn('window.electron.receive 不存在')
//   }
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