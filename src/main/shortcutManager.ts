import { globalShortcut, BrowserWindow } from 'electron';

const DEFAULT_SHORTCUT = process.platform === 'darwin' ? 'Option+Space' : 'Alt+Space';

let currentShortcut = DEFAULT_SHORTCUT;
let registered = false;
let mainWindow: BrowserWindow | null = null;

export function setMainWindow(window: BrowserWindow): void {
  mainWindow = window;
}

export function registerShortcut(): boolean {
  if (registered) {
    unregisterShortcut();
  }

  try {
    const success = globalShortcut.register(currentShortcut, () => {
      if (mainWindow) {
        if (mainWindow.isVisible()) {
          mainWindow.hide();
        } else {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    });

    if (success) {
      registered = true;
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function unregisterShortcut(): void {
  if (registered) {
    globalShortcut.unregister(currentShortcut);
    registered = false;
  }
}

export function setShortcut(shortcut: string): boolean {
  const oldShortcut = currentShortcut;
  currentShortcut = shortcut;

  const success = registerShortcut();
  
  if (!success) {
    currentShortcut = oldShortcut;
    return false;
  }

  return true;
}

export function getShortcut(): string {
  return currentShortcut;
}

export function isShortcutRegistered(): boolean {
  return registered;
}

export function isShortcutAvailable(shortcut: string): boolean {
  const previousShortcut = currentShortcut;
  currentShortcut = shortcut;
  
  const success = registerShortcut();
  
  if (success) {
    unregisterShortcut();
    currentShortcut = previousShortcut;
    return true;
  }
  
  currentShortcut = previousShortcut;
  return false;
}
