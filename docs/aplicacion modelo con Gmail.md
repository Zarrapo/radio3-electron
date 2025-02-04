# Crear una Aplicación Electron para Google Mail (Gmail)

## Resumen: Pasos principales para crear la aplicación

### Crear la carpeta y configurar el proyecto

```bash
mkdir electron-google-mail
cd electron-google-mail
npm init -y
```

### Instalar dependencias

```bash
npm install electron --save-dev
npm install electron-store --save
npm install electron-builder --save-dev
```

### Estructura del proyecto y archivos clave

```explorer
electron-google-mail/
├── assets/
│   └── icons/
│       ├── icon.ico
│       ├── icon.icns
│       └── icon.png
├── build/
│   └── installer.nsh    # Personalizar la instalación
├── dist/                # Generado tras la compilación
├── main.js
├── package.json
└── ...
```

### Archivo 'Installer' (build/installer.nsh)

```nsis
!macro customHeader
  !define MUI_DIRECTORYPAGE_TEXT_TOP "Seleccione la carpeta de destino para instalar ${PRODUCT_NAME}."
!macroend

!macro customInit
  StrCpy $INSTDIR "$PROGRAMFILES\${PRODUCT_NAME}"
!macroend
```

### Archivo 'Main' (/main.js)

```js
// main.js
import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

// Definir __dirname manualmente
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Función asíncrona para crear la ventana y manejar la importación de electron-store
async function createWindow() {
  const { default: Store } = await import('electron-store');
  const store = new Store();

  // Establece el nombre de la aplicación (esto se usará en macOS principalmente)
  app.setName("Google Mail Desktop");

  // Determinar el icono según la plataforma
  let iconPath;
  if (process.platform === 'win32') {
    iconPath = path.join(__dirname, 'assets', 'icons', 'icon.ico');
  } else if (process.platform === 'darwin') {
    iconPath = path.join(__dirname, 'assets', 'icons', 'icon.icns');
  } else {
    iconPath = path.join(__dirname, 'assets', 'icons', 'icon.png');
  }

  // Obtener el tamaño anterior almacenado, o usar un tamaño por defecto
  const windowState = store.get('windowState') || { width: 1200, height: 900 };

  // Crear la ventana
  const mainWindow = new BrowserWindow({
    width: windowState.width,
    height: windowState.height,
    icon: iconPath,
    title: "Google Mail Desktop", // Título de la ventana
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
      // puedes agregar más opciones si lo necesitas
    }
  });

  // Ocultar el menú (por si no quieres la barra de menús de Electron)
  mainWindow.setMenu(null);

  // Cargar la URL de la aplicación
  mainWindow.loadURL('https://mail.google.com');

  // Guardar el tamaño y la posición de la ventana al cerrarla
  mainWindow.on('close', () => {
    store.set('windowState', mainWindow.getBounds());
  });
}

// Crear la ventana cuando la aplicación esté lista
app.whenReady().then(createWindow);

// Cerrar la app cuando todas las ventanas estén cerradas (excepto en macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Volver a crear la ventana si la aplicación está activa (solo en macOS)
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
```

### Archivo 'Package' (/package.json)

```json
{
  "name": "electron-google-mail",
  "version": "1.0.0",
  "description": "Aplicación de escritorio para Gmail",
  "main": "main.js",
  "type": "module",
  "scripts": {
    "start": "electron .",
    "build": "electron-builder"
  },
  "author": "Germán",
  "license": "MIT",
  "devDependencies": {
    "electron": "^34.0.2",
    "electron-builder": "^25.1.8"
  },
  "dependencies": {
    "electron-store": "^10.0.1"
  },
  "build": {
    "appId": "es.ordiales.gmail",
    "productName": "Google Mail Desktop",
    "icon": "assets/icons/icon",
    "files": [
      "**/*"
    ],
    "directories": {
      "output": "dist"
    },
    "win": {
      "icon": "assets/icons/icon.ico",
      "target": [
        {
          "target": "nsis",
          "arch": [
            "x64",
            "ia32"
          ]
        }
      ]
    },
    "mac": {
      "icon": "assets/icons/icon.icns",
      "category": "public.app-category.productivity"
    },
    "linux": {
      "icon": "assets/icons/",
      "target": [
        "AppImage"
      ]
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "include": "build/installer.nsh"
    }
  }
}
```

