import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  setIgnoreMouseEvents: (ignore: boolean) =>
    ipcRenderer.send('set-ignore-mouse-events', ignore),
  windowClose: () => ipcRenderer.send('window-close'),
  // Karinote data bridge
  karinoteQuery: (type: string, days: number) =>
    ipcRenderer.invoke('karinote:query', type, days),
  karinoteWrite: (type: string, data: object) =>
    ipcRenderer.invoke('karinote:write', type, JSON.stringify(data)),
});
