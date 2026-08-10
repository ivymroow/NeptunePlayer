const { app, BrowserWindow, ipcMain, dialog, protocol, net } = require('electron');
const { autoUpdater } = require('electron-updater');
const { spawn, execFile, exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const url = require('url');
const DiscordRPC = require('discord-rpc');
const musicMetadata = require('music-metadata');

let mainWindow;
let rpc;
const clientId = '1505897532880977940'; 
const configPath = path.join(app.getPath('userData'), 'config.json');

// Discord Widget state
// Global cache preventing duplicate image uploading requests
const uploadedArtCache = {};

function loadConfig() {
    if (fs.existsSync(configPath)) {
        try {
            return JSON.parse(fs.readFileSync(configPath, 'utf8'));
        } catch (e) {
            return { folders: [], settings: {} };
        }
    }
    return { folders: [], settings: {} };
}

function saveConfig(config) {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
}

protocol.registerSchemesAsPrivileged([
    { scheme: 'media', privileges: { bypassCSP: true, stream: true, corsEnabled: true, supportFetchAPI: true } }
]);

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1350,
        height: 880,
        backgroundColor: '#0a0a0a',
        icon: path.resolve(__dirname, 'prideicon.png'),
        frame: false,
        titleBarStyle: 'hidden',
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

function initDiscordRPC() {
    rpc = new DiscordRPC.Client({ transport: 'ipc' });

    rpc.on('ready', () => {
        console.log('Discord Rich Presence initialized.');
        rpc.setActivity({
            details: "Idle",
            state: "Browsing Library",
            largeImageKey: "prideicon",
            largeImageText: "by ivymroow :3 icon by nepvortex64 (sarah)",
            type: 2,
            instance: false
        });
    });

    rpc.login({ clientId }).catch(console.error);
}

app.on('ready', () => {
    if (process.platform === 'win32') app.setAppUserModelId('com.neptune.player');

    protocol.handle('media', (request) => {
        const filePath = decodeURIComponent(request.url.replace('media://', ''));
        return net.fetch(url.pathToFileURL(filePath).toString());
    });

    createWindow();
    initDiscordRPC();

    autoUpdater.on('update-available', (info) => {
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('update-available', { version: info.version });
        }
    });
    autoUpdater.on('update-downloaded', (info) => {
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('update-downloaded', { version: info.version });
        }
    });
    autoUpdater.on('error', err => {
        console.error('Update error:', err.message);
    });
    autoUpdater.on('update-not-available', () => {
        console.log('No update available.');
    });
    ipcMain.on('quit-and-install', () => {
        autoUpdater.quitAndInstall();
    });
    setTimeout(() => autoUpdater.checkForUpdatesAndNotify(), 3000);
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
    if (mainWindow === null) createWindow();
});

async function scanDirectory(dirPath, allSongs) {
    try {
        const files = fs.readdirSync(dirPath);
        for (const file of files) {
            const fullPath = path.join(dirPath, file);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                await scanDirectory(fullPath, allSongs);
            } else if (/\.(mp3|wav|ogg|flac|m4a)$/i.test(file)) {
                try {
                    const metadata = await musicMetadata.parseFile(fullPath);
                    let art = null;
                    if (metadata.common.picture && metadata.common.picture.length > 0) {
                        const pic = metadata.common.picture[0];
                        art = `data:${pic.format};base64,${pic.data.toString('base64')}`;
                    }
                    allSongs.push({
                        id: allSongs.length + 1,
                        name: metadata.common.title || path.basename(file, path.extname(file)),
                        artist: metadata.common.artist || "Unknown Artist",
                        album: metadata.common.album || "Unknown Album",
                        duration: metadata.format.duration || 0,
                        file: fullPath, 
                        art: art,
                        playCount: 0,
                        playTime: 0
                    });
                } catch (err) {
                    allSongs.push({
                        id: allSongs.length + 1,
                        name: path.basename(file, path.extname(file)),
                        artist: "Unknown Artist",
                        album: "Unknown Album",
                        duration: 0,
                        file: fullPath,
                        art: null,
                        playCount: 0,
                        playTime: 0
                    });
                }
            }
        }
    } catch (e) {
        console.error("Failed to read directory:", e);
    }
}