### Probar la aplicación en desarrollo

```bash
npm start
```

### Empaquetar la aplicación

```bash
npm run build
```

---

## Detalle de todos los Pasos para crear la aplicación

En los siguientes apartados se explica de forma detallada todos los pasos necesarios para crear, probar y empaquetar tu aplicación Electron para Google Mail. A continuación, se describe desde la configuración inicial del proyecto, la instalación de dependencias y la organización de la estructura del proyecto, hasta la implementación de los archivos clave (como `main.js`, `package.json` y el script de instalación) y las pruebas en desarrollo.  
Una vez repasados estos pasos, continuarás con el resto de la documentación para perfeccionar y distribuir tu aplicación.

## 1. Crear la carpeta y configurar el proyecto

```bash
mkdir electron-google-mail
cd electron-google-mail
npm init -y
```

### Instalar dependencias

```bash
npm install electron --save-dev
npm install electron-builder --save-dev
npm install electron-store --save
```

> Usamos `electron-store` para guardar el tamaño de la ventana.

Breve explicación de cada comando:

1. **`npm install electron --save-dev`**  
   Esto instala Electron como dependencia de desarrollo. Es decir, se usa solo durante el proceso de desarrollo y no se incluye en el paquete final de producción. Electron te permite crear aplicaciones de escritorio usando tecnologías web (HTML, CSS, JS).

2. **`npm install electron-builder --save-dev`**  
   Con este comando agregas electron-builder, también como dependencia de desarrollo. Electron-builder es una herramienta muy útil para empaquetar y distribuir tu aplicación Electron en diferentes plataformas (Windows, macOS, Linux). Ayuda a automatizar el proceso de creación de instaladores y paquetes.

3. **`npm install electron-store --save`**  
   Aquí instalas electron-store como una dependencia regular. Este paquete proporciona un almacén sencillo basado en JSON para guardar configuraciones o datos de tu aplicación. Es práctico para gestionar ajustes de usuario o persistir información sin complicaciones.

En resumen, estos comandos configuran tu proyecto para desarrollar una app de escritorio con Electron, empacarla para distribución y almacenar configuraciones de manera sencilla.

## 2. Estructura recomendada

Puedes organizar los archivos para los `iconos` de esta manera, solo cambiando nombres y añadiendo (o copiando) los iconos que quieras usar:

```explorer
electron-google-mail/
├── assets/
│   └── icons/
│       ├── icon.ico
│       ├── icon.icns
│       └── icon.png
├── build/
│   └── installer.nsh    # Personalizar la instalación
├── dist/   # Generado tras la compilación
├── main.js
├── package.json
└── ...
```

## 3. Configuración de 'package.json'

Este archivo es el **package.json** de un proyecto Node.js, y en este caso, está configurado para una aplicación de escritorio creada con Electron. Su función es servir como "manifiesto" del proyecto, definiendo toda la información relevante y la configuración necesaria para:

- **Identificar el proyecto:** Incluye detalles básicos como el nombre, la versión, la descripción y el autor.
- **Gestionar dependencias:** Enumera las librerías y herramientas que el proyecto necesita para funcionar (por ejemplo, Electron y electron-store) y las que solo se utilizan en el desarrollo (como electron-builder).
- **Definir scripts:** Proporciona comandos personalizados que facilitan tareas comunes, como iniciar la aplicación o empaquetarla para distribución.
- **Configurar el empaquetado:** A través de la sección "build", se establecen parámetros para generar instaladores y paquetes adaptados a diferentes sistemas operativos (Windows, macOS y Linux).

En resumen, el package.json organiza toda la información técnica y operativa del proyecto, permitiendo una gestión eficiente de las dependencias, la ejecución de scripts y la configuración para distribuir la aplicación de manera óptima.

