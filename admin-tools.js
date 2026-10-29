// Estilos compartidos de index.html / Tools.html / notificaciones.html (inyectados por JS para no usar un .css aparte)
document.head.insertAdjacentHTML('beforeend', `<style>
:root {
  --modal-bg: var(--color-surface);
  --modal-text: var(--color-text-main);
  --modal-border: var(--color-border-subtle);
  --modal-muted: var(--color-text-muted);
  --modal-soft: var(--color-text-muted);
  --modal-chip-bg: var(--color-surface-3);
}
 * {
 box-sizing: border-box;
 }
  .admin-header {
 background: var(--page-bg) !important;
 backdrop-filter: none !important;
 border-bottom: 0 !important;
 }
.app-header {
 flex-wrap: nowrap;  
}
.header-left {
 flex-shrink: 1;  
 min-width: 0;  
}
.header-right {
 flex-shrink: 0;  
 flex-wrap: nowrap;  
}
 .admin-header .app-title,
 .admin-header .app-subtitle {
 color: var(--header-text) !important;
 }
 .admin-main {
 background: transparent;
 min-height: calc(100vh - 64px);
 padding: 12px;
 width: 100%;
 }
 @media (min-width: 768px) {
 .admin-main {
 max-width: 1200px;
 margin: 0 auto;
 padding: 20px;
 }
 }
 .admin-card {
 background: rgba(255, 255, 255, 0.98);
 border-radius: 16px;
 box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
 margin-bottom: 16px;
 overflow: hidden;
 width: 100%;
 }
 .admin-card-header {
 padding: 14px 16px;
 background: var(--gradient-accent);
 color: white !important;
 display: flex;
 justify-content: space-between;
 align-items: center;
 flex-wrap: wrap;
 gap: 8px;
 }
 .admin-card-header h2 {
 color: white !important;
 font-size: 18px;
 margin: 0;
 }
 .admin-card-header .text-button {
 color: white !important;
 background: rgba(255,255,255,0.2);
 padding: 6px 12px;
 border-radius: 20px;
 font-size: 12px;
 border: none;
 cursor: pointer;
 }
 .admin-stats-grid {
 display: grid;
 grid-template-columns: repeat(3, 1fr);
 gap: 8px;
 margin-bottom: 16px;
 width: 100%;
 }
 .admin-stat-card {
 background: var(--gradient-accent);
 border-radius: 12px;
 padding: 10px 4px;
 text-align: center;
 color: white !important;
 width: 100%;
 min-width: 0; 
 }
 .admin-stat-card * {
 color: white !important;
 }
 .admin-stat-value {
 font-size: 18px;
 font-weight: 800;
 display: block;
 margin-bottom: 4px;
 color: white !important;
 white-space: nowrap;
 overflow: hidden;
 text-overflow: ellipsis;
 }
 .admin-stat-label {
 font-size: 9px;
 opacity: 0.9;
 text-transform: uppercase;
 letter-spacing: 0.3px;
 color: white !important;
 display: block;
 white-space: nowrap;
 overflow: hidden;
 text-overflow: ellipsis;
 }
 @media (min-width: 480px) {
 .admin-stats-grid {
 gap: 12px;
 margin-bottom: 20px;
 }
 .admin-stat-card {
 padding: 12px 8px;
 }
 .admin-stat-value {
 font-size: 22px;
 }
 .admin-stat-label {
 font-size: 10px;
 }
 }
 @media (min-width: 768px) {
 .admin-stats-grid {
 gap: 16px;
 margin-bottom: 24px;
 }
 .admin-stat-card {
 padding: 20px;
 }
 .admin-stat-value {
 font-size: 28px;
 margin-bottom: 8px;
 }
 .admin-stat-label {
 font-size: 12px;
 }
 }
 .admin-section {
 margin-bottom: 20px;
 }
 .admin-section-header {
 display: flex;
 align-items: center;
 justify-content: space-between;
 gap: 10px;
 margin-bottom: 10px;
 padding: 0 2px;
 }
 .admin-section-header h2 {
 margin: 0;
 font-size: 15px;
 font-weight: 800;
 color: #fff;
 display: flex;
 align-items: center;
 gap: 8px;
 }
 .admin-section-header .ash-icon {
 display: inline-flex;
 color: var(--color-accent-solid);
 }
 .admin-cards-grid {
 display: grid;
 grid-template-columns: repeat(3, 1fr);
 gap: 10px;
 }
 .admin-cards-grid.admin-cards-grid-compact {
 grid-template-columns: repeat(3, 1fr);
 }
 @media (max-width: 640px) {
 .admin-cards-grid {
 grid-template-columns: repeat(2, 1fr);
 }
 }
 @media (max-width: 340px) {
 .admin-cards-grid,
 .admin-cards-grid.admin-cards-grid-compact {
 grid-template-columns: 1fr;
 }
 }
 .admin-mini-card {
 background: var(--color-surface, #fff);
 border: 1px solid var(--color-border-subtle, #e2e4ea);
 border-radius: 16px;
 padding: 14px 12px;
 display: flex;
 flex-direction: column;
 gap: 10px;
 text-decoration: none;
 color: var(--color-text-main, #111318);
 cursor: pointer;
 box-shadow: 0 1px 3px rgba(0,0,0,0.12);
 transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
 position: relative;
 min-height: 96px;
 font-family: inherit;
 text-align: left;
 }
 .admin-mini-card:hover {
 transform: translateY(-2px);
 border-color: var(--color-primary-soft, #8b5cf6);
 box-shadow: 0 8px 20px rgba(0,0,0,0.18);
 }
 .admin-mini-card:active { transform: scale(0.97); }
 .admin-mini-card .amc-icon {
 width: 36px;
 height: 36px;
 border-radius: 12px;
 display: grid;
 place-items: center;
 background: rgba(139, 92, 246, 0.16);
 color: var(--color-primary, #6d28d9);
 }
 .admin-mini-card .amc-label {
 font-size: 12.5px;
 font-weight: 700;
 line-height: 1.25;
 padding-right: 4px;
 }
 .admin-mini-card .amc-badge { position: absolute; top: 10px; right: 10px; }
 .admin-cta-bar {
 display: block;
 margin-top: 10px;
 padding: 12px;
 background: var(--gradient-accent);
 color: #fff;
 font-weight: 700;
 font-size: 13px;
 border-radius: 12px;
 text-align: center;
 text-decoration: none;
 }
 /* Tiles: Crear Producto / Lista de Productos.
    Colapsados: tarjeta compacta igual a las mini-cards de Notificaciones/Herramientas.
    Expandidos: su formulario/lista se abre en un panel a pantalla completa. */
 .grid-tile:not(.expanded) {
 background: transparent;
 box-shadow: none;
 border-radius: 14px;
 }
 .grid-tile .tile-header {
 cursor: pointer;
 }
 .grid-tile:not(.expanded) .admin-card-header.tile-header {
 flex-direction: column;
 align-items: flex-start;
 justify-content: center;
 text-align: left;
 gap: 6px;
 min-height: 78px;
 padding: 14px 12px;
 background: rgba(255, 255, 255, 0.98);
 border-radius: 14px;
 box-shadow: 0 2px 8px rgba(0,0,0,0.15);
 transition: transform 0.15s ease, box-shadow 0.15s ease;
 }
 .grid-tile:not(.expanded) .admin-card-header.tile-header:hover {
 transform: translateY(-2px);
 box-shadow: 0 6px 18px rgba(0,0,0,0.22);
 }
 .grid-tile:not(.expanded) .tile-title,
 .grid-tile:not(.expanded) .tile-icon {
 color: #2a2140 !important;
 }
 .grid-tile:not(.expanded) .tile-icon svg {
 color: #7a4fc9;
 }
 .grid-tile:not(.expanded) .tile-header .tile-actions {
 display: none;
 }
 .grid-tile.expanded .tile-icon,
 .grid-tile.expanded .tile-subtitle {
 display: none;
 }
 .grid-tile.expanded .admin-card-header.tile-header {
 flex-direction: row;
 align-items: center;
 justify-content: space-between;
 text-align: left;
 border-radius: 0;
 }
 /* Ninguna sección del panel de admin (ni el formulario de crear/editar
 producto, ni el listado en modo lista o cuadrícula) debe quedar fija en
 pantalla — todo se mueve junto con el contenido al hacer scroll. */
 .grid-tile.expanded {
 position: fixed;
 inset: 0;
 z-index: 9500;
 margin: 0;
 border-radius: 0;
 overflow-y: auto;
 -webkit-overflow-scrolling: touch;
 background: #f4f1fa;
 animation: fs-panel-in 0.18s ease;
 }
 @keyframes fs-panel-in {
 from { opacity: 0; }
 to { opacity: 1; }
 }
 .tile-icon {
 font-size: 22px;
 line-height: 1;
 }
 .tile-title {
 font-size: 14px !important;
 margin: 0 !important;
 }
 .tile-subtitle { display: none; }
 .tile-actions {
 display: flex;
 align-items: center;
 gap: 10px;
 }
 .tile-close-btn {
 display: inline-flex;
 align-items: center;
 justify-content: center;
 width: 30px;
 height: 30px;
 border-radius: 50%;
 border: none;
 background: rgba(255,255,255,0.2);
 color: #fff;
 font-size: 15px;
 line-height: 1;
 cursor: pointer;
 flex-shrink: 0;
 }
 .tile-close-btn:hover {
 background: rgba(255,255,255,0.32);
 }
 .form-vertical {
 display: flex;
 flex-direction: column;
 gap: 12px;
 padding: 16px;
 width: 100%;
 }
 .form-row {
 display: flex;
 flex-direction: column;
 gap: 6px;
 width: 100%;
 }
 .form-row label {
 font-weight: 600;
 font-size: 13px;
 color: #2a1a16;
 }
 .form-row input,
 .form-row select,
 .form-row textarea {
 padding: 10px 12px;
 border: 2px solid #e0e0e0;
 border-radius: 12px;
 font-size: 14px;
 transition: all 0.2s;
 width: 100%;
 box-sizing: border-box;
 }
 .form-row input:focus,
 .form-row select:focus,
 .form-row textarea:focus {
 outline: none;
 border-color: var(--color-accent-solid);
 box-shadow: 0 0 0 3px rgba(var(--color-accent-rgb),0.1);
 }
 @media (min-width: 768px) {
 .form-vertical {
 display: grid;
 grid-template-columns: repeat(2, 1fr);
 gap: 16px;
 padding: 24px;
 }
 .form-row-full {
 grid-column: span 2;
 }
 }
 .image-upload-area {
 display: flex;
 flex-direction: column;
 gap: 8px;
 }
 .image-preview-container {
 display: flex;
 gap: 8px;
 align-items: center;
 flex-wrap: wrap;
 }
 .image-preview {
 max-width: 50px;
 max-height: 50px;
 border-radius: 8px;
 border: 2px solid #e0e0e0;
 object-fit: cover;
 }
 @media (min-width: 768px) {
 .image-preview {
 max-width: 80px;
 max-height: 80px;
 }
 }
 .image-url-input {
 flex: 1;
 padding: 8px 10px;
 border: 2px solid #e0e0e0;
 border-radius: 10px;
 font-size: 11px;
 background: #f5f5f8;
 }
 .progress-bar {
 height: 3px;
 background: #e0e0e0;
 border-radius: 3px;
 margin-top: 6px;
 overflow: hidden;
 }
 .upload-progress {
 width: 0%;
 height: 100%;
 background: var(--gradient-accent);
 transition: width 0.3s;
 }
 .primary-button {
 background: var(--gradient-accent);
 border: none;
 border-radius: 50px;
 padding: 12px 20px;
 color: white;
 font-weight: 600;
 font-size: 14px;
 cursor: pointer;
 transition: all 0.2s;
 width: 100%;
 }
 .primary-button:hover {
 transform: translateY(-2px);
 box-shadow: 0 6px 20px rgba(var(--color-accent-rgb),0.4);
 }
 .admin-controls {
 display: flex;
 flex-direction: column;
 gap: 10px;
 padding: 16px;
 }
 @media (min-width: 768px) {
 .admin-controls {
 flex-direction: row;
 padding: 20px;
 }
 }
 .admin-search, .admin-filter-select {
 padding: 10px 12px;
 background: white;
 border: 2px solid #e0e0e0;
 border-radius: 12px;
 font-size: 14px;
 width: 100%;
 }
 @media (min-width: 768px) {
 .admin-search {
 flex: 1;
 }
 .admin-filter-select {
 width: auto;
 }
 }
 .admin-products-header {
 display: none;
 }
 .admin-product-row {
 display: flex;
 flex-wrap: wrap;
 gap: 6px;
 padding: 10px 12px;
 background: white;
 border-bottom: 1px solid #e0e0e0;
 align-items: center;
 }
 .admin-product-id {
 font-family: monospace;
 font-size: 10px;
 background: #f0f0f0;
 padding: 2px 8px;
 border-radius: 20px;
 color: #666;
 }
 .admin-product-name {
 flex: 1;
 font-size: 13px;
 font-weight: 500;
 color: #333;
 }
 .admin-product-price {
 font-size: 13px;
 font-weight: 700;
 color: var(--color-accent-solid);
 }
 .admin-product-stock {
 font-size: 11px;
 padding: 2px 8px;
 border-radius: 20px;
 }
 .admin-product-stock.in-stock {
 background: #e8f5e9;
 color: #2e7d32;
 }
 .admin-product-stock.low-stock {
 background: #fff3e0;
 color: #f97316;
 }
 .admin-product-stock.out-stock {
 background: #ffebee;
 color: #c62828;
 }
 .admin-product-actions {
 display: flex;
 gap: 8px;
 width: 100%;
 margin-top: 6px;
 }
 .admin-product-actions button {
 flex: 1;
 padding: 6px 12px;
 font-size: 12px;
 border: none;
 border-radius: 8px;
 cursor: pointer;
 }
 .admin-product-actions button:first-child {
 background: #fbf5f2;
 color: #2a1a16;
 }
 .admin-product-actions button:first-child:hover {
 background: var(--color-accent-solid);
 color: white;
 }
 .admin-product-actions button:last-child {
 background: #ffe8e8;
 color: #d32f2f;
 }
 .admin-product-actions button:last-child:hover {
 background: #d32f2f;
 color: white;
 }
 @media (min-width: 768px) {
 .admin-products-header {
 display: grid;
 grid-template-columns: 80px 1fr 100px 100px 120px;
 gap: 12px;
 padding: 12px 16px;
 background: var(--gradient-accent);
 border-radius: 12px;
 font-weight: 600;
 font-size: 13px;
 color: white !important;
 margin-bottom: 12px;
 }
 .admin-product-row {
 display: grid;
 grid-template-columns: 80px 1fr 100px 100px 120px;
 gap: 12px;
 padding: 12px 16px;
 }
 .admin-product-id {
 background: none;
 padding: 0;
 font-size: 12px;
 }
 .admin-product-actions {
 width: auto;
 margin-top: 0;
 }
 }
 .admin-pagination {
 display: flex;
 justify-content: center;
 gap: 6px;
 padding: 16px;
 flex-wrap: wrap;
 }
 .admin-pagination button {
 padding: 6px 12px;
 border: 2px solid #e0e0e0;
 background: white;
 border-radius: 8px;
 cursor: pointer;
 font-size: 12px;
 }
 .admin-pagination button:hover {
 background: var(--color-accent-solid);
 color: white;
 border-color: #2a1a16;
 }
 .admin-pagination button.active-page {
 background: var(--color-accent-solid);
 color: white;
 border-color: var(--color-accent-solid);
 }
 .global-loader {
 position: fixed;
 top: 0;
 left: 0;
 width: 100%;
 height: 100%;
 background: rgba(0,0,0,0.8);
 display: flex;
 flex-direction: column;
 justify-content: center;
 align-items: center;
 z-index: 9999;
 }
 .global-loader.hidden {
 display: none;
 }
 .loader-spinner {
 width: 40px;
 height: 40px;
 border: 4px solid #f3f3f3;
 border-top: 4px solid var(--color-accent-solid);
 border-radius: 50%;
 animation: spin 1s linear infinite;
 }
 @keyframes spin {
 0% { transform: rotate(0deg); }
 100% { transform: rotate(360deg); }
 }
 .loader-text {
 color: white;
 margin-top: 12px;
 font-size: 14px;
 }
 .header-right {
 display: flex;
 gap: 8px;
 align-items: center;
 }
 .icon-button {
 background: rgba(255,255,255,0.1);
 border: none;
 padding: 8px 12px;
 border-radius: 30px;
 color: white;
 cursor: pointer;
 font-size: 16px;
 }
 .header-left {
 display: flex;
 align-items: center;
 gap: 10px;
 }
 .logo-touch-area {
 width: 40px;
 height: 40px;
 flex-shrink: 0;
 background: var(--gradient-accent);
 border-radius: 12px;
 display: flex;
 align-items: center;
 justify-content: center;
 font-weight: bold;
 color: white;
 }
 .app-title {
 margin: 0;
 font-size: 18px;
 color: white;
 }
 .app-subtitle {
 margin: 0;
 font-size: 12px;
 color: rgba(255,255,255,0.7);
 }
.npi-badge{background:var(--color-accent-solid);color:#fff;border-radius:50px;padding:2px 10px;font-size:12px;font-weight:800;min-width:24px;text-align:center;}
.npi-badge.zero{background:rgba(255,255,255,.12);color:#888;}
/* Botón de tema: muestra sol u luna según el tema activo */
#theme-toggle .icon-moon { display: none; }
[data-theme="light"] #theme-toggle .icon-sun { display: none; }
[data-theme="light"] #theme-toggle .icon-moon { display: inline; }

/* ===== index.html / Tools.html: son oscuros por defecto, esto los aclara ===== */
[data-theme="light"] .logo-touch-area,
[data-theme="light"] .logo-touch-area * {
  box-shadow: none !important;
  filter: none !important;
  text-shadow: none !important;
}
.admin-section-header h2 { color: var(--ink-title); }
[data-theme="light"] #tools-back {
  background: rgba(0, 0, 0, 0.05);
  border-color: rgba(0, 0, 0, 0.12);
  color: #1a1a2e;
}

/* ===== notificaciones.html: es claro por defecto, esto lo oscurece ===== */
[data-theme="dark"] body { background: var(--color-bg); color: var(--color-text-main); }
[data-theme="dark"] .notif-section-header { background: linear-gradient(135deg, color-mix(in srgb, var(--notif-dark) 45%, #000), color-mix(in srgb, var(--notif-dark) 75%, #000)); }
[data-theme="dark"] .request-card,
[data-theme="dark"] .request-summary,
[data-theme="dark"] .notifications-filters,
[data-theme="dark"] .skeleton-notif,
[data-theme="dark"] .zr-skel-card {
  background: var(--color-surface) !important;
  border-color: var(--color-border-subtle) !important;
  color: var(--color-text-main);
}
</style>`);


