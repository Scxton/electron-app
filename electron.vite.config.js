import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin, bytecodePlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin(), bytecodePlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin(), bytecodePlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer'),
        //新加入的内容
        // process: "process/browser",
        // stream: "stream-browserify",
        // zlib: "browserify-zlib",
        // util: 'util'
      }
    },
    plugins: [vue()],
    // optimizeDeps: {
    //   exclude: ['ssh2']
    // }
  }

})
