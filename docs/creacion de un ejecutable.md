# Creación de un ejecutable para una aplicación Electron

Vamos a ver como crear un ejecutable para tu aplicación Electron, incluyendo las diferencias entre las instalaciones `nsis` y `portable`, y cómo permitir al usuario establecer una ruta de instalación personalizada.

## Tipos de Instalación

### portable

- **Descripción**: Crea un ejecutable que no requiere instalación. El usuario puede ejecutar la aplicación directamente desde cualquier ubicación sin necesidad de instalarla.
- **Ventajas**: Fácil de distribuir y ejecutar. No requiere permisos de administrador para ejecutar.
- **Desventajas**: Puede dejar archivos temporales en el sistema. No crea accesos directos ni entradas en el menú de inicio.

### nsis

- **Descripción**: Crea un instalador que instala la aplicación en una ubicación fija en el sistema (por ejemplo, `C:\Program Files\{productName}`). Este instalador puede crear accesos directos y entradas en el menú de inicio.
- **Ventajas**: Proporciona una experiencia de instalación más completa. Permite la personalización de la ruta de instalación y la creación de accesos directos.
- **Desventajas**: Requiere permisos de administrador para instalar. Puede ser más complejo de configurar.

## Configuración de 'package.json'

### Configuración para `portable`

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
    "portable": {
      "useZip": false,
      "artifactName": "${productName}-portable.${ext}"
    },
    "win": {
      "icon": "assets/icons/icon.ico",
      "target": [
        {
          "target": "portable",
          "arch": [
            "x64"
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
    }
  }
}
```

En este ejemplo, la sección

```json
"portable": { "useZip": false }
```

Se encuentra dentro del objeto `build`, lo que aplica esa configuración cuando generes el target "portable" en Windows. Esto le indicará a electron-builder que, al generar la versión portable, no utilice un archivo ZIP sino el formato por defecto.

### Configuración para `nsis`

Con lq opción `nsis` puedes crear un ejecutable para instalar la aplicación. En este apartado vamos a abordar tambien una **Ruta de Instalación Personalizada**.

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
    // Definimos la ruta de la carpeta 'build' 
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "include": "build/installer.nsh"
    }
  }
}
```

## Script NSIS Personalizado

Si no tienes un directorio `build` en tu proyecto, puedes crearlo tú mismo. Este directorio se utilizará para almacenar el archivo `installer.nsh` que personalizará el instalador NSIS.

### Pasos para crear el directorio `build`

1. **Crear el directorio `build`**:
   En la raíz de tu proyecto, crea un nuevo directorio llamado `build`.

2. **Crear el archivo `installer.nsh`**:
   Dentro del directorio `build`, crea un archivo llamado `installer.nsh`.

### Estructura del Proyecto

Tu estructura de proyecto debería verse algo así:

```explorer
/d:/OneDrive/Desarrollo/JavaScript/Proyectos/Aplicaciones con Electron/electron-google-mail.v1/
├── assets/
│   └── icons/
│       ├── icon.ico
│       ├── icon.icns
│       └── icon.png
├── build/
│   └── installer.nsh
├── dist/
├── main.js
├── package.json
└── ...
```

### Contenido del archivo `installer.nsh`

Crea un archivo llamado `installer.nsh` en el directorio `build` de tu proyecto. Este script te permitirá personalizar la ruta de instalación.

```nsh
!macro customHeader
  !define MUI_DIRECTORYPAGE_TEXT_TOP "Seleccione la carpeta de destino para instalar ${PRODUCT_NAME}."
!macroend

!macro customInit
  StrCpy $INSTDIR "$PROGRAMFILES\${PRODUCT_NAME}"
!macroend
```

## Opciones Adicionales

### Establecer Carpeta para Datos del Usuario

Si quieres evitar que Electron guarde datos en AppData, puedes ejecutar la app con:

```js
app.setPath("userData", path.join(__dirname, "data"));
```

Generalmente, debes llamar a `app.setPath("userData", ...)` en el proceso principal (main process), antes de que se necesite acceder a la ruta de datos del usuario. La ubicación recomendada es justo al inicio del archivo principal (por ejemplo, en tu `main.js` o `src/index.js`), antes de crear la ventana o incluso antes de `app.whenReady()`.  

Por ejemplo, podrías estructurarlo así:

```js
// Importar Modulos
import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

// Importa el módulo fs
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Establece la ruta de los datos del usuario
/*
"userData" es la clave que usa Electron para identificar la ubicación de los datos del usuario.
"data" es el nombre de la carpeta que has decidido usar y que, al asignarla con app.setPath("userData", path.join(__dirname, "data")), se convertirá en la ruta que Electron usará para userData.
*/
const userDataPath = path.join(__dirname, "data");

app.setPath("userData", userDataPath);

// Verificar si la carpeta existe, y si no, crearla
if (!fs.existsSync(userDataPath)) {
  fs.mkdirSync(userDataPath, { recursive: true });
}


function createWindow() {
  // Código para crear la ventana...
  const mainWindow = new BrowserWindow({
    // Opciones de la ventana...
  });

  mainWindow.loadURL('https://mail.google.com');
  // Resto de la configuración...
}

app.whenReady().then(createWindow);
```

La carpeta que indiques en `app.setPath("userData", ...)` **no la crea automáticamente** el instalador o el builder. Eso significa que, por defecto, si tu aplicación intenta escribir datos en esa ruta, algunas librerías (como electron-store) pueden encargarse de crear la carpeta si no existe. Sin embargo, si tienes código que asuma su existencia o quieres asegurarte de que la estructura de directorios esté lista desde el inicio, es buena práctica comprobar y crear la carpeta manualmente. Por ejemplo, como hemos hecho, usando el módulo `fs` de Node.  
De este modo, te aseguras de que la carpeta `data` exista antes de que se intente acceder a ella en cualquier parte de tu aplicación. ¡Espero que esto aclare tu duda!

## Generar el Instalador

Para generar el instalador, ejecuta el siguiente comando:

```bash
npm run build
```

Esto generará un instalador `.exe` en el directorio `dist`. Ejecuta este instalador para instalar tu aplicación en la ruta especificada por el usuario.

## Resumen

- **`portable`**: Crea un ejecutable que no requiere instalación. El usuario puede ejecutar la aplicación directamente desde cualquier ubicación.
- **`nsis`**: Crea un instalador que instala la aplicación en una ubicación fija en el sistema. Permite al usuario seleccionar la ruta de instalación y crea accesos directos y entradas en el menú de inicio.

Elige la opción que mejor se adapte a tus necesidades y ajusta la configuración en tu `package.json` en consecuencia.

---
