import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
export const api = {
  openSecondaryWindow: () => ipcRenderer.send('open-secondary-window'),
  closeSecondaryWindow: () => ipcRenderer.send('close-secondary-window'),
  sendTimeUpdate: (time: number, isOvertime: boolean) =>
    ipcRenderer.send('time-update', time, isOvertime),
  onTimeUpdate: (callback: (time: number, isOvertime: boolean) => void) => {
    ipcRenderer.on('time-update', (_, time, isOvertime) => callback(time, isOvertime))
  },
  onNoExternalDisplay: (callback: () => void) => {
    ipcRenderer.on('no-external-display', () => callback())
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
