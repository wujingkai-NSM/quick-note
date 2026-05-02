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

declare global {
  interface Window {
    quickNote: {
      note: {
        create: (content: string) => Promise<CommandResult>;
        append: (content: string) => Promise<CommandResult>;
        update: (noteId: string, content: string) => Promise<CommandResult>;
        delete: (noteId: string) => Promise<CommandResult>;
        rename: (title: string) => Promise<CommandResult>;
        list: (limit?: number) => Promise<ListResult>;
        search: (keyword: string) => Promise<SearchResult>;
        count: () => Promise<number>;
      };
      app: {
        export: () => Promise<CommandResult>;
        import: () => Promise<CommandResult>;
        openDataDir: () => Promise<{ success: boolean }>;
        getNotes: () => Promise<Note[]>;
        showList: () => void;
        showHelp: () => void;
        showMain: () => void;
        resizeListWindow: (height: number) => void;
        resizeMainWindow: (height: number) => void;
        setNoteContent: (noteId: string, content: string) => void;
        onBlur: (callback: () => void) => () => void;
        onShowListPage: (callback: () => void) => () => void;
        onShowHelpPage: (callback: () => void) => () => void;
        onShowMainPage: (callback: () => void) => () => void;
        minimize: () => void;
      };
    };
  }
}
