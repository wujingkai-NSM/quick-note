import { contextBridge, ipcRenderer } from 'electron';
import type { Note } from '../main/types';

interface CommandResult {
  success: boolean;
  message: string;
  data?: unknown;
}

interface ListResult {
  success: boolean;
  notes: Note[];
}

interface SearchResult {
  success: boolean;
  notes: Note[];
}

const api = {
  note: {
    create: async (content: string): Promise<CommandResult> => {
      return ipcRenderer.invoke('note:create', content);
    },
    append: async (content: string): Promise<CommandResult> => {
      return ipcRenderer.invoke('note:append', content);
    },
    rename: async (newTitle: string): Promise<CommandResult> => {
      return ipcRenderer.invoke('note:rename', newTitle);
    },
    list: async (limit?: number): Promise<ListResult> => {
      return ipcRenderer.invoke('note:list', limit);
    },
    search: async (keyword: string): Promise<SearchResult> => {
      return ipcRenderer.invoke('note:search', keyword);
    },
    count: async (): Promise<number> => {
      return ipcRenderer.invoke('note:count');
    }
  },
  app: {
    export: async (): Promise<CommandResult> => {
      return ipcRenderer.invoke('app:export');
    },
    import: async (): Promise<CommandResult> => {
      return ipcRenderer.invoke('app:import');
    },
    openDataDir: async (): Promise<{ success: boolean }> => {
      return ipcRenderer.invoke('app:openDataDir');
    },
    getNotes: async (): Promise<Note[]> => {
      return ipcRenderer.invoke('app:getNotes');
    },
    showList: () => {
      ipcRenderer.send('app:showList');
    },
    hideList: () => {
      ipcRenderer.send('app:hideList');
    },
    resizeListWindow: (height: number) => {
      ipcRenderer.send('app:resizeListWindow', height);
    },
    resizeMainWindow: (height: number) => {
      ipcRenderer.send('app:resizeMainWindow', height);
    },
    onBlur: (callback: () => void) => {
      ipcRenderer.on('app:blur', callback);
      return () => ipcRenderer.removeListener('app:blur', callback);
    },
    minimize: () => {
      ipcRenderer.send('minimize-window');
    }
  }
};

contextBridge.exposeInMainWorld('quickNote', api);
