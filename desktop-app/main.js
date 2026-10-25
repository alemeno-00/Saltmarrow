// Saltmarrow Deep for macOS: a window that loads the live game, with a bundled copy for offline play
const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');
const URL = 'https://alemeno-00.github.io/Saltmarrow/';
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

function createWindow() {
  const win = new BrowserWindow({
    width: 1440, height: 900, minWidth: 900, minHeight: 600,
    backgroundColor: '#0b0e10', title: 'Saltmarrow Deep', show: false,
    webPreferences: { contextIsolation: true, sandbox: true }
  });
  win.once('ready-to-show', () => win.show());
  let offline = false;
  win.webContents.on('did-fail-load', (e, code, desc, url, isMain) => {
    if (isMain && !offline) { offline = true; win.loadFile(path.join(__dirname, 'www', 'index.html')); }
  });
  // links to other sites open in the normal browser
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
  win.loadURL(URL);
}

const menu = Menu.buildFromTemplate([
  { role: 'appMenu' },
  { label: 'View', submenu: [{ role: 'reload' }, { role: 'togglefullscreen' }, { type: 'separator' }, { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' }] },
  { role: 'windowMenu' }
]);
app.whenReady().then(() => { Menu.setApplicationMenu(menu); createWindow(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
app.on('window-all-closed', () => app.quit());
