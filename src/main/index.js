import { app, shell, BrowserWindow, ipcMain, globalShortcut, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { getElectronVersion } from './version'
import { logoutTest } from '../renderer/api/logout'


// const { ipcMain, shell } = require('electron')
const fs = require('fs')
const path = require('path')
const { net } = require('electron')



let mainWindow = null // 🔁 改成 let，允许后续置为 null

export function logoutFromServer(userId, userName) {
  console.log('注销请求参数:', userId, userName)
  return new Promise((resolve, reject) => {
    const request = net.request({
      method: 'POST',
      url: `http://localhost:8007/auth/logout?userId=${userId}&userName=${userName}`,
      headers: {
        'Content-Type': 'application/json',    
        // 'Authorization': "Bearer ${token}"
      }
    })
    // console.log('注销请求参数token:', global.Token)
    // console.log('注销请求:', request)
    
    request.on('response', (response) => {
      console.log('✅ 注销接口响应状态码:', response.statusCode)
      resolve(response.statusCode)
    })

    request.on('error', (err) => {
      console.error('❌ 注销接口请求失败:', err)
      reject(err)
    })

    request.end()
  })
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false,
      devTools: true
    }
  })

  // 隐藏菜单栏
  mainWindow.setMenu(null)

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // 拦截窗口关闭事件，先清除缓存再退出
  // mainWindow.on('close', async (e) => {
  //   e.preventDefault()

  //   try {
  //     const ses = mainWindow.webContents.session
  //     await ses.clearStorageData()
  //     console.log('✅ 清除本地数据成功，准备退出')
  //   } catch (err) {
  //     console.error('❌ 清除本地数据失败:', err)
  //   }

  //   mainWindow.destroy() // 彻底销毁窗口
  //   mainWindow = null
  //   app.quit() // 退出整个程序
  // })

  ipcMain.on('user-login', (e, userName, userId) => {
    global.userName = userName
    global.userId = userId
    // global.Token = Token
    console.log('主进程已接收到用户登录信息:', userName, userId)
  })


  mainWindow.on('close', async (e) => {
    console.log('userID', global.userId)
    e.preventDefault()
    try {
      console.log('用户名：...', global.userName)

      if (global.userId && global.userName) {
        console.log('注销接口将被调用...')
        await logoutFromServer(global.userId, global.userName)
      }
      await mainWindow.webContents.session.clearStorageData()
      console.log('✅ 本地数据已清除')
    } catch (err) {
      console.error('⚠️ 关闭前处理失败:', err)
    }
    mainWindow.destroy()
    app.quit()
  })

  // mainWindow.on('close', async (e) => {
  //   e.preventDefault()
  //   try {
  //     // const logoutUrl = 'http://your-api/logout'

  //     // 使用 Electron 的 net 模块发送注销请求
  //     const { net } = require('electron')

  //     await logoutTest(global.userId, global.userName)

  //     // await new Promise((resolve, reject) => {
  //     //   const request = net.request({
  //     //     method: 'POST',
  //     //     url: logoutUrl,
  //     //     headers: {
  //     //       'Content-Type': 'application/json'
  //     //     }
  //     //   })

  //     // 清除本地数据
  //     await mainWindow.webContents.session.clearStorageData()
  //     console.log('✅ 本地数据已清除')

  //   } catch (err) {
  //     console.error('⚠️ 关闭前处理失败:', err)
  //   }
  //   // 最终退出
  //   mainWindow.destroy()
  //   app.quit()
  // })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  globalShortcut.register('CommandOrControl+Shift+i', function () {
    mainWindow.webContents.openDevTools()
  })

  return mainWindow
}

let myWindow = null
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory, additionalData) => {
    if (myWindow) {
      dialog.showMessageBox({
        message: '此程序已经正在运行'
      })
      if (myWindow.isMinimized()) myWindow.restore()
      myWindow.focus()
    }
  })

  app.whenReady().then(() => {
    electronApp.setAppUserModelId('com.electron')
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })
    myWindow = createWindow()
    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })

  app.on('window-all-closed', (e) => {
    console.log('所有窗口已关闭，准备退出应用')
    if (process.platform !== 'darwin') {

      app.quit()
    }
  })



}

ipcMain.handle('getElectronVersion', getElectronVersion)

ipcMain.handle('download-file', async (event, { fileName, targetPath, url, token }) => {
  try {
    console.log('主进程收到下载请求:', { fileName, targetPath, url })

    // 确保目标目录存在
    if (!fs.existsSync(targetPath)) {
      fs.mkdirSync(targetPath, { recursive: true })
    }

    const filePath = path.join(targetPath, fileName)
    console.log('文件将保存至:', filePath)

    // 使用 Electron 的 net 模块下载文件
    return new Promise((resolve, reject) => {
      const request = net.request({
        method: 'POST',
        url: `${url}?fileName=${encodeURIComponent(fileName)}`,
        headers: {
          'Accept': 'application/octet-stream',
          'Authorization': `Bearer ${token}`
        }
      })

      let data = []

      request.on('response', (response) => {
        console.log('下载响应状态码:', response.statusCode)

        if (response.statusCode !== 200) {
          reject({
            success: false,
            error: `服务器返回错误状态码: ${response.statusCode}`
          })
          return
        }

        response.on('data', (chunk) => {
          data.push(chunk)
        })

        response.on('end', () => {
          try {
            const buffer = Buffer.concat(data)
            fs.writeFileSync(filePath, buffer)
            console.log('文件下载完成并保存')
            resolve({ success: true, path: filePath })
          } catch (err) {
            console.error('保存文件失败:', err)
            reject({ success: false, error: err.message })
          }
        })

        response.on('error', (error) => {
          console.error('下载过程中出错:', error)
          reject({ success: false, error: error.message })
        })
      })

      request.on('error', (error) => {
        console.error('请求出错:', error)
        reject({ success: false, error: error.message })
      })

      request.end()
    })
  } catch (error) {
    console.error('下载文件失败:', error)
    return { success: false, error: error.message }
  }
})

// 处理打开文件夹请求
ipcMain.handle('open-folder', async (event, folderPath) => {
  try {
    await shell.openPath(folderPath)
    return { success: true }
  } catch (error) {
    console.error('打开文件夹失败:', error)
    return { success: false, error: error.message }
  }
})

// 处理选择目录的请求
ipcMain.handle('select-directory', async () => {
  const { dialog } = require('electron')
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  })
  return result
})




// ipcMain.on('force-close', () => {
//   if(myWindow) {
//     myWindow.destory()
//   }
//   // app.quit()
// })


// ipcMain.on('force-close', () => {
//   app.quit()
// })