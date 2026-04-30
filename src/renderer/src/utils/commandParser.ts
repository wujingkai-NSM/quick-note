export interface ParsedCommand {
  command: string;
  args: string;
  content: string;
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

export function parseCommand(input: string): ParsedCommand | null {
  const trimmed = input.trim();
  
  if (!trimmed.startsWith('/')) {
    return null;
  }

  const spaceIndex = trimmed.indexOf(' ');
  
  if (spaceIndex === -1) {
    const command = trimmed;
    const isValid = COMMANDS.some(c => c.command === command);
    return isValid ? { command, args: '', content: '' } : null;
  }

  const command = trimmed.substring(0, spaceIndex);
  const args = trimmed.substring(spaceIndex + 1);
  
  const commandInfo = COMMANDS.find(c => c.command === command);
  
  if (!commandInfo) {
    return null;
  }

  return { command, args, content: '' };
}

export function extractContentAndCommand(input: string): { content: string; command: ParsedCommand | null } {
  const lines = input.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const parsed = parseCommand(lines[i]);
    if (parsed) {
      const contentLines = lines.filter((_, idx) => idx !== i);
      return {
        content: contentLines.join('\n'),
        command: parsed
      };
    }
  }

  return { content: input, command: null };
}
