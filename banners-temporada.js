// Banners de temporada (Master): imagen sin texto + texto encima + fechas en que se muestran en Comunidad.
// Se leen de RTDB (banners_temporada) y se guardan por admin-api. Los nombres deben coincidir con temporadas.js del sitio.
(function () {
  const RTDB = 'https://znr-live-default-rtdb.firebaseio.com/banners_temporada.json';
  const TEMPORADAS = ['Año Nuevo', 'Día de Reyes', 'Día de la Candelaria', 'San Valentín (Amor y Amistad)', 'Día Internacional de la Mujer', 'Semana Santa', 'Día del Niño', 'Día de las Madres', 'Día del Padre', 'Día del Maestro', 'Fiestas Patrias (Septiembre)', 'Halloween', 'Día de Muertos', 'Acción de Gracias', 'Posadas', 'Navidad', 'Fin de Año',
    'Regreso a clases', 'Vacaciones de verano', 'Vacaciones de invierno', 'Graduaciones', 'Temporada de bodas', 'Hot Sale', 'Buen Fin', 'Black Friday', 'Rebajas de fin de temporada'];
  const esc = (s) => escapeHtml(String(s ?? ''));
  const hoy = new Date().toISOString().slice(0, 10);
  // Reduce la imagen a 1600 px de ancho máx. en JPEG (proporción recomendada 12:5, ej. 1200×500).
  const comprimir = (file) => new Promise((ok, mal) => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, 1600 / img.width), c = Object.assign(document.createElement('canvas'), { width: img.width * k, height: img.height * k });
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      ok(c.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => mal(new Error('No se pudo leer la imagen'));
    img.src = URL.createObjectURL(file);
  });

  window.openBannersTemporadaModal = async function () {
    document.getElementById('modal-banners-temporada')?.remove();
    const modal = document.createElement('div');
    modal.id = 'modal-banners-temporada';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:99999;display:flex;align-items:flex-end;justify-content:center;';
    modal.innerHTML = `<div style="background:var(--modal-bg);border-radius:20px 20px 0 0;width:100%;max-width:560px;max-height:88vh;overflow-y:auto;padding:0 0 32px;color:var(--modal-text);">
      <div style="position:sticky;top:0;background:var(--modal-bg);padding:18px 20px 14px;border-bottom:1px solid var(--modal-border);display:flex;align-items:center;justify-content:space-between;z-index:2;">
        <h2 style="margin:0;font-size:1rem;font-weight:800;">${Icon('calendar')} Banners de temporada</h2>
        <button id="btn-close-banners" style="background:none;border:none;font-size:22px;cursor:pointer;color:var(--modal-muted);">×</button>
      </div>
      <div style="padding:18px 20px;">
        <form id="banner-form" style="display:grid;gap:10px;border:1px solid var(--modal-border);border-radius:14px;padding:14px;margin-bottom:18px;">
          <b id="banner-form-t">Nuevo banner</b>
          <input type="hidden" name="id">
          <label>Imagen (sin texto, 1200×500 recomendado)<input type="file" name="archivo" accept="image/*"></label>
          <input name="titulo" placeholder="Título (ej. Halloween)" maxlength="60" required>
          <input name="subtitulo" placeholder="Subtítulo (ej. Season)" maxlength="40">
          <input name="descripcion" placeholder="Descripción" maxlength="140">
          <input name="boton" placeholder="Texto del botón (ej. Descubre ofertas)" maxlength="30">
          <label>Temporada (para "Podría interesarte")<select name="temporada">${TEMPORADAS.map((t) => `<option>${esc(t)}</option>`).join('')}</select></label>
          <div style="display:flex;gap:8px;"><label style="flex:1">Desde<input type="date" name="inicio" required value="${hoy}"></label><label style="flex:1">Hasta<input type="date" name="fin" required></label></div>
          <label>Color del texto<select name="tema"><option value="oscuro">Oscuro (imagen clara)</option><option value="claro">Blanco (imagen oscura)</option></select></label>
          <div style="display:flex;gap:8px;"><button type="submit" class="primary-button" style="flex:1">Guardar</button><button type="reset" class="text-button">Limpiar</button></div>
        </form>
        <div id="banners-lista">Cargando…</div>
      </div></div>`;
    document.body.appendChild(modal);
    document.getElementById('btn-close-banners').onclick = () => modal.remove();
    const form = document.getElementById('banner-form'), lista = document.getElementById('banners-lista');
    let banners = {};
    const pintar = async () => {
      banners = (await fetch(RTDB).then((r) => r.json()).catch(() => null)) || {};
      const ids = Object.keys(banners).sort((a, b) => banners[a].inicio.localeCompare(banners[b].inicio));
      lista.innerHTML = ids.length ? ids.map((id) => { const b = banners[id], vivo = b.inicio <= hoy && hoy <= b.fin; return `
        <div style="display:flex;gap:10px;align-items:center;border:1px solid var(--modal-border);border-radius:14px;padding:10px;margin-bottom:10px;">
          <img src="${esc(b.imagen)}" alt="" style="width:96px;height:40px;object-fit:cover;border-radius:8px;">
          <div style="flex:1;min-width:0;font-size:.8rem;"><b>${esc(b.titulo)}</b> ${esc(b.subtitulo)}<br><span style="color:${vivo ? '#22c55e' : 'var(--modal-muted)'}">${vivo ? 'Visible · ' : ''}${esc(b.inicio)} → ${esc(b.fin)} · ${esc(b.temporada)}</span></div>
          <button type="button" class="text-button" data-editar="${esc(id)}">Editar</button>
          <button type="button" class="text-button" data-borrar="${esc(id)}">×</button>
        </div>`; }).join('') : '<p style="text-align:center;color:var(--modal-soft);">Aún no hay banners.</p>';
    };
    form.onreset = () => setTimeout(() => { form.elements.id.value = ''; form.inicio.value = hoy; document.getElementById('banner-form-t').textContent = 'Nuevo banner'; });
    lista.onclick = async (e) => {
      const ed = e.target.dataset.editar, del = e.target.dataset.borrar;
      if (ed) {
        Object.entries(banners[ed]).forEach(([k, v]) => form.elements[k] && (form.elements[k].value = v));
        form.elements.id.value = ed;
        document.getElementById('banner-form-t').textContent = 'Editar banner (deja la imagen vacía para conservarla)';
        form.scrollIntoView({ behavior: 'smooth' });
      }
      if (del && await askConfirm('¿Eliminar este banner?')) {
        const r = await apiFetch(window.ADMIN_API_URL, { action: 'eliminarBannerTemporada', token: getAdminToken(), id: del }, true).then((x) => x.json()).catch(() => ({}));
        r.ok ? pintar() : askAlert(r.error || 'No se pudo eliminar');
      }
    };
    form.onsubmit = async (e) => {
      e.preventDefault();
      const btn = form.querySelector('[type=submit]');
      btn.disabled = true; btn.textContent = 'Guardando…';
      try {
        const datos = Object.fromEntries(new FormData(form));
        delete datos.archivo;
        if (form.archivo.files[0]) datos.imagen = await comprimir(form.archivo.files[0]);
        const r = await apiFetch(window.ADMIN_API_URL, { action: 'guardarBannerTemporada', token: getAdminToken(), ...datos }, true).then((x) => x.json());
        if (!r.ok) throw new Error(r.error || 'Error del servidor');
        form.reset();
        pintar();
      } catch (err) { askAlert('No se pudo guardar: ' + err.message); }
      btn.disabled = false; btn.textContent = 'Guardar';
    };
    pintar();
  };
})();
