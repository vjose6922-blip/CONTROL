const CACHE_NAME    = 'zr-admin-cache-v1';
const DYNAMIC_CACHE = 'zr-admin-dynamic-v1';

const STATIC_ASSETS = [
  './',
  'index.html',
  'notificaciones.html',
  'Tools.html',
  'styles.css',
  'api-config.js',
  'common.js',
  'admin.js',
  'admin-tools.js',
  'admin-comunidad.js',
  'notifications-optimized.js',
  'offline-manager.js',
  'cache-manager.js',
  'error-monitor.js',
  'error-bootstrap.js',
  'znr-devconsole.js',
  'fcm-init.js',
  'icons.js',
  'manifest.json',
  'logo.svg',
];

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
const API_DOMAINS      = [
  'script.google.com',
  'wttr.in',
  'registrar-token-fcm-1038143238323.us-central1.run.app',
  'eliminar-token-fcm-1038143238323.us-central1.run.app',
  'vendedores-api-1038143238323.us-central1.run.app',
  'catalogo-api-1038143238323.us-central1.run.app',
  'auth-api-1038143238323.us-central1.run.app',
  'ventas-api-1038143238323.us-central1.run.app',
  'live-api-1038143238323.us-central1.run.app',
  'admin-api-1038143238323.us-central1.run.app',
  'beneficiarios-api-1038143238323.us-central1.run.app',
  'tienda-znr-api-1038143238323.us-central1.run.app',
];
const IMAGE_CDN_HOSTS  = ['lh3.googleusercontent.com', 'googleusercontent.com'];

self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await Promise.allSettled(
        STATIC_ASSETS.map(async asset => {
          try {
            const response = await fetch(asset, { cache: 'reload' });
            if (response.ok) await cache.put(asset, response);
          } catch {}
        })
      );
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter(n => n !== CACHE_NAME && n !== DYNAMIC_CACHE)
          .map(n => caches.delete(n))
      );
      await self.clients.claim();
      const clients = await self.clients.matchAll();
      clients.forEach(c => c.postMessage({ type: 'SW_ACTIVATED' }));
    })()
  );
});

function getCacheStrategy(request) {
  const url = new URL(request.url);
  if (request.method === 'POST') return 'NETWORK_ONLY';
  if (IMAGE_CDN_HOSTS.some(h => url.hostname.includes(h))) return 'CACHE_FIRST';
  if (IMAGE_EXTENSIONS.some(ext => url.pathname.toLowerCase().endsWith(ext))) return 'CACHE_FIRST';
  if (url.hostname.includes('wttr.in')) return 'NETWORK_ONLY';
  if (url.hostname.includes('firebaseio.com')) return 'NETWORK_FIRST';
  if (API_DOMAINS.some(d => url.hostname.includes(d))) return 'NETWORK_FIRST';
  if (['document', 'style', 'script'].includes(request.destination)) return 'STALE_WHILE_REVALIDATE';
  return 'CACHE_FIRST';
}

self.addEventListener('fetch', event => {
  if (event.request.url.startsWith('chrome-extension://')) return;
  const strategy = getCacheStrategy(event.request);
  const handlers = {
    CACHE_FIRST:            cacheFirst,
    NETWORK_ONLY:           networkOnly,
    NETWORK_FIRST:          networkFirst,
    STALE_WHILE_REVALIDATE: staleWhileRevalidate,
  };
  event.respondWith((handlers[strategy] || networkFirst)(event.request));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const net = await fetch(request);
    if (net?.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, net.clone());
    }
    return net;
  } catch {
    return new Response('Offline', { status: 404 });
  }
}

async function networkOnly(request) {
  try { return await fetch(request); }
  catch {
    return new Response(JSON.stringify(null), {
      status: 503, headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function networkFirst(request) {
  try {
    const net = await fetch(request);
    if (net?.status === 200) {
      const url    = new URL(request.url);
      const action = url.searchParams.get('action');
      const sensitive = ['login', 'loginVendedor', 'notifications', 'notificationsBatch',
                         'update', 'delete', 'create', 'uploadImage',
                         'verificarAdmin', 'vendedoresAdmin', 'productosPendientes',
                         'obtenerReportes', 'aprobarVendedor', 'rechazarVendedor',
                         'aprobarProductoComunidad', 'rechazarProductoComunidad',
                         'marcarVendedorConfiable', 'marcarVendedorPlan', 'suspenderVendedor',
                         'marcarProductoConfiable', 'reportarProducto', 'marcarReporteRevisado',
                         'marcarNotificacionLeida', 'marcarTodasNotificacionesLeidas',
                         'responderSolicitudPlus', 'solicitudesPlus', 'obtenerResumenPlanPlus'];
      if (!action || !sensitive.includes(action)) {
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, net.clone());
      }
    }
    return net;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw new Error('Offline');
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request, { cache: 'reload' }).then(net => {
    if (net?.status === 200) {
      cache.put(request, net.clone());
    }
    return net;
  }).catch(() => null);
  if (cached) { fetchPromise.catch(() => {}); return cached; }
  const net = await fetchPromise;
  if (net) return net;
  return new Response('No disponible', { status: 404 });
}

self.addEventListener('push', event => {
  const payload = event.data ? event.data.json() : {};
  const notif = payload.notification || {};
  const title = notif.title || 'Z&R Admin';
  const body  = notif.body  || 'Novedades en el panel';
  const url   = (payload.data && payload.data.url) || payload.fcmOptions?.link || './';

  event.waitUntil((async () => {
    await self.registration.showNotification(title, {
      body:    body,
      icon:    'logo.svg',
      vibrate: [200, 100, 200],
      data:    { url: url },
      actions: [{ action: 'open', title: 'Ver ahora' }, { action: 'close', title: 'Cerrar' }]
    });
    const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    clientList.forEach(c => c.postMessage({ type: 'znr-nueva-notificacion' }));
  })());
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'close') return;
  const url = event.notification.data?.url || './';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      for (const c of clients) {
        if (c.url === url && 'focus' in c) return c.focus();
      }
      return self.clients.openWindow?.(url);
    })
  );
});
