(function () {
  'use strict';

  const run = (n) => `https://${n}-api-1038143238323.us-central1.run.app`;
  const _w = ['52', '867', '178', '1272'];

  const urls = {
    API_URL: 'https://script.google.com/macros/s/AKfycbzNshrt3zldBNiyoB8x36ktCEO02H0cKxebiTuK7UAbsgd5R9biaCW7W4ihm1aVOJG7ww/exec',
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

  // true = acciones de lectura por POST (token en el body, no en la URL). Activar cuando el backend lo acepte.
  const TOKEN_EN_BODY = false;
  window.getAdminToken = () => sessionStorage.getItem('admin_token') || '';
  window.apiFetch = (base, params, post = TOKEN_EN_BODY) => {
    const p = new URLSearchParams(params);
    return post
      ? fetch(base, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: p.toString() })
      : fetch(`${base}?${p}`);
  };
})();