async function openDonacionesStatsModal() {
  const old = document.getElementById('modal-donaciones-stats');
  if (old) old.remove();
  const token = getAdminToken();
  const beneficiariosApi = window.BENEFICIARIOS_API_URL;
  const vendedoresApi = window.VENDEDORES_API_URL;
  const catalogoApi = window.CATALOGO_API_URL;

  const modal = document.createElement('div');
  modal.id = 'modal-donaciones-stats';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:99999;display:flex;align-items:flex-end;justify-content:center;';
  modal.innerHTML = `<div style="background:var(--modal-bg);border-radius:20px 20px 0 0;width:100%;max-width:520px;max-height:88vh;overflow-y:auto;padding:0 0 32px;color:var(--modal-text);">
    <div style="position:sticky;top:0;background:var(--modal-bg);padding:18px 20px 14px;border-bottom:1px solid var(--modal-border);display:flex;align-items:center;justify-content:space-between;">
      <h2 style="margin:0;font-size:1rem;font-weight:800;">${Icon('heart')} Estadísticas de Donaciones</h2>
      <button id="btn-close-don-stats" style="background:none;border:none;font-size:22px;cursor:pointer;color:var(--modal-muted);">×</button>
    </div>
    <div id="don-stats-body" style="padding:20px;">Cargando…</div>
  </div>`;
  document.body.appendChild(modal);
  document.getElementById('btn-close-don-stats').onclick = () => modal.remove();
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });

  try {
    // Cargar vendedores, productos comunidad, beneficiarios y el historial de donaciones
    const [vRes, prodRes, benRes, donRes] = await Promise.all([
      apiFetch(vendedoresApi, { action:'vendedoresAdmin', token }).then(r=>r.json()).catch(()=>({})),
      apiFetch(catalogoApi, { action:'listarTodoComunidad', token, donado:'true' }).then(r=>r.json()).catch(()=>({})),
      apiFetch(beneficiariosApi, { action:'obtenerBeneficiarios', token }).then(r=>r.json()).catch(()=>({})),
      apiFetch(beneficiariosApi, { action:'obtenerDonaciones', token }).then(r=>r.json()).catch(()=>({})),
    ]);
    const vendors    = vRes.vendors || [];
    const products   = prodRes.products || [];
    const bens       = benRes.beneficiarios || [];
    const donaciones = donRes.donaciones || [];

    const donados   = products.filter(p => p.donado === true || p.donado === 'TRUE' || p.donado === 'true');
    const sinAsig   = Math.max(0, (prodRes.total ?? products.length) - donados.length);
    const bensAprov = bens.filter(b => b.estado === 'aprobado');
    const bensPend  = bens.filter(b => b.estado === 'pendiente');

    const valorTotal = donados.reduce((s, p) => s + (Number(p.precio) || 0), 0);
    const vendedoresDonadores = new Set(donados.map(p => p.vendedor_uid).filter(Boolean));

    const productMap    = {}; products.forEach(p => { productMap[String(p.id)] = p; });
    const vendorNameMap = {}; vendors.forEach(v => { vendorNameMap[v.uid] = v.nombre; });
    const benMap         = {}; bens.forEach(b => { benMap[b.id] = b; });

    // Donaciones agrupadas por beneficiario: cantidad, valor total y vendedores que donaron
    const byBen = {};
    donados.forEach(p => {
      const bid = p.beneficiario_id || '__sin__';
      if (!byBen[bid]) byBen[bid] = { count: 0, valor: 0, vendedores: new Set() };
      byBen[bid].count++;
      byBen[bid].valor += Number(p.precio) || 0;
      if (p.vendedor_nombre) byBen[bid].vendedores.add(p.vendedor_nombre);
    });

    // Ranking de vendedores que más han donado
    const byVendor = {};
    donados.forEach(p => {
      const uid = p.vendedor_uid || '__sin__';
      if (!byVendor[uid]) byVendor[uid] = { nombre: p.vendedor_nombre || vendorNameMap[uid] || 'Vendedor', count: 0, valor: 0 };
      byVendor[uid].count++;
      byVendor[uid].valor += Number(p.precio) || 0;
    });
    const topVendedores = Object.values(byVendor).sort((a, b) => b.count - a.count).slice(0, 5);

    // Donaciones más recientes (historial activo, ordenado por fecha de asignación)
    const recientes = donaciones
      .filter(d => d.estado === 'activo' && d.fecha_asignacion)
      .sort((a, b) => new Date(b.fecha_asignacion) - new Date(a.fecha_asignacion))
      .slice(0, 6);

    const fmtMoney = v => '$' + Number(v||0).toLocaleString('es-MX');
    const fmtFecha = d => { try { return new Date(d).toLocaleDateString('es-MX', { day:'2-digit', month:'short', year:'numeric' }); } catch(_) { return ''; } };

    document.getElementById('don-stats-body').innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px;">
        <div style="background:rgba(249,115,22,.15);border:1px solid rgba(249,115,22,.3);border-radius:14px;padding:14px;text-align:center;">
          <div style="font-size:1.6rem;font-weight:900;color:#f97316;">${donados.length}</div>
          <div style="font-size:.72rem;color:var(--modal-soft);margin-top:2px;">Productos donados</div>
        </div>
        <div style="background:rgba(244,114,182,.12);border:1px solid rgba(244,114,182,.28);border-radius:14px;padding:14px;text-align:center;">
          <div style="font-size:1.4rem;font-weight:900;color:#f472b6;">${fmtMoney(valorTotal)}</div>
          <div style="font-size:.72rem;color:var(--modal-soft);margin-top:2px;">Valor total donado</div>
        </div>
        <div style="background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.2);border-radius:14px;padding:14px;text-align:center;">
          <div style="font-size:1.6rem;font-weight:900;color:#22c55e;">${bensAprov.length}</div>
          <div style="font-size:.72rem;color:var(--modal-soft);margin-top:2px;">Beneficiarios activos</div>
        </div>
        <div style="background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.2);border-radius:14px;padding:14px;text-align:center;">
          <div style="font-size:1.6rem;font-weight:900;color:#ef4444;">${bensPend.length}</div>
          <div style="font-size:.72rem;color:var(--modal-soft);margin-top:2px;">Beneficiarios pendientes</div>
        </div>
        <div style="background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.2);border-radius:14px;padding:14px;text-align:center;">
          <div style="font-size:1.6rem;font-weight:900;color:#818cf8;">${sinAsig}</div>
          <div style="font-size:.72rem;color:var(--modal-soft);margin-top:2px;">Productos sin asignar</div>
        </div>
        <div style="background:rgba(56,189,248,.1);border:1px solid rgba(56,189,248,.22);border-radius:14px;padding:14px;text-align:center;">
          <div style="font-size:1.6rem;font-weight:900;color:#38bdf8;">${vendedoresDonadores.size}</div>
          <div style="font-size:.72rem;color:var(--modal-soft);margin-top:2px;">Vendedores donadores</div>
        </div>
      </div>

      ${Object.keys(byBen).length > 0 ? `
      <p style="font-size:.75rem;color:var(--modal-muted);text-transform:uppercase;letter-spacing:.05em;margin:0 0 10px;">Donaciones por beneficiario</p>
      ${Object.entries(byBen).sort((a,b)=>b[1].count-a[1].count).map(([bid, info]) => {
        const ben = benMap[bid];
        const label = ben ? (ben.nombre + (ben.organizacion ? ' — ' + ben.organizacion : '')) : 'Sin asignar';
        const vendsLabel = [...info.vendedores].slice(0, 3).join(', ') + (info.vendedores.size > 3 ? '…' : '');
        return `
        <div style="padding:11px 0;border-bottom:1px solid rgba(127,127,127,.22);">
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <span style="font-size:.85rem;font-weight:600;">${Icon('heart')} ${escapeHtml(label)}</span>
            <span style="background:#f97316;color:#fff;border-radius:20px;padding:2px 10px;font-size:.78rem;font-weight:700;">${info.count}</span>
          </div>
          <div style="font-size:.72rem;color:var(--modal-soft);margin-top:4px;">${fmtMoney(info.valor)} · donado por ${escapeHtml(vendsLabel || '—')}</div>
        </div>`;
      }).join('')}` : '<p style="color:var(--modal-soft);text-align:center;padding:16px 0;">Aún no hay donaciones asignadas.</p>'}

      ${topVendedores.length > 0 ? `
      <p style="font-size:.75rem;color:var(--modal-muted);text-transform:uppercase;letter-spacing:.05em;margin:22px 0 10px;">Top vendedores donadores</p>
      ${topVendedores.map((v, i) => `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:9px 0;border-bottom:1px solid rgba(127,127,127,.22);">
          <span style="font-size:.82rem;">${['🥇','🥈','🥉'][i] || '•'} ${escapeHtml(v.nombre)}</span>
          <span style="font-size:.75rem;color:var(--modal-soft);">${v.count} prod · ${fmtMoney(v.valor)}</span>
        </div>`).join('')}` : ''}

      ${recientes.length > 0 ? `
      <p style="font-size:.75rem;color:var(--modal-muted);text-transform:uppercase;letter-spacing:.05em;margin:22px 0 10px;">Donaciones recientes</p>
      ${recientes.map(d => {
        const prod    = productMap[String(d.producto_id)] || {};
        const ben     = benMap[d.beneficiario_id] || {};
        const vNombre = prod.vendedor_nombre || vendorNameMap[d.vendedor_uid] || 'Vendedor';
        return `
        <div style="padding:8px 0;border-bottom:1px solid rgba(127,127,127,.22);font-size:.78rem;color:var(--modal-text);">
          <strong style="color:#fff;">${escapeHtml(prod.nombre || 'Producto')}</strong><br>
          ${escapeHtml(vNombre)} ${Icon('arrow-right',{size:12})} ${escapeHtml(ben.nombre || 'beneficiario')} · <span style="color:var(--modal-muted);">${fmtFecha(d.fecha_asignacion)}</span>
        </div>`;
      }).join('')}` : ''}
    `;
  } catch(e) {
    document.getElementById('don-stats-body').innerHTML = '<p style="color:#ef4444;text-align:center;">Error al cargar estadísticas.</p>';
  }
}

// ── Gráficas y Estadísticas (ZNR + Comunidad) ──────────────────────────────
async function openAnalyticsModal(period, source) {
  period = period || 'day';
  source = source || 'znr';
  const old = document.getElementById('modal-analytics');
  if (old) old.remove();
  const token = getAdminToken();
  const periodLabels = { day:'Hoy', week:'Semana', month:'Mes', all:'Todo' };
  const sourceLabels = { znr:'Catálogo ZNR', comunidad:'Comunidad' };

  const modal = document.createElement('div');
  modal.id = 'modal-analytics';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:99999;display:flex;align-items:flex-end;justify-content:center;';
  modal.innerHTML = `<div style="background:var(--modal-bg);border-radius:20px 20px 0 0;width:100%;max-width:560px;max-height:88vh;overflow-y:auto;padding:0 0 32px;color:var(--modal-text);">
    <div style="position:sticky;top:0;background:var(--modal-bg);padding:18px 20px 14px;border-bottom:1px solid var(--modal-border);display:flex;align-items:center;justify-content:space-between;gap:10px;z-index:2;">
      <h2 style="margin:0;font-size:1rem;font-weight:800;">${Icon('stats')} Gráficas y Estadísticas</h2>
      <button id="btn-close-analytics" style="background:none;border:none;font-size:22px;cursor:pointer;color:var(--modal-muted);">×</button>
    </div>
    <div style="padding:14px 20px 0;display:flex;gap:6px;">
      ${['znr','comunidad'].map(s => `<button class="an-source-btn" data-source="${s}" style="flex:1;padding:8px 0;border-radius:30px;border:1px solid ${s===source ? 'transparent' : 'rgba(127,127,127,.22)'};background:${s===source ? 'linear-gradient(135deg,#6366f1,#818cf8)' : 'rgba(127,127,127,.22)'};color:#fff;font-size:12.5px;font-weight:700;cursor:pointer;">${sourceLabels[s]}</button>`).join('')}
    </div>
    <div style="padding:10px 20px 0;display:flex;gap:6px;">
      ${['day','week','month','all'].map(p => `<button class="an-period-btn" data-period="${p}" style="flex:1;padding:8px 0;border-radius:30px;border:1px solid ${p===period ? 'transparent' : 'rgba(127,127,127,.22)'};background:${p===period ? 'var(--gradient-accent)' : 'rgba(127,127,127,.22)'};color:#fff;font-size:12.5px;font-weight:600;cursor:pointer;">${periodLabels[p]}</button>`).join('')}
    </div>
    <div id="an-body" style="padding:18px 20px;">Cargando…</div>
  </div>`;
  document.body.appendChild(modal);
  document.getElementById('btn-close-analytics').onclick = () => modal.remove();
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  modal.querySelectorAll('.an-period-btn').forEach(btn => {
    btn.addEventListener('click', () => openAnalyticsModal(btn.dataset.period, source));
  });
  modal.querySelectorAll('.an-source-btn').forEach(btn => {
    btn.addEventListener('click', () => openAnalyticsModal(period, btn.dataset.source));
  });

  const bodyEl = document.getElementById('an-body');
  try {
    if (!token) throw new Error('Sin sesión de admin');
    const action = source === 'comunidad' ? 'getAnalyticsComunidad' : 'getAnalytics';
    const apiUrl = source === 'comunidad' ? window.VENTAS_API_URL : window.TIENDA_ZNR_API_URL;
    const res = await apiFetch(apiUrl, { action, token, period }).then(r=>r.json());
    if (!res.ok) throw new Error(res.error || 'Error del servidor');

    const fmtMoney = v => '$' + Number(v||0).toLocaleString('es-MX');
    const byDay    = res.requestsByDay  || [];
    const topProds = res.topProducts    || [];
    const topVends = res.topVendors     || [];
    const vendorStatus = res.vendorStatusSummary || [];
    const recent   = res.recentActivity || [];
    const maxDay   = Math.max(1, ...byDay.map(d => d.count));
    const maxProd  = Math.max(1, ...topProds.map(p => p.count));

    // Vocabulario de estados distinto entre ZNR (confirmed/rejected/cancelled)
    // y Comunidad (entregado/confirmada/pendiente/sin_stock/cancelada_por_baja).
    const STATUS_VISUAL = {
      confirmed:          { color:'#22c55e', label:'Confirmado' },
      entregado:          { color:'#22c55e', label:'Entregado' },
      confirmada:         { color:'#38bdf8', label:'Confirmada' },
      rejected:           { color:'#ef4444', label:'Rechazado' },
      cancelled:          { color:'#ef4444', label:'Cancelado' },
      sin_stock:          { color:'#ef4444', label:'Sin stock' },
      cancelada_por_baja: { color:'#ef4444', label:'Cancelada' },
      pending:            { color:'#f97316', label:'Pendiente' },
      pendiente:          { color:'#f97316', label:'Pendiente' }
    };

    bodyEl.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:22px;">
        <div style="background:rgba(99,102,241,.12);border:1px solid rgba(99,102,241,.25);border-radius:14px;padding:14px;text-align:center;">
          <div style="font-size:1.6rem;font-weight:900;color:#818cf8;">${res.totalRequests}</div>
          <div style="font-size:.72rem;color:var(--modal-soft);margin-top:2px;">Solicitudes</div>
        </div>
        <div style="background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.22);border-radius:14px;padding:14px;text-align:center;">
          <div style="font-size:1.4rem;font-weight:900;color:#22c55e;">${fmtMoney(res.totalRevenue)}</div>
          <div style="font-size:.72rem;color:var(--modal-soft);margin-top:2px;">${source === 'comunidad' ? 'Ingresos entregados' : 'Ingresos confirmados'}</div>
        </div>
        <div style="background:rgba(56,189,248,.1);border:1px solid rgba(56,189,248,.22);border-radius:14px;padding:14px;text-align:center;">
          <div style="font-size:1.6rem;font-weight:900;color:#38bdf8;">${res.confirmedOrders}</div>
          <div style="font-size:.72rem;color:var(--modal-soft);margin-top:2px;">Confirmados</div>
        </div>
        <div style="background:rgba(249,115,22,.12);border:1px solid rgba(249,115,22,.25);border-radius:14px;padding:14px;text-align:center;">
          <div style="font-size:1.6rem;font-weight:900;color:#f97316;">${res.pendingOrders}</div>
          <div style="font-size:.72rem;color:var(--modal-soft);margin-top:2px;">Pendientes</div>
        </div>
      </div>

      ${byDay.length ? `
      <p style="font-size:.75rem;color:var(--modal-muted);text-transform:uppercase;letter-spacing:.05em;margin:0 0 12px;">Solicitudes en el período</p>
      <div style="display:flex;align-items:flex-end;gap:6px;height:90px;margin-bottom:24px;">
        ${byDay.map(d => `
          <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;justify-content:flex-end;height:100%;">
            <div title="${d.count}" style="width:100%;max-width:30px;background:var(--gradient-accent);border-radius:6px 6px 2px 2px;height:${Math.max(4, (d.count/maxDay)*64)}px;"></div>
            <span style="font-size:.62rem;color:var(--modal-muted);">${escapeHtml(d.label)}</span>
          </div>`).join('')}
      </div>` : '<p style="color:var(--modal-soft);text-align:center;padding:10px 0;">Sin solicitudes en este período.</p>'}

      ${topProds.length ? `
      <p style="font-size:.75rem;color:var(--modal-muted);text-transform:uppercase;letter-spacing:.05em;margin:0 0 10px;">Productos más solicitados</p>
      ${topProds.map(p => `
        <div style="margin-bottom:9px;">
          <div style="display:flex;justify-content:space-between;font-size:.78rem;margin-bottom:3px;">
            <span style="color:var(--modal-text);">${escapeHtml(p.name)}</span><span style="color:var(--modal-soft);">${p.count}</span>
          </div>
          <div style="background:rgba(127,127,127,.22);border-radius:20px;height:6px;overflow:hidden;">
            <div style="background:var(--color-accent-solid);height:100%;width:${(p.count/maxProd)*100}%;"></div>
          </div>
        </div>`).join('')}` : ''}

      ${topVends.length ? `
      <p style="font-size:.75rem;color:var(--modal-muted);text-transform:uppercase;letter-spacing:.05em;margin:22px 0 10px;">Top vendedores por ingresos</p>
      ${topVends.map((v, i) => `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:9px 0;border-bottom:1px solid rgba(127,127,127,.22);">
          <span style="font-size:.82rem;color:var(--modal-text);">${['🥇','🥈','🥉'][i] || '•'} ${escapeHtml(v.nombre)}</span>
          <span style="font-size:.75rem;color:var(--modal-soft);">${v.orders} ped · ${fmtMoney(v.revenue)}</span>
        </div>`).join('')}` : ''}

      ${(source === 'comunidad' && vendorStatus.length) ? `
      <p style="font-size:.75rem;color:var(--modal-muted);text-transform:uppercase;letter-spacing:.05em;margin:22px 0 10px;">Entregado / Sin stock por vendedor</p>
      ${vendorStatus.map(v => `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(127,127,127,.22);font-size:.8rem;">
          <span style="color:var(--modal-text);">${escapeHtml(v.nombre)}</span>
          <span style="display:flex;gap:6px;">
            <span title="Entregados" style="background:rgba(34,197,94,.15);color:#22c55e;border-radius:20px;padding:2px 10px;font-size:.72rem;font-weight:700;">✔ ${v.entregados}</span>
            <span title="Sin stock" style="background:rgba(239,68,68,.15);color:#ef4444;border-radius:20px;padding:2px 10px;font-size:.72rem;font-weight:700;">✖ ${v.sinStock}</span>
          </span>
        </div>`).join('')}
      ` : (recent.length ? `
      <p style="font-size:.75rem;color:var(--modal-muted);text-transform:uppercase;letter-spacing:.05em;margin:22px 0 10px;">Actividad reciente</p>
      ${recent.map(a => {
        const visual = STATUS_VISUAL[a.status] || { color:'#f97316', label:'Pendiente' };
        const vendedorTxt = a.vendedor ? escapeHtml(a.vendedor) + ' · ' : '';
        return `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(127,127,127,.22);font-size:.78rem;">
          <span style="color:var(--modal-text);">${vendedorTxt}${a.items} producto${a.items===1?'':'s'} · ${escapeHtml(a.date)}</span>
          <span style="background:${visual.color};color:#fff;border-radius:20px;padding:2px 9px;font-size:.7rem;font-weight:700;">${visual.label}</span>
        </div>`;
      }).join('')}` : '')}
    `;
  } catch(e) {
    bodyEl.innerHTML = '<p style="color:#ef4444;text-align:center;">Error al cargar estadísticas' + (e.message ? ': ' + escapeHtml(e.message) : '') + '</p>';
  }
}



