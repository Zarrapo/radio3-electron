import { contextBridge } from 'electron';

window.addEventListener('DOMContentLoaded', () => {
  // 1. Inyectar CSS para forzar que cualquier .ad-top-banner no reserve espacio
  const style = document.createElement('style');
  style.textContent = `
    .ad-top-banner {
      display: none !important;
      height: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow: hidden !important;
    }
  `;
  document.head.appendChild(style);

  // 2. Función recursiva para eliminar .ad-top-banner dentro de un Shadow DOM y colapsar su contenedor si está vacío
  function removeAdFromShadow(root) {
    if (!root) return;
    const ads = root.querySelectorAll('.ad-top-banner');
    ads.forEach(ad => {
      const parent = ad.parentElement;
      ad.remove();
      // Si el contenedor padre queda sin elementos, lo ocultamos
      if (parent && parent.childElementCount === 0) {
        parent.style.display = 'none';
      }
    });
    // Recorrer recursivamente elementos que contengan Shadow DOM
    root.querySelectorAll('*').forEach(el => {
      if (el.shadowRoot) {
        removeAdFromShadow(el.shadowRoot);
      }
    });
  }

  // 3. Función para eliminar .ad-top-banner del documento principal y colapsar su contenedor si es posible
  function removeAndCollapseAdTopBanners() {
    const ads = document.querySelectorAll('.ad-top-banner');
    ads.forEach(ad => {
      const parent = ad.parentElement;
      ad.remove();
      if (parent && parent.childElementCount === 0) {
        parent.style.display = 'none';
      }
    });
    // También buscar en cualquier Shadow DOM
    document.querySelectorAll('*').forEach(el => {
      if (el.shadowRoot) {
        removeAdFromShadow(el.shadowRoot);
      }
    });
  }

  // 4. Ejecutar inmediatamente para eliminar los anuncios ya presentes
  removeAndCollapseAdTopBanners();

  // 5. Usar un MutationObserver para detectar reinserciones dinámicas y eliminar/colapsar el contenedor
  const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        removeAndCollapseAdTopBanners();
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // 6. También, como respaldo, llamar a la función cada segundo
  setInterval(removeAndCollapseAdTopBanners, 1000);
});

// 7. Exponer una API segura (si la necesitas en el renderer)
contextBridge.exposeInMainWorld('api', {});
