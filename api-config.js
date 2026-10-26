(function () {
  'use strict';

  const run = (n) => `https://${n}-api-1038143238323.us-central1.run.app`;

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
  Object.defineProperties(window, props);

  // Lecturas por POST (token en el body, no en la URL/logs) para todos los backends de Cloud Run;
  // todos aceptan lecturas por POST (revisado).
  const LECTURAS_POST = new Set(['catalogo', 'vendedores', 'tienda-znr', 'admin', 'auth', 'ventas', 'beneficiarios', 'live', 'pedidos', 'historias'].map(run));
  window.getAdminToken = () => sessionStorage.getItem('admin_token') || '';
  window.apiFetch = (base, params, post = LECTURAS_POST.has(base)) => {
    const p = new URLSearchParams(params);
    const req = post
      ? fetch(base, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: p.toString() })
      : fetch(`${base}?${p}`);
    // Si una API rechaza el token, admin.js confirma con el servidor si la sesión sigue viva.
    return req.then(r => {
      if (getAdminToken()) r.clone().json().then(d => { if (d && d.ok === false && /autoriz|sesi[oó]n|token/i.test(d.error || '')) dispatchEvent(new Event('znr:sesion-rechazada')); }).catch(() => {});
      return r;
    });
  };
})();
