const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getSources: () => ipcRenderer.invoke('get-sources'),
  saveScreenshot: (dataUrl, filename) => ipcRenderer.invoke('save-screenshot', dataUrl, filename),
  copyToClipboard: (dataUrl) => ipcRenderer.invoke('copy-to-clipboard', dataUrl),
  copyTextToClipboard: (text) => ipcRenderer.invoke('copy-text-to-clipboard', text),
  closeCaptureWindow: () => ipcRenderer.send('close-capture'),
  hideMainWindow: () => ipcRenderer.send('hide-main-window'),
  showMainWindow: () => ipcRenderer.send('show-main-window'),
  showNotification: (message, type) => ipcRenderer.send('show-notification', { message, type }),
  onNotification: (callback) => ipcRenderer.on('notification', (event, data) => callback(data)),
  onSourcesReady: (callback) => ipcRenderer.on('sources-ready', (event, sources) => callback(sources)),
  startCapture: () => ipcRenderer.send('start-capture'),
  startAreaSelect: () => ipcRenderer.send('start-area-select'),
  closeAreaSelect: () => ipcRenderer.send('close-area-select'),
  areaSelected: (dataUrl) => ipcRenderer.send('area-selected', dataUrl),
  onFullScreenCapture: (callback) => ipcRenderer.on('full-screen-capture', (event, dataUrl) => callback(dataUrl)),
  quickFullScreenshot: () => ipcRenderer.send('quick-full-screenshot'),
  onScreenshotCaptured: (callback) => ipcRenderer.on('screenshot-captured', (event, dataUrl) => callback(dataUrl)),
  platform: process.platform
});
