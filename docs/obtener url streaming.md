# Obtener la URL de Streaming de una Emisora de Radio

Este documento explica cómo obtener la URL de streaming de cualquier emisora de radio utilizando herramientas del navegador, lo que permite integrar emisoras en aplicaciones personalizadas, como la que estás desarrollando con Electron.

## Pasos para Obtener la URL de Streaming

### 1. Acceder a la Página Web de la Emisora

Visita el sitio web oficial de la emisora de radio que deseas agregar a tu aplicación.

### 2. Iniciar la Reproducción en el Navegador

Comienza a reproducir la emisora directamente desde la página web.

### 3. Abrir las Herramientas de Desarrollo del Navegador

- Presiona la tecla `F12` para abrir el inspector de elementos.
- Haz clic en la pestaña `Red` o `Network` para ver las solicitudes que realiza la página.

### 4. Recargar la Página

Presiona el botón de recarga o `F5` para volver a cargar la página y capturar todas las solicitudes desde el inicio.

### 5. Filtrar por Tipo 'Media'

En la lista de solicitudes, busca aquellas cuyo tipo sea `media`. Estas suelen corresponder al flujo de audio o video.

### 6. Copiar la URL del Flujo de Audio

- Haz clic derecho en la solicitud identificada como `media`.
- Selecciona `Copiar` y luego `Copiar URL`.

### 7. Verificar la URL

Pega la URL copiada en un reproductor como **VLC** para asegurarte de que corresponde al flujo de la emisora deseada.

## **Consideraciones Finales**

- Algunas emisoras pueden cambiar sus URLs de streaming periódicamente o implementar medidas para evitar el acceso directo.
- Es importante asegurarse de que el uso de estas URLs cumple con los términos de servicio de la emisora.
- Este método te permite obtener la URL directa del flujo de la emisora, que puedes utilizar en tu aplicación Electron para reproducir la radio sin depender de la interfaz web original.

Para más detalles y capturas de pantalla que ilustran el proceso, puedes consultar el artículo completo en **Geekland\.eu:** [Obtener la URL para poder escuchar cualquier radio en Streaming](https://geekland.eu/obtener-la-url-para-escuchar-radio-en-streaming/)
