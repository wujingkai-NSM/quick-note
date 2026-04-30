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
        rename: (newTitle: string) => Promise<CommandResult>;
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
        hideList: () => void;
        resizeListWindow: (height: number) => void;
        onBlur: (callback: () => void) => () => void;
        minimize: () => void;
      };
    };
  }
}
