let _plusModalUid = '';
let _plusModalNombre = '';

async function loadSolicitudesPlus() {
  const listEl = document.getElementById('admin-plus-list');
  if (!listEl) return;
  const API = window.VENDEDORES_API_URL;
  const token = getAdminToken();
  if (!API || !token) return;

  if (typeof window.znrSkeletonRows === 'function') listEl.innerHTML = window.znrSkeletonRows(3);

  const refreshBtn = document.getElementById('refresh-plus-btn');
  const refreshIcon = refreshBtn ? refreshBtn.querySelector('svg') : null;
  if (refreshIcon) refreshIcon.style.animation = 'spin 0.7s linear infinite';
  if (refreshBtn) refreshBtn.disabled = true;

  try {
    const res = await apiFetch(API, { action: 'solicitudesPlus', token });
    const data = await res.json();
    if (!data.ok) { listEl.innerHTML = `<p style="color:#f87171;text-align:center">${escapeHtml(data.error || 'Error')}</p>`; return; }

    loadPagosPlus();
    const lista = data.solicitudes || [];
    updateTabBadge('plus', lista.length);
    document.getElementById('sc-plus').textContent = lista.length;

    if (lista.length === 0) {
      listEl.innerHTML = `<p style="color:#aaa;text-align:center;padding:24px 0;">Sin solicitudes pendientes ${Icon('star')}</p>`;
      return;
    }

    listEl.innerHTML = lista.map(v => {
      const fecha = v.fecha_solicitud ? new Date(v.fecha_solicitud).toLocaleDateString('es-MX', {day:'2-digit',month:'short',year:'numeric'}) : '—';
      return `<div style="background:#1e1e2e;border:1px solid #7c3aed44;border-radius:12px;padding:14px 16px;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">
        <div>
          <p style="margin:0;color:#e2e8f0;font-weight:600;font-size:.95rem;">${Icon('star')} ${escapeHtml(v.nombre)}</p>
          <p style="margin:2px 0 0;color:#888;font-size:.75rem;">Solicitado: ${fecha}</p>
        </div>
        <div style="display:flex;gap:8px;">
          <button data-click="openPlusModal" data-args="${dargs(v.uid, v.nombre, 'denied')}"
            style="padding:6px 14px;border-radius:8px;border:none;background:#dc2626;color:#fff;cursor:pointer;font-size:.8rem;font-weight:600;">${Icon('x')} Denegar</button>
          <button data-click="openPlusModal" data-args="${dargs(v.uid, v.nombre, 'approved')}"
            style="padding:6px 14px;border-radius:8px;border:none;background:var(--notif-accent);color:#fff;cursor:pointer;font-size:.8rem;font-weight:600;">${Icon('check')} Aprobar</button>
          <button data-click="recordarInteresPlus" data-args="${dargs(v.uid, v.nombre, ARG.THIS)}"
            style="padding:6px 14px;border-radius:8px;border:none;background:#0ea5e9;color:#fff;cursor:pointer;font-size:.8rem;font-weight:600;">${Icon('bell')} Recordar</button>
        </div>
      </div>`;
    }).join('');
  } catch(e) {
    listEl.innerHTML = '<p style="color:#f87171;text-align:center">Error al cargar</p>';
  } finally {
    if (refreshIcon) refreshIcon.style.animation = '';
    if (refreshBtn) refreshBtn.disabled = false;
  }
}

