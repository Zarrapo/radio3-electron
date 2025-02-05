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

// Escuchar la última emisora al iniciar la app
ipcRenderer.on('play-last-station', (event, lastStation) => {
    const button = Object.keys(stations).find(key => stations[key] === lastStation);
    if (button) {
        changeStation(lastStation, document.getElementById(button));
    }
});

// Función para cambiar la emisora y resaltar el botón activo
function changeStation(url, button) {
    if (audio.src !== url) {
        audio.src = url;
        audio.load();
        audio.play().then(() => {
            console.log(`Reproduciendo: ${url}`);
            ipcRenderer.send('change-station', url);

            // Quitar la clase activa de todos los botones
            stationButtons.forEach(btn => btn.classList.remove('active'));

            // Agregar clase activa al botón seleccionado
            button.classList.add('active');
        }).catch(error => {
            console.warn("Error al reproducir la emisora:", error);
        });
    }
}

// Asignar eventos a los botones de emisoras
stationButtons.forEach(button => {
    button.addEventListener('click', () => {
        const stationKey = button.id;
        changeStation(stations[stationKey], button);
    });
});
