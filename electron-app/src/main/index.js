import { app, shell, BrowserWindow, ipcMain, globalShortcut, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { getElectronVersion } from './version'




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