// ── Monitor de Errores (movido al panel de Notificaciones > Herramientas) ──
// ── Reentrenar modelo de IA (auto-tag de categoría) ───────────────────────
async function resincronizarComunidadAlgoliaBtn() {
  const confirmado = await new Promise((resolve) => {
    showCustomConfirm({
      title: 'Resincronizar Comunidad con Algolia',
      message: 'Esto recorre todo el índice de Algolia y borra cualquier producto que ya no exista o no esté aprobado en la hoja (productos "fantasma"). Puede tardar unos segundos si el catálogo es grande. ¿Continuar?',
      icon: 'refresh',
      confirmText: 'Sí, resincronizar',
      cancelText: 'Cancelar',
      onConfirm: () => resolve(true),
      onCancel: () => resolve(false)
    });
  });
  if (!confirmado) return;

  showLoader('Resincronizando Comunidad con Algolia...');
  try {
    const api = window.CATALOGO_API_URL;
    const token = getAdminToken();
    if (!api || !token) {
      hideLoader();
      showCustomAlert({
        title: 'Sin sesión activa',
        message: 'No hay token de admin disponible. Inicia sesión de nuevo.',
        icon: 'error',
        confirmText: 'Entendido'
      });
      return;
    }
    const res = await apiFetch(api, { action: 'resincronizarComunidadAlgolia', token }, true);
    const data = await res.json();
    hideLoader();
    if (!data || !data.ok) {
      showCustomAlert({
        title: 'No se pudo resincronizar',
        message: (data && data.error) || 'Error desconocido.',
        icon: 'error',
        confirmText: 'Entendido'
      });
      return;
    }
    showCustomAlert({
      title: 'Resincronización disparada',
      message: data.message || 'Resincronización disparada.',
      icon: 'check',
      confirmText: 'Entendido'
    });
  } catch (err) {
    hideLoader();
    console.error('Error resincronizarComunidadAlgolia:', err);
    showCustomAlert({
      title: 'Error de conexión',
      message: 'No se pudo contactar al servidor. Intenta de nuevo.',
      icon: 'error',
      confirmText: 'Entendido'
    });
  }
}

