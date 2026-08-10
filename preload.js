const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // Config
    getConfig: () => ipcRenderer.invoke('get-config'),
    saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
    selectFolder: () => ipcRenderer.invoke('select-folder'),
    selectFile: (filters) => ipcRenderer.invoke('select-file', filters),
    removeFolder: (folderPath) => ipcRenderer.invoke('remove-folder', folderPath),
    scanMusic: () => ipcRenderer.invoke('scan-music'),
    updatePresence: (data) => ipcRenderer.send('update-presence', data),
    toggleMiniPlayer: (active) => ipcRenderer.send('toggle-mini-player', active),
    updateMiniPlayer: (data) => ipcRenderer.send('mini-player-state', data),
    updateMiniBop: (bop) => ipcRenderer.send('mini-bop', bop),
    onMiniAction: (callback) => ipcRenderer.on('mini-action', (_event, action) => callback(action)),
    onMiniState: (callback) => ipcRenderer.on('mini-player-state', (_event, data) => callback(data)),
    onMiniBop: (callback) => ipcRenderer.on('mini-bop', (_event, bop) => callback(bop)),
    sendMiniAction: (action) => ipcRenderer.send('mini-action', action),
    convertDownload: (opts) => ipcRenderer.invoke('convert-download', opts),
    onConvertProgress: (cb) => ipcRenderer.on('convert-progress', (_, p) => cb(p)),
    // Custom Frame Controls
    minimizeWindow: () => ipcRenderer.send('window-minimize'),
    maximizeWindow: () => ipcRenderer.send('window-maximize'),
    closeWindow: () => ipcRenderer.send('window-close'),

    // Updates
    onUpdateAvailable: (cb) => ipcRenderer.on('update-available', (_e, info) => cb(info)),
    onUpdateDownloaded: (cb) => ipcRenderer.on('update-downloaded', (_e, info) => cb(info)),
    quitAndInstall: () => ipcRenderer.send('quit-and-install'),


});