```json
{
  "name": "electron-google-mail",
  "version": "1.0.0",
  "description": "Aplicación de escritorio para Gmail",
  "main": "main.js",
  "type": "module",
  "scripts": {
    "start": "electron .",
    "build": "electron-builder"
  },
  "author": "Germán",
  "license": "MIT",
  "devDependencies": {
    "electron": "^34.0.2",
    "electron-builder": "^25.1.8"
  },
  "dependencies": {
    "electron-store": "^10.0.1"
  },
  "build": {
    "appId": "es.ordiales.gmail",
    "productName": "Google Mail Desktop",
    "icon": "assets/icons/icon",
    "files": [
      "**/*"
    ],
    "directories": {
      "output": "dist"
    },
    "win": {
      "icon": "assets/icons/icon.ico",
      "target": [
        {
          "target": "nsis",
          "arch": [
            "x64",
            "ia32"
          ]
        }
      ]
    },
    "mac": {
      "icon": "assets/icons/icon.icns",
      "category": "public.app-category.productivity"
    },
    "linux": {
      "icon": "assets/icons/",
      "target": [
        "AppImage"
      ]
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "include": "build/installer.nsh"
    }
  }
}
```

Te explico qué significa cada parte de este `package.json`:

1. **Metadatos básicos**  
   - `"name": "electron-google-mail"`: Es el nombre de tu proyecto.  
   - `"version": "1.0.0"`: La versión actual de la aplicación.  
   - `"description": "Aplicación de escritorio para Gmail"`: Una breve descripción de lo que hace la app.  
   - `"main": "main.js"`: Indica el punto de entrada de la aplicación, es decir, el archivo principal que se ejecutará cuando inicies Electron.  
   - `"type": "module"`: Permite usar módulos ES en Node.js, lo que significa que puedes usar `import` y `export` en lugar de `require`.

2. **Scripts**  
   - `"start": "electron ."`: Este script arranca la aplicación Electron. Cuando ejecutas `npm start`, se lanza la app.  
   - `"build": "electron-builder"`: Ejecuta electron-builder para empaquetar y crear instaladores para la app.

3. **Información del autor y licencia**  
   - `"author": "Germán"`: Credita a quien desarrolló la aplicación.  
   - `"license": "MIT"`: Define la licencia de uso del software.

4. **Dependencias**  
   - `"devDependencies"`:  
     - `"electron": "^34.0.2"`: Especifica la versión de Electron que se usará, instalada como dependencia de desarrollo.  
     - `"electron-builder": "^25.1.8"`: Herramienta para empaquetar la aplicación en diferentes plataformas, también como dependencia de desarrollo.
   - `"dependencies"`:  
     - `"electron-store": "^10.0.1"`: Se instala como dependencia normal y sirve para guardar configuraciones o datos de la app de forma sencilla.

5. **Configuración de build para electron-builder**  
   Dentro de la sección `"build"` se configuran varias opciones para el empaquetado y distribución:
   - `"appId": "es.ordiales.gmail"`: Identificador único de la app.  
   - `"productName": "Google Mail Desktop"`: Nombre que aparecerá en los instaladores y en la aplicación empaquetada.  
   - `"icon": "assets/icons/icon"`: Ruta base para los íconos de la app.
   - `"files": ["**/*"]`: Indica que se incluirán todos los archivos y directorios en el paquete final.
   - `"directories": { "output": "dist" }`: Especifica que los artefactos de build se colocarán en la carpeta `dist`.

   **Plataformas específicas:**
   - **Windows (`"win"`)**:
     - `"icon": "assets/icons/icon.ico"`: Ícono específico para Windows.  
     - `"target"`: Configuración del empaquetado. Se define NSIS como target, con soporte para arquitecturas `x64` e `ia32`.
   - **macOS (`"mac"`)**:
     - `"icon": "assets/icons/icon.icns"`: Ícono específico para macOS.  
     - `"category": "public.app-category.productivity"`: Categoría de la app en la App Store (o simplemente para clasificación).
   - **Linux (`"linux"`)**:
     - `"icon": "assets/icons/"`: Ruta de los íconos para Linux (se espera que haya diferentes formatos en esa carpeta).  
     - `"target": ["AppImage"]`: Define que se creará un paquete tipo AppImage.

   - **NSIS Configuración (`"nsis"`)**:
     - `"oneClick": false`: Configura el instalador para que no sea de un solo clic, permitiendo un proceso interactivo.
     - `"allowToChangeInstallationDirectory": true`: Permite al usuario cambiar el directorio de instalación.
     - `"include": "build/installer.nsh"`: Incluye un script adicional para personalizar el instalador NSIS.