async function reentrenarModeloIA() {
  const confirmado = await new Promise((resolve) => {
    showCustomConfirm({
      title: 'Reentrenar modelo de IA',
      message: 'Esto dispara un entrenamiento nuevo del modelo de auto-tag de categorías en GitHub Actions, usando las fotos y categorías actuales del catálogo. Puede tardar varios minutos y reemplazará el modelo en producción al terminar. ¿Continuar?',
      icon: 'sparkles',
      confirmText: 'Sí, reentrenar',
      cancelText: 'Cancelar',
      onConfirm: () => resolve(true),
      onCancel: () => resolve(false)
    });
  });
  if (!confirmado) return;

  showLoader('Disparando reentrenamiento...');
  try {
    const api = window.ADMIN_API_URL;
    const token = getAdminToken();
    if (!api || !token) {
      hideLoader();
      showCustomAlert({
        title: 'Sin sesión activa',
        message: 'No hay token de admin disponible. Inicia sesión de nuevo.',
        icon: 'error',
        confirmText: 'Entendido'
      });
      return;
    }
    const res = await apiFetch(api, { action: 'reentrenarModeloIA', token }, true);
    const data = await res.json();
    hideLoader();
    if (!data || !data.ok) {
      showCustomAlert({
        title: 'No se pudo disparar el reentrenamiento',
        message: (data && data.error) || 'Error desconocido.',
        icon: 'error',
        confirmText: 'Entendido'
      });
      return;
    }
    showCustomAlert({
      title: 'Reentrenamiento disparado',
      message: data.message || 'Revisa la pestaña Actions de tu repo en GitHub para ver el progreso.',
      icon: 'check',
      confirmText: 'Entendido'
    });
  } catch (err) {
    hideLoader();
    console.error('Error reentrenarModeloIA:', err);
    showCustomAlert({
      title: 'Error de conexión',
      message: 'No se pudo contactar al servidor. Intenta de nuevo.',
      icon: 'error',
      confirmText: 'Entendido'
    });
  }
}






// ── Resumen Plan Plus (MRR) ────────────────────────────────────────────────
async function openPlanPlusResumenModal() {
  const old = document.getElementById('modal-plan-plus-resumen');
  if (old) old.remove();
  const token = getAdminToken();
  const rol   = sessionStorage.getItem('admin_rol') || 'master';
  const api   = window.VENDEDORES_API_URL;
  const esMaster = rol === 'master';

  const modal = document.createElement('div');
  modal.id = 'modal-plan-plus-resumen';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:99999;display:flex;align-items:flex-end;justify-content:center;';
  modal.innerHTML = `<div style="background:var(--modal-bg);border-radius:20px 20px 0 0;width:100%;max-width:560px;max-height:88vh;overflow-y:auto;padding:0 0 32px;color:var(--modal-text);">
    <div style="position:sticky;top:0;background:var(--modal-bg);padding:18px 20px 14px;border-bottom:1px solid var(--modal-border);display:flex;align-items:center;justify-content:space-between;gap:10px;z-index:2;">
      <h2 style="margin:0;font-size:1rem;font-weight:800;">${Icon('star')} Resumen Plan Plus</h2>
      <button id="btn-close-plan-plus-resumen" style="background:none;border:none;font-size:22px;cursor:pointer;color:var(--modal-muted);">×</button>
    </div>
    ${esMaster ? `
    <div style="padding:14px 20px 0;">
      <label style="font-size:.72rem;font-weight:700;color:var(--modal-muted);text-transform:uppercase;letter-spacing:.04em;display:block;margin-bottom:6px;">Ciudad</label>
      <select id="ppr-estado-select" style="width:100%;padding:10px;margin-bottom:8px;border-radius:10px;border:1.5px solid var(--modal-border);background:var(--modal-bg);color:var(--modal-text);"></select>
      <select id="ppr-ciudad-select" style="width:100%;padding:10px;border-radius:10px;border:1.5px solid var(--modal-border);background:var(--modal-bg);color:var(--modal-text);"></select>
    </div>` : ''}
    <div id="ppr-body" style="padding:18px 20px;">Cargando…</div>
  </div>`;
  document.body.appendChild(modal);
  if (esMaster) enlazarEstadoCiudad(document.getElementById('ppr-estado-select'), document.getElementById('ppr-ciudad-select'), 'Todas (global)');
  document.getElementById('btn-close-plan-plus-resumen').onclick = () => modal.remove();
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });

  const bodyEl = document.getElementById('ppr-body');
  const fmtMoney = v => '$' + Number(v || 0).toLocaleString('es-MX');

  async function cargar(ciudad) {
    bodyEl.innerHTML = 'Cargando…';
    try {
      if (!token) throw new Error('Sin sesión de admin');
      const params = { action: 'obtenerResumenPlanPlus', token };
      if (ciudad) params.ciudad = ciudad;
      const res = await apiFetch(api, params).then(r => r.json());
      if (!res.ok) throw new Error(res.error || 'Error del servidor');
      const proximos = res.proximosVencimientos || [];

      const admins = res.adminsCiudad || [];

      bodyEl.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:22px;">
          <div style="grid-column:span 2;background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.22);border-radius:14px;padding:16px;text-align:center;">
            <div style="font-size:2rem;font-weight:900;color:#22c55e;">${fmtMoney(res.mrr)}</div>
            <div style="font-size:.75rem;color:var(--modal-soft);margin-top:2px;">MRR real${res.ciudad ? ' — ' + escapeHtml(res.ciudad) : ' (global)'} (${res.vendedoresActivos} × ${fmtMoney(res.precioMensual)}/mes)</div>
          </div>
          ${esMaster && res.ciudad ? `
          <div style="grid-column:span 2;background:rgba(234,179,8,.12);border:1px solid rgba(234,179,8,.28);border-radius:14px;padding:16px;text-align:center;">
            <div style="font-size:1.7rem;font-weight:900;color:#eab308;">${fmtMoney(res.montoAdmin)}</div>
            <div style="font-size:.75rem;color:var(--modal-soft);margin-top:2px;">Pago sugerido para el admin de ${escapeHtml(res.ciudad)} (${Math.round(res.porcentajeAdmin * 100)}% del MRR real — no incluye Plan Plus gratis por ser staff, y este monto no se paga solo)</div>
          </div>` : ''}
          <div style="background:rgba(99,102,241,.12);border:1px solid rgba(99,102,241,.25);border-radius:14px;padding:14px;text-align:center;">
            <div style="font-size:1.6rem;font-weight:900;color:#818cf8;">${res.vendedoresActivos}</div>
            <div style="font-size:.72rem;color:var(--modal-soft);margin-top:2px;">Vendedores Plus activos</div>
          </div>
          <div style="background:rgba(249,115,22,.12);border:1px solid rgba(249,115,22,.25);border-radius:14px;padding:14px;text-align:center;">
            <div style="font-size:1.6rem;font-weight:900;color:#f97316;">${res.vencenEn7dias}</div>
            <div style="font-size:.72rem;color:var(--modal-soft);margin-top:2px;">Vencen en 7 días</div>
          </div>
        </div>

        ${esMaster && admins.length ? `
        <p style="font-size:.75rem;color:var(--modal-muted);text-transform:uppercase;letter-spacing:.05em;margin:0 0 10px;">Pagar a ${admins.length > 1 ? 'los admins de ' + escapeHtml(res.ciudad) : 'el admin de ' + escapeHtml(res.ciudad)}</p>
        ${admins.length > 1 ? `<p style="font-size:.72rem;color:#eab308;margin:0 0 12px;">Hay más de un admin activo en esta ciudad — el monto de arriba es el total de la ciudad, repártanlo entre ustedes.</p>` : ''}
        ${admins.map(a => `
          <div style="background:rgba(127,127,127,.22);border:1px solid rgba(127,127,127,.22);border-radius:14px;padding:14px;margin-bottom:10px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
              <span style="font-weight:700;font-size:.88rem;">${escapeHtml(a.nombre)}${a.activo ? '' : ' <span style="color:#ef4444;font-weight:600;font-size:.7rem;">(desactivado)</span>'}</span>
            </div>
            ${a.clabe ? `
            <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 0;">
              <span style="font-size:.78rem;color:var(--modal-text);">CLABE: <b style="font-family:monospace;letter-spacing:.03em;">${escapeHtml(a.clabe)}</b></span>
              <button type="button" data-copy="${escapeHtml(a.clabe)}" style="background:rgba(99,102,241,.18);border:none;color:#a5b4fc;border-radius:8px;padding:4px 10px;font-size:.72rem;font-weight:700;cursor:pointer;">Copiar</button>
            </div>` : ''}
            ${a.tarjeta ? `
            <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 0;">
              <span style="font-size:.78rem;color:var(--modal-text);">Tarjeta: <b style="font-family:monospace;letter-spacing:.03em;">${escapeHtml(a.tarjeta)}</b></span>
              <button type="button" data-copy="${escapeHtml(a.tarjeta)}" style="background:rgba(99,102,241,.18);border:none;color:#a5b4fc;border-radius:8px;padding:4px 10px;font-size:.72rem;font-weight:700;cursor:pointer;">Copiar</button>
            </div>` : ''}
            ${!a.clabe && !a.tarjeta ? '<p style="font-size:.76rem;color:var(--modal-muted);margin:4px 0;">Todavía no capturó CLABE ni tarjeta.</p>' : ''}
            <button type="button" ${a.pagado ? 'disabled' : `data-marcar-pago="${a.uid}"`}
              style="width:100%;margin-top:10px;border-radius:10px;padding:9px;font-size:.8rem;font-weight:700;cursor:${a.pagado ? 'default' : 'pointer'};border:none;
              background:${a.pagado ? 'rgba(34,197,94,.15)' : '#eab308'};color:${a.pagado ? '#22c55e' : '#1a1a1a'};">
              ${a.pagado ? '✓ Ya pagado ' + a.periodo + (a.montoPagado ? ' (' + fmtMoney(a.montoPagado) + ')' : '') : 'Marcar pagado ' + a.periodo}
            </button>
          </div>
        `).join('')}
        ` : ''}

        ${proximos.length ? `
        <p style="font-size:.75rem;color:var(--modal-muted);text-transform:uppercase;letter-spacing:.05em;margin:0 0 10px;">Próximos vencimientos</p>
        ${proximos.map(v => {
          const urgente = v.diasRestantes <= 7;
          return `
          <div style="display:flex;align-items:center;justify-content:space-between;padding:9px 0;border-bottom:1px solid rgba(127,127,127,.22);">
            <span style="font-size:.82rem;color:var(--modal-text);">${escapeHtml(v.nombre)}</span>
            <span style="background:${urgente ? '#ef4444' : 'rgba(127,127,127,.22)'};color:#fff;border-radius:20px;padding:2px 10px;font-size:.72rem;font-weight:700;">${v.diasRestantes} día${v.diasRestantes === 1 ? '' : 's'}</span>
          </div>`;
        }).join('')}` : '<p style="color:var(--modal-soft);text-align:center;padding:16px 0;">Nadie vence en los próximos 30 días.</p>'}
      `;
    } catch (e) {
      bodyEl.innerHTML = '<p style="color:#ef4444;text-align:center;">Error al cargar el resumen: ' + (e.message || '') + '</p>';
    }
  }

  // Delegación de eventos: copiar CLABE/tarjeta y marcar pago, sin
  // re-atar listeners cada vez que cargar() vuelve a pintar el body.
  bodyEl.addEventListener('click', async (e) => {
    const copyBtn = e.target.closest('[data-copy]');
    if (copyBtn) {
      try {
        await navigator.clipboard.writeText(copyBtn.dataset.copy);
        const original = copyBtn.textContent;
        copyBtn.textContent = '¡Copiado!';
        setTimeout(() => { copyBtn.textContent = original; }, 1200);
      } catch { /* clipboard no disponible, se ignora silenciosamente */ }
      return;
    }
    const pagoBtn = e.target.closest('[data-marcar-pago]');
    if (pagoBtn) {
      if (!await askConfirm('¿Confirmas que ya le transferiste este pago? No se puede desmarcar.')) return;
      pagoBtn.disabled = true;
      pagoBtn.textContent = 'Guardando…';
      try {
        const r = await fetch(api, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'marcarPagoAdminMes', token, uid: pagoBtn.dataset.marcarPago }),
        }).then(x => x.json());
        if (!r.ok) throw new Error(r.error || 'Error del servidor');
        const ciudadActual = document.getElementById('ppr-ciudad-select')?.value || '';
        await cargar(ciudadActual);
      } catch (e2) {
        askAlert('No se pudo marcar el pago: ' + (e2.message || ''));
        pagoBtn.disabled = false;
        pagoBtn.textContent = 'Marcar pagado';
      }
    }
  });

  if (esMaster) {
    document.getElementById('ppr-ciudad-select').addEventListener('change', (e) => cargar(e.target.value));
  }
  await cargar('');
}



 

// ── Sincronizar productos de un vendedor específico (fix manual) ───────────
window.openSyncVendedorModal = function() {
  let modal = document.getElementById('sync-vendedor-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'sync-vendedor-modal';
    modal.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,.6);backdrop-filter:blur(5px);z-index:19999;align-items:center;justify-content:center;';
    modal.innerHTML = `
      <div style="background:var(--modal-bg);color:var(--modal-text);border-radius:22px;padding:28px;max-width:400px;width:90%;position:relative;box-shadow:0 24px 64px rgba(0,0,0,.3);">
        <button data-hide="sync-vendedor-modal" style="position:absolute;top:14px;right:14px;background:var(--modal-chip-bg);border:none;width:36px;height:36px;border-radius:50%;font-size:17px;cursor:pointer;color:var(--modal-muted);">${Icon('x')}</button>
        <h3 style="margin:0 0 8px;font-size:18px;">${Icon('refresh')} Sincronizar productos de vendedor</h3>
        <p style="margin:0 0 18px;font-size:13px;color:var(--modal-muted);">Vuelve a sincronizar todos los productos publicados de un vendedor, según su UID.</p>
        <label style="font-size:12px;font-weight:700;color:#444;display:block;margin-bottom:6px;">UID del vendedor</label>
        <input type="text" id="sync-vendedor-uid-input" placeholder="Ej: v_1779036431879" style="width:100%;padding:12px;border:1.5px solid #e2e0eb;border-radius:10px;font-size:14px;margin-bottom:16px;box-sizing:border-box;">
        <button type="button" id="sync-vendedor-submit-btn" class="primary-button full-width" style="padding:12px;">Sincronizar</button>
      </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });
    modal.querySelector('#sync-vendedor-submit-btn').addEventListener('click', ejecutarSyncVendedor);
    modal.querySelector('#sync-vendedor-uid-input').addEventListener('keydown', e => {
      if (e.key === 'Enter') ejecutarSyncVendedor();
    });
  }
  const input = modal.querySelector('#sync-vendedor-uid-input');
  input.value = '';
  modal.style.display = 'flex';
  setTimeout(() => input.focus(), 50);
};

