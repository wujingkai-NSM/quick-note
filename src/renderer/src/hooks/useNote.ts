import { useState, useCallback, useEffect } from 'react';
import type { Note } from '../../../main/types';
import { COMMANDS } from '../utils/commandParser';

export interface StatusMessage {
  type: 'success' | 'error' | 'info';
  message: string;
}

export function useNote() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteCount, setNoteCount] = useState(0);
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showList, setShowList] = useState(false);
  const [searchResults, setSearchResults] = useState<Note[]>([]);

  const showStatus = useCallback((type: StatusMessage['type'], message: string, duration = 1000) => {
    setStatus({ type, message });
    setTimeout(() => setStatus(null), duration);
  }, []);

  const createNote = useCallback(async (content: string) => {
    if (!content.trim()) return;
    
    const result = await window.quickNote.note.create(content);
    if (result.success) {
      showStatus('success', '笔记创建成功');
      await refreshNotes();
    } else {
      showStatus('error', result.message);
    }
  }, [showStatus]);

  const appendToLastNote = useCallback(async (content: string) => {
    if (!content.trim()) return;
    
    const result = await window.quickNote.note.append(content);
    if (result.success) {
      showStatus('success', '内容追加成功');
      await refreshNotes();
    } else {
      showStatus('error', result.message);
    }
  }, [showStatus]);

  const renameLastNote = useCallback(async (newTitle: string) => {
    const result = await window.quickNote.note.rename(newTitle);
    if (result.success) {
      showStatus('success', '重命名成功');
      await refreshNotes();
    } else {
      showStatus('error', result.message);
    }
  }, [showStatus]);

  const listNotes = useCallback(async (limit = 10) => {
    const result = await window.quickNote.note.list(limit);
    setNotes(result.notes);
    setShowList(true);
    setShowHelp(false);
    setSearchResults([]);
  }, []);

  const searchNotes = useCallback(async (keyword: string) => {
    const result = await window.quickNote.note.search(keyword);
    setSearchResults(result.notes);
    setShowList(true);
    setShowHelp(false);
  }, []);

  const exportData = useCallback(async () => {
    const result = await window.quickNote.app.export();
    if (result.success) {
      showStatus('success', '导出成功');
    } else {
      showStatus('error', result.message);
    }
  }, [showStatus]);

  const importData = useCallback(async () => {
    const result = await window.quickNote.app.import();
    if (result.success) {
      showStatus('success', '导入成功');
      await refreshNotes();
    } else {
      showStatus('error', result.message);
    }
  }, [showStatus]);

  const refreshNotes = useCallback(async () => {
    const result = await window.quickNote.note.list();
    setNotes(result.notes);
    const count = await window.quickNote.note.count();
    setNoteCount(count);
  }, []);

  const handleCommand = useCallback(async (command: string, args: string, content: string) => {
    setShowList(false);
    setShowHelp(false);
    setSearchResults([]);

    switch (command) {
      case '/new-file':
        await createNote(content);
        break;
      case '/save':
        await appendToLastNote(content);
        break;
      case '/rename':
        await renameLastNote(args);
        break;
      case '/list':
        await listNotes();
        break;
      case '/search':
        await searchNotes(args);
        break;
      case '/export':
        await exportData();
        break;
      case '/import':
        await importData();
        break;
      case '/help':
        setShowHelp(true);
        setShowList(false);
        break;
      default:
        showStatus('error', '未知命令');
    }
  }, [createNote, appendToLastNote, renameLastNote, listNotes, searchNotes, exportData, importData, showStatus]);

  const handleContent = useCallback(async (content: string) => {
    if (!content.trim()) return;
    await createNote(content);
  }, [createNote]);

  useEffect(() => {
    refreshNotes();
  }, [refreshNotes]);

  return {
    notes,
    noteCount,
    status,
    showHelp,
    showList,
    searchResults,
    commands: COMMANDS,
    handleCommand,
    handleContent,
    showStatus,
    setShowList,
    setShowHelp
  };
}
