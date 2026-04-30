import { useEffect, useCallback } from 'react';
import { COMMANDS } from '../utils/commandParser';

export function HelpPage() {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      window.quickNote.app.minimize();
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="help-page">
      <div className="help-header-bar">
        <h2>命令帮助</h2>
        <button className="close-btn" onClick={() => window.quickNote.app.minimize()}>×</button>
      </div>
      <div className="help-content">
        <div className="help-section">
          <h3>基础操作</h3>
          <div className="help-item">
            <span className="help-key">Alt+Space</span>
            <span className="help-desc">唤起输入窗口</span>
          </div>
          <div className="help-item">
            <span className="help-key">Enter</span>
            <span className="help-desc">保存笔记或执行命令</span>
          </div>
          <div className="help-item">
            <span className="help-key">Shift+Enter</span>
            <span className="help-desc">换行</span>
          </div>
          <div className="help-item">
            <span className="help-key">Esc</span>
            <span className="help-desc">关闭窗口</span>
          </div>
        </div>
        
        <div className="help-section">
          <h3>斜杠命令</h3>
          {COMMANDS.map((cmd) => (
            <div key={cmd.command} className="help-item">
              <span className="help-command">{cmd.command}</span>
              <span className="help-desc">{cmd.description}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="help-footer">
        <span>按 Esc 关闭</span>
      </div>
    </div>
  );
}