// Pagos recibidos por Z&R (Tienda Z&R y Plan Plus, Stripe o Mercado Pago). Solo el Master los ve.
let _pagosZnr = [], _pagosFiltro = 'todos';
async function loadPagosPlus() {
  const el = document.getElementById('admin-plus-pagos');
  if (!el || (sessionStorage.getItem('admin_rol') || 'master') !== 'master') return;
  try {
    const data = await (await apiFetch(window.VENDEDORES_API_URL, { action: 'listarPagosPlus', token: getAdminToken() })).json();
    if (!data.ok) throw new Error(data.error || 'No se pudieron cargar los pagos');
    _pagosZnr = data.pagos || [];
    renderPagosZnr();
  } catch (e) { el.innerHTML = `<p style="color:#f87171;font-size:.8rem;">Pagos recibidos: ${escapeHtml(e.message)}</p>`; }
}
window.filtrarPagosZnr = (f) => { _pagosFiltro = f; renderPagosZnr(); };
function renderPagosZnr() {
  const el = document.getElementById('admin-plus-pagos');
  const fecha = f => f ? new Date(f).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  const tipo = { tienda: 'Tienda Z&R', plus: 'Plan Plus' };
  const lista = _pagosZnr.filter(p => _pagosFiltro === 'todos' || p.origen === _pagosFiltro);
  const total = lista.reduce((s, p) => s + Number(p.monto || 0), 0);
  const chip = (f, txt) => `<button data-click="filtrarPagosZnr" data-args="${dargs(f)}" style="border:none;border-radius:16px;padding:5px 12px;font-size:.75rem;font-weight:600;cursor:pointer;background:${_pagosFiltro === f ? '#ff4f81' : '#2a2a3a'};color:#fff;">${txt}</button>`;
  el.innerHTML = `<p style="color:#aaa;font-size:.8rem;font-weight:600;margin:0 0 8px;">${Icon('credit-card')} Pagos recibidos · $${total.toLocaleString('es-MX')}</p>
    <div style="display:flex;gap:6px;margin-bottom:10px;">${chip('todos', 'Todos')}${chip('tienda', 'Tienda Z&R')}${chip('plus', 'Plan Plus')}</div>` +
    (lista.length ? lista.map(p =>
      `<div style="display:flex;justify-content:space-between;gap:10px;padding:8px 12px;margin-bottom:6px;background:#1e1e2e;border-radius:10px;font-size:.82rem;">
        <span style="color:#e2e8f0;"><span style="color:#ff4f81;font-weight:600;">${tipo[p.origen] || ''}</span> · ${escapeHtml(p.quien || p.vendedor || '')} <span style="color:#888;">· ${fecha(p.fecha)}</span>${p.duplicado ? ' <span style="color:#fbbf24;font-weight:700;">· cobro duplicado</span>' : ''}</span>
        <span style="color:#e2e8f0;font-weight:600;white-space:nowrap;">$${Number(p.monto || 0).toLocaleString('es-MX')} · ${p.proveedor === 'stripe' ? 'Stripe' : 'Mercado Pago'}</span>
      </div>`).join('') : '<p style="color:#888;font-size:.8rem;">Sin pagos todavía.</p>');
}

async function recordarInteresPlus(uid, nombre, btn) {
  const API = window.VENDEDORES_API_URL;
  const token = getAdminToken();
  const runFn = async () => {
    const res = await fetch(API, { method:'POST', body: JSON.stringify({ action:'recordarInteresPlus', token, uid }) });
    const data = await res.json();
    if (window.showTemporaryMessage) window.showTemporaryMessage(data.ok ? `Recordatorio enviado a ${nombre}` : (data.error || 'Error al enviar'), data.ok ? 'success' : 'error');
  };
  if (btn && window.withButtonLoading) await window.withButtonLoading(btn, runFn, 'Enviando…');
  else await runFn();
}

function openPlusModal(uid, nombre, tipo) {
  _plusModalUid = uid;
  _plusModalNombre = nombre;
  document.getElementById('plus-modal-uid').textContent = uid;
  document.getElementById('plus-modal-nombre').textContent = nombre;
  document.getElementById('plus-modal-error').style.display = 'none';
  document.getElementById('plus-modal-aprobar-area').style.display = tipo === 'approved' ? '' : 'none';
  document.getElementById('plus-modal-denegar-area').style.display = tipo === 'denied' ? '' : 'none';
  document.getElementById('plus-modal').style.display = 'flex';
  document.getElementById('plus-modal').dataset.tipo = tipo;
}

function closePlusModal() {
  document.getElementById('plus-modal').style.display = 'none';
}

async function confirmarRespuestaPlus(respuesta, btn) {
  const errEl = document.getElementById('plus-modal-error');
  errEl.style.display = 'none';
  const API = window.VENDEDORES_API_URL;
  const token = getAdminToken();
  if (!API || !token) return;

  const body = {
    action: 'responderSolicitudPlus',
    token,
    uid: _plusModalUid,
    respuesta
  };
  if (respuesta === 'approved') {
    const dias = parseInt(document.getElementById('plus-modal-dias').value) || 30;
    if (dias < 1) { errEl.textContent = 'Ingresa días válidos.'; errEl.style.display = ''; return; }
    body.dias = dias;
  } else {
    const motivo = document.getElementById('plus-modal-motivo').value.trim();
    if (!motivo) { errEl.textContent = 'Ingresa el motivo del rechazo.'; errEl.style.display = ''; return; }
    body.motivo = motivo;
  }

  const runFn = async () => {
    try {
      const res = await fetch(API, { method:'POST', body: JSON.stringify(body) });
      const data = await res.json();
      if (!data.ok) { errEl.textContent = data.error || 'Error al responder.'; errEl.style.display = ''; return; }
      closePlusModal();
      loadSolicitudesPlus();
    } catch(e) {
      errEl.textContent = 'Error de red.'; errEl.style.display = '';
    }
  };
  if (btn && window.withButtonLoading) await window.withButtonLoading(btn, runFn, respuesta === 'approved' ? 'Aprobando…' : 'Denegando…');
  else await runFn();
}
