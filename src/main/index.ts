// Electron main process entry point
import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import fs from 'fs/promises';
import path from 'path';
import type { FileContent, Language } from '@core/interfaces/types';

// ---------------------------------------------------------------------------
// Extension → Language mapping (mirrors TreeSitterParser, kept in sync)
// ---------------------------------------------------------------------------
const EXTENSION_TO_LANGUAGE: Record<string, Language> = {
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.mjs': 'javascript',
  '.cjs': 'javascript',
  '.py': 'python',
  '.java': 'java',
  '.rs': 'rust',
};

function detectLanguage(filePath: string): Language | null {
  const dot = filePath.lastIndexOf('.');
  if (dot === -1) return null;
  const ext = filePath.slice(dot).toLowerCase();
  return EXTENSION_TO_LANGUAGE[ext] ?? null;
}

// ---------------------------------------------------------------------------
// IPC handlers
// ---------------------------------------------------------------------------

ipcMain.handle('open-file', async (): Promise<FileContent | null> => {
  const win = BrowserWindow.getFocusedWindow();

  const result = await dialog.showOpenDialog(win ?? new BrowserWindow(), {
    properties: ['openFile'],
    filters: [
      {
        name: 'Source Files',
        extensions: ['ts', 'tsx', 'js', 'jsx', 'mjs', 'py', 'java', 'rs',
                      'txt', 'md', 'json', 'yaml', 'yml', 'css', 'html', 'xml'],
      },
      { name: 'All Files', extensions: ['*'] },
    ],
  });

  if (result.canceled || result.filePaths.length === 0) return null;

  const filePath = result.filePaths[0];

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return {
      path: filePath,
      name: path.basename(filePath),
      content,
      language: detectLanguage(filePath),
    };
  } catch {
    return null;
  }
});

// ---------------------------------------------------------------------------
// Window lifecycle
// ---------------------------------------------------------------------------

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, '../ipc/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env['VITE_DEV_SERVER_URL'] !== undefined) {
    void win.loadURL(process.env['VITE_DEV_SERVER_URL']);
  } else {
    void win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
