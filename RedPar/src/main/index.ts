import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { execFile } from 'child_process';

let mainWindow: BrowserWindow | null = null;

const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 380,
    height: 580,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: !isDev,
    },
  });

  // Set transparent background
  mainWindow.setBackgroundColor('#00000000');

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// --- Karinote bridge ---
const bridgeScript = path.resolve(__dirname, '../../scripts/karinote_bridge.py');

function queryKarinote(type: string, days: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = execFile(
      'python',
      [bridgeScript, '--action', 'query', '--type', type, '--days', String(days)],
      { encoding: 'utf8', timeout: 15000 },
      (err, stdout) => {
        if (err) {
          reject(new Error(`Karinote bridge error: ${err.message}`));
          return;
        }
        resolve(stdout.trim());
      },
    );
  });
}

function writeKarinote(type: string, dataJson: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = execFile(
      'python',
      [bridgeScript, '--action', 'write', '--type', type, '--data', dataJson],
      { encoding: 'utf8', timeout: 15000 },
      (err, stdout) => {
        if (err) {
          reject(new Error(`Karinote bridge error: ${err.message}`));
          return;
        }
        resolve(stdout.trim());
      },
    );
  });
}

// IPC handlers
ipcMain.on('set-ignore-mouse-events', (_event, ignore: boolean) => {
  if (mainWindow) {
    mainWindow.setIgnoreMouseEvents(ignore, { forward: true });
  }
});

ipcMain.on('window-close', () => {
  app.quit();
});

ipcMain.handle('karinote:query', async (_event, type: string, days: number) => {
  try {
    return await queryKarinote(type, days);
  } catch (e: any) {
    return JSON.stringify({ error: e.message });
  }
});

ipcMain.handle('karinote:write', async (_event, type: string, data: string) => {
  try {
    return await writeKarinote(type, data);
  } catch (e: any) {
    return JSON.stringify({ error: e.message });
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
