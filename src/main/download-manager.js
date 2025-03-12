const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const downloadManager = require('electron-download-manager');
const { v4: uuidv4 } = require('uuid');

// 下载项目列表
let downloadItems = [];

// 初始化下载管理器
function initDownloadManager() {
  // 设置下载管理器选项
  downloadManager.register({
    downloadFolder: path.join(app.getPath('downloads'), 'app-downloads')
  });

  // 监听下载开始事件
  downloadManager.on('download-started', (info) => {
    console.log('下载开始:', info);
    const newItem = {
      id: info.id || uuidv4(),
      url: info.url,
      filename: info.filename,
      path: info.path,
      state: 'progressing',
      percent: 0,
      totalBytes: 0,
      receivedBytes: 0,
      speed: 0,
      startTime: Date.now()
    };
    
    downloadItems.push(newItem);
    broadcastDownloadUpdate();
  });

  // 监听下载进度事件
  downloadManager.on('download-progress', (info) => {
    const item = downloadItems.find(i => i.id === info.id);
    if (item) {
      item.state = 'progressing';
      item.percent = info.percent;
      item.totalBytes = info.totalBytes;
      item.receivedBytes = info.receivedBytes;
      
      // 计算下载速度 (bytes/second)
      const elapsedTime = (Date.now() - item.startTime) / 1000; // 转换为秒
      if (elapsedTime > 0) {
        item.speed = item.receivedBytes / elapsedTime;
      }
      
      broadcastDownloadUpdate();
    }
  });

  // 监听下载完成事件
  downloadManager.on('download-completed', (info) => {
    const item = downloadItems.find(i => i.id === info.id);
    if (item) {
      item.state = 'completed';
      item.percent = 100;
      item.speed = 0;
      broadcastDownloadUpdate();
    }
  });

  // 监听下载失败事件
  downloadManager.on('download-failed', (info) => {
    const item = downloadItems.find(i => i.id === info.id);
    if (item) {
      item.state = 'failed';
      item.speed = 0;
      broadcastDownloadUpdate();
    }
  });

  // 设置IPC事件处理
  setupIpcHandlers();
}

// 设置IPC事件处理
function setupIpcHandlers() {
  // 确保下载目录存在
  ipcMain.handle('ensure-download-directory', async (event, dirPath) => {
    try {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`创建下载目录: ${dirPath}`);
      }
      return dirPath;
    } catch (error) {
      console.error('创建下载目录失败:', error);
      // 如果创建失败，返回默认下载目录
      const defaultPath = path.join(app.getPath('downloads'), 'app-downloads');
      if (!fs.existsSync(defaultPath)) {
        fs.mkdirSync(defaultPath, { recursive: true });
      }
      return defaultPath;
    }
  });

  // 选择下载目录
  ipcMain.handle('select-download-directory', async (event) => {
    const mainWindow = BrowserWindow.getFocusedWindow();
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      title: '选择下载目录'
    });
    return result;
  });

  // 开始下载
  ipcMain.on('start-downloads', (event, data) => {
    const { files, path: downloadPath, batchMode } = data;
    
    // 设置下载目录
    downloadManager.setOptions({
      downloadFolder: downloadPath
    });
    
    // 开始下载所有文件
    files.forEach(filename => {
      // 构建下载URL (根据你的API调整)
      const downloadUrl = `${getApiBaseUrl()}/download/${encodeURIComponent(filename)}`;
      
      downloadManager.download({
        url: downloadUrl,
        filename: filename,
        onProgress: (progress) => {
          console.log(`下载进度 ${filename}: ${progress}%`);
        }
      });
    });
  });

  // 获取下载列表
  ipcMain.on('get-downloads', (event) => {
    event.sender.send('download-updated', downloadItems);
  });

  // 暂停所有下载
  ipcMain.on('download-pause-all', (event) => {
    downloadItems.forEach(item => {
      if (item.state === 'progressing') {
        item.state = 'interrupted';
        downloadManager.pause(item.id);
      }
    });
    broadcastDownloadUpdate();
  });

  // 恢复所有下载
  ipcMain.on('download-resume-all', (event) => {
    downloadItems.forEach(item => {
      if (item.state === 'interrupted') {
        item.state = 'progressing';
        downloadManager.resume(item.id);
      }
    });
    broadcastDownloadUpdate();
  });

  // 清除已完成的下载
  ipcMain.on('download-clear-completed', (event) => {
    downloadItems = downloadItems.filter(item => 
      item.state !== 'completed' && item.state !== 'cancelled' && item.state !== 'failed'
    );
    broadcastDownloadUpdate();
  });

  // 暂停单个下载
  ipcMain.on('download-pause', (event, id) => {
    const item = downloadItems.find(i => i.id === id);
    if (item && item.state === 'progressing') {
      item.state = 'interrupted';
      downloadManager.pause(id);
      broadcastDownloadUpdate();
    }
  });

  // 恢复单个下载
  ipcMain.on('download-resume', (event, id) => {
    const item = downloadItems.find(i => i.id === id);
    if (item && item.state === 'interrupted') {
      item.state = 'progressing';
      downloadManager.resume(id);
      broadcastDownloadUpdate();
    }
  });

  // 移除单个下载
  ipcMain.on('download-remove', (event, id) => {
    const index = downloadItems.findIndex(i => i.id === id);
    if (index !== -1) {
      downloadManager.cancel(id);
      downloadItems.splice(index, 1);
      broadcastDownloadUpdate();
    }
  });
}

// 广播下载更新
function broadcastDownloadUpdate() {
  const windows = BrowserWindow.getAllWindows();
  windows.forEach(window => {
    if (!window.isDestroyed()) {
      window.webContents.send('download-updated', downloadItems);
    }
  });
}

// 获取API基础URL
function getApiBaseUrl() {
  // 根据你的环境配置返回适当的API URL
  return process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000/api'
    : 'https://your-production-api.com/api';
}

module.exports = {
  initDownloadManager
}; 