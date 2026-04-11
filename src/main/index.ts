// Electron main process entry point
import { app, BrowserWindow } from 'electron'
import path from 'path'

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, '../ipc/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (process.env['VITE_DEV_SERVER_URL'] !== undefined) {
    void win.loadURL(process.env['VITE_DEV_SERVER_URL'])
  } else {
    void win.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
