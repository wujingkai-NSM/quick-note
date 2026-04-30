import { useEffect, useRef, useCallback } from 'react';
import type { CommandInfo } from '../utils/commandParser';

interface CommandPickerProps {
  commands: CommandInfo[];
  inputValue: string;
  onSelect: (command: CommandInfo) => void;
  onClose: () => void;
}

export function CommandPicker({ commands, inputValue, onSelect, onClose }: CommandPickerProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const selectedIndexRef = useRef(0);

  const filteredCommands = commands.filter(cmd => {
    const inputAfterSlash = inputValue.toLowerCase().replace(/^\//, '');
    return cmd.command.toLowerCase().includes(inputAfterSlash) ||
           cmd.description.toLowerCase().includes(inputAfterSlash);
  });

  useEffect(() => {
    selectedIndexRef.current = 0;
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [filteredCommands]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndexRef.current = Math.max(0, selectedIndexRef.current - 1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndexRef.current = Math.min(filteredCommands.length - 1, selectedIndexRef.current + 1);
    } else if (e.key === 'Enter' && filteredCommands[selectedIndexRef.current]) {
      onSelect(filteredCommands[selectedIndexRef.current]);
      onClose();
    }
  }, [filteredCommands, onSelect, onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="command-picker-overlay" onClick={onClose}>
      <div className="command-picker" onClick={(e) => e.stopPropagation()} ref={listRef}>
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
                  onSelect(cmd);
                  onClose();
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
  );
}
