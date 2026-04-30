import { ipcMain, dialog, shell, BrowserWindow } from 'electron';
import { 
  createNote, 
  appendToLastNote, 
  renameLastNote, 
  updateNote,
  listNotes, 
  searchNotes, 
  getNotesCount,
  getDataPath,
  exportData,
  importData
} from './dataManager';
import type { Note } from './types';

const sendNotesChanged = () => {
  BrowserWindow.getAllWindows().forEach(window => {
    window.webContents.send('app:notesChanged');
  });
};

export function setupIpcHandlers(): void {
  ipcMain.handle('note:create', async (_, content: string) => {
    const result = createNote(content);
    if (result.success) sendNotesChanged();
    return result;
  });

  ipcMain.handle('note:append', async (_, content: string) => {
    const result = appendToLastNote(content);
    if (result.success) sendNotesChanged();
    return result;
  });

  ipcMain.handle('note:rename', async (_, newTitle: string) => {
    const result = renameLastNote(newTitle);
    if (result.success) sendNotesChanged();
    return result;
  });

  ipcMain.handle('note:update', async (_, noteId: string, content: string) => {
    const result = updateNote(noteId, content);
    if (result.success) sendNotesChanged();
    return result;
  });

  ipcMain.handle('note:list', async (_, limit?: number) => {
    const notes = listNotes(limit);
    return { success: true, notes };
  });

  ipcMain.handle('note:search', async (_, keyword: string) => {
    const notes = searchNotes(keyword);
    return { success: true, notes };
  });

  ipcMain.handle('note:count', async () => {
    return getNotesCount();
  });

  ipcMain.handle('app:export', async () => {
    const result = await dialog.showSaveDialog({
      title: '导出数据',
      defaultPath: 'quick-note-data.json',
      filters: [{ name: 'JSON Files', extensions: ['json'] }]
    });

    if (!result.canceled && result.filePath) {
      const data = exportData();
      try {
        require('fs').writeFileSync(result.filePath, data, 'utf-8');
        return { success: true, message: '导出成功' };
      } catch {
        return { success: false, message: '导出失败' };
      }
    }

    return { success: false, message: '已取消' };
  });

  ipcMain.handle('app:import', async () => {
    const result = await dialog.showOpenDialog({
      title: '导入数据',
      filters: [{ name: 'JSON Files', extensions: ['json'] }]
    });

    if (!result.canceled && result.filePaths.length > 0) {
      try {
        const content = require('fs').readFileSync(result.filePaths[0], 'utf-8');
        return importData(content);
      } catch {
        return { success: false, message: '读取文件失败' };
      }
    }

    return { success: false, message: '已取消' };
  });

  ipcMain.handle('app:openDataDir', async () => {
    const path = getDataPath();
    await shell.openPath(path);
    return { success: true };
  });

  ipcMain.handle('app:getNotes', async (): Promise<Note[]> => {
    return listNotes();
  });
}
