// Lista única de herramientas del panel: index.html y Tools.html se generan desde aquí, así nunca se desfasan.
// [id, etiqueta, icono, permiso requerido]  (permisos en ROL_PERMISOS, common.js)
window.ZNR_TOOLS = [
  ['inspector', 'Modo Inspector (Comunidad)', 'community', 'tools'],
  ['confiable', 'Sugerencias: Vendedor confiable', 'lock', 'tools'],
  ['vendorstats', 'Estadísticas de Vendedores', 'stats', 'tools'],
  ['analytics', 'Gráficas y Estadísticas', 'stats', 'tools'],
  ['donaciones', 'Estadísticas de Donaciones', 'heart', 'tools'],
  ['planplus', 'Resumen Plan Plus (MRR)', 'star', 'tools'],
  ['errores', 'Monitor de Errores', 'error', 'tools-master'],
  ['reentrenar', 'Reentrenar modelo IA (categorías)', 'sparkles', 'tools-master'],
  ['syncvendedor', 'Sincronizar productos de vendedor', 'refresh', 'tools'],
  ['algolia', 'Resincronizar todo Comunidad con Algolia', 'refresh', 'tools'],
  ['sinciudad', 'Vendedores sin ciudad', 'community', 'tools'],
  ['backfillcomunidad', 'Asignar ciudad retroactiva (Comunidad)', 'refresh', 'tools'],
  ['backfillznr', 'Asignar ciudad retroactiva (Z&amp;R)', 'refresh', 'tools'],
  ['planplusadmins', 'Plan Plus retroactivo (admins/moderadores)', 'star', 'tools-master'],
  ['contactoadmins', 'Sincronizar WhatsApp de admins por ciudad', 'whatsapp', 'tools-master'],
  ['migrarciudades', 'Migrar ciudades a formato Ciudad, Estado', 'map-pin', 'tools-master'],
  ['pendientescarga', 'Pendientes por cargar', 'refresh', 'tools']
];
// data-tools-grid="link" (index: abre Tools.html?tool=…) o "button" (Tools.html: la abre en la misma página).
document.querySelectorAll('[data-tools-grid]').forEach((el) => {
  const link = el.dataset.toolsGrid === 'link';
  el.innerHTML = ZNR_TOOLS.map(([id, label, icon, rol]) => {
    const attrs = `class="admin-mini-card" data-tool="${id}" data-role="${rol}"${tienePermiso(rol) ? '' : ' hidden'}`;
    const inner = `<span class="amc-icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" aria-hidden="true"><use href="#ic-${icon}"/></svg></span><span class="amc-label">${label}</span>`;
    return link ? `<a ${attrs} href="Tools.html?tool=${id}">${inner}</a>` : `<button type="button" ${attrs}>${inner}</button>`;
  }).join('');
});
