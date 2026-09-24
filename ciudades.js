// Fuente única de países/ciudades donde opera ZNR. Rellena con tus datos reales
// (lat/lng: centro aproximado de la ciudad, para detectar la más cercana al comprador).
window.ZNR_CIUDADES = [
  { pais: 'México', ciudad: 'Nuevo Laredo', lat: 27.4767, lng: -99.5164 },
];

// Llena un <select> de país con los países únicos de la lista de arriba.
function llenarSelectPais(select) {
  const paises = [...new Set(window.ZNR_CIUDADES.map(c => c.pais))];
  select.innerHTML = '<option value="">Selecciona un país</option>' +
    paises.map(p => `<option value="${p}">${p}</option>`).join('');
}

// Llena un <select> de ciudad con las ciudades del país dado.
function llenarSelectCiudad(select, pais) {
  const ciudades = window.ZNR_CIUDADES.filter(c => c.pais === pais);
  select.innerHTML = '<option value="">Selecciona una ciudad</option>' +
    ciudades.map(c => `<option value="${c.ciudad}">${c.ciudad}</option>`).join('');
}

// Enlaza un par país→ciudad: al cambiar el país, recarga las ciudades.
function enlazarPaisCiudad(selectPais, selectCiudad) {
  llenarSelectPais(selectPais);
  selectPais.addEventListener('change', () => llenarSelectCiudad(selectCiudad, selectPais.value));
}

// Distancia en km entre dos coordenadas (fórmula de Haversine).
function distanciaKm(lat1, lng1, lat2, lng2) {
  const R = 6371, dLat = (lat2 - lat1) * Math.PI / 180, dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function ciudadMasCercana(lat, lng) {
  return window.ZNR_CIUDADES.reduce((mejor, c) =>
    distanciaKm(lat, lng, c.lat, c.lng) < distanciaKm(lat, lng, mejor.lat, mejor.lng) ? c : mejor
  ).ciudad;
}

// Muestra un chip no-bloqueante con selects país→ciudad cuando no hay geolocalización.
function mostrarSelectorCiudad(resolve) {
  const chip = document.createElement('div');
  chip.style.cssText = 'position:fixed;bottom:16px;left:16px;right:16px;max-width:320px;background:#fff;border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,.2);padding:14px;z-index:9999;font-size:13px;';
  chip.innerHTML = `<div style="margin-bottom:8px;font-weight:600;">📍 Elige tu ciudad</div>
    <select id="chip-pais" style="width:100%;margin-bottom:6px;padding:8px;border-radius:8px;"></select>
    <select id="chip-ciudad-sel" style="width:100%;padding:8px;border-radius:8px;"></select>`;
  document.body.appendChild(chip);
  const selPais = chip.querySelector('#chip-pais'), selCiudad = chip.querySelector('#chip-ciudad-sel');
  enlazarPaisCiudad(selPais, selCiudad);
  selCiudad.addEventListener('change', () => {
    if (!selCiudad.value) return;
    localStorage.setItem('buyer_ciudad', selCiudad.value);
    chip.remove();
    resolve(selCiudad.value);
  });
}

// Ciudad del comprador: localStorage → geolocalización (sin request al backend,
// solo distancia contra la lista de arriba) → selector manual si no hay permiso.
function obtenerCiudadComprador() {
  const guardada = localStorage.getItem('buyer_ciudad');
  if (guardada) return Promise.resolve(guardada);
  return new Promise((resolve) => {
    if (!navigator.geolocation) return mostrarSelectorCiudad(resolve);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const ciudad = ciudadMasCercana(pos.coords.latitude, pos.coords.longitude);
        localStorage.setItem('buyer_ciudad', ciudad);
        resolve(ciudad);
      },
      () => mostrarSelectorCiudad(resolve),
      { timeout: 6000 }
    );
  });
}
