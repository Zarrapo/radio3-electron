## 📌 Ubicaciones de Inicio Automático de Aplicaciones

### 🖥 **Windows**

Windows permite ejecutar aplicaciones al inicio desde diferentes ubicaciones, dependiendo del usuario y el nivel de permisos.

#### 📂 **Carpetas de Inicio Automático**

| Ubicación | Descripción |
|-----------|------------|
| `C:\Users\TU_USUARIO\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup` | Inicio automático solo para el usuario actual. |
| `C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Startup` | Inicio automático para todos los usuarios. |

#### 🔑 **Registro de Windows**

| Clave del Registro | Descripción |
|-------------------|-------------|
| `HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Run` | Inicia programas solo para el usuario actual. |
| `HKEY_LOCAL_MACHINE\Software\Microsoft\Windows\CurrentVersion\Run` | Inicia programas para todos los usuarios. |
| `HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\RunOnce` | Se ejecuta solo una vez al iniciar sesión. |
| `HKEY_LOCAL_MACHINE\Software\Microsoft\Windows\CurrentVersion\RunOnce` | Se ejecuta solo una vez en el arranque del sistema. |

#### 📜 **Tareas Programadas**

Windows también permite ejecutar aplicaciones al inicio mediante el **Programador de Tareas** (`taskschd.msc`).

- Ubicación en el Registro:  
  `HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Schedule\TaskCache\Tree\`
- Ruta en el disco:  
  `C:\Windows\System32\Tasks\`

---

### 🐧 **Linux**

En Linux, los scripts y programas pueden iniciarse automáticamente a través de varios métodos.

#### 📂 **Directorios de Inicio Automático**

| Ubicación | Descripción |
|-----------|------------|
| `~/.config/autostart/` | Archivos `.desktop` para ejecutar programas en el inicio del usuario. |
| `/etc/xdg/autostart/` | Inicio automático para todos los usuarios (en sistemas con X11). |

#### 🔧 **Crontab**

Crontab permite ejecutar scripts o programas al inicio del sistema.

- Editar con: `crontab -e`
- Agregar una línea:  

  ```bash
  @reboot /ruta/al/script.sh
  ```

#### 🚀 **Systemd (Archivos de Servicio)**

Para iniciar aplicaciones o servicios al arranque, se usa `systemd`:

- Crear un servicio en `/etc/systemd/system/mi-servicio.service`:

  ```ini
  [Unit]
  Description=Mi aplicación de inicio
  After=network.target

  [Service]
  ExecStart=/ruta/al/ejecutable
  Restart=always
  User=usuario

  [Install]
  WantedBy=default.target
  ```

- Habilitar el servicio:

  ```bash
  sudo systemctl enable mi-servicio
  ```

#### 🛠 **Archivos de Inicio de Sesión**

| Ubicación | Descripción |
|-----------|------------|
| `~/.bashrc` | Se ejecuta al abrir una terminal interactiva. |
| `~/.profile` | Se ejecuta al iniciar sesión gráfica o en consola. |
| `~/.xinitrc` | Se ejecuta al iniciar sesión en X11. |
| `/etc/rc.local` | (Obsoleto en algunas distros) Se ejecuta en el arranque del sistema. |

---
