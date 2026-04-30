export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface DataStore {
  version: string;
  notes: Note[];
  lastNoteId: string | null;
}

export interface CommandResult {
  success: boolean;
  message: string;
  data?: unknown;
}

export interface SearchResult {
  notes: Note[];
}

export interface ListResult {
  notes: Note[];
}

export interface CreateNoteParams {
  content: string;
}

export interface AppendNoteParams {
  content: string;
}

export interface RenameNoteParams {
  newTitle: string;
}

export interface SearchParams {
  keyword: string;
}

export interface ListParams {
  limit?: number;
}

export const APP_VERSION = '1.0';

export const DATA_FILE_NAME = 'data.json';

export const DATA_BACKUP_NAME = 'data_backup.json';