async function ejecutarSyncVendedor() {
  const input = document.getElementById('sync-vendedor-uid-input');
  const vendedorUid = (input?.value || '').trim();
  if (!vendedorUid) {
    if (window.showTemporaryMessage) window.showTemporaryMessage('Ingresa el UID del vendedor', 'error');
    return;
  }
  const api = window.CATALOGO_API_URL;
  const token = getAdminToken();
  if (!api || !token) {
    showCustomAlert({
      title: 'Sin sesión activa',
      message: 'No hay token de admin disponible. Inicia sesión de nuevo.',
      icon: 'error',
      confirmText: 'Entendido'
    });
    return;
  }
  document.getElementById('sync-vendedor-modal').style.display = 'none';
  showLoader('Sincronizando productos del vendedor...');
  try {
    const res = await apiFetch(api, { action: 'sincronizarProductosVendedor', vendedor_uid: vendedorUid, token }, true);
    const data = await res.json();
    hideLoader();
    if (!data || !data.ok) {
      showCustomAlert({
        title: 'No se pudo sincronizar',
        message: (data && data.error) || 'Error desconocido.',
        icon: 'error',
        confirmText: 'Entendido'
      });
      return;
    }
    showCustomAlert({
      title: 'Sincronización completa',
      message: data.message || `Productos del vendedor ${vendedorUid} sincronizados.`,
      icon: 'check',
      confirmText: 'Entendido'
    });
  } catch (err) {
    hideLoader();
    console.error('Error sincronizarProductosVendedor:', err);
    showCustomAlert({
      title: 'Error de conexión',
      message: 'No se pudo contactar al servidor. Intenta de nuevo.',
      icon: 'error',
      confirmText: 'Entendido'
    });
  }
}
window.ejecutarSyncVendedor = ejecutarSyncVendedor;

function openErrorMonitorModal() {
  const old = document.getElementById('modal-error-monitor');
  if (old) old.remove();

  const modal = document.createElement('div');
  modal.id = 'modal-error-monitor';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:99999;display:flex;align-items:flex-end;justify-content:center;';
  modal.innerHTML = `<div style="background:var(--modal-bg);border-radius:20px 20px 0 0;width:100%;max-width:560px;max-height:88vh;overflow-y:auto;padding:0 0 32px;color:var(--modal-text);">
    <div style="position:sticky;top:0;background:var(--modal-bg);padding:18px 20px 14px;border-bottom:1px solid var(--modal-border);display:flex;align-items:center;justify-content:space-between;gap:10px;">
      <h2 style="margin:0;font-size:1rem;font-weight:800;display:flex;align-items:center;gap:8px;"><svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" aria-hidden="true"><use href="#ic-error"/></svg> Monitor de Errores <span id="em-badge" style="display:none;background:#ef4444;color:#fff;border-radius:20px;padding:1px 8px;font-size:11px;font-weight:700"></span></h2>
      <button id="btn-close-error-monitor" style="background:none;border:none;font-size:22px;cursor:pointer;color:var(--modal-muted);">×</button>
    </div>
    <div style="padding:16px 20px;">
      <div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap">
        <button data-click="loadErrorLog" style="background:rgba(127,127,127,.22);border:1px solid rgba(127,127,127,.22);color:#fff;padding:6px 14px;border-radius:20px;font-size:13px;cursor:pointer;display:flex;align-items:center;gap:6px">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" aria-hidden="true"><use href="#ic-refresh"/></svg> Actualizar
        </button>
        <button data-click="clearErrorLog" style="background:rgba(127,127,127,.22);border:1px solid rgba(127,127,127,.22);color:#ef4444;padding:6px 14px;border-radius:20px;font-size:13px;cursor:pointer;display:flex;align-items:center;gap:6px">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" aria-hidden="true"><use href="#ic-trash"/></svg> Limpiar log
        </button>
        <button data-click="copiarErrorLog" style="background:rgba(127,127,127,.22);border:1px solid rgba(127,127,127,.22);color:#fff;padding:6px 14px;border-radius:20px;font-size:13px;cursor:pointer">📋 Copiar errores</button>
        <select id="em-filter" data-change="renderErrorLog" style="background:rgba(127,127,127,.22);border:1px solid rgba(127,127,127,.22);color:#fff;padding:6px 12px;border-radius:20px;font-size:13px;cursor:pointer">
          <option value="all">Todos</option>
          <option value="CRÍTICO">Solo críticos</option>
          <option value="ERROR">Solo errores</option>
        </select>
      </div>
      <div id="em-list" style="font-size:13px;line-height:1.6">
        <p style="color:var(--modal-muted);text-align:center;padding:20px">Cargando...</p>
      </div>
    </div>
  </div>`;
  document.body.appendChild(modal);
  document.getElementById('btn-close-error-monitor').onclick = () => modal.remove();
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  if (typeof loadErrorLog === 'function') loadErrorLog();
}

// ── Monitor de Errores: funciones de carga y renderizado ──────────────────

window.loadErrorLog = function() {
  const list = document.getElementById('em-list');
  if (!list) return;
  list.innerHTML = '<p style="color:var(--modal-muted);text-align:center;padding:20px">' + Icon('clock') + ' Cargando errores...</p>';
  const api   = window.ADMIN_API_URL;
  const token = getAdminToken();

  if (!api || !token) {
    list.innerHTML = '<p style="color:#f97316;text-align:center;padding:20px">' + Icon('error') + ' Sin sesión activa. Inicia sesión de nuevo.</p>';
    return;
  }

  apiFetch(api, { action: 'obtenerErrorLog', token })
    .then(r => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(data => {
      if (!data.ok && data.error) {
        // Backend respondió con error (ej: token inválido)
        list.innerHTML = `<p style="color:#ef4444;text-align:center;padding:20px">${Icon('x')} ${escapeHtml(data.error)}</p>`;
        return;
      }
      // Normalizar campos en español → formato interno
      const remote = (Array.isArray(data.errors) ? data.errors : []).map(e => ({
        ts:       e.ts        || e.Timestamp || new Date().toISOString(),
        level:    e.nivel     || e.Nivel     || e.level    || 'ERROR',
        source:   e.fuente    || e.Fuente    || e.source   || '',
        action:   e.accion    || e.Accion    || e.action   || '',
        message:  e.mensaje   || e.Mensaje   || e.message  || '',
        url:      e.url       || e.URL       || '',
        filename: e.archivo   || e.Archivo   || e.filename || '',
        lineno:   e.linea     || e.Linea     || e.lineno   || 0,
        colno:    e.columna   || e.Columna   || e.colno    || 0,
        stack:    e.stack     || e.Stack     || '',
      }));
      // Combinar con errores locales del localStorage si los hay
      const local = (window.ZRMonitor ? window.ZRMonitor.getErrors() : []);
      const seen  = new Set();
      window._emErrors = [...remote, ...local]
        .filter(e => { const k = (e.ts||'') + (e.message||''); return seen.has(k) ? false : seen.add(k); })
        .sort((a, b) => new Date(b.ts) - new Date(a.ts));
      renderErrorLog();
    })
    .catch(err => {
      console.error('[Monitor] Error al obtener errores:', err);
      list.innerHTML = `<p style="color:#ef4444;text-align:center;padding:20px">${Icon('x')} Error de red: ${escapeHtml(err.message)}.<br><span style="color:var(--modal-muted);font-size:11px;">Revisa la consola para más detalles.</span></p>`;
    });
};

window.renderErrorLog = function() {
  const list = document.getElementById('em-list');
  if (!list) return;
  const filter = (document.getElementById('em-filter') || {}).value || 'all';
  const all    = window._emErrors || [];
  const errors = filter === 'all' ? all : all.filter(e => (e.level||'') === filter);
  const badge  = document.getElementById('em-badge');
  if (badge) { badge.textContent = all.length; badge.style.display = all.length ? 'inline' : 'none'; }
  if (!errors.length) {
    list.innerHTML = '<p style="color:var(--modal-muted);text-align:center;padding:30px">' + Icon('check') + ' Sin errores registrados</p>';
    return;
  }
  const colorMap = { 'CRÍTICO':'#ef4444', 'ERROR':'#f97316', 'WARN':'#eab308' };
  const grupos = znrGrupoErrores(errors), rep = grupos.filter(g => g.n > ZNR_MAX_REPETIDOS).length;
  list.innerHTML = `<p style="color:var(--modal-soft);font-size:12px;margin:0 0 10px;">${errors.length} error${errors.length === 1 ? '' : 'es'} · ${grupos.length} distinto${grupos.length === 1 ? '' : 's'}${rep ? ` · <b style="color:#ef4444;">${rep} repetido${rep === 1 ? '' : 's'} más de ${ZNR_MAX_REPETIDOS} veces</b>` : ''}</p>` + grupos.map(({ e, n }) => {
    const fecha = e.ts ? new Date(e.ts).toLocaleString('es-MX', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit', second:'2-digit' }) : '–';
    const c     = colorMap[e.level] || '#aaa';
    const src   = escapeHtml(e.source || (e.filename||'').split('/').pop() || '?');
    const msg   = escapeHtml((e.message || '').slice(0, 200));
    const file  = escapeHtml(e.filename || '');
    const line  = e.lineno || 0;
    const col   = e.colno  || 0;
    const stk   = escapeHtml(e.stack  || '');
    return `<div style="background:rgba(127,127,127,.22);border-radius:12px;padding:12px 14px;margin-bottom:10px;border-left:3px solid ${c};">
      <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px;margin-bottom:4px;">
        <span style="color:${c};font-weight:700;font-size:11px;">${escapeHtml(e.level||'?')} &bull; ${src}${n > 1 ? ` <b style="background:${n > ZNR_MAX_REPETIDOS ? '#dc2626' : 'rgba(127,127,127,.4)'};color:#fff;border-radius:10px;padding:1px 7px;margin-left:4px;">×${n}${n > ZNR_MAX_REPETIDOS ? ' ⚠' : ''}</b>` : ''}</span>
        <span style="color:var(--modal-muted);font-size:11px;">${fecha}</span>
      </div>
      <div style="color:var(--modal-text);font-size:12px;word-break:break-word;">${msg}</div>
      ${file||line ? `<div style="color:var(--modal-muted);font-size:11px;margin-top:3px;">${file}${line?':'+line+':'+col:''}</div>` : ''}
      ${stk ? `<details style="margin-top:5px;"><summary style="color:var(--modal-muted);font-size:11px;cursor:pointer;">Stack trace</summary><pre style="color:var(--modal-muted);font-size:10px;margin:4px 0 0;white-space:pre-wrap;word-break:break-all;">${stk}</pre></details>` : ''}
    </div>`;
  }).join('');
};

// Copia los errores (los del filtro, agrupados) como texto para pegarlos en un chat; si el portapapeles no deja, baja un .txt.
window.copiarErrorLog = async function() {
  const filter = (document.getElementById('em-filter') || {}).value || 'all';
  const errors = (window._emErrors || []).filter(e => filter === 'all' || e.level === filter);
  if (!errors.length) return showTemporaryMessage('No hay errores para copiar', 'info');
  const texto = znrGrupoErrores(errors).map(({ e, n }) => [
    `[${e.level}] ${e.source || '?'}${e.action ? ' · ' + e.action : ''} ×${n} · ${e.ts}`, e.message,
    e.url && 'URL: ' + e.url, e.filename && `Archivo: ${e.filename}:${e.lineno}:${e.colno}`, e.stack && 'Stack: ' + e.stack,
  ].filter(Boolean).join('\n')).join('\n\n');
  try {
    await navigator.clipboard.writeText(texto);
    showTemporaryMessage('Errores copiados: pégalos en el chat', 'success');
  } catch (_) {
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([texto], { type: 'text/plain' })), download: 'errores-znr.txt' });
    a.click();
    showTemporaryMessage('No se pudo copiar; se descargó errores-znr.txt', 'info');
  }
};

window.clearErrorLog = async function() {
  if (!await askConfirm('¿Borrar todos los errores del log?')) return;
  const api   = window.ADMIN_API_URL;
  const token = getAdminToken();
  if (window.ZRMonitor) window.ZRMonitor.clear();
  if (api && token) {
    try {
      const res = await apiFetch(api, { action: 'limpiarErrorLog', token }, true);
      const data = await res.json();
      if (!data.ok) {
        showTemporaryMessage('No se pudo limpiar el log del servidor: ' + (data.error || 'error desconocido'), 'error');
      }
    } catch (err) {
      showTemporaryMessage('No se pudo limpiar el log del servidor: ' + err.message, 'error');
    }
  }
  // Volver a pedir el log real al servidor en vez de confiar en un
  // borrado local optimista — así se ve de inmediato si algo no se
  // borró de verdad.
  window.loadErrorLog();
};







 // ── Sugerencias: Vendedor confiable ────────────────────────────────────────
