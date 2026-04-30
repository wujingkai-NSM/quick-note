import { useState, useEffect, useCallback } from 'react';
import type { Note } from '../../../main/types';

interface ListPageProps {
  searchKeyword?: string;
}

export function ListPage({ searchKeyword }: ListPageProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

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
    const headerHeight = 36;
    const footerHeight = 32;
    const noteHeight = 30;
    const emptyHeight = 80;
    
    let contentHeight: number;
    if (notes.length === 0) {
      contentHeight = emptyHeight;
    } else {
      contentHeight = Math.min(notes.length * noteHeight, 260);
    }
    
    const totalHeight = headerHeight + contentHeight + footerHeight;
    window.quickNote.app.resizeListWindow(totalHeight);
  }, [notes.length]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      window.quickNote.app.hideList();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(0, prev - 1));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(notes.length - 1, prev + 1));
    } else if (e.key === 'Enter' && notes[selectedIndex]) {
      navigator.clipboard.writeText(notes[selectedIndex].content);
      window.quickNote.app.hideList();
    }
  }, [notes, selectedIndex]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

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
        <button className="close-btn" onClick={() => window.quickNote.app.hideList()}>×</button>
      </div>
      <div className="notes-list">
        {notes.length === 0 ? (
          <div className="empty-message">暂无笔记</div>
        ) : (
          notes.map((note, index) => (
            <div
              key={note.id}
              className={`note-entry ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => {
                navigator.clipboard.writeText(note.content);
                window.quickNote.app.hideList();
              }}
            >
              <span className="note-title-text">{note.title}</span>
              <span className="note-time">{formatDate(note.createdAt)}</span>
            </div>
          ))
        )}
      </div>
      <div className="list-footer">
        <span>↑↓ 选择 · Enter 复制 · Esc 关闭</span>
      </div>
    </div>
  );
}
