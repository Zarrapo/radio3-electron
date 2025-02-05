import { app, BrowserWindow, ipcMain, Menu, Tray, shell } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import Store from 'electron-store';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const store = new Store();
let mainWindow;
let tray;
let aboutWindow = null; // Nueva variable global para la ventana "Acerca de"
let isFirstUserAction = true;
let isModalOpen = false; // Nueva variable para controlar la ventana modal

app.whenReady().then(() => {
    createTray();
    createWindow();
    
    app.setLoginItemSettings({
        openAtLogin: true,
        openAsHidden: true,
    });
});

function createTray() {
    tray = new Tray(path.join(__dirname, 'assets', 'icons', 'rne.ico'));
    tray.setToolTip('Reproductor de Radio');
    
    // Actualización del menú contextual del tray con "Acerca de" al final separado por un separador
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Mostrar/Ocultar', click: () => {
            if (mainWindow.isVisible()) { mainWindow.hide(); } 
            else { mainWindow.show(); playLastStation(); }
        }},
        { label: 'Mover', click: () => { mainWindow.webContents.send('start-window-move'); } },
        { label: 'Salir', click: () => {
            if(aboutWindow){ 
                aboutWindow.removeAllListeners('close');
                aboutWindow.destroy();
            }
            if(mainWindow){
                mainWindow.removeAllListeners('close');
                mainWindow.destroy();
            }
            app.quit();
        }},
        { type: 'separator' },
        { label: 'Acerca de', click: () => { createAboutWindow(); } }
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

    // Cargar el archivo HTML de la ventana principal
    mainWindow.loadFile(path.join(__dirname, 'index.html'));

    // Eliminar menú de Electron
    Menu.setApplicationMenu(null);

    // Actualización del menú contextual para la ventana: se separa "Acerca de" con un separador
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Mostrar/Ocultar', click: () => {
            if (mainWindow.isVisible()) { mainWindow.hide(); } 
            else { mainWindow.show(); playLastStation(); }
        }},
        { label: 'Mover', click: () => { mainWindow.webContents.send('start-window-move'); } },
        { label: 'Salir', click: () => {
            if(mainWindow){
                mainWindow.removeAllListeners('close'); // Remover listeners para evitar error
                mainWindow.destroy();
            }
            app.quit();
        }},
        { type: 'separator' },
        { label: 'Acerca de', click: () => { createAboutWindow(); } }
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

    mainWindow.on('blur', () => {
        if (!isModalOpen) {
            mainWindow.hide();
        }
    });

    mainWindow.webContents.on('context-menu', () => {
        contextMenu.popup();
    });
}

// IPC para obtener la posición actual de la ventana
ipcMain.handle('get-window-position', () => {
    return mainWindow.getPosition();
});

// IPC para actualizar la posición de la ventana
ipcMain.on('update-window-position', (event, pos) => {
    mainWindow.setPosition(pos.x, pos.y);
    // Guardar la nueva posición
    const bounds = mainWindow.getBounds();
    store.set('windowState', bounds);
});

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

function createAboutWindow() {
    if (!mainWindow.isVisible()) {
        mainWindow.show(); // Mostrar la aplicación si está oculta
    }
    isModalOpen = true; // Indicar que se abre la ventana modal
    aboutWindow = new BrowserWindow({
        width: 400,
        height: 400,
        resizable: false,
        minimizable: false,
        maximizable: false,
        parent: mainWindow,
        modal: true,
        title: 'Acerca de',
        icon: path.join(__dirname, 'assets', 'icons', 'Info.ico'), // Nuevo icono
        webPreferences: { 
            nodeIntegration: true,
            contextIsolation: false 
        }
    });
    aboutWindow.setMenu(null);
    aboutWindow.loadFile(path.join(__dirname, 'about.html'));
    // Al cerrarse, se limpia la variable y se vuelve a situar el foco sobre la aplicación
    aboutWindow.on('closed', () => {
        isModalOpen = false; // Restablecer bandera de modal cerrado
        aboutWindow = null; // Limpiar la referencia
        mainWindow.show();
        mainWindow.focus();
    });

    // Configuramos el handler para abrir enlaces externamente
    aboutWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });
}