async function openSugerenciasConfiableModal() {
  const old = document.getElementById('modal-sugerencias-confiable');
  if (old) old.remove();
  const token = getAdminToken();
  const api   = window.VENDEDORES_API_URL;

  const modal = document.createElement('div');
  modal.id = 'modal-sugerencias-confiable';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:99999;display:flex;align-items:flex-end;justify-content:center;';
  modal.innerHTML = `<div style="background:var(--modal-bg);border-radius:20px 20px 0 0;width:100%;max-width:560px;max-height:88vh;overflow-y:auto;padding:0 0 32px;color:var(--modal-text);">
    <div style="position:sticky;top:0;background:var(--modal-bg);padding:18px 20px 14px;border-bottom:1px solid var(--modal-border);display:flex;align-items:center;justify-content:space-between;gap:10px;z-index:2;">
      <h2 style="margin:0;font-size:1rem;font-weight:800;">${Icon('lock')} Sugerencias: Vendedor confiable</h2>
      <button id="btn-close-sugerencias-confiable" style="background:none;border:none;font-size:22px;cursor:pointer;color:var(--modal-muted);">×</button>
    </div>
    <div id="sc-body" style="padding:18px 20px;">Cargando…</div>
  </div>`;
  document.body.appendChild(modal);
  document.getElementById('btn-close-sugerencias-confiable').onclick = () => modal.remove();
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });

  const bodyEl = document.getElementById('sc-body');

  async function marcarConfiable(uid, btn) {
    btn.disabled = true;
    btn.textContent = 'Marcando…';
    try {
      const params = new URLSearchParams();
      params.append('action', 'marcarVendedorConfiable');
      params.append('token', token);
      params.append('uid', uid);
      params.append('confiable', 'true');
      const res = await apiFetch(api, params, true).then(r => r.json());
      if (!res.ok) throw new Error(res.error || 'Error del servidor');
      const row = btn.closest('.sc-row');
      if (row) row.remove();
    } catch (e) {
      btn.disabled = false;
      btn.textContent = 'Reintentar';
      askAlert('Error al marcar confiable: ' + e.message);
    }
  }

  try {
    if (!token) throw new Error('Sin sesión de admin');
    const res = await apiFetch(api, { action: 'obtenerSugerenciasConfiable', token }).then(r => r.json());
    if (!res.ok) throw new Error(res.error || 'Error del servidor');

    const sugerencias = res.sugerencias || [];
    bodyEl.innerHTML = `
      <p style="font-size:.78rem;color:var(--modal-soft);margin:0 0 16px;">Vendedores activos con al menos ${res.minVentasRequeridas} pedidos entregados que todavía no están marcados como confiables.</p>
      <div id="sc-list">
        ${sugerencias.length ? sugerencias.map(s => `
          <div class="sc-row" style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(127,127,127,.22);gap:10px;">
            <div>
              <div style="font-size:.85rem;color:var(--modal-text);font-weight:600;">${escapeHtml(s.nombre)}</div>
              <div style="font-size:.72rem;color:var(--modal-muted);">${s.ventasEntregadas} pedidos entregados</div>
            </div>
            <button class="sc-marcar-btn" data-uid="${escapeHtml(s.uid)}" style="padding:7px 14px;border:none;border-radius:20px;background:#2563eb;color:#fff;font-size:.75rem;font-weight:700;cursor:pointer;white-space:nowrap;">Marcar confiable</button>
          </div>`).join('') : '<p style="color:var(--modal-soft);text-align:center;padding:20px 0;">No hay vendedores nuevos que sugerir por ahora.</p>'}
      </div>`;

    bodyEl.querySelectorAll('.sc-marcar-btn').forEach(btn => {
      btn.addEventListener('click', () => marcarConfiable(btn.dataset.uid, btn));
    });
  } catch (e) {
    bodyEl.innerHTML = '<p style="color:#ef4444;text-align:center;">Error al cargar sugerencias: ' + (e.message || '') + '</p>';
  }
}

// ── Backfill de ciudad en productos viejos (Comunidad + Z&R) ────────────────
async function backfillCiudadComunidadBtn() {
  const token = getAdminToken();
  if (!await askConfirm('Esto pone la ciudad del vendedor en todos sus productos de Comunidad que aún no la tienen. ¿Continuar?')) return;
  try {
    const api = window.CATALOGO_API_URL;
    const params = new URLSearchParams({ action: 'backfillCiudadComunidad', token });
    const res = await apiFetch(api, params, true).then(r => r.json());
    if (!res.ok) throw new Error(res.error || 'Error del servidor');
    askAlert(`Listo: ${res.actualizados} de ${res.revisados} productos actualizados. (Los que no se movieron son de vendedores que tampoco tienen ciudad asignada todavía — resuélvelo primero en "Vendedores sin ciudad".)`);
  } catch (e) {
    askAlert('Error: ' + e.message);
  }
}
window.backfillCiudadComunidadBtn = backfillCiudadComunidadBtn;

async function asignarCiudadMasivaZNRBtn() {
  const token = getAdminToken();
  const rol = sessionStorage.getItem('admin_rol') || 'master';
  let pais = null, ciudad = null;
  if (rol === 'master') {
    pais = await askPrompt('País para TODOS los productos Z&R sin ciudad:', 'México');
    if (!pais) return;
    ciudad = await askPrompt('Ciudad para TODOS los productos Z&R sin ciudad:');
    if (!ciudad) return;
  } else if (!await askConfirm(`Esto asigna TODOS los productos Z&R sin ciudad a tu ciudad (${sessionStorage.getItem('admin_ciudad') || ''}). ¿Continuar?`)) {
    return;
  }
  try {
    const api = window.CATALOGO_API_URL;
    const params = new URLSearchParams({ action: 'asignarCiudadMasivaProductosZNR', token });
    if (pais) params.append('pais', pais);
    if (ciudad) params.append('ciudad', ciudad);
    const res = await apiFetch(api, params, true).then(r => r.json());
    if (!res.ok) throw new Error(res.error || 'Error del servidor');
    askAlert(`Listo: ${res.actualizados} productos Z&R actualizados.`);
  } catch (e) {
    askAlert('Error: ' + e.message);
  }
}
window.asignarCiudadMasivaZNRBtn = asignarCiudadMasivaZNRBtn;

// ── Plan Plus retroactivo para admins/moderadores ya existentes (creados
// antes de que existiera este perk) ─────────────────────────────────────
async function sincronizarPlanPlusAdminsBtn() {
  if (!await askConfirm('Esto revisa TODOS los admins/moderadores activos y le genera una contraseña NUEVA a cada uno, sincronizada con su cuenta de vendedor. Las contraseñas anteriores dejan de funcionar. ¿Continuar?')) return;
  const token = getAdminToken();
  try {
    const api = window.VENDEDORES_API_URL;
    const res = await fetch(api, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'sincronizarPlanPlusAdminsExistentes', token }),
    }).then(r => r.json());
    if (!res.ok) throw new Error(res.error || 'Error del servidor');
    askAlert(`Listo — ${res.total} cuentas revisadas (${res.sinDatos} sin teléfono):\n\n${(res.resultados || []).join('\n')}`);
  } catch (e) {
    askAlert('Error: ' + (e.message || ''));
  }
}
window.sincronizarPlanPlusAdminsBtn = sincronizarPlanPlusAdminsBtn;

// ── Vendedores sin ciudad (migración de cuentas viejas) ─────────────────────
// ── Salud del catálogo (Z&R): prendas activas y combinaciones que faltan para armar outfits ──
async function openCatalogoSaludModal() {
  document.getElementById('modal-catalogo-salud')?.remove();
  const token = getAdminToken();
  const rol = sessionStorage.getItem('admin_rol') || 'master';
  const modal = document.createElement('div');
  modal.id = 'modal-catalogo-salud';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:99999;display:flex;align-items:flex-end;justify-content:center;';
  modal.innerHTML = `<div style="background:var(--modal-bg);border-radius:20px 20px 0 0;width:100%;max-width:560px;max-height:88vh;overflow-y:auto;padding:0 0 32px;color:var(--modal-text);">
    <div style="position:sticky;top:0;background:var(--modal-bg);padding:18px 20px 14px;border-bottom:1px solid var(--modal-border);display:flex;align-items:center;justify-content:space-between;gap:10px;z-index:2;">
      <h2 style="margin:0;font-size:1rem;font-weight:800;">${Icon('stats')} Salud del catálogo</h2>
      <button id="btn-close-cat-salud" style="background:none;border:none;font-size:22px;cursor:pointer;color:var(--modal-muted);">×</button>
    </div>
    <div id="cat-salud-body" style="padding:18px 20px;">Cargando…</div>
  </div>`;
  document.body.appendChild(modal);
  document.getElementById('btn-close-cat-salud').onclick = () => modal.remove();
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  const bodyEl = document.getElementById('cat-salud-body');
  const GEN = { hombre: 'Hombre', mujer: 'Mujer', unisex: 'Unisex' }, SEC = { torso: 'Torso', piernas: 'Piernas', pies: 'Pies', accesorios: 'Accesorios' };
  const pintar = async () => {
    try {
      if (!token) throw new Error('Sin sesión de admin');
      const res = await apiFetch(window.CATALOGO_API_URL, { action: 'obtenerAlertaCatalogo', token }).then(r => r.json());
      if (!res.ok) throw new Error(res.error || 'Error del servidor');
      const alertas = res.alertas || [];
      bodyEl.innerHTML = (alertas.length ? alertas.map(a => `
        <div style="border:1px solid var(--modal-border);border-radius:14px;padding:14px;margin-bottom:12px;">
          <div style="font-weight:800;margin-bottom:4px;">${escapeHtml(a.ciudad)}</div>
          <div style="font-size:.85rem;color:${a.total < a.minimoTotal ? '#ef4444' : 'var(--modal-soft)'};margin-bottom:8px;">Prendas activas (con stock): <b>${a.total}</b> de ${a.minimoTotal} recomendadas</div>
          ${(a.faltantes || []).map(f => `<div style="font-size:.8rem;display:flex;justify-content:space-between;padding:5px 0;border-top:1px solid var(--modal-border);"><span>${GEN[f.genero] || f.genero} · ${SEC[f.seccion] || f.seccion}${f.estilo !== '-' ? ' · ' + (f.estilo === 'formal' ? 'Formal' : 'Casual') : ''}</span><span style="color:var(--modal-soft);">tienes ${f.tiene}, mínimo ${f.minimo}</span></div>`).join('')}
          <div style="font-size:.7rem;color:var(--modal-muted);margin-top:8px;">Actualizado: ${a.generadoEn ? new Date(a.generadoEn).toLocaleString('es-MX') : '—'}</div>
        </div>`).join('') : '<p style="text-align:center;color:var(--modal-soft);padding:20px 0;">Todo en orden: el catálogo tiene prendas suficientes para armar outfits.</p>')
        + (rol === 'master' ? '<button id="btn-cat-salud-run" class="primary-button full-width" style="margin-top:6px;">Actualizar ahora</button>' : '<p style="font-size:.72rem;color:var(--modal-muted);text-align:center;">Se recalcula cada 24 horas.</p>');
      document.getElementById('btn-cat-salud-run')?.addEventListener('click', async (ev) => {
        ev.target.disabled = true; ev.target.textContent = 'Actualizando…';
        try {
          const r = await apiFetch(window.CATALOGO_API_URL, { action: 'ejecutarMantenimientoCatalogo', token }, true).then(x => x.json());
          if (!r.ok) throw new Error(r.error || 'Error del servidor');
          window.actualizarContadoresHerramientas?.();
          pintar();
        } catch (e) { ev.target.disabled = false; ev.target.textContent = 'Actualizar ahora'; askAlert('No se pudo actualizar: ' + e.message); }
      });
    } catch (e) { bodyEl.innerHTML = '<p style="color:#ef4444;text-align:center;">Error al cargar: ' + escapeHtml(e.message) + '</p>'; }
  };
  pintar();
}