async function uploadArtworkToWeb(base64Data) {
    if (!base64Data) return null;
    if (uploadedArtCache[base64Data]) return uploadedArtCache[base64Data];

    try {
        const imgBytes = Buffer.from(base64Data.split(',')[1], 'base64');
        const boundary = '----' + Date.now();
        const parts = [
            '--' + boundary + '\r\nContent-Disposition: form-data; name="reqtype"\r\n\r\nfileupload\r\n--' + boundary + '\r\nContent-Disposition: form-data; name="fileToUpload"; filename="art.png"\r\nContent-Type: image/png\r\n\r\n',
            imgBytes,
            '\r\n--' + boundary + '--\r\n'
        ];
        const response = await net.fetch('https://catbox.moe/user/api.php', {
            method: 'POST', headers: { 'Content-Type': 'multipart/form-data; boundary=' + boundary },
            body: Buffer.concat([Buffer.from(parts[0]), parts[1], Buffer.from(parts[2])])
        });
        const url = (await response.text()).trim();
        if (url.startsWith('http')) { uploadedArtCache[base64Data] = url; return url; }
    } catch (err) { console.error("Failed uploading artwork:", err); }
    return null;
}

ipcMain.handle('get-config', () => loadConfig());

ipcMain.handle('save-settings', (event, settings) => {
    const config = loadConfig();
    config.settings = settings;
    saveConfig(config);
    return config;
});

ipcMain.handle('save-supabase-config', (event, { url, anonKey }) => {
    const config = loadConfig();
    config.supabase = { url, anonKey };
    saveConfig(config);
    return { success: true };
});

ipcMain.handle('select-folder', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    });
    if (!result.canceled && result.filePaths.length > 0) {
        const config = loadConfig();
        const selectedDir = result.filePaths[0];
        if (!config.folders.includes(selectedDir)) {
            config.folders.push(selectedDir);
            saveConfig(config);
        }
        return config;
    }
    return null;
});

ipcMain.handle('select-file', async (event, filters) => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: filters || []
    });
    if (!result.canceled && result.filePaths.length > 0) {
        return url.pathToFileURL(result.filePaths[0]).href;
    }
    return null;
});

ipcMain.handle('remove-folder', (event, folderPath) => {
    const config = loadConfig();
    config.folders = config.folders.filter(f => f !== folderPath);
    saveConfig(config);
    return config;
});

ipcMain.handle('scan-music', async () => {
    const config = loadConfig();
    let allSongs = [];
    for (const folder of config.folders) {
        await scanDirectory(folder, allSongs);
    }
    return allSongs;
});

ipcMain.on('update-presence', async (event, { title, artist, isPlaying, duration, currentTime, art, playCount }) => {
    if (!rpc) return;

    let targetImageKey = "prideicon";
    if (art && art.startsWith('data:image')) {
        const remoteUrl = await uploadArtworkToWeb(art);
        if (remoteUrl) targetImageKey = remoteUrl;
    }

    const activityPayload = {
        type: 2,
        largeImageKey: targetImageKey,
        largeImageText: art ? "by ivymroow :3" : "by ivymroow :3 icon by nepvortex64 (sarah)",
        instance: false
    };

    if (isPlaying) {
        activityPayload.details = `${title}`;
        activityPayload.state = `${artist}${playCount ? ' (' + playCount + ' plays)' : ''}`;
        if (duration && currentTime) {
            const now = Date.now();
            if (!mainWindow._lastTs || now - mainWindow._lastTs > 1000) {
                mainWindow._lastTs = now;
                activityPayload.startTimestamp = Math.floor(now / 1000 - currentTime);
                activityPayload.endTimestamp = Math.floor(now / 1000 + (duration - currentTime));
            }
        }
    } else {
        activityPayload.details = `Paused: ${title}`;
        activityPayload.state = `by ${artist}`;
    }

    rpc.setActivity(activityPayload).catch(console.error);
});

ipcMain.on('window-minimize', () => {
    if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
    if (mainWindow) {
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize();
        } else {
            mainWindow.maximize();
        }
    }
});

ipcMain.on('window-close', () => {
    if (mainWindow) mainWindow.close();
});

