(function () {
  'use strict';

  const run = (n) => `https://${n}-api-1038143238323.us-central1.run.app`;
  const _w = ['52', '867', '178', '1272'];

  const urls = {
    CATALOGO_API_URL: run('catalogo'),
    VENDEDORES_API_URL: run('vendedores'),
    TIENDA_ZNR_API_URL: run('tienda-znr'),
    ADMIN_API_URL: run('admin'),
    AUTH_API_URL: run('auth'),
    VENTAS_API_URL: run('ventas'),
    BENEFICIARIOS_API_URL: run('beneficiarios'),
    LIVE_API_URL: run('live'),
    PEDIDOS_API_URL: run('pedidos'),
    HISTORIAS_API_URL: run('historias')
  };

  const props = Object.fromEntries(Object.entries(urls).map(([k, v]) => [k, { get: () => v, configurable: false, enumerable: false }]));
  props.WHATSAPP_NUMBER = { get: () => _w.join(''), configurable: false, enumerable: false };
  Object.defineProperties(window, props);

  // Lecturas por POST (token en el body, no en la URL/logs) para todos los backends de Cloud Run;
  // todos aceptan lecturas por POST (revisado).
  const LECTURAS_POST = new Set(['catalogo', 'vendedores', 'tienda-znr', 'admin', 'auth', 'ventas', 'beneficiarios', 'live', 'pedidos', 'historias'].map(run));
  window.getAdminToken = () => sessionStorage.getItem('admin_token') || '';
  window.apiFetch = (base, params, post = LECTURAS_POST.has(base)) => {
    const p = new URLSearchParams(params);
    return post
      ? fetch(base, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: p.toString() })
      : fetch(`${base}?${p}`);
  };
})();