async function openVendedoresSinCiudadModal() {
  const old = document.getElementById('modal-vendedores-sin-ciudad');
  if (old) old.remove();
  const token = getAdminToken();
  const rol = sessionStorage.getItem('admin_rol') || 'master';
  const api = window.VENDEDORES_API_URL;

  const modal = document.createElement('div');
  modal.id = 'modal-vendedores-sin-ciudad';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:99999;display:flex;align-items:flex-end;justify-content:center;';
  modal.innerHTML = `<div style="background:var(--modal-bg);border-radius:20px 20px 0 0;width:100%;max-width:560px;max-height:88vh;overflow-y:auto;padding:0 0 32px;color:var(--modal-text);">
    <div style="position:sticky;top:0;background:var(--modal-bg);padding:18px 20px 14px;border-bottom:1px solid var(--modal-border);display:flex;align-items:center;justify-content:space-between;gap:10px;z-index:2;">
      <h2 style="margin:0;font-size:1rem;font-weight:800;">${Icon('community')} Vendedores sin ciudad</h2>
      <button id="btn-close-sinciudad" style="background:none;border:none;font-size:22px;cursor:pointer;color:var(--modal-muted);">×</button>
    </div>
    <div id="vsc-body" style="padding:18px 20px;">Cargando…</div>
  </div>`;
  document.body.appendChild(modal);
  document.getElementById('btn-close-sinciudad').onclick = () => modal.remove();
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });

  const bodyEl = document.getElementById('vsc-body');

  async function asignar(uid, row, paisSel, ciudadSel, btn) {
    const pais = rol === 'master' ? paisSel.value : null;
    const ciudad = rol === 'master' ? ciudadSel.value : null;
    if (rol === 'master' && (!pais || !ciudad)) return askAlert('Elige país y ciudad.');
    btn.disabled = true;
    btn.textContent = 'Asignando…';
    try {
      const params = new URLSearchParams({ action: 'asignarCiudadVendedor', token, uid });
      if (pais) params.append('pais', pais);
      if (ciudad) params.append('ciudad', ciudad);
      const res = await apiFetch(api, params, true).then(r => r.json());
      if (!res.ok) throw new Error(res.error || 'Error del servidor');
      row.remove();
    } catch (e) {
      btn.disabled = false;
      btn.textContent = 'Reintentar';
      askAlert('Error al asignar ciudad: ' + e.message);
    }
  }

  try {
    if (!token) throw new Error('Sin sesión de admin');
    const res = await apiFetch(api, { action: 'listarVendedoresSinCiudad', token }).then(r => r.json());
    if (!res.ok) throw new Error(res.error || 'Error del servidor');

    const vendors = res.vendors || [];
    const nota = rol === 'master'
      ? 'Elige país y ciudad para cada vendedor que reconozcas.'
      : `Solo puedes reclamar vendedores para tu ciudad (${sessionStorage.getItem('admin_ciudad') || ''}).`;
    bodyEl.innerHTML = `
      <p style="font-size:.78rem;color:var(--modal-soft);margin:0 0 16px;">${nota}</p>
      <div id="vsc-list">
        ${vendors.length ? vendors.map(v => `
          <div class="vsc-row" data-uid="${escapeHtml(v.uid)}" style="padding:10px 0;border-bottom:1px solid rgba(127,127,127,.22);">
            <div style="font-size:.85rem;color:var(--modal-text);font-weight:600;">${escapeHtml(v.nombre)} · ${escapeHtml(v.telefono)}</div>
            <div style="font-size:.72rem;color:var(--modal-muted);margin:2px 0 8px;">${escapeHtml(v.puntoEntrega) || 'Sin punto de entrega registrado'}</div>
            <div style="display:flex;gap:8px;align-items:center;">
              ${rol === 'master' ? `<select class="vsc-pais" style="flex:1;padding:6px;border-radius:8px;"></select>
              <select class="vsc-ciudad" style="flex:1;padding:6px;border-radius:8px;"></select>` : ''}
              <button class="vsc-asignar-btn" style="padding:7px 14px;border:none;border-radius:20px;background:#2563eb;color:#fff;font-size:.75rem;font-weight:700;cursor:pointer;white-space:nowrap;">Asignar</button>
            </div>
          </div>`).join('') : '<p style="color:var(--modal-soft);text-align:center;padding:20px 0;">No hay vendedores pendientes de asignar.</p>'}
      </div>`;

    bodyEl.querySelectorAll('.vsc-row').forEach(row => {
      if (rol === 'master') enlazarPaisCiudad(row.querySelector('.vsc-pais'), row.querySelector('.vsc-ciudad'));
      const btn = row.querySelector('.vsc-asignar-btn');
      btn.addEventListener('click', () => asignar(row.dataset.uid, row, row.querySelector('.vsc-pais'), row.querySelector('.vsc-ciudad'), btn));
    });
  } catch (e) {
    bodyEl.innerHTML = '<p style="color:#ef4444;text-align:center;">Error al cargar: ' + (e.message || '') + '</p>';
  }
}


// Colapsados: tarjeta compacta (igual a las mini-cards de Notificaciones).
// Al tocarlas se abren a pantalla completa; solo el botón ✕ las cierra.
function openGridTile(tileId, bodyId) {
  const tile = document.getElementById(tileId);
  const body = document.getElementById(bodyId);
  if (!tile || !body) return;
  tile.classList.add('expanded');
  body.style.display = '';
  document.body.style.overflow = 'hidden';
  try { localStorage.setItem('admin_section_' + bodyId, 'open'); } catch(_) {}
}
function closeGridTile(tileId, bodyId) {
  const tile = document.getElementById(tileId);
  const body = document.getElementById(bodyId);
  if (!tile || !body) return;
  tile.classList.remove('expanded');
  body.style.display = 'none';
  document.body.style.overflow = '';
  try { localStorage.setItem('admin_section_' + bodyId, 'closed'); } catch(_) {}
}
window.openGridTile = openGridTile;
window.closeGridTile = closeGridTile;
window.expandGridTile = openGridTile; // alias por compatibilidad
(function restoreAdminSectionsState() {
  [['admin-create-section','create-product-body'], ['admin-list-section','list-products-body']].forEach(([tileId, bodyId]) => {
    try {
      if (localStorage.getItem('admin_section_' + bodyId) === 'open') {
        openGridTile(tileId, bodyId);
      }
    } catch(_) {}
  });
})();

function setBadge(id, count) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = count;
  el.classList.toggle('zero', count === 0);
}

function openInspectorMode() {
  const token = getAdminToken();
  if (!token) { if (window.showTemporaryMessage) window.showTemporaryMessage('Sin sesión de admin', 'error'); return; }
  // Token en el fragmento (#), no en el query: no llega a logs del servidor ni al Referer.
  window.open('https://znrcommunity.com/comunidad.html?inspector=1#token=' + encodeURIComponent(token), '_blank', 'noopener');
}

