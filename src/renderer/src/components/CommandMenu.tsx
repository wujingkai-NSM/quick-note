
import type { CommandInfo } from '../utils/commandParser';

interface CommandMenuProps {
  commands: CommandInfo[];
}

export function CommandMenu({ commands }: CommandMenuProps) {
  return (
    <div className="command-menu">
      <h3 className="menu-title">命令帮助</h3>
      <div className="command-list">
        {commands.map((cmd) => (
          <div key={cmd.command} className="command-item">
            <code className="command-name">{cmd.command}</code>
            <span className="command-desc">{cmd.description}</span>
            <span className="command-example">{cmd.example}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
