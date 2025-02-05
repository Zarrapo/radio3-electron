# Inicio Automático en Electron

Este documento describe cómo configurar el inicio automático de una aplicación desarrollada con Electron, evitando que en modo desarrollo se cree una entrada en el registro de Windows.

## Problema

Cuando se ejecuta la aplicación con `npm start`, Electron puede agregar una entrada en el registro de Windows en:

```regedit
HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Run
```

Esto hace que la aplicación se inicie automáticamente, lo cual solo es deseado en una versión empaquetada.

## Solución

Para evitar que la configuración de inicio automático se aplique en modo desarrollo, podemos modificar el código para que solo se ejecute cuando la aplicación esté empaquetada y en producción.

### Código corregido

```javascript
const isDev = !app.isPackaged || process.argv.includes('--dev');

app.whenReady().then(() => {
    createTray();
    createWindow();
    
    if (!isDev) {
        app.setLoginItemSettings({
            openAtLogin: true,
            openAsHidden: true,
        });
    }
});
```

### Explicación

1. **`!app.isPackaged`**: Detecta si la aplicación está en modo desarrollo.
2. **`process.argv.includes('--dev')`**: Permite forzar el modo desarrollo ejecutando `npm start -- --dev`.
3. **Evita configurar `setLoginItemSettings` si la aplicación está en desarrollo.**

## Alternativa: Uso de `NODE_ENV`

Para asegurarnos de que el entorno está bien definido, podemos establecer `NODE_ENV` en el `package.json`:

```json
"scripts": {
  "start": "cross-env NODE_ENV=development electron .",
  "build": "cross-env NODE_ENV=production electron-builder"
}
```

**Nota:** Se recomienda instalar `cross-env` para definir variables de entorno en diferentes sistemas operativos:

```cmd
npm install --save-dev cross-env
```

## Consideraciones Finales

- Asegúrate de probar la aplicación en ambos entornos.
- `app.isPackaged` es suficiente en la mayoría de los casos, pero `NODE_ENV` puede ser un extra de seguridad.
- Puedes agregar `console.log` en `isDev` para depuración y verificar que la detección de entorno funciona correctamente.

Con estos cambios, la configuración de inicio automático solo se aplicará en versiones empaquetadas y evitará problemas en modo desarrollo.

---
