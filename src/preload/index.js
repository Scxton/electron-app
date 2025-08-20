import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import fileDownload from 'js-file-download';

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
//增加预加载脚本
//给主进程发消息打开文件夹选择对话框，并返回选择的路径（需要接受路径的函数） 定义send函数
const api = {
  send: (channel) => {
    ipcRenderer.send(channel);
  },
  sendmessage: (channel, data) => {
    ipcRenderer.send(channel, data);
  },
  



  receive_folder_path: (callback) => {
    ipcRenderer.once('receive_folder_path_reply', (event, path) => {
      callback(event,path);
    });
  }
}



if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}

// 用于在渲染进程和主进程之间安全地共享数据
// contextBridge.exposeInMainWorld('electron', {
//   send: (channel, data) => {
//     ipcRenderer.send(channel, data);
//   },
//   receive: (channel, func) => {
//     ipcRenderer.on(channel, (event, ...args) => func(...args));
//   }
// });