## 4. Configuración del archivo principal 'main.js'

En una aplicación Electron, el archivo `main.js` es el punto de entrada del proceso principal (main process). Esto quiere decir que desde aquí se inicializa la aplicación, se crean las ventanas y se manejan eventos globales de la app. En nuestro caso, `main.js` se encarga de crear una ventana que carga Gmail, configurar la aplicación (por ejemplo, el icono y el título), y gestionar la persistencia del estado de la ventana (tamaño y posición) usando `electron-store`.

```js
// main.js
import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

// Definir __dirname manualmente
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Función asíncrona para crear la ventana y manejar la importación de electron-store
async function createWindow() {
  const { default: Store } = await import('electron-store');
  const store = new Store();

  // Establece el nombre de la aplicación (esto se usará en macOS principalmente)
  app.setName("Google Mail Desktop");

  // Determinar el icono según la plataforma
  let iconPath;
  if (process.platform === 'win32') {
    iconPath = path.join(__dirname, 'assets', 'icons', 'icon.ico');
  } else if (process.platform === 'darwin') {
    iconPath = path.join(__dirname, 'assets', 'icons', 'icon.icns');
  } else {
    iconPath = path.join(__dirname, 'assets', 'icons', 'icon.png');
  }

  // Obtener el tamaño anterior almacenado, o usar un tamaño por defecto
  const windowState = store.get('windowState') || { width: 1200, height: 900 };

  // Crear la ventana
  const mainWindow = new BrowserWindow({
    width: windowState.width,
    height: windowState.height,
    icon: iconPath,
    title: "Google Mail Desktop", // Título de la ventana
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
      // puedes agregar más opciones si lo necesitas
    }
  });

  // Ocultar el menú (por si no quieres la barra de menús de Electron)
  mainWindow.setMenu(null);

  // Cargar la URL de la aplicación
  mainWindow.loadURL('https://mail.google.com');

  // Guardar el tamaño y la posición de la ventana al cerrarla
  mainWindow.on('close', () => {
    store.set('windowState', mainWindow.getBounds());
  });
}

// Crear la ventana cuando la aplicación esté lista
app.whenReady().then(createWindow);

// Cerrar la app cuando todas las ventanas estén cerradas (excepto en macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Volver a crear la ventana si la aplicación está activa (solo en macOS)
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
```

### Comentario detallado del código

```js
// main.js
import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

// Definir __dirname manualmente
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```

- **Importaciones iniciales:**  
  Se importan `app` y `BrowserWindow` de Electron, que son esenciales para controlar la vida de la aplicación y crear ventanas.  
  Además, se importan módulos nativos de Node.js como `path` y `url` para trabajar con rutas y determinar el directorio actual, ya que al usar módulos ES (`type: "module"` en package.json) no tenemos acceso directo a `__dirname`.

```js
// Función asíncrona para crear la ventana y manejar la importación de electron-store
async function createWindow() {
  const { default: Store } = await import('electron-store');
  const store = new Store();
```

- **Función `createWindow`:**  
  Esta función asíncrona se encarga de crear la ventana principal de la app.  
  Primero, importa dinámicamente `electron-store` para gestionar la persistencia de datos (como el estado de la ventana). Esto permite que se almacenen configuraciones y se recuperen al iniciar la aplicación.

```js
  // Establece el nombre de la aplicación (esto se usará en macOS principalmente)
  app.setName("Google Mail Desktop");
```

- **Establecer el nombre de la app:**  
  Se define el nombre que se mostrará, especialmente relevante en macOS para la identificación de la aplicación en el sistema.

```js
  // Determinar el icono según la plataforma
  let iconPath;
  if (process.platform === 'win32') {
    iconPath = path.join(__dirname, 'assets', 'icons', 'icon.ico');
  } else if (process.platform === 'darwin') {
    iconPath = path.join(__dirname, 'assets', 'icons', 'icon.icns');
  } else {
    iconPath = path.join(__dirname, 'assets', 'icons', 'icon.png');
  }
```

- **Selección del icono:**  
  Según el sistema operativo (Windows, macOS o Linux), se establece la ruta al icono correspondiente. Esto asegura que la app tenga una apariencia nativa en cada plataforma.