ipcMain.handle('convert-download', async (event, { url, quality, playlist }) => {
    const dlPath = path.join(app.getPath('userData'), 'songs');
    if (!fs.existsSync(dlPath)) fs.mkdirSync(dlPath, { recursive: true });

    // also check old path and copy any files found there
    const oldPath = path.join(path.dirname(app.getPath('exe')), 'songs');
    if (fs.existsSync(oldPath) && oldPath !== dlPath) {
        for (const f of fs.readdirSync(oldPath)) {
            if (f.endsWith('.mp3') && !fs.existsSync(path.join(dlPath, f))) {
                fs.copyFileSync(path.join(oldPath, f), path.join(dlPath, f));
            }
        }
    }

    const args = [
        url,
        '-x', '--audio-format', 'mp3', '--audio-quality', quality || '0',
        '--embed-thumbnail', '--embed-metadata',
        '--postprocessor-args', 'ffmpeg:-c:v mjpeg -q:v 5',
        '-o', path.join(dlPath, playlist ? '%(playlist_title)s/%(title)s.%(ext)s' : '%(title)s.%(ext)s'),
        '--progress', '--newline', '--no-mtime'
    ];
    if (!playlist) args.push('--no-playlist');

    const bin = [path.join(process.resourcesPath, 'yt-dlp.exe'), path.join(__dirname, 'yt-dlp.exe')].find(f => fs.existsSync(f));

    return new Promise(resolve => {
        if (!bin) { resolve({ success: false, error: 'yt-dlp.exe not found' }); return; }

        const before = Date.now();
        let downloadedFiles = [];
        let stderrBuf = '';

        const proc = require('child_process').spawn(bin, args, { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });

        proc.stdout.on('data', data => {
            const out = data.toString();
            const p = out.match(/(\d+\.?\d*)%/);
            if (p) mainWindow.webContents.send('convert-progress', Math.round(parseFloat(p[1])));
        });
        proc.stderr.on('data', data => { stderrBuf += data; });

        proc.on('error', err => {
            resolve({ success: false, error: err.message });
        });

        proc.on('close', async code => {
            if (code !== 0) { resolve({ success: false, error: (stderrBuf || 'exit code ' + code).slice(0, 500) }); return; }

            function findMp3(dir, since) {
                let results = [];
                try {
                    const entries = fs.readdirSync(dir, { withFileTypes: true });
                    for (const e of entries) {
                        const fp = path.join(dir, e.name);
                        if (e.isDirectory()) results = results.concat(findMp3(fp, since));
                        else if (e.name.endsWith('.mp3') && fs.statSync(fp).birthtimeMs > since) results.push(fp);
                    }
                } catch(e) {}
                return results;
            }
            const files = findMp3(dlPath, before - 2000).sort().slice(0, 100);
            if (!files.length) { resolve({ success: true, songs: [] }); return; }

            const songs = [];
            for (const fp of files) {
                try {
                    const meta = await musicMetadata.parseFile(fp);
                    let title = meta.common.title || path.basename(fp).replace(/\.mp3$/i, '');
                    let artist = meta.common.artist || 'Unknown Artist';
                    if (artist === 'Unknown Artist') {
                        const dash = title.match(/^(.+?)\s*[-–—]\s*(.+)/);
                        if (dash) { artist = dash[1].trim(); title = dash[2].trim(); }
                        else {
                            const dir = path.basename(path.dirname(fp));
                            const dd = dir.match(/^(.+?)\s*[-–—]\s*(.+)/);
                            if (dd) { artist = dd[1].trim(); }
                        }
                    }
                    let art = null;
                    if (meta.common.picture?.length) {
                        const p = meta.common.picture[0];
                        art = `data:${p.format};base64,${p.data.toString('base64')}`;
                    }
                    songs.push({ name: title, artist, art, file: `data:audio/mpeg;base64,${fs.readFileSync(fp).toString('base64')}` });
                } catch(e) {
                    const fname = path.basename(fp).replace(/\.mp3$/i, '');
                    const dash = fname.match(/^(.+?)\s*[-–—]\s*(.+)/);
                    let title = dash ? dash[2].trim() : fname;
                    let artist = dash ? dash[1].trim() : 'Unknown Artist';
                    if (artist === 'Unknown Artist') {
                        const dir = path.basename(path.dirname(fp));
                        const dd = dir.match(/^(.+?)\s*[-–—]\s*(.+)/);
                        if (dd) artist = dd[1].trim();
                    }
                    songs.push({ name: title, artist, art: null, file: `data:audio/mpeg;base64,${fs.readFileSync(fp).toString('base64')}` });
                }
            }
            resolve({ success: true, songs });
        });
    });
});

let miniWindow = null;

function createMiniPlayer() {
    if (miniWindow) return;
    miniWindow = new BrowserWindow({
        width: 340,
        height: 180,
        backgroundColor: '#0a0a0a',
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        skipTaskbar: true,
        resizable: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });
    miniWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mini-player.html'),
        protocol: 'file:',
        slashes: true
    }));
    miniWindow.on('closed', () => { miniWindow = null; });
}

ipcMain.on('toggle-mini-player', (_event, active) => {
    if (active) {
        createMiniPlayer();
    } else {
        if (miniWindow) { miniWindow.close(); miniWindow = null; }
    }
});

ipcMain.on('mini-player-state', (_event, data) => {
    if (miniWindow && !miniWindow.isDestroyed()) {
        miniWindow.webContents.send('mini-player-state', data);
    }
});

ipcMain.on('mini-bop', (_event, bop) => {
    if (miniWindow && !miniWindow.isDestroyed()) {
        miniWindow.webContents.send('mini-bop', bop);
    }
});

ipcMain.on('mini-action', (_event, action) => {
    if (action === 'close') {
        if (miniWindow && !miniWindow.isDestroyed()) {
            miniWindow.close();
            miniWindow = null;
        }
    }
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('mini-action', action);
    }
});