window.openVendorStatsGlobal = async function() {
  const token = getAdminToken();
  const vendedoresApi = window.VENDEDORES_API_URL;
  const catalogoApi = window.CATALOGO_API_URL;
  let modal = document.getElementById('global-vendor-stats-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'global-vendor-stats-modal';
    modal.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,.6);backdrop-filter:blur(5px);z-index:19999;align-items:center;justify-content:center;';
    modal.innerHTML = `
      <div style="background:var(--modal-bg);color:var(--modal-text);border-radius:22px;padding:28px;max-width:500px;width:93%;max-height:85vh;overflow-y:auto;position:relative;box-shadow:0 24px 64px rgba(0,0,0,.3);">
        <button data-hide="global-vendor-stats-modal,gvs-action-menu" style="position:absolute;top:14px;right:14px;background:var(--modal-chip-bg);border:none;width:36px;height:36px;border-radius:50%;font-size:17px;cursor:pointer;color:var(--modal-muted);">${Icon('x')}</button>
        <h3 style="margin:0 0 18px;font-size:19px;">${Icon('stats')} Estadísticas de Vendedores</h3>
        <div id="gvs-summary" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:16px;"></div>
        <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px;">
          <input id="gvs-search" type="text" placeholder="Buscar por nombre o teléfono..." style="width:100%;padding:10px 12px;border-radius:10px;border:1px solid #ddd;font-size:13px;box-sizing:border-box;">
          <div style="display:flex;gap:8px;">
            <select id="gvs-filter-estado" style="flex:1;min-width:0;padding:10px 8px;border-radius:10px;border:1px solid #ddd;font-size:13px;">
              <option value="">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="pendiente">Pendientes</option>
              <option value="suspendido">Suspendidos/Rechazados</option>
            </select>
            <select id="gvs-filter-plan" style="flex:1;min-width:0;padding:10px 8px;border-radius:10px;border:1px solid #ddd;font-size:13px;">
              <option value="">Free y Plus</option>
              <option value="plus">Solo Plus</option>
              <option value="free">Solo Free</option>
            </select>
          </div>
        </div>
        <div id="gvs-list"></div>
      </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target===modal) { modal.style.display='none'; const m=document.getElementById('gvs-action-menu'); if(m) m.style.display='none'; } });
  }
  modal.style.display = 'flex';
  document.getElementById('gvs-summary').innerHTML = '<p style="color:var(--modal-soft);grid-column:span 3;text-align:center;">Cargando...</p>';
  document.getElementById('gvs-list').innerHTML = '';
  try {
    const [vRes, pRes] = await Promise.all([
      apiFetch(vendedoresApi, { action: "vendedoresAdmin", token: token }).then(r=>r.json()).catch(()=>({})),
      apiFetch(catalogoApi, { action: "listarTodoComunidad", token: token, resumen: "vendedores" }).then(r=>r.json()).catch(()=>({}))
    ]);
    const vendors  = vRes.vendors  || [];
    const resumen = pRes.resumen || {};
    const activos  = vendors.filter(v=>v.estado==='activo').length;
    const pendientes = vendors.filter(v=>v.estado==='pendiente').length;
    const suspendidos= vendors.filter(v=>v.estado==='suspendido'||v.estado==='rechazado').length;
    document.getElementById('gvs-summary').innerHTML = `
      <div style="background:#f0fff4;border-radius:14px;padding:14px;text-align:center;">
        <div style="font-size:24px;font-weight:800;color:#2e7d32;">${activos}</div>
        <div style="font-size:11px;color:var(--modal-muted);text-transform:uppercase;">Activos</div>
      </div>
      <div style="background:#fff8e1;border-radius:14px;padding:14px;text-align:center;">
        <div style="font-size:24px;font-weight:800;color:#f57f17;">${pendientes}</div>
        <div style="font-size:11px;color:var(--modal-muted);text-transform:uppercase;">Pendientes</div>
      </div>
      <div style="background:#ffebee;border-radius:14px;padding:14px;text-align:center;">
        <div style="font-size:24px;font-weight:800;color:#c62828;">${suspendidos}</div>
        <div style="font-size:11px;color:var(--modal-muted);text-transform:uppercase;">Suspendidos</div>
      </div>`;

    // Guardamos los datos crudos para poder re-filtrar sin volver a pedirlos.
    window._gvsData = { vendors, resumen };

    const searchEl = document.getElementById('gvs-search');
    const estadoEl = document.getElementById('gvs-filter-estado');
    const planEl   = document.getElementById('gvs-filter-plan');
    searchEl.oninput = () => window._renderVendorStatsList();
    estadoEl.onchange = () => window._renderVendorStatsList();
    planEl.onchange   = () => window._renderVendorStatsList();

    window._renderVendorStatsList();
  } catch(e) {
    document.getElementById('gvs-summary').innerHTML = `<p style="color:#ef4444;grid-column:span 3;">Error: ${escapeHtml(e.message)}</p>`;
  }
};

window._renderVendorStatsList = function() {
  const menuElPrev = document.getElementById('gvs-action-menu');
  if (menuElPrev) menuElPrev.style.display = 'none';
  const { vendors, resumen } = window._gvsData || { vendors: [], resumen: {} };
  const listEl = document.getElementById('gvs-list');
  if (!listEl) return;
  if (!vendors.length) { listEl.innerHTML = '<p style="color:var(--modal-soft);text-align:center;">Sin vendedores</p>'; return; }

  const q = (document.getElementById('gvs-search')?.value || '').trim().toLowerCase();
  const filtroEstado = document.getElementById('gvs-filter-estado')?.value || '';
  const filtroPlan   = document.getElementById('gvs-filter-plan')?.value || '';

  const filtrados = vendors.filter(v => {
    if (q) {
      const nombre = String(v.nombre||'').toLowerCase();
      const tel    = String(v.telefono||'').toLowerCase();
      if (!nombre.includes(q) && !tel.includes(q)) return false;
    }
    if (filtroEstado) {
      if (filtroEstado === 'suspendido') {
        if (v.estado !== 'suspendido' && v.estado !== 'rechazado') return false;
      } else if (v.estado !== filtroEstado) return false;
    }
    if (filtroPlan) {
      const esPlus = v.plan === 'plus';
      if (filtroPlan === 'plus' && !esPlus) return false;
      if (filtroPlan === 'free' && esPlus) return false;
    }
    return true;
  });

  if (!filtrados.length) { listEl.innerHTML = '<p style="color:var(--modal-soft);text-align:center;padding:16px 0;">Ningún vendedor coincide con el filtro.</p>'; return; }

  listEl.innerHTML = filtrados.map(v => {
      const { aprobados = 0, pendientes: pendProd = 0, stock = 0, total = 0 } = resumen[v.uid] || {};
      const esPlus    = v.plan === 'plus';
      const limite    = v.limite != null ? v.limite : (esPlus ? (v.planNivel === 'pro' ? 1000 : 400) : 20);
      const actuales  = v.productosActuales != null ? v.productosActuales : total;
      const diasRestantes = v.planVence ? Math.ceil((new Date(v.planVence) - new Date()) / 86400000) : null;
      const puedeSuspender = v.estado==='activo' && typeof AdminComunidad!=='undefined';
      const planBadge = esPlus
        ? `<span style="background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:999px;">${v.planNivel === 'pro' ? 'PRO' : 'PLUS'}</span>`
        : `<span style="background:#eee;color:#999;font-size:10px;font-weight:700;padding:2px 8px;border-radius:999px;">FREE</span>`;
      const venceTxt = (esPlus && diasRestantes != null)
        ? `<div style="font-size:11px;color:${diasRestantes<=7?'#c62828':'#888'};margin-top:2px;">vence en ${diasRestantes}d</div>`
        : '';
      return `<div class="gvs-row" style="padding:14px 0;border-bottom:1px solid #f0f0f5;" data-uid="${escapeAttr(v.uid)}">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;">
          <div style="min-width:0;flex:1;">
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
              <span style="font-weight:700;font-size:14px;">${escapeHtml(v.nombre||'—')}</span>
              ${planBadge}
            </div>
            <div style="font-size:12px;color:var(--modal-muted);margin-top:2px;">${escapeHtml(v.telefono||'—')} · <span style="color:${v.estado==='activo'?'#2e7d32':'#f57f17'}">${escapeHtml(v.estado)}</span></div>
            ${venceTxt}
          </div>
          <button class="btn-row-menu" data-uid="${escapeAttr(v.uid)}" data-plan="${escapeAttr(v.plan||'free')}" data-nombre="${escapeHtml(v.nombre||'')}" data-dias="${diasRestantes != null ? diasRestantes : 0}" data-suspendible="${puedeSuspender ? '1':'0'}" style="flex-shrink:0;width:32px;height:32px;border-radius:50%;border:1px solid #eee;background:#fafafa;color:#555;font-size:16px;font-weight:700;line-height:1;cursor:pointer;">⋮</button>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:10px;font-size:11.5px;color:var(--modal-muted);flex-wrap:wrap;">
          <span style="font-weight:700;color:var(--modal-text);">${actuales}/${limite} productos</span>
          <span>${aprobados} aprobados · ${Icon('clock',{size:12})} ${pendProd} pend. · Stock: ${stock}</span>
        </div>
      </div>`;
    }).join('');

  let menuEl = document.getElementById('gvs-action-menu');
  if (!menuEl) {
    menuEl = document.createElement('div');
    menuEl.id = 'gvs-action-menu';
    menuEl.style.cssText = 'display:none;position:fixed;z-index:100001;background:#fff;border-radius:12px;box-shadow:0 12px 32px rgba(0,0,0,.22);border:1px solid #eee;min-width:170px;overflow:hidden;padding:4px;';
    document.body.appendChild(menuEl);
    document.addEventListener('click', () => { menuEl.style.display = 'none'; });
  }

  function itemHtml(label, color, extra) {
    return `<button class="gvs-menu-item" ${extra||''} style="display:flex;width:100%;align-items:center;gap:8px;padding:9px 12px;border:none;background:none;color:${color||'#333'};font-size:13px;font-weight:600;text-align:left;cursor:pointer;border-radius:8px;">${label}</button>`;
  }

  listEl.querySelectorAll('.btn-row-menu').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const yaAbierto = menuEl.style.display === 'block' && menuEl.dataset.forUid === this.dataset.uid;
      menuEl.style.display = 'none';
      if (yaAbierto) return; // clic de nuevo en el mismo botón: solo cerrar

      const uid = this.dataset.uid;
      const nombre = this.dataset.nombre;
      const plan = this.dataset.plan;
      const dias = Number(this.dataset.dias) || 0;
      const esPlus = plan === 'plus';
      const puedeSuspender = this.dataset.suspendible === '1';

      menuEl.dataset.forUid = uid;
      menuEl.innerHTML = [
        itemHtml(esPlus ? 'Quitar Plus' : 'Activar Plus', '#7c3aed', 'data-act="toggle-plan"'),
        esPlus ? itemHtml('Ajustar días', '#7c3aed', 'data-act="adjust-days"') : '',
        puedeSuspender ? itemHtml('Suspender', '#555', 'data-act="suspend"') : '',
        itemHtml('Eliminar cuenta', '#dc2626', 'data-act="delete"'),
      ].join('');

      menuEl.querySelectorAll('.gvs-menu-item').forEach(mi => {
        mi.addEventListener('click', function(ev) {
          ev.stopPropagation();
          menuEl.style.display = 'none';
          const act = this.dataset.act;
          if (act === 'toggle-plan') window.togglePlanVendedor(uid, nombre, plan);
          else if (act === 'adjust-days') window.ajustarDiasPlus(uid, nombre, dias);
          else if (act === 'suspend') AdminComunidad.suspenderVendedor(uid, nombre);
          else if (act === 'delete') window.eliminarCuentaVendedorAdmin(uid, nombre);
        });
      });

      const rect = this.getBoundingClientRect();
      menuEl.style.display = 'block';
      const menuWidth = menuEl.offsetWidth || 170;
      let left = rect.right - menuWidth;
      if (left < 8) left = 8;
      let top = rect.bottom + 4;
      const menuHeight = menuEl.offsetHeight || 150;
      if (top + menuHeight > window.innerHeight - 8) top = rect.top - menuHeight - 4;
      menuEl.style.left = left + 'px';
      menuEl.style.top = top + 'px';
    });
  });
};

// Acciones de plan desde Estadísticas de vendedor: el motivo es obligatorio para que quede en audit.html.
// Resuelve { razon, dias } o null si se cancela.
const pedirMotivo = (title, message, confirmText, numberLabel = '', numberValue = '') => new Promise((resolve) => showCustomConfirm({
  title, message, confirmText, numberLabel, numberValue, requireReason: true,
  onConfirm: (razon, dias) => resolve({ razon, dias }), onCancel: () => resolve(null),
}));
const _msgVend = (txt, tipo) => (window.showTemporaryMessage ? window.showTemporaryMessage(txt, tipo) : askAlert(txt));

// Manda la acción a vendedores-api y vuelve a pintar las estadísticas.
async function accionPlanVendedor(params, loader, exito) {
  try {
    window.showLoader?.(loader);
    const data = await apiFetch(window.VENDEDORES_API_URL, { ...params, token: getAdminToken() }, true).then((r) => r.json());
    if (!data.ok) throw new Error(data.error || 'Error del servidor');
    _msgVend(exito(data), 'success');
    window.openVendorStatsGlobal();
  } catch (err) { _msgVend(err.message, 'error'); } finally { window.hideLoader?.(); }
}

window.togglePlanVendedor = async function(uid, nombre, currentPlan) {
  if (!getAdminToken()) return _msgVend('Token no encontrado. Re-inicia sesión.', 'error');
  const activar = currentPlan !== 'plus';
  const r = await pedirMotivo(activar ? 'Activar Plan Plus' : 'Quitar Plan Plus',
    activar ? `¿Activar el plan Plus para "${nombre}"?` : `¿Quitar el plan Plus a "${nombre}"? Se ocultarán productos si excede el límite.`,
    activar ? 'Activar' : 'Quitar Plus', activar ? 'Días de Plus' : '', '30');
  if (!r) return;
  const dias = activar ? parseInt(r.dias, 10) : 0;
  if (activar && !(dias > 0)) return _msgVend('Número de días inválido.', 'error');
  const nivel = activar ? await new Promise((ok) => showCustomConfirm({ title: '¿Qué plan activar?', message: 'Plus: hasta 400 artículos · Pro: hasta 1,000 artículos.',
    confirmText: 'Pro', cancelText: 'Plus', onConfirm: () => ok('pro'), onCancel: () => ok('plus') })) : '';
  accionPlanVendedor({ action: 'marcarVendedorPlan', uid, plan: activar ? 'plus' : 'free', nivel, dias, razon: r.razon }, 'Actualizando plan...',
    () => (activar ? `Plan ${nivel === 'pro' ? 'Pro' : 'Plus'} activado por ${dias} días para ${nombre}` : `Plan removido de ${nombre}`));
};

window.ajustarDiasPlus = async function(uid, nombre, diasActuales) {
  if (!getAdminToken()) return _msgVend('Token no encontrado. Re-inicia sesión.', 'error');
  const r = await pedirMotivo('Ajustar días de Plus', `"${nombre}" tiene ${diasActuales} días de Plus restantes.`, 'Ajustar', 'Días a agregar (negativo para restar, ej. -5)', '30');
  if (!r) return;
  // Normaliza guiones "tipográficos" (–, —, −) que quedan al copiar de un chat o documento.
  const delta = parseInt(String(r.dias).trim().replace(/[\u2010-\u2015\u2212]/g, '-'), 10);
  if (!Number.isFinite(delta) || delta === 0) return _msgVend(`Número de días inválido: "${r.dias}". Usa solo dígitos, con "-" al inicio para restar (ej. 30 o -5).`, 'error');
  accionPlanVendedor({ action: 'ajustarDiasPlanPlus', uid, dias: delta, razon: r.razon }, 'Ajustando días de Plus...',
    (d) => (d.plan === 'plus' ? `Plan Plus de ${nombre} ${delta > 0 ? 'extendido' : 'acortado'} (${delta > 0 ? '+' : ''}${delta} días).` : `El ajuste dejó el plan de ${nombre} vencido — volvió a Free.`));
};

window.eliminarCuentaVendedorAdmin = async function(uid, nombre) {
  const token = getAdminToken();
  const api   = window.VENDEDORES_API_URL;
  if (!token) { if (window.showTemporaryMessage) window.showTemporaryMessage('Token no encontrado. Re-inicia sesión.', 'error'); return; }

  if (!(await askConfirm(`Esto borrará TODO de "${nombre}": productos, sesiones en vivo, entregas y su cuenta. Es irreversible. ¿Continuar?`))) return;

  const razon = await new Promise((resolve) => {
    showCustomConfirm({
      title: 'Última confirmación',
      message: `Se eliminará por completo a "${nombre}" y no podrás recuperar sus datos. ¿Eliminar definitivamente?`,
      icon: '',
      confirmText: 'Sí, eliminar definitivamente',
      cancelText: 'Cancelar',
      requireReason: true,
      reasonPlaceholder: 'Motivo de la eliminación (obligatorio)',
      onConfirm: (r) => resolve(r),
      onCancel: () => resolve(null),
    });
  });
  if (razon === null) return;

  try {
    if (window.showLoader) window.showLoader('Eliminando cuenta...');
    const params = new URLSearchParams();
    params.append('action', 'eliminarCuentaVendedor');
    params.append('uid', uid);
    params.append('token', token);
    params.append('razon', razon);

    const res = await apiFetch(api, params, true);
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || 'Error del servidor');

    const mensaje = `Cuenta de "${nombre}" eliminada por completo`;
    if (window.showTemporaryMessage) window.showTemporaryMessage(mensaje, 'success');
    else askAlert(mensaje);

    window.openVendorStatsGlobal();
    if (typeof AdminComunidad !== 'undefined' && AdminComunidad.loadVendors) AdminComunidad.loadVendors();
    if (typeof window.refreshAllAdminBadges === 'function') window.refreshAllAdminBadges();

  } catch (err) {
    if (window.showTemporaryMessage) window.showTemporaryMessage(err.message, 'error');
    else askAlert('Error: ' + err.message);
  } finally {
    if (window.hideLoader) window.hideLoader();
  }
};

// Toggle de tema claro/oscuro (botón #theme-toggle en index.html, Tools.html y notificaciones.html)
document.getElementById('theme-toggle')?.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = next;
  localStorage.setItem('theme', next);
});

// ── Llamada directa a vendedores-api con el token del admin ──
const _vApi = (action, extra = {}) => fetch(window.VENDEDORES_API_URL, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action, token: getAdminToken(), ...extra }),
}).then(r => r.json()).catch(e => ({ ok: false, error: e.message }));

// Llena contacto_admin (botón de WhatsApp por ciudad) con los admins que ya existían.
async function sincronizarContactosAdminsBtn() {
  const res = await _vApi('sincronizarContactosAdmins');
  askAlert(res.ok ? `Listo — ${res.ciudades} ciudades sincronizadas` + (res.master ? '' : '\n⚠ Falta el WhatsApp del Master: define la variable MASTER_WHATSAPP en vendedores-api') : 'Error: ' + (res.error || ''));
}
window.sincronizarContactosAdminsBtn = sincronizarContactosAdminsBtn;

// Migración de una sola vez: quita los teléfonos que ya estaban publicados (productos, perfiles, fundaciones). Por tandas, hasta terminar.
async function purgarTelefonosPublicosBtn() {
  showLoader('Quitando teléfonos de los datos públicos…');
  const total = {};
  for (const coleccion of ['productos_comunidad', 'perfil_vendedor', 'beneficiarios_aprobados']) {
    let cursor = '';
    do {
      const res = await _vApi('purgarTelefonosPublicos', { coleccion, cursor });
      if (!res.ok) { hideLoader(); return askAlert(res.error || 'No se pudo completar'); }
      total[coleccion] = (total[coleccion] || 0) + res.limpiados;
      cursor = res.siguiente || '';
    } while (cursor);
  }
  hideLoader();
  askAlert(`Listo. Documentos limpiados: ${Object.entries(total).map(([k, n]) => `${k} ${n}`).join(', ')}.\n\nSiguiente paso: ejecuta "Resincronizar todo Comunidad con Algolia" para limpiar también el buscador.`);
}
window.purgarTelefonosPublicosBtn = purgarTelefonosPublicosBtn;

// Fotos huérfanas de los vendedores (carpeta vendedores_uploads/): primero simula y muestra cuántas son; borra solo si confirmas.
async function limpiarFotosVendedoresBtn() {
  const llamar = (confirmar) => fetch(window.CATALOGO_API_URL, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'limpiarImagenesHuerfanasVendedores', token: getAdminToken(), confirmar }),
  }).then(r => r.json()).catch(e => ({ ok: false, error: e.message }));
  showLoader('Buscando fotos huérfanas…');
  const sim = await llamar(false);
  hideLoader();
  if (!sim.ok) return askAlert(sim.error || 'No se pudo revisar');
  if (!sim.huerfanas) return askAlert(`No hay fotos huérfanas (revisé ${sim.totalArchivos} archivos; ${sim.enUso} en uso).`);
  showCustomConfirm({
    title: 'Borrar fotos huérfanas',
    message: `Hay ${sim.huerfanas} fotos sin usar (≈ ${sim.mb} MB, con más de 7 días) de ${sim.totalArchivos} archivos. Esto no se puede deshacer. ¿Borrarlas?`,
    confirmText: 'Sí, borrar',
    onConfirm: async () => {
      showLoader('Borrando…');
      let r, borradas = 0;
      do { r = await llamar(true); if (!r.ok) break; borradas += r.borradas; } while (r.quedan > 0);
      hideLoader();
      askAlert(r.ok ? `Listo: ${borradas} fotos borradas.` : (r.error || 'No se pudo completar'));
    },
  });
}
window.limpiarFotosVendedoresBtn = limpiarFotosVendedoresBtn;

// Migración única: ciudad "Nuevo Laredo" → "Nuevo Laredo, Tamaulipas". Primero simula y pregunta; después aplica.
async function migrarCiudadesBtn() {
  const sim = await _vApi('migrarCiudadesConEstado');
  if (!sim.ok) return askAlert('Error: ' + (sim.error || ''));
  if (!await askConfirm(`Simulación (aún no se cambió nada)\nPor colección: ${JSON.stringify(sim.actualizados)}\nSin equivalencia: ${JSON.stringify(sim.sinEquivalencia)}\n\n¿Aplicar la migración?`)) return;
  const r = await _vApi('migrarCiudadesConEstado', { aplicar: true });
  askAlert(r.ok ? 'Migración aplicada: ' + JSON.stringify(r.actualizados) : 'Error: ' + (r.error || ''));
}
window.migrarCiudadesBtn = migrarCiudadesBtn;