```js
  // Obtener el tamaño anterior almacenado, o usar un tamaño por defecto
  const windowState = store.get('windowState') || { width: 1200, height: 900 };
```

- **Gestión del estado de la ventana:**  
  Se recupera el tamaño y la posición de la ventana almacenados previamente. Si no hay datos, se usan valores por defecto.

```js
  // Crear la ventana
  const mainWindow = new BrowserWindow({
    width: windowState.width,
    height: windowState.height,
    icon: iconPath,
    title: "Google Mail Desktop", // Título de la ventana
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
      // puedes agregar más opciones si lo necesitas
    }
  });
```

- **Creación de la ventana principal:**  
  Se instancia un objeto `BrowserWindow` con:
  - **Dimensiones:** Basadas en el estado recuperado.
  - **Icono:** El path determinado anteriormente.
  - **Título:** Que se muestra en la barra de título.
  - **Preferencias web:** Configuraciones de seguridad, donde se desactiva la integración de Node en el render process para mayor seguridad y se activa el aislamiento del contexto.

```js
  // Ocultar el menú (por si no quieres la barra de menús de Electron)
  mainWindow.setMenu(null);
```

- **Personalización de la ventana:**  
  Se oculta la barra de menús de Electron para una experiencia más limpia, aunque esto es opcional.

```js
  // Cargar la URL de la aplicación
  mainWindow.loadURL('https://mail.google.com');
```

- **Carga de contenido:**  
  La ventana creada carga la página de Gmail directamente, convirtiendo nuestra app en un contenedor para el correo de Google.

```js
  // Guardar el tamaño y la posición de la ventana al cerrarla
  mainWindow.on('close', () => {
    store.set('windowState', mainWindow.getBounds());
  });
}
```

- **Persistencia del estado:**  
  Antes de cerrar la ventana, se guarda su tamaño y posición en `electron-store`. Esto permite que, al reabrir la app, se mantenga la última configuración del usuario.

### Gestión de eventos de la aplicación

```js
// Crear la ventana cuando la aplicación esté lista
app.whenReady().then(createWindow);
```

- **Inicio de la aplicación:**  
  Cuando Electron termina su proceso de inicialización, se llama a `createWindow` para abrir la ventana principal.

```js
// Cerrar la app cuando todas las ventanas estén cerradas (excepto en macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
```

- **Cierre de la app:**  
  En sistemas que no son macOS, la aplicación se cierra completamente cuando todas las ventanas han sido cerradas. En macOS es común mantener la app activa hasta que el usuario la cierre explícitamente.

```js
// Volver a crear la ventana si la aplicación está activa (solo en macOS)
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
```

- **Reactivación en macOS:**  
  En macOS, cuando se hace clic en el icono de la app en el Dock y no hay ventanas abiertas, se vuelve a crear la ventana principal.

### Resumen

- **Función principal (`main.js`):**  
  Sirve como el núcleo de la aplicación Electron. Desde aquí se inicializa la app, se configuran elementos esenciales (nombre, icono, tamaño de ventana), se carga el contenido (Gmail) y se gestionan eventos globales para asegurar una experiencia de usuario coherente en diferentes sistemas operativos.

- **Contexto con lo que ya sabemos:**  
  Hemos visto en el `package.json` cómo se definen las dependencias y scripts para iniciar y empaquetar la aplicación. `main.js` complementa esto siendo el encargado de construir la ventana que mostrará Gmail y gestionar la persistencia del estado (por ejemplo, tamaño y posición de la ventana) mediante `electron-store`.

Espero que este comentario y explicación te ayude a comprender mejor la función y el funcionamiento del archivo `main.js` en tu proyecto. ¡Un saludo y a seguir desarrollando!

## 5. Probar la aplicación en desarrollo

### Prueba de la aplicación en desarrollo con `npm start`

Para ver tu app en acción mientras la desarrollas, puedes utilizar el comando `npm start`. Se ejecuta el script `start` definido en el `package.json`. Inicia el proceso principal de Electron y abre la ventana de tu aplicación.

```json
//package.json
...
"scripts": {
    "start": "electron .",
    "build": "electron-builder"
  },
...
```

 Sigue estos pasos:

