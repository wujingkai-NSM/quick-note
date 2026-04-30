import React, { useState, useEffect, useRef, useCallback } from 'react';
import { extractContentAndCommand, COMMANDS, type CommandInfo } from '../utils/commandParser';
import { CommandPicker } from './CommandPicker';

interface NoteInputProps {
  onSubmit: (content: string) => void;
  onCommand: (command: string, args: string, content: string) => void;
  noteCount: number;
}

export function NoteInput({ onSubmit, onCommand, noteCount }: NoteInputProps) {
  const [value, setValue] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineHeight = 20;
  const baseHeight = 40;
  const statusBarHeight = 28;

  useEffect(() => {
    const isTypingCommand = value.trim().startsWith('/') && !value.includes('\n');
    setShowPicker(isTypingCommand);
  }, [value]);

  useEffect(() => {
    const lines = value.split('\n').length;
    const contentHeight = Math.max(lines * lineHeight, 20);
    const totalHeight = baseHeight + Math.max(0, contentHeight - 20);
    window.quickNote.app.resizeMainWindow(totalHeight);
  }, [value]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setValue('');
      setShowPicker(false);
      window.quickNote.app.minimize();
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const { content, command } = extractContentAndCommand(value);
      
      if (command) {
        onCommand(command.command, command.args, content);
      } else {
        onSubmit(value);
      }
      
      setValue('');
      setShowPicker(false);
    }
  }, [value, onSubmit, onCommand]);

  const handleBlur = useCallback(() => {
    if (value.trim()) {
      const { content, command } = extractContentAndCommand(value);
      
      if (command) {
        onCommand(command.command, command.args, content);
      } else {
        onSubmit(value);
      }
    }
    setValue('');
    setShowPicker(false);
    window.quickNote.app.minimize();
  }, [value, onSubmit, onCommand]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    const unsubscribe = window.quickNote.app.onBlur(handleBlur);
    return unsubscribe;
  }, [handleBlur]);

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
    <div className="input-container">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="记录一闪而过的念头... (输入 / 查看命令)"
        className="note-input"
        rows={1}
      />
      <div className="status-bar">
        <span className="note-count">{noteCount} 条笔记</span>
      </div>
      
      {showPicker && (
        <CommandPicker
          commands={COMMANDS}
          inputValue={value}
          onSelect={handleCommandSelect}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}
