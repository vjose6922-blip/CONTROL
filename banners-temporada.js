// Banners de temporada (Master): imagen sin texto + texto encima + fechas en que se muestran en Comunidad.
// Se leen de RTDB (banners_temporada) y se guardan por admin-api. La vista previa usa banner-temporada.js (igual que el sitio).
// Los nombres de temporada deben coincidir con temporadas.js del sitio.
(function () {
  const RTDB = 'https://znr-live-default-rtdb.firebaseio.com/banners_temporada.json';
  const TEMPORADAS = {
    Festividades: ['Año Nuevo', 'Día de Reyes', 'Día de la Candelaria', 'San Valentín (Amor y Amistad)', 'Día Internacional de la Mujer', 'Semana Santa', 'Día del Niño', 'Día de las Madres', 'Día del Padre', 'Día del Maestro', 'Fiestas Patrias (Septiembre)', 'Halloween', 'Día de Muertos', 'Acción de Gracias', 'Posadas', 'Navidad', 'Fin de Año'],
    'Festivales escolares': ['Día de la Constitución', 'Día de la Bandera', 'Festival del Amor y la Amistad', 'Festival de primavera', 'Festival del Día del Niño', 'Batalla de Puebla', 'Festival del Día de las Madres', 'Clausura y fin de curso', 'Desfile y kermés de Fiestas Patrias', 'Día de la Raza', 'Día de las Naciones Unidas', 'Festival de Halloween y Día de Muertos', 'Desfile de la Revolución', 'Pastorela y posada escolar'],
    Temporadas: ['Regreso a clases', 'Vacaciones de verano', 'Vacaciones de invierno', 'Graduaciones', 'Temporada de bodas', 'Hot Sale', 'Buen Fin', 'Black Friday', 'Rebajas de fin de temporada']
  };
  const POS = ['tl', 'tc', 'tr', 'ml', 'mc', 'mr', 'bl', 'bc', 'br'];
  const CSS = `@font-face { font-family: 'ZNR Serif'; font-weight: 700; src: url('fonts/playfair-display-latin-700-normal.woff2') format('woff2'); }
#banner-form { display: grid; gap: 12px; border: 1px solid var(--modal-border, #eee); border-radius: 16px; padding: 16px; margin-bottom: 18px; }
#banner-form label { display: grid; gap: 5px; font-size: 12px; font-weight: 600; color: var(--modal-soft, #777); }
#banner-form :is(input:not([type=radio]), select) { width: 100%; box-sizing: border-box; padding: 10px 12px; border: 1px solid var(--modal-border, #e0e0e0); border-radius: 12px; background: var(--modal-input-bg, transparent); color: var(--modal-text, inherit); font: inherit; font-size: 14px; }
#banner-form :is(input, select):focus { outline: none; border-color: #ff4f81; box-shadow: 0 0 0 3px rgba(255, 79, 129, .12); }
#banner-form .fila { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
#banner-form details { border: 1px solid var(--modal-border, #eee); border-radius: 12px; }
#banner-form summary { display: flex; align-items: center; gap: 8px; padding: 12px 14px; cursor: pointer; list-style: none; font-weight: 700; font-size: 14px; }
#banner-form summary::-webkit-details-marker { display: none; }
#banner-form summary small { margin-left: auto; font-weight: 500; font-size: 12px; color: var(--modal-soft, #888); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 55%; }
#banner-form summary:after { content: '›'; font-size: 18px; color: var(--modal-soft, #aaa); transition: transform .2s; } #banner-form details[open] summary:after { transform: rotate(90deg); }
#banner-form .bt-cuerpo { display: grid; gap: 12px; padding: 0 14px 14px; }
.bt-prev { position: sticky; top: 58px; z-index: 1; display: flex; padding: 6px 0; background: var(--modal-bg, #fff); }
.bt-prev .com-banner { background: repeating-conic-gradient(#0001 0 25%, #0000 0 50%) 0 0 / 16px 16px; }
.bt-aviso { font-size: 12px; color: #ef4444; font-weight: 600; }
.bt-pos { display: grid; grid-template-columns: repeat(3, 28px); gap: 4px; padding: 6px; border: 1px solid var(--modal-border, #e0e0e0); border-radius: 10px; width: max-content; }
.bt-pos input { display: none; }
.bt-pos span { display: block; height: 20px; border-radius: 5px; background: var(--modal-border, #e5e5e5); cursor: pointer; }
.bt-pos input:checked + span { background: #ff4f81; }
.bt-chk { display: flex !important; align-items: center; gap: 6px; }
.bt-noti { display: grid; grid-template-columns: 34px 1fr; gap: 10px; padding: 12px; border-radius: 20px; background: #3a3a3c; color: #fff; font-size: 13px; }
.bt-noti i { width: 34px; height: 34px; border-radius: 9px; background: #ff4f81; display: grid; place-items: center; font: 700 11px Georgia, serif; font-style: normal; }
.bt-noti small { opacity: .7; } .bt-noti b { display: block; font-size: 14px; } .bt-noti img { width: 100%; aspect-ratio: 2; object-fit: cover; border-radius: 12px; margin-top: 8px; display: block; }`;
  const esc = (s) => escapeHtml(String(s ?? ''));
  const hoy = new Date().toLocaleDateString('en-CA');
  // Mismas fechas un año después (29 feb → 28 feb); si venció hace más de un año, se sigue sumando hasta que quede vigente o futuro.
  const masUnAno = (d) => { const [y, m, dd] = d.split('-'); return `${+y + 1}-${m}-${m === '02' && dd === '29' ? '28' : dd}`; };
  const pickPos = (name, def) => `<div class="bt-pos">${POS.map((p) => `<label title="${p}"><input type="radio" name="${name}" value="${p}"${p === def ? ' checked' : ''}><span></span></label>`).join('')}</div>`;
  // Reduce la imagen a 1600 px de ancho máx. en JPEG (proporción 12:5, ej. 1200×500).
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
        <form id="banner-form">
          <b id="banner-form-t">Nuevo banner</b>
          <div class="bt-prev" id="banner-prev"></div>
          <span class="bt-aviso" id="banner-aviso" hidden>El texto no cabe completo: acórtalo, baja el tamaño o muévelo.</span>
          <input type="hidden" name="id">
          <details name="bt" open><summary>Imagen y texto <small data-res="texto"></small></summary><div class="bt-cuerpo">
            <label>Imagen (sin texto, 1200×500 recomendado)<input type="file" name="archivo" accept="image/*"></label>
            <label>Título<input name="titulo" placeholder="Ej. Halloween" maxlength="60" required></label>
            <label>Subtítulo<input name="subtitulo" placeholder="Ej. Season" maxlength="40"></label>
            <label>Descripción<input name="descripcion" placeholder="Ej. Artículos para esta temporada" maxlength="140"></label>
            <label>Texto del botón (vacío = sin botón)<input name="boton" placeholder="Ej. Ver productos" maxlength="30"></label>
          </div></details>
          <details name="bt"><summary>Diseño del texto <small data-res="diseno"></small></summary><div class="bt-cuerpo">
            <div class="fila"><label>Posición del texto${pickPos('pos', 'ml')}</label>
              <label>Posición del botón${pickPos('botonPos', '')}<span class="bt-chk"><input type="radio" name="botonPos" value="txt" checked> Debajo del texto</span></label></div>
            <div class="fila"><label>Tamaño del texto<select name="escala"><option value="0.85">Chico</option><option value="1" selected>Normal</option><option value="1.15">Grande</option><option value="1.3">Muy grande</option></select></label>
              <label>Color del texto<select name="tema"><option value="oscuro">Oscuro (imagen clara)</option><option value="claro">Blanco (imagen oscura)</option></select></label></div>
            <label>Sombra detrás del texto<select name="degradado"><option value="si">Sí (se lee mejor)</option><option value="no">No</option></select></label>
          </div></details>
          <details name="bt"><summary>Dónde y cuándo <small data-res="cuando"></small></summary><div class="bt-cuerpo">
            <label>Dónde mostrar<select name="donde"><option value="ambos">Inicio y Comunidad</option><option value="inicio">Solo Inicio</option><option value="comunidad">Solo Comunidad</option></select></label>
            <label>Mostrar solo este banner<select name="exclusivo"><option value="no">No, rota junto con los demás</option><option value="si">Sí, oculta los demás (campañas fuertes)</option></select></label>
            <label>Temporada (para "Podría interesarte")<select name="temporada">${Object.entries(TEMPORADAS).map(([g, l]) => `<optgroup label="${esc(g)}">${l.map((t) => `<option>${esc(t)}</option>`).join('')}</optgroup>`).join('')}</select></label>
            <div class="fila"><label>Desde<input type="date" name="inicio" required value="${hoy}"></label><label>Hasta<input type="date" name="fin" required></label></div>
          </div></details>
          <details name="bt"><summary>Notificación <small data-res="aviso"></small></summary><div class="bt-cuerpo">
            <label>Notificación cuando empiece<select name="aviso"><option value="si">Sí, avisar a compradores y vendedores</option><option value="no">No avisar</option></select></label>
            <div class="fila"><label>Título de la notificación<input name="avisoTitulo" placeholder="Vacío = título del banner" maxlength="60"></label>
              <label>Texto<input name="avisoTexto" placeholder="Vacío = descripción" maxlength="140"></label></div>
            <label>Imagen de la notificación (horizontal 2:1, ej. 1024×512; vacía = la del banner)<input type="file" name="archivoAviso" accept="image/*"></label>
            <div id="aviso-prev"></div>
            <div class="fila"><input name="pruebaTel" type="tel" maxlength="10" placeholder="Tu número (10 dígitos)"><button type="button" id="btn-prueba-aviso" class="text-button">Enviarme una prueba</button></div>
            <span id="prueba-msg" style="font-size:12px;font-weight:600;"></span>
          </div></details>
          <div style="display:flex;gap:8px;"><button type="submit" class="primary-button" style="flex:1">Guardar</button><button type="reset" class="text-button">Limpiar</button></div>
        </form>
        <div id="banners-lista">Cargando…</div>
      </div></div><style>${CSS}</style>`; // el <style> al final: tools-page.js toma el primer hijo como la tarjeta
    document.body.appendChild(modal);
    document.getElementById('btn-close-banners').onclick = () => modal.remove();
    const form = document.getElementById('banner-form'), lista = document.getElementById('banners-lista'), prev = document.getElementById('banner-prev');
    let banners = {}, imgUrl = '', avisoUrl = ''; // avisoUrl: imagen propia de la notificación (guardada o recién elegida)
    const preview = () => {
      const d = Object.fromEntries(new FormData(form)), img = avisoUrl || imgUrl;
      prev.innerHTML = znrBanner.html({ ...d, imagen: imgUrl });
      document.getElementById('banner-aviso').hidden = !znrBanner.desborda(prev.firstElementChild);
      const fecha = (f) => f ? new Date(f + 'T12:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }) : '?';
      Object.entries({ texto: d.titulo || 'Falta el título', diseno: { '0.85': 'Chico', 1: 'Normal', '1.15': 'Grande', '1.3': 'Muy grande' }[d.escala] + ' · ' + (d.tema === 'claro' ? 'blanco' : 'oscuro'),
        cuando: `${fecha(d.inicio)} → ${fecha(d.fin)}`, aviso: d.aviso === 'no' ? 'No avisar' : 'Avisar al empezar' }).forEach(([k, v]) => { form.querySelector(`[data-res="${k}"]`).textContent = v; });
      // Así se verá la notificación en Android (en iPhone sale sin imagen).
      document.getElementById('aviso-prev').innerHTML = d.aviso === 'no' ? '' : `<div class="bt-noti"><i>Z&amp;R</i><div><small>Z&amp;R Comunidad · ${avisoUrl ? 'imagen propia' : 'imagen del banner'}</small>
        <b>${esc(d.avisoTitulo || d.titulo || 'Título')}</b>${esc(d.avisoTexto || d.descripcion || d.subtitulo)}${img ? `<img src="${esc(img)}" alt="">` : ''}</div></div>`;
    };
    form.addEventListener('invalid', (e) => e.target === form.querySelector(':invalid') && e.target.closest('details')?.setAttribute('open', ''), true); // abre la sección del primer campo obligatorio que falta
    // Prueba: manda el aviso (texto actual del formulario) solo a los dispositivos de ese número y dice cómo le fue.
    document.getElementById('btn-prueba-aviso').onclick = async (e) => {
      const d = Object.fromEntries(new FormData(form)), msg = document.getElementById('prueba-msg');
      const imagen = [avisoUrl, imgUrl].find((u) => /^https:/.test(u)) || ''; // una imagen recién elegida aún no está subida: se usa la guardada
      try { localStorage.setItem('znr_prueba_tel', d.pruebaTel); } catch (_) {}
      e.target.disabled = true; msg.style.color = ''; msg.textContent = 'Enviando…';
      const r = await apiFetch(window.ADMIN_API_URL, { action: 'probarAvisoTemporada', token: getAdminToken(), telefono: d.pruebaTel,
        titulo: d.avisoTitulo || d.titulo, texto: d.avisoTexto || d.descripcion || d.subtitulo, imagen, temporada: d.temporada }, true).then((x) => x.json()).catch(() => ({ error: 'Error de red' }));
      msg.style.color = r.ok && r.enviados ? '#22c55e' : '#ef4444';
      msg.textContent = r.ok ? `Enviada a ${r.enviados} de ${r.dispositivos} dispositivo(s)${r.errores?.length ? ' · Firebase: ' + r.errores.join(', ') : ''}${/^blob:/.test(avisoUrl) ? ' · con la imagen guardada (guarda para usar la nueva)' : ''}` : r.error || 'No se pudo enviar';
      e.target.disabled = false;
    };
    try { form.pruebaTel.value = localStorage.getItem('znr_prueba_tel') || ''; } catch (_) {}
    form.oninput = (e) => {
      if (e.target.name === 'archivoAviso' && e.target.files[0]) avisoUrl = URL.createObjectURL(e.target.files[0]);
      if (e.target.name === 'archivo' && e.target.files[0]) imgUrl = URL.createObjectURL(e.target.files[0]);
      preview();
    };
    document.fonts?.load("700 20px 'ZNR Serif'").then(preview, () => {});
    const pintar = async () => {
      banners = (await fetch(RTDB).then((r) => r.json()).catch(() => null)) || {};
      const ids = Object.keys(banners).sort((a, b) => banners[a].inicio.localeCompare(banners[b].inicio));
      lista.innerHTML = ids.length ? ids.map((id) => { const b = banners[id], vivo = b.inicio <= hoy && hoy <= b.fin; return `
        <div style="display:flex;gap:10px;align-items:center;border:1px solid var(--modal-border);border-radius:14px;padding:10px;margin-bottom:10px;">
          <img src="${esc(b.imagen)}" alt="" style="width:96px;height:40px;object-fit:cover;border-radius:8px;">
          <div style="flex:1;min-width:0;font-size:.8rem;"><b>${esc(b.titulo)}</b> ${esc(b.subtitulo)}<br><span style="color:${vivo ? '#22c55e' : 'var(--modal-muted)'}">${vivo ? 'Visible · ' : ''}${b.exclusivo === 'si' ? 'Solo este · ' : ''}${{ inicio: 'Inicio · ', ambos: 'Inicio y Comunidad · ' }[b.donde] || 'Comunidad · '}${b.aviso === 'si' ? (b.avisado === b.inicio ? 'Notificación enviada · ' : 'Notificará al empezar · ') : ''}${esc(b.inicio)} → ${esc(b.fin)} · ${esc(b.temporada)}</span></div>
          ${b.fin < hoy ? `<button type="button" class="primary-button" style="padding:6px 12px;font-size:.75rem;" data-renovar="${esc(id)}">Renovar ${+b.fin.slice(0, 4) + 1}</button>` : ''}
          <button type="button" class="text-button" data-editar="${esc(id)}">Editar</button>
          <button type="button" class="text-button" data-borrar="${esc(id)}">×</button>
        </div>`; }).join('') : '<p style="text-align:center;color:var(--modal-soft);">Aún no hay banners.</p>';
    };
    form.onreset = () => setTimeout(() => { form.elements.id.value = ''; form.inicio.value = hoy; imgUrl = ''; avisoUrl = ''; try { form.pruebaTel.value = localStorage.getItem('znr_prueba_tel') || ''; } catch (_) {} document.getElementById('banner-form-t').textContent = 'Nuevo banner'; preview(); });
    lista.onclick = async (e) => {
      const ed = e.target.dataset.editar, del = e.target.dataset.borrar, ren = e.target.dataset.renovar;
      if (ren) { // vuelve a guardar el banner (misma imagen y texto) con las fechas del año siguiente
        const { imagen, ...b } = banners[ren];
        let { inicio, fin } = b;
        do { inicio = masUnAno(inicio); fin = masUnAno(fin); } while (fin < hoy);
        e.target.disabled = true;
        const r = await apiFetch(window.ADMIN_API_URL, { action: 'guardarBannerTemporada', token: getAdminToken(), ...b, donde: b.donde || 'comunidad', id: ren, inicio, fin }, true).then((x) => x.json()).catch(() => ({}));
        r.ok ? pintar() : (askAlert(r.error || 'No se pudo renovar'), e.target.disabled = false);
      }
      if (ed) {
        form.reset();
        setTimeout(() => {
          Object.entries(banners[ed]).forEach(([k, v]) => form.elements[k] && (form.elements[k].value = v));
          form.elements.id.value = ed;
          imgUrl = banners[ed].imagen;
          avisoUrl = banners[ed].avisoImagen || '';
          document.getElementById('banner-form-t').textContent = 'Editar banner (deja la imagen vacía para conservarla)';
          preview();
          form.scrollIntoView({ behavior: 'smooth' });
        });
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
        delete datos.archivo; delete datos.archivoAviso; delete datos.pruebaTel;
        if (form.archivo.files[0]) datos.imagen = await comprimir(form.archivo.files[0]);
        if (form.archivoAviso.files[0]) datos.avisoImagen = await comprimir(form.archivoAviso.files[0]);
        const r = await apiFetch(window.ADMIN_API_URL, { action: 'guardarBannerTemporada', token: getAdminToken(), ...datos }, true).then((x) => x.json());
        if (!r.ok) throw new Error(r.error || 'Error del servidor');
        form.reset();
        pintar();
      } catch (err) { askAlert('No se pudo guardar: ' + err.message); }
      btn.disabled = false; btn.textContent = 'Guardar';
    };
    preview();
    pintar();
  };
})();
