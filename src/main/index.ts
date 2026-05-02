import { app, shell, BrowserWindow, Tray, nativeImage, Menu, dialog, ipcMain } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';
import { initDataManager } from './dataManager';
import { setupIpcHandlers } from './ipcHandlers';
import { registerShortcut, unregisterShortcut, getShortcut, setMainWindow } from './shortcutManager';

let tray: Tray | null = null;
let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 300,
    height: 44,
    minHeight: 44,
    maxHeight: 600,
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

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
    mainWindow?.focus();
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

  let blurTimeout: ReturnType<typeof setTimeout> | null = null;

  mainWindow.on('blur', () => {
    blurTimeout = setTimeout(() => {
      mainWindow?.hide();
    }, 200);
  });

  mainWindow.on('focus', () => {
    if (blurTimeout) {
      clearTimeout(blurTimeout);
      blurTimeout = null;
    }
  });
}

ipcMain.on('app:showList', () => {
  if (mainWindow) {
    mainWindow.webContents.send('app:showListPage');
    mainWindow.show();
    mainWindow.focus();
  }
});

ipcMain.on('app:showHelp', () => {
  if (mainWindow) {
    mainWindow.webContents.send('app:showHelpPage');
    mainWindow.show();
    mainWindow.focus();
  }
});

ipcMain.on('app:showMain', () => {
  if (mainWindow) {
    mainWindow.webContents.send('app:showMainPage');
    mainWindow.show();
    mainWindow.focus();
  }
});

ipcMain.on('app:setNoteContent', (_, noteId: string, content: string) => {
  mainWindow?.webContents.send('app:noteContent', noteId, content);
});

ipcMain.on('app:resizeListWindow', (_, height: number) => {
  if (mainWindow) {
    const minHeight = 100;
    const maxHeight = 500;
    const actualHeight = Math.max(minHeight, Math.min(maxHeight, height));
    mainWindow.setSize(300, actualHeight);
  }
});

ipcMain.on('app:resizeMainWindow', (_, height: number) => {
  if (mainWindow) {
    const minHeight = 44;
    const maxHeight = 200;
    const actualHeight = Math.max(minHeight, Math.min(maxHeight, height));
    mainWindow.setSize(300, actualHeight);
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
