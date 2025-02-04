// Instalar Dependencias desde el terminal
/*
npm install electron --save-dev
npm install electron-store --save
npm install electron-builder --save-dev
*/

// Script de Inicio
// npm start

// Script de Empaquetado
// npm run build

// Importar los módulos necesarios 
import { app, BrowserWindow, session } from 'electron';
import { fileURLToPath } from 'url';
import path from 'path';
import Store from 'electron-store';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Definir la variable de la ventana principal
let mainWindow;
// Instancia de almacenamiento de datos
const store = new Store();

// Configurar la sesión de Electron
function createWindow() {
  // Obtener el tamaño y la posición de la ventana almacenados, o usar valores por defecto
  const windowState = store.get('windowState') || { x: undefined, y: undefined, width: 1200, height: 900 };
  
  // Crear la ventana principal
  mainWindow = new BrowserWindow({
    x: windowState.x,
    y: windowState.y,
    width: windowState.width,
    height: windowState.height,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Usa el script preload
      contextIsolation: true, // Asegura que los contextos están separados
      enableRemoteModule: false,
      nodeIntegration: false // Desactiva Node.js en el renderer por seguridad
    },
    icon: path.join(__dirname, 'assets', 'icons', 'icon.ico') // Asignar el icono
  });

  // Ocultar la barra de menús de Electron
  mainWindow.setMenu(null);

  // Cargar la URL de la aplicación (en este ejemplo, una web)
  //mainWindow.loadURL('https://www.radio-espana.es/radio-3?utm_source=homescreen');
  mainWindow.loadURL('https://www.ivoox.com/escuchar-online-radio-3_tw_64_1.html');

  // Guardar el estado y el tamaño de la ventana al cerrarla
  mainWindow.on('close', () => {
    store.set('windowState', mainWindow.getBounds());
  });

  // Limpiar la referencia de la ventana al cerrarla
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Crear ventana y manejo de errores al iniciar
//app.whenReady().then(createWindow).catch(console.error);
app.whenReady().then(() => {
  // Bloqueo de dominios de anuncios en la sesión
  session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
    // Lista de patrones de URL que quieras bloquear
    const blockedDomains = [
      'safeframe.googlesyndication.com',
      'googletagservices.com',
      // añade más si lo necesitas
    ];
    
    // Si la URL contiene alguno de los dominios bloqueados, cancelar la solicitud
    if (blockedDomains.some(domain => details.url.includes(domain))) {
      console.log("Bloqueando URL: ", details.url);
      return callback({ cancel: true });
    }
    callback({ cancel: false });
  });

  // Crear la ventana principal
  createWindow();
}).catch(console.error);




app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
