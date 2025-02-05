const { ipcRenderer } = require('electron');

const audio = document.getElementById('audio');
const stationButtons = document.querySelectorAll('.station-button');

// Lista de emisoras
const stations = {
    station1: "https://dispatcher.rndfnk.com/crtve/rner3/main/mp3/high",
    station2: "https://dispatcher.rndfnk.com/crtve/rnerc/main/mp3/high",
    station3: "https://dispatcher.rndfnk.com/crtve/rne5/main/mp3/high",
    station4: "https://dispatcher.rndfnk.com/crtve/rne1/main/mp3/high"
};

let currentButton = null; // Guarda el botón activo
let isPaused = false; // Estado de la reproducción

// Escuchar la última emisora al iniciar la app
ipcRenderer.on('play-last-station', (event, lastStation) => {
    const button = Object.keys(stations).find(key => stations[key] === lastStation);
    if (button) {
        changeStation(lastStation, document.getElementById(button));
    }
});

// Función para cambiar la emisora y actualizar los botones
function changeStation(url, button) {
    if (audio.src !== url) {
        isPaused = false; // Reinicia el estado de pausa
        audio.src = url;
        audio.load();
        audio.play().then(() => {
            ipcRenderer.send('change-station', url);

            updateButtons(button, 'playing');
        }).catch(error => {
            console.warn("Error al reproducir la emisora:", error);
        });
    }
}

// Función para actualizar la apariencia de los botones
function updateButtons(activeButton, state) {
    stationButtons.forEach(btn => {
        btn.classList.remove('active', 'paused');
    });

    if (state === 'playing') {
        activeButton.classList.add('active');
    } else if (state === 'paused') {
        activeButton.classList.add('paused');
    }

    currentButton = activeButton;
}

// Asignar eventos a los botones de emisoras
stationButtons.forEach(button => {
    button.addEventListener('click', () => {
        const stationKey = button.id;

        if (button === currentButton) {
            // Si el botón actual se pulsa, alternamos entre play/pause
            if (isPaused) {
                audio.play();
                updateButtons(button, 'playing');
                isPaused = false;
            } else {
                audio.pause();
                updateButtons(button, 'paused');
                isPaused = true;
            }
        } else {
            // Si se pulsa otro botón, cambiamos de emisora
            changeStation(stations[stationKey], button);
        }
    });
});

// Variables para el modo mover
let moveActive = false;
let startMouseX, startMouseY;
let startWinPos = { x: 0, y: 0 };

ipcRenderer.on('start-window-move', () => {
    // Activar modo mover
    document.body.style.cursor = 'grab';
    moveActive = true;
    document.addEventListener('mousedown', onMouseDownForMove);
});

// Función que inicia el arrastre de la ventana
function onMouseDownForMove(e) {
    if (e.button !== 0 || !moveActive) return;
    document.body.style.cursor = 'grabbing';
    startMouseX = e.screenX;
    startMouseY = e.screenY;
    ipcRenderer.invoke('get-window-position').then(pos => {
        startWinPos = { x: pos[0], y: pos[1] };
    });
    document.addEventListener('mousemove', onMouseMoveForMove);
    document.addEventListener('mouseup', onMouseUpForMove);
    e.preventDefault();
}

function onMouseMoveForMove(e) {
    const deltaX = e.screenX - startMouseX;
    const deltaY = e.screenY - startMouseY;
    const newPos = { x: startWinPos.x + deltaX, y: startWinPos.y + deltaY };
    ipcRenderer.send('update-window-position', newPos);
}

function onMouseUpForMove(e) {
    if (e.button !== 0) return;
    // Desactivar modo mover y limpiar listeners
    document.body.style.cursor = 'default';
    moveActive = false;
    document.removeEventListener('mousedown', onMouseDownForMove);
    document.removeEventListener('mousemove', onMouseMoveForMove);
    document.removeEventListener('mouseup', onMouseUpForMove);
}
