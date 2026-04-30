export interface ParsedCommand {
  command: string;
  args: string;
}

export interface CommandInfo {
  command: string;
  description: string;
  example: string;
  hasArgs: boolean;
}

export const COMMANDS: CommandInfo[] = [
  { command: '/new-file', description: '新建笔记', example: '这是一条笔记 /new-file', hasArgs: false },
  { command: '/save', description: '追加到上一条笔记', example: '继续追加内容 /save', hasArgs: false },
  { command: '/rename', description: '重命名上一条笔记', example: '/rename 会议纪要', hasArgs: true },
  { command: '/list', description: '列出最近笔记', example: '/list', hasArgs: false },
  { command: '/search', description: '全文搜索', example: '/search 产品方案', hasArgs: true },
  { command: '/export', description: '导出全部数据', example: '/export', hasArgs: false },
  { command: '/import', description: '导入数据文件', example: '/import', hasArgs: false },
  { command: '/help', description: '显示帮助', example: '/help', hasArgs: false }
];

function findCommandInLine(line: string): { command: string; args: string; before: string } | null {
  const trimmed = line.trim();
  
  if (!trimmed.includes('/')) {
    return null;
  }

  for (const cmd of COMMANDS) {
    const cmdIndex = trimmed.lastIndexOf(cmd.command);
    
    if (cmdIndex !== -1) {
      const before = trimmed.substring(0, cmdIndex).trim();
      const after = trimmed.substring(cmdIndex + cmd.command.length).trim();
      
      if (cmd.hasArgs) {
        return {
          command: cmd.command,
          args: after,
          before
        };
      } else {
        if (after === '' || after.startsWith('/')) {
          return {
            command: cmd.command,
            args: '',
            before
          };
        }
      }
    }
  }
  
  return null;
}

export function extractContentAndCommand(input: string): { content: string; command: ParsedCommand | null } {
  const lines = input.split('\n');
  let contentLines: string[] = [];
  let foundCommand: ParsedCommand | null = null;

  for (const line of lines) {
    const result = findCommandInLine(line);
    
    if (result && !foundCommand) {
      foundCommand = {
        command: result.command,
        args: result.args
      };
      
      if (result.before) {
        contentLines.push(result.before);
      }
    } else {
      contentLines.push(line);
    }
  }

  return {
    content: contentLines.join('\n').trim(),
    command: foundCommand
  };
}
