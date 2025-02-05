import { app, BrowserWindow, ipcMain, Menu, Tray } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import Store from 'electron-store';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const store = new Store();
let mainWindow;
let tray;
let isFirstUserAction = true;

app.whenReady().then(() => {
    createTray();
    createWindow();
    
    app.setLoginItemSettings({
        openAtLogin: true
    });
});

function createTray() {
    tray = new Tray(path.join(__dirname, 'assets', 'icons', 'rne.ico'));
    tray.setToolTip('Reproductor de Radio');
    
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Mostrar/Ocultar', click: () => {
            if (mainWindow.isVisible()) {
                mainWindow.hide();
            } else {
                mainWindow.show();
                playLastStation();
            }
        }},
        { label: 'Salir', click: () => {
            mainWindow.destroy();
            app.quit();
        }}
    ]);
    
    tray.setContextMenu(contextMenu);
    
    tray.on('click', () => {
        if (mainWindow.isVisible()) {
            mainWindow.hide();
        } else {
            mainWindow.show();
            playLastStation();
        }
    });
}

function createWindow() {
    const windowState = store.get('windowState', { width: 200, height: 300, x: undefined, y: undefined });
    const lastStation = store.get('lastStation', 'https://dispatcher.rndfnk.com/crtve/rner3/main/mp3/high');

    mainWindow = new BrowserWindow({
        width: windowState.width,
        height: windowState.height,
        x: windowState.x,
        y: windowState.y,
        icon: path.join(__dirname, 'assets', 'icons', 'rne.ico'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        show: false, // No mostrar en la barra de tareas al inicio
        skipTaskbar: true, // No aparece en la barra de tareas
        frame: false, // Elimina los controles de minimizar, maximizar y cerrar
        //resizable: true // Permite redimensionar
        resizable: false // Permite redimensionar
    });

    mainWindow.loadFile(path.join(__dirname, 'index.html'));

    // Eliminar menú de Electron
    Menu.setApplicationMenu(null);

    const contextMenu = Menu.buildFromTemplate([
        { label: 'Mostrar/Ocultar', click: () => {
            if (mainWindow.isVisible()) {
                mainWindow.hide();
            } else {
                mainWindow.show();
                playLastStation();
            }
        }},
        { label: 'Salir', click: () => {
            mainWindow.destroy();
            app.quit();
        }}
    ]);

    mainWindow.webContents.once('did-finish-load', () => {
        mainWindow.webContents.send('load-last-station', lastStation);
    });

    mainWindow.on('close', (event) => {
        event.preventDefault();
        store.set('windowState', mainWindow.getBounds()); // Guarda tamaño y posición
        mainWindow.hide(); // Ocultar en lugar de cerrar
    });

    mainWindow.on('resize', () => {
        store.set('windowState', mainWindow.getBounds()); // Guarda tamaño en cada cambio
    });

    mainWindow.on('move', () => {
        store.set('windowState', mainWindow.getBounds()); // Guarda posición
    });

    mainWindow.webContents.on('context-menu', () => {
        contextMenu.popup();
    });
}

function playLastStation() {
    const lastStation = store.get('lastStation');
    if (lastStation) {
        mainWindow.webContents.send('play-last-station', lastStation);
    }
}

// Guardar la última emisora seleccionada y reproducir solo tras la primera acción del usuario
ipcMain.on('change-station', (event, url) => {
    store.set('lastStation', url);
    if (isFirstUserAction) {
        playLastStation();
        isFirstUserAction = false;
    }
});
