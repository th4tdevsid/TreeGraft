// Electron IPC preload script
// Runs in the renderer context with access to contextBridge and ipcRenderer.
// This is the ONLY place that touches electron IPC APIs — UI code never
// imports from electron directly.
import { contextBridge, ipcRenderer } from 'electron'
import type { FileContent } from '@core/interfaces/types'

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: (): Promise<FileContent | null> =>
    ipcRenderer.invoke('open-file') as Promise<FileContent | null>,
})
