import React, { useState, useEffect, useRef, useCallback } from 'react';
import { extractContentAndCommand, COMMANDS, type CommandInfo } from '../utils/commandParser';

interface NoteInputProps {
  onSubmit: (content: string, noteId?: string) => void;
  onCommand: (command: string, args: string, content: string) => void;
  noteCount: number;
}

export function NoteInput({ onSubmit, onCommand, noteCount }: NoteInputProps): React.ReactElement {
  const [value, setValue] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const selectedIndexRef = useRef(0);

  useEffect(() => {
    const isTypingCommand = value.trim().startsWith('/') && !value.includes('\n');
    setShowPicker(isTypingCommand);
    selectedIndexRef.current = 0;
  }, [value]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const contentHeight = textareaRef.current.scrollHeight;
      const totalHeight = Math.min(Math.max(44, contentHeight), 200);
      window.quickNote.app.resizeMainWindow(totalHeight);
      textareaRef.current.style.height = `${contentHeight}px`;
    }
  }, [value]);

  const filteredCommands = COMMANDS.filter(cmd => {
    const inputAfterSlash = value.toLowerCase().replace(/^\//, '');
    return cmd.command.toLowerCase().includes(inputAfterSlash) ||
           cmd.description.toLowerCase().includes(inputAfterSlash);
  });

  const handleSave = useCallback(() => {
    const trimmedValue = value.trim();
    
    if (!trimmedValue) {
      setValue('');
      setEditingNoteId(null);
      setShowPicker(false);
      window.quickNote.app.minimize();
      return;
    }

    const { content, command } = extractContentAndCommand(trimmedValue);
    
    if (command) {
      if (['/save', '/rename'].includes(command.command) && !content && !command.args) {
        return;
      }
      onCommand(command.command, command.args, content);
      // 命令执行后根据命令类型决定是否隐藏窗口
      if (['/list', '/help', '/search'].includes(command.command)) {
        // 这些命令会显示新的页面，不需要隐藏主窗口
        setValue('');
        setEditingNoteId(null);
        setShowPicker(false);
        return;
      }
      // 其他命令执行完后隐藏窗口
      setValue('');
      setEditingNoteId(null);
      setShowPicker(false);
      window.quickNote.app.minimize();
    } else {
      onSubmit(trimmedValue, editingNoteId || undefined);
      setValue('');
      setEditingNoteId(null);
      setShowPicker(false);
      // 只有普通文本提交才隐藏窗口
      window.quickNote.app.minimize();
    }
  }, [value, editingNoteId, onSubmit, onCommand]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (showPicker) {
        setShowPicker(false);
        return;
      }
      
      handleSave();
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      
      if (showPicker && filteredCommands.length > 0) {
        const selectedCommand = filteredCommands[selectedIndexRef.current];
        if (selectedCommand) {
          handleCommandSelect(selectedCommand);
          setShowPicker(false);
          return;
        }
      }
      
      handleSave();
    } else if (e.key === 'Enter' && e.shiftKey) {
      // Shift+Enter 输入换行，不阻止默认行为
    } else if (showPicker && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault();
      if (e.key === 'ArrowUp') {
        selectedIndexRef.current = Math.max(0, selectedIndexRef.current - 1);
      } else {
        selectedIndexRef.current = Math.min(filteredCommands.length - 1, selectedIndexRef.current + 1);
      }
      
      const listItem = document.querySelector(`.picker-item:nth-child(${selectedIndexRef.current + 1})`);
      listItem?.scrollIntoView({ block: 'nearest' });
    } else if (showPicker && e.key === 'Tab') {
      e.preventDefault();
      selectedIndexRef.current = Math.min(filteredCommands.length - 1, selectedIndexRef.current + 1);
    }
  }, [value, editingNoteId, showPicker, handleSave, onCommand, filteredCommands.length]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    const listener = (e: Event) => {
      const event = e as CustomEvent<{ noteId: string; content: string }>;
      console.log('noteContent event received:', { noteId: event.detail.noteId, content: event.detail.content });
      setValue(event.detail.content);
      setEditingNoteId(event.detail.noteId);
      textareaRef.current?.focus();
    };

    window.addEventListener('noteContent', listener);
    
    return () => {
      window.removeEventListener('noteContent', listener);
    };
  }, []);

  useEffect(() => {
    console.log('editingNoteId changed:', editingNoteId);
  }, [editingNoteId]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };

  const handleCommandSelect = (command: CommandInfo) => {
    if (command.hasArgs) {
      setValue(command.command + ' ');
    } else {
      setValue(command.command);
    }
  };

  return (
    <div className="input-wrapper">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={editingNoteId ? '编辑笔记...' : '记录一闪而过的念头...'}
        className="note-input"
        rows={1}
      />
      <span className="note-count">{noteCount} 条笔记</span>
      
      {showPicker && (
        <>
          <div className="command-picker-overlay" onClick={() => setShowPicker(false)} />
          <div className="picker-container">
            <div className="command-picker" onClick={(e) => e.stopPropagation()}>
              <div className="picker-header">
                <span className="picker-title">命令</span>
                <span className="picker-shortcut">↑↓ 选择 · Enter 确认 · Esc 关闭</span>
              </div>
              <div className="picker-list">
                {filteredCommands.length === 0 ? (
                  <div className="picker-empty">未找到匹配的命令</div>
                ) : (
                  filteredCommands.map((cmd, index) => (
                    <div
                      key={cmd.command}
                      className={`picker-item ${index === selectedIndexRef.current ? 'selected' : ''}`}
                      onClick={() => {
                        handleCommandSelect(cmd);
                        setShowPicker(false);
                      }}
                    >
                      <code className="cmd-command">{cmd.command}</code>
                      <span className="cmd-description">{cmd.description}</span>
                      {cmd.example && (
                        <span className="cmd-example">{cmd.example}</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
