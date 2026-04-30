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

  const updateNote = useCallback(async (noteId: string, content: string) => {
    if (!content.trim()) return;
    
    const result = await window.quickNote.note.update(noteId, content);
    if (result.success) {
      showStatus('success', '笔记更新成功');
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

  const refreshNotes = useCallback(async () => {
    const result = await window.quickNote.note.list();
    setNotes(result.notes);
    const count = await window.quickNote.note.count();
    setNoteCount(count);
  }, []);

  const handleCommand = useCallback(async (command: string, args: string, content: string) => {
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
      case '/export':
        const exportResult = await window.quickNote.app.export();
        if (exportResult.success) {
          showStatus('success', '导出成功');
        } else {
          showStatus('error', exportResult.message);
        }
        break;
      case '/import':
        const importResult = await window.quickNote.app.import();
        if (importResult.success) {
          showStatus('success', '导入成功');
          await refreshNotes();
        } else {
          showStatus('error', importResult.message);
        }
        break;
      default:
        showStatus('error', '未知命令');
    }
  }, [createNote, appendToLastNote, renameLastNote, showStatus, refreshNotes]);

  const handleContent = useCallback(async (content: string, noteId?: string) => {
    console.log('handleContent called:', { content, noteId });
    if (!content.trim()) return;
    
    if (noteId) {
      console.log('Updating note:', noteId);
      await updateNote(noteId, content);
    } else {
      console.log('Creating new note');
      await createNote(content);
    }
  }, [createNote, updateNote]);

  useEffect(() => {
    refreshNotes();
  }, [refreshNotes]);

  return {
    notes,
    noteCount,
    status,
    commands: COMMANDS,
    handleCommand,
    handleContent,
    showStatus
  };
}
