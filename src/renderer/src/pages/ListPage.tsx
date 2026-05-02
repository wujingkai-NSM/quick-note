import { useState, useEffect, useCallback, useRef } from 'react';
import type { Note } from '../../../main/types';

interface ListPageProps {
  searchKeyword?: string;
  onBack?: () => void;
  onNoteSelect?: () => void;
}

export function ListPage({ searchKeyword, onBack, onNoteSelect }: ListPageProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const notesListRef = useRef<HTMLDivElement>(null);

  const loadNotes = useCallback(async () => {
    if (searchKeyword) {
      const result = await window.quickNote.note.search(searchKeyword);
      setNotes(result.notes);
    } else {
      const result = await window.quickNote.note.list(10);
      setNotes(result.notes);
    }
    setSelectedIndex(0);
  }, [searchKeyword]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  useEffect(() => {
    const handleNotesChanged = () => {
      loadNotes();
    };

    window.addEventListener('notesChanged', handleNotesChanged);
    return () => {
      window.removeEventListener('notesChanged', handleNotesChanged);
    };
  }, [loadNotes]);

  useEffect(() => {
    const headerHeight = 36;
    const footerHeight = 32;
    const noteHeight = 30;
    const emptyHeight = 80;
    const inputHeight = 44;
    const statusHeight = 32;
    
    let contentHeight: number;
    if (notes.length === 0) {
      contentHeight = emptyHeight;
    } else {
      contentHeight = Math.min(notes.length * noteHeight, 400);
    }
    
    const totalHeight = headerHeight + contentHeight + footerHeight;
    window.quickNote.app.resizeListWindow(Math.min(totalHeight, 500));
  }, [notes.length]);

  const handleNoteSelect = useCallback((note: Note) => {
    window.quickNote.app.setNoteContent(note.id, note.content);
    onNoteSelect?.();
  }, [onNoteSelect]);

  const handleDeleteNote = useCallback(async () => {
    if (notes[selectedIndex]) {
      await window.quickNote.note.delete(notes[selectedIndex].id);
      setSelectedIndex(prev => Math.max(0, Math.min(prev, notes.length - 2)));
    }
  }, [notes, selectedIndex]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onBack?.();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(0, prev - 1));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(notes.length - 1, prev + 1));
    } else if (e.key === 'Enter' && notes[selectedIndex]) {
      handleNoteSelect(notes[selectedIndex]);
    } else if (e.key.toLowerCase() === 'd' && notes[selectedIndex]) {
      handleDeleteNote();
    }
  }, [notes, selectedIndex, handleNoteSelect, handleDeleteNote]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (notesListRef.current && notes.length > 0) {
      const selectedElement = notesListRef.current.querySelector(`.note-entry:nth-child(${selectedIndex + 1})`) as HTMLElement;
      if (selectedElement) {
        const listRect = notesListRef.current.getBoundingClientRect();
        const elementRect = selectedElement.getBoundingClientRect();
        const scrollTop = notesListRef.current.scrollTop;
        const elementTop = elementRect.top - listRect.top + scrollTop;
        const elementHeight = elementRect.height;
        const listHeight = listRect.height;
        
        const targetScrollTop = elementTop - (listHeight / 2) + (elementHeight / 2);
        
        notesListRef.current.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth'
        });
      }
    }
  }, [selectedIndex, notes.length]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="list-page">
      <div className="list-header-bar">
        <h2>{searchKeyword ? '搜索结果' : '最近笔记'}</h2>
        <button className="close-btn" onClick={onBack}>×</button>
      </div>
      <div ref={notesListRef} className="notes-list">
        {notes.length === 0 ? (
          <div className="empty-message">暂无笔记</div>
        ) : (
          notes.map((note, index) => (
            <div
              key={note.id}
              className={`note-entry ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => handleNoteSelect(note)}
            >
              <span className="note-title-text">{note.title}</span>
              <span className="note-time">{formatDate(note.createdAt)}</span>
            </div>
          ))
        )}
      </div>
      <div className="list-footer">
        <span>↑↓ 选择 · Enter 编辑 · D 删除 · Esc 关闭</span>
      </div>
    </div>
  );
}
