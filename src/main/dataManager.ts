import { app } from 'electron';
import { readFileSync, writeFileSync, existsSync, renameSync, mkdirSync } from 'fs';
import { join } from 'path';
import { Note, DataStore, CommandResult, APP_VERSION, DATA_FILE_NAME, DATA_BACKUP_NAME } from './types';

let dataStore: DataStore;
let dataPath: string;

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function extractTitle(content: string): string {
  const firstLine = content.trim().split('\n')[0];
  if (!firstLine) return '无标题';
  return firstLine.length > 30 ? firstLine.substring(0, 30) + '...' : firstLine;
}

function getDefaultDataStore(): DataStore {
  return {
    version: APP_VERSION,
    notes: [],
    lastNoteId: null
  };
}

export function initDataManager(): void {
  dataPath = join(app.getPath('appData'), 'Quick-Note');
  
  if (!existsSync(dataPath)) {
    mkdirSync(dataPath, { recursive: true });
  }

  const filePath = join(dataPath, DATA_FILE_NAME);
  
  if (!existsSync(filePath)) {
    dataStore = getDefaultDataStore();
    writeFileSync(filePath, JSON.stringify(dataStore, null, 2), 'utf-8');
  } else {
    try {
      const content = readFileSync(filePath, 'utf-8');
      dataStore = JSON.parse(content);
      
      if (dataStore.version !== APP_VERSION) {
        console.warn(`Data version mismatch: expected ${APP_VERSION}, got ${dataStore.version}`);
      }
    } catch {
      handleCorruptedFile(filePath);
    }
  }
}

function handleCorruptedFile(filePath: string): void {
  const backupPath = join(dataPath, DATA_BACKUP_NAME);
  
  if (existsSync(filePath)) {
    renameSync(filePath, backupPath);
  }
  
  dataStore = getDefaultDataStore();
  writeFileSync(filePath, JSON.stringify(dataStore, null, 2), 'utf-8');
  
  console.error('Data file corrupted, restored to default and backed up');
}

export function saveDataStore(): void {
  const filePath = join(dataPath, DATA_FILE_NAME);
  writeFileSync(filePath, JSON.stringify(dataStore, null, 2), 'utf-8');
}

export function createNote(content: string): CommandResult {
  if (!content.trim()) {
    return { success: false, message: '内容不能为空' };
  }

  const note: Note = {
    id: generateId(),
    title: extractTitle(content),
    content: content.trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  dataStore.notes.unshift(note);
  dataStore.lastNoteId = note.id;
  saveDataStore();

  return { success: true, message: '笔记创建成功', data: note };
}

export function appendToLastNote(content: string): CommandResult {
  if (!content.trim()) {
    return { success: false, message: '内容不能为空' };
  }

  if (!dataStore.lastNoteId) {
    return createNote(content);
  }

  const note = dataStore.notes.find(n => n.id === dataStore.lastNoteId);
  
  if (!note) {
    return createNote(content);
  }

  note.content += '\n' + content.trim();
  note.updatedAt = new Date().toISOString();
  saveDataStore();

  return { success: true, message: '内容追加成功', data: note };
}

export function renameLastNote(newTitle: string): CommandResult {
  if (!newTitle.trim()) {
    return { success: false, message: '标题不能为空' };
  }

  if (!dataStore.lastNoteId) {
    return { success: false, message: '没有可重命名的笔记' };
  }

  const note = dataStore.notes.find(n => n.id === dataStore.lastNoteId);
  
  if (!note) {
    return { success: false, message: '笔记不存在' };
  }

  note.title = newTitle.trim();
  note.updatedAt = new Date().toISOString();
  saveDataStore();

  return { success: true, message: '重命名成功', data: note };
}

export function updateNote(noteId: string, content: string): CommandResult {
  if (!content.trim()) {
    return { success: false, message: '内容不能为空' };
  }

  const note = dataStore.notes.find(n => n.id === noteId);
  
  if (!note) {
    return { success: false, message: '笔记不存在' };
  }

  note.content = content.trim();
  note.title = extractTitle(content);
  note.updatedAt = new Date().toISOString();
  dataStore.lastNoteId = noteId;
  saveDataStore();

  return { success: true, message: '笔记更新成功', data: note };
}

export function listNotes(limit: number = 10): Note[] {
  return dataStore.notes.slice(0, limit);
}

export function searchNotes(keyword: string): Note[] {
  if (!keyword.trim()) {
    return [];
  }

  const lowerKeyword = keyword.toLowerCase();
  return dataStore.notes.filter(note => 
    note.title.toLowerCase().includes(lowerKeyword) ||
    note.content.toLowerCase().includes(lowerKeyword)
  ).slice(0, 20);
}

export function getNotesCount(): number {
  return dataStore.notes.length;
}

export function getDataPath(): string {
  return dataPath;
}

export function exportData(): string {
  return JSON.stringify(dataStore, null, 2);
}

export function importData(jsonContent: string): CommandResult {
  try {
    const importedData = JSON.parse(jsonContent) as DataStore;
    
    if (!importedData.version || !importedData.notes) {
      return { success: false, message: '无效的数据格式' };
    }

    if (importedData.version > APP_VERSION) {
      return { success: false, message: '请升级软件后尝试导入' };
    }

    dataStore = importedData;
    saveDataStore();

    return { success: true, message: '数据导入成功' };
  } catch {
    return { success: false, message: '数据解析失败' };
  }
}
