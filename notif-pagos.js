// Pestaña "Pagos" (solo Master): historial de pagos en línea (Stripe / Mercado Pago) de Comunidad, tienda y
// Plan Plus, y las alertas de posible cobro duplicado, que se marcan como revisadas al atenderlas.
const PAGO_ORIGEN = { comunidad: 'Comunidad', tienda: 'Tienda Z&R', plus: 'Plan Plus' };
const PAGO_PROV = { stripe: 'Stripe', mp: 'Mercado Pago' };

function filaPago(p, alerta) {
  const fecha = p.fecha ? new Date(p.fecha).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';
  const detalle = [PAGO_ORIGEN[p.origen] || p.origen, p.vendedor, p.requestId && 'pedido ' + p.requestId, fecha].filter(Boolean).map(escapeHtml).join(' · ');
  return `<div style="background:#1e1e2e;border:1px solid ${alerta ? '#dc262688' : '#7c3aed44'};border-radius:12px;padding:12px 16px;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">
    <div>
      <p style="margin:0;color:#e2e8f0;font-weight:600;font-size:.95rem;">${alerta ? Icon('error') + ' Posible cobro duplicado · ' : ''}$${Number(p.monto || 0).toLocaleString('es-MX')} MXN · ${PAGO_PROV[p.proveedor] || 'Mercado Pago'}</p>
      <p style="margin:2px 0 0;color:#888;font-size:.75rem;">${detalle}</p>
    </div>
    ${alerta ? `<button data-click="marcarAlertaPago" data-args="${dargs(p.id, ARG.THIS)}" style="padding:6px 14px;border-radius:8px;border:none;background:var(--notif-accent);color:#fff;cursor:pointer;font-size:.8rem;font-weight:600;">${Icon('check')} Revisada</button>` : ''}
  </div>`;
}

async function loadPagos() {
  const listEl = document.getElementById('admin-pagos-list');
  if (!listEl) return;
  if (typeof window.znrSkeletonRows === 'function') listEl.innerHTML = window.znrSkeletonRows(3);
  try {
    const data = await (await apiFetch(window.VENTAS_API_URL, { action: 'listarPagos', token: getAdminToken() })).json();
    if (!data.ok) { listEl.innerHTML = `<p style="color:#f87171;text-align:center">${escapeHtml(data.error || 'Error')}</p>`; return; }
    updateTabBadge('pagos', data.alertas.length);
    listEl.innerHTML = data.alertas.map(p => filaPago(p, true)).join('') +
      (data.pagos.length ? data.pagos.map(p => filaPago(p, false)).join('') : `<p style="color:#aaa;text-align:center;padding:24px 0;">Aún no hay pagos en línea ${Icon('credit-card')}</p>`);
  } catch (e) {
    listEl.innerHTML = '<p style="color:#f87171;text-align:center">Error al cargar</p>';
  }
}

async function marcarAlertaPago(id, btn) {
  const runFn = async () => {
    const data = await (await apiFetch(window.VENTAS_API_URL, { action: 'marcarAlertaPagoRevisada', token: getAdminToken(), id }, true)).json();
    if (!data.ok && window.showTemporaryMessage) window.showTemporaryMessage(data.error || 'Error', 'error');
    loadPagos();
  };
  if (btn && window.withButtonLoading) await window.withButtonLoading(btn, runFn, 'Guardando…');
  else await runFn();
}
