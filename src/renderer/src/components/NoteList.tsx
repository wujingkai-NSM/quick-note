import React, { useState } from 'react';
import type { Note } from '../../../main/types';

interface NoteListProps {
  notes: Note[];
  isSearch?: boolean;
  onClose: () => void;
}

export function NoteList({ notes, isSearch = false, onClose }: NoteListProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(0, prev - 1));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(notes.length - 1, prev + 1));
    } else if (e.key === 'Enter' && notes[selectedIndex]) {
      navigator.clipboard.writeText(notes[selectedIndex].content);
      onClose();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="note-list" onKeyDown={handleKeyDown} tabIndex={0}>
      <div className="list-header">
        <h3>{isSearch ? '搜索结果' : '最近笔记'}</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      <div className="notes-container">
        {notes.length === 0 ? (
          <div className="empty-state">暂无笔记</div>
        ) : (
          notes.map((note, index) => (
            <div
              key={note.id}
              className={`note-item ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => {
                navigator.clipboard.writeText(note.content);
                onClose();
              }}
            >
              <div className="note-title">{note.title}</div>
              <div className="note-meta">
                <span className="note-date">{formatDate(note.createdAt)}</span>
                <span className="copy-hint">点击复制</span>
              </div>
              <div className="note-preview">{note.content.substring(0, 50)}...</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
