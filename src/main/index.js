import { app, shell, BrowserWindow, ipcMain, globalShortcut, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { getElectronVersion } from './version'


// const { ipcMain, shell } = require('electron')
const fs = require('fs')
const path = require('path')
const { net } = require('electron')

// 处理文件下载请求 

function createWindow() {
    // server.listen(PORT, () => {
    //     console.log(`Server is running on http://localhost:${PORT}`)
    // })

    const mainWindow = new BrowserWindow({
        width: 900,
        height: 670,
        
        show: false,
        icon,
        webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            sandbox: false,
            nodeIntegration: true,
            webSecurity: false,
            devTools: true
        }
    })
    //隐藏菜单栏
    mainWindow.setMenu(null)

    mainWindow.on('ready-to-show', () => {
        mainWindow.show()
    })

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

    app.on('window-all-closed', () => {
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