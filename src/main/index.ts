import { app, shell, BrowserWindow, Tray, nativeImage, Menu, dialog, ipcMain } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';
import { initDataManager } from './dataManager';
import { setupIpcHandlers } from './ipcHandlers';
import { registerShortcut, unregisterShortcut, getShortcut, setMainWindow } from './shortcutManager';

let tray: Tray | null = null;
let mainWindow: BrowserWindow | null = null;
let listWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 300,
    height: 40,
    minHeight: 40,
    maxHeight: 300,
    show: false,
    resizable: false,
    frame: false,
    autoHideMenuBar: true,
    alwaysOnTop: true,
    transparent: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  setMainWindow(mainWindow);

  let isWindowReady = false;

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
    mainWindow?.focus();
    isWindowReady = true;
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('close', (event) => {
    event.preventDefault();
    mainWindow?.hide();
  });

  }

function createListWindow(): void {
  if (listWindow) {
    listWindow.show();
    listWindow.focus();
    return;
  }

  listWindow = new BrowserWindow({
    width: 300,
    minHeight: 100,
    maxHeight: 360,
    show: false,
    resizable: false,
    frame: false,
    autoHideMenuBar: true,
    alwaysOnTop: true,
    transparent: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  listWindow.on('ready-to-show', () => {
    listWindow?.show();
    listWindow?.focus();
  });

  listWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    listWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}#list`);
  } else {
    listWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: 'list' });
  }

  listWindow.on('close', (event) => {
    event.preventDefault();
    listWindow?.hide();
  });

  listWindow.on('blur', () => {
    listWindow?.hide();
  });

  listWindow.on('closed', () => {
    listWindow = null;
  });
}

let helpWindow: BrowserWindow | null = null;

function createHelpWindow(): void {
  if (helpWindow) {
    helpWindow.show();
    helpWindow.focus();
    return;
  }

  helpWindow = new BrowserWindow({
    width: 320,
    height: 400,
    show: false,
    resizable: false,
    frame: false,
    autoHideMenuBar: true,
    alwaysOnTop: true,
    transparent: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  helpWindow.on('ready-to-show', () => {
    helpWindow?.show();
    helpWindow?.focus();
  });

  helpWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    helpWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}#help`);
  } else {
    helpWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: 'help' });
  }

  helpWindow.on('close', (event) => {
    event.preventDefault();
    helpWindow?.hide();
  });

  helpWindow.on('blur', () => {
    helpWindow?.hide();
  });

  helpWindow.on('closed', () => {
    helpWindow = null;
  });
}

ipcMain.on('app:showList', () => {
  createListWindow();
});

ipcMain.on('app:showHelp', () => {
  createHelpWindow();
});

ipcMain.on('app:showMain', () => {
  mainWindow?.show();
  mainWindow?.focus();
});

ipcMain.on('app:setNoteContent', (_, noteId: string, content: string) => {
  mainWindow?.webContents.send('app:noteContent', noteId, content);
});

ipcMain.on('app:hideList', () => {
  listWindow?.hide();
});

ipcMain.on('app:resizeListWindow', (_, height: number) => {
  if (listWindow) {
    const minHeight = 100;
    const maxHeight = 360;
    const actualHeight = Math.max(minHeight, Math.min(maxHeight, height));
    listWindow.setSize(300, actualHeight);
  }
});

ipcMain.on('app:resizeMainWindow', (_, height: number) => {
  if (mainWindow) {
    const minHeight = 40;
    const maxHeight = 200;
    const actualHeight = Math.max(minHeight, Math.min(maxHeight, height));
    mainWindow.setSize(400, actualHeight);
  }
});

ipcMain.on('minimize-window', () => {
  mainWindow?.hide();
});

function createTray(): void {
  const trayIcon = nativeImage.createFromPath(join(__dirname, '../../resources/icon.png'));
  tray = new Tray(trayIcon);

  const updateMenu = () => {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: '显示',
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
          }
        }
      },
      {
        label: '设置热键...',
        click: () => {
          dialog.showMessageBox({
            message: `当前热键: ${getShortcut()}\n\n如需修改热键，请编辑配置文件。`,
            type: 'info'
          });
        }
      },
      {
        label: '打开数据目录',
        click: async () => {
          await shell.openPath(join(app.getPath('appData'), 'Quick-Note'));
        }
      },
      {
        type: 'separator' as const
      },
      {
        label: '导出数据',
        click: async () => {
          const result = await dialog.showSaveDialog({
            title: '导出数据',
            defaultPath: 'quick-note-data.json',
            filters: [{ name: 'JSON Files', extensions: ['json'] }]
          });

          if (!result.canceled && result.filePath) {
            const data = require('./dataManager').exportData();
            require('fs').writeFileSync(result.filePath, data, 'utf-8');
            dialog.showMessageBox({ message: '导出成功', type: 'info' });
          }
        }
      },
      {
        label: '导入数据',
        click: async () => {
          const result = await dialog.showOpenDialog({
            title: '导入数据',
            filters: [{ name: 'JSON Files', extensions: ['json'] }]
          });

          if (!result.canceled && result.filePaths.length > 0) {
            try {
              const content = require('fs').readFileSync(result.filePaths[0], 'utf-8');
              const importResult = require('./dataManager').importData(content);
              if (importResult.success) {
                dialog.showMessageBox({ message: '导入成功', type: 'info' });
              } else {
                dialog.showMessageBox({ message: importResult.message, type: 'error' });
              }
            } catch {
              dialog.showMessageBox({ message: '读取文件失败', type: 'error' });
            }
          }
        }
      },
      {
        type: 'separator' as const
      },
      {
        label: '关于',
        click: () => {
          dialog.showMessageBox({
            message: '闪念笔记 v1.0\n\n极速启动、本地优先的全局闪念捕捉工具',
            type: 'info'
          });
        }
      },
      {
        label: '退出',
        click: () => {
          app.quit();
        }
      }
    ]);

    tray?.setContextMenu(contextMenu);
  };

  updateMenu();
  tray.setToolTip('闪念笔记');

  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.quicknote.app');

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  initDataManager();
  setupIpcHandlers();
  
  if (!registerShortcut()) {
    dialog.showMessageBox({
      message: `默认热键 ${getShortcut()} 被占用，请在托盘菜单中设置其他热键`,
      type: 'warning'
    });
  }

  createTray();
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  unregisterShortcut();
  tray?.destroy();
});
