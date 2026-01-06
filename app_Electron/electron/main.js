const { app, BrowserWindow, ipcMain, globalShortcut, screen, desktopCapturer, clipboard, nativeImage, Tray, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let captureWindow;
let areaSelectWindow;
let tray;

const isDev = !app.isPackaged;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 950,
    minWidth: 800,
    minHeight: 850,
    show: false,
    frame: true,
    transparent: false,
    resizable: true,
    skipTaskbar: false,
    alwaysOnTop: false,
    backgroundColor: '#1e40af',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.setMenu(null);

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const x = Math.floor((width - 900) / 2);
  const y = Math.floor((height - 950) / 2);
  mainWindow.setPosition(x, y);

  mainWindow.on('close', () => {
    app.quit();
  });
}

function createCaptureWindow(sources) {
  const { width, height } = screen.getPrimaryDisplay().bounds;

  captureWindow = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    fullscreen: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  if (isDev) {
    captureWindow.loadURL('http://localhost:5173/capture.html');
  } else {
    captureWindow.loadFile(path.join(__dirname, '../dist/capture.html'));
  }

  captureWindow.once('ready-to-show', () => {
    captureWindow.webContents.send('sources-ready', sources);
  });

  captureWindow.on('closed', () => {
    captureWindow = null;
  });
}

function createAreaSelectWindow() {
  const { width, height } = screen.getPrimaryDisplay().bounds;

  areaSelectWindow = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
    frame: false,
    transparent: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    fullscreen: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  if (isDev) {
    areaSelectWindow.loadURL('http://localhost:5173/areaselect.html');
  } else {
    areaSelectWindow.loadFile(path.join(__dirname, '../dist/areaselect.html'));
  }

  areaSelectWindow.on('closed', () => {
    areaSelectWindow = null;
  });
}

function createTray() {
  const iconPath = isDev 
    ? path.join(__dirname, '../public/tray-icon.png')
    : path.join(process.resourcesPath, 'tray-icon.png');

  const icon = fs.existsSync(iconPath) 
    ? nativeImage.createFromPath(iconPath)
    : nativeImage.createEmpty();

  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Capture Screenshot',
      click: () => {
        startCapture();
      },
      accelerator: 'CommandOrControl+Shift+S'
    },
    {
      label: 'Quick Capture',
      click: () => {
        quickCapture();
      },
      accelerator: 'CommandOrControl+Shift+A'
    },
    { type: 'separator' },
    {
      label: 'Settings',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setToolTip('Snipt - Screenshot Tool');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.minimize();
      } else {
        mainWindow.show();
      }
    }
  });
}

async function ensureMainWindowMinimized() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }

  if (!mainWindow.isMinimized()) {
    mainWindow.minimize();
  }

  // Wait for the minimize event or a short timeout to ensure it is fully gone
  await new Promise((resolve) => {
    let settled = false;
    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve();
      }
    }, 300);

    const onMinimize = () => {
      if (!settled) {
        settled = true;
        clearTimeout(timeout);
        resolve();
      }
    };

    mainWindow.once('minimize', onMinimize);
  });
}

function restoreMainWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }
  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }
  mainWindow.show();
  mainWindow.focus();
}

async function startCapture() {
  try {
    await ensureMainWindowMinimized();

    const sources = await desktopCapturer.getSources({
      types: ['screen', 'window'],
      thumbnailSize: { width: 1920, height: 1080 }
    });

    if (sources.length > 0) {
      createCaptureWindow(sources);
    }
  } catch (error) {
    console.error('Failed to get sources:', error);
  }
}

async function quickCapture() {
  try {
    await ensureMainWindowMinimized();

    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: screen.getPrimaryDisplay().size
    });

    if (sources.length > 0) {
      const source = sources[0];
      const image = source.thumbnail.toPNG();
      
      const nImage = nativeImage.createFromBuffer(image);
      clipboard.writeImage(nImage);

      if (mainWindow) {
        mainWindow.webContents.send('notification', {
          message: 'Screenshot copied to clipboard!',
          type: 'success'
        });
        restoreMainWindow();
      }
    }
  } catch (error) {
    console.error('Quick capture failed:', error);
  }
}

async function startAreaSelect() {
  try {
    await ensureMainWindowMinimized();

    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: screen.getPrimaryDisplay().size
    });

    if (sources.length > 0) {
      createAreaSelectWindow();
      
      setTimeout(() => {
        if (areaSelectWindow) {
          const dataUrl = sources[0].thumbnail.toDataURL();
          areaSelectWindow.webContents.send('full-screen-capture', dataUrl);
        }
      }, 100);
    }
  } catch (error) {
    console.error('Area select failed:', error);
  }
}

app.whenReady().then(() => {
  createMainWindow();
  createTray();

  globalShortcut.register('CommandOrControl+Shift+S', () => {
    startCapture();
  });

  globalShortcut.register('CommandOrControl+Shift+A', () => {
    quickCapture();
  });

  setTimeout(() => {
    if (mainWindow) {
      mainWindow.show();
    }
  }, 500);
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

ipcMain.handle('get-sources', async () => {
  const sources = await desktopCapturer.getSources({
    types: ['screen', 'window'],
    thumbnailSize: screen.getPrimaryDisplay().size
  });
  return sources;
});

ipcMain.handle('save-screenshot', async (event, dataUrl, filename) => {
  const { dialog } = require('electron');
  
  const { filePath } = await dialog.showSaveDialog({
    defaultPath: filename,
    filters: [
      { name: 'Images', extensions: ['png'] }
    ]
  });

  if (filePath) {
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync(filePath, base64Data, 'base64');
    return filePath;
  }
  return null;
});

ipcMain.handle('copy-to-clipboard', async (event, dataUrl) => {
  const image = nativeImage.createFromDataURL(dataUrl);
  clipboard.writeImage(image);
  return true;
});

ipcMain.handle('copy-text-to-clipboard', async (event, text) => {
  clipboard.writeText(text);
  return true;
});

ipcMain.on('close-capture', () => {
  if (captureWindow && !captureWindow.isDestroyed()) {
    captureWindow.close();
  }
});

ipcMain.on('show-notification', (event, { message, type }) => {
  if (mainWindow) {
    mainWindow.webContents.send('notification', { message, type });
  }
});

ipcMain.on('hide-main-window', () => {
  ensureMainWindowMinimized();
});

ipcMain.on('show-main-window', () => {
  restoreMainWindow();
});

ipcMain.on('start-capture', () => {
  startCapture();
});

ipcMain.on('start-area-select', () => {
  startAreaSelect();
});

ipcMain.on('close-area-select', () => {
  if (areaSelectWindow) {
    areaSelectWindow.close();
    areaSelectWindow = null;
  }
  restoreMainWindow();
});

ipcMain.on('area-selected', (event, dataUrl) => {
  if (areaSelectWindow) {
    areaSelectWindow.close();
    areaSelectWindow = null;
  }
  restoreMainWindow();
  if (mainWindow) {
    mainWindow.webContents.send('screenshot-captured', dataUrl);
  }
});

ipcMain.on('quick-full-screenshot', async () => {
  try {
    await ensureMainWindowMinimized();

    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: screen.getPrimaryDisplay().size
    });
    
    if (sources.length > 0) {
      const dataUrl = sources[0].thumbnail.toDataURL();
      if (mainWindow) {
        mainWindow.webContents.send('screenshot-captured', dataUrl);
      }
      restoreMainWindow();
    }
  } catch (error) {
    console.error('Error capturing full screenshot:', error);
  }
});