**Ejecuta el comando de inicio:**  
Abre una terminal en la raíz del proyecto y ejecuta:

```bash
npm start
```

Esto lanzará la aplicación en modo desarrollo, creando la ventana configurada en `main.js` y cargando Gmail en ella.

**Observa y depura:**  
Una vez que la ventana esté abierta, podrás interactuar con la aplicación y ver en la terminal o en las herramientas de desarrollo de Electron cualquier mensaje o error que te ayude a depurar el proyecto.

Con estos pasos podrás probar tu aplicación en desarrollo usando `npm start`. Así es más fácil ir iterando y ajustando detalles a medida que avanzas en el proyecto.

> Probablemente la barra de tareas siga diciendo “Electron” hasta que empaquetes la aplicación.

## 6. Empaquetar la aplicación

Para generar el instalador para Windows, macOS o Linux, ejecuta:

```bash
npm run build
```

- Se creará una carpeta `dist` con el instalador y/o ejecutable según tu plataforma.
- Al instalar y abrir esa versión, en la barra de tareas ya debería aparecer “Google Mail Desktop” (o como hayas llamado a tu `productName`) y con el icono que hayas configurado.

### Empaquetar la aplicación: Referencia al código en package.json

Cuando ejecutamos `npm run build`, **electron-builder** utiliza la configuración especificada en la sección `"build"` de nuestro `package.json`. Veamos cómo se relaciona esto con el código:

- **Identificación y metadatos de la aplicación:**  
  En el `package.json` encontramos:

  ```json
  "name": "electron-google-mail",
  "version": "1.0.0",
  "description": "Aplicación de escritorio para Gmail",
  "author": "Germán",
  "license": "MIT"
  ```

  Estos datos permiten identificar la aplicación y proporcionan información básica que puede ser usada en distintos contextos (como en las propiedades de la app empaquetada).

- **Configuración del empaquetado:**  
  La sección `"build"` es fundamental para definir cómo se creará el instalador para cada plataforma:
  
  ```json
  "build": {
    "appId": "es.ordiales.gmail",
    "productName": "Google Mail Desktop",
    "icon": "assets/icons/icon",
    "files": [
      "**/*"
    ],
    "directories": {
      "output": "dist"
    },
    "win": {
      "icon": "assets/icons/icon.ico",
      "target": [
        {
          "target": "nsis",
          "arch": [
            "x64",
            "ia32"
          ]
        }
      ]
    },
    "mac": {
      "icon": "assets/icons/icon.icns",
      "category": "public.app-category.productivity"
    },
    "linux": {
      "icon": "assets/icons/",
      "target": [
        "AppImage"
      ]
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "include": "build/installer.nsh"
    }
  }
  ```
  
  - **Windows:**  
    La configuración bajo `"win"` indica que se creará un instalador NSIS. Con `"oneClick": false` y `"allowToChangeInstallationDirectory": true` en la sección `"nsis"`, el instalador será interactivo, permitiendo al usuario elegir dónde instalar la aplicación. Además, se especifica el uso del ícono `assets/icons/icon.ico` y se soportan las arquitecturas `x64` e `ia32`.
  
  - **macOS:**  
    Bajo `"mac"`, se indica que la app se empaquetará como una aplicación nativa de macOS, usando el ícono `assets/icons/icon.icns` y clasificándola en la categoría `public.app-category.productivity` para una integración adecuada en el sistema.
  
  - **Linux:**  
    La sección `"linux"` especifica que se generará un paquete en formato **AppImage** utilizando los íconos contenidos en `assets/icons/`, lo que facilita la distribución en diversas distribuciones de Linux.

- **Resultado del empaquetado:**  
  La propiedad `"directories": { "output": "dist" }` establece que todos los archivos resultantes se ubicarán en la carpeta `dist`, lo que facilita su localización y distribución posterior.

En resumen, el código del `package.json` define de forma clara y específica el tipo de instalador que se generará para cada plataforma: un instalador NSIS interactivo para Windows, una aplicación nativa para macOS y un paquete AppImage para Linux. Esta configuración asegura que, al ejecutar `npm run build`, se produzcan instaladores optimizados y adaptados a las convenciones de cada sistema operativo, garantizando una distribución profesional de tu aplicación.

---
