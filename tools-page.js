// Guard: sin token de admin, de vuelta al login.
if (!sessionStorage.getItem('admin_token')) location.href = 'index.html';

// Modales que las funciones de admin-tools.js crean; los "desmontamos" para que
// vivan como contenido de la página en vez de overlay flotante.
const EMBED_TOOLS = {
  confiable: ['modal-sugerencias-confiable', () => window.openSugerenciasConfiableModal()],
  vendorstats: ['global-vendor-stats-modal', () => window.openVendorStatsGlobal()],
  analytics: ['modal-analytics', () => window.openAnalyticsModal()],
  donaciones: ['modal-donaciones-stats', () => window.openDonacionesStatsModal()],
  planplus: ['modal-plan-plus-resumen', () => window.openPlanPlusResumenModal()],
  errores: ['modal-error-monitor', () => window.openErrorMonitorModal()],
  syncvendedor: ['sync-vendedor-modal', () => window.openSyncVendedorModal()],
  sinciudad: ['modal-vendedores-sin-ciudad', () => window.openVendedoresSinCiudadModal()]
};
// Acciones que no dejan contenido embebido (pestaña nueva o confirm/alert flotante).
const ACTION_TOOLS = {
  inspector: () => window.openInspectorMode(),
  reentrenar: () => window.reentrenarModeloIA(),
  algolia: () => window.resincronizarComunidadAlgoliaBtn(),
  backfillcomunidad: () => window.backfillCiudadComunidadBtn(),
  backfillznr: () => window.asignarCiudadMasivaZNRBtn(),
  planplusadmins: () => window.sincronizarPlanPlusAdminsBtn(),
  contactoadmins: () => window.sincronizarContactosAdminsBtn(),
  migrarciudades: () => window.migrarCiudadesBtn(),
  pendientescarga: () => window.pendientesPorCargarBtn()
};

function closeAllTools() {
  toolObserver?.disconnect();
  toolObserver = null;
  Object.values(EMBED_TOOLS).forEach(([id]) => document.getElementById(id)?.remove());
  document.getElementById('tools-content').innerHTML = '';
}

// Saca el "modal" del body, le quita el overlay/backdrop y su botón de cerrar,
// y lo mete dentro del contenedor de la página.
let toolObserver = null;

function stripModal(el) {
  el.style.cssText = 'position:static;display:block;';
  const card = el.firstElementChild;
  if (card) Object.assign(card.style, {
    maxWidth: 'none', width: '100%', boxShadow: 'none', margin: '0',
    maxHeight: 'none', overflowY: 'visible', borderRadius: '16px'
  });
  el.querySelectorAll('button').forEach(b => {
    if ((b.id || '').startsWith('btn-close') || b.hasAttribute('data-hide')) {
      b.removeAttribute('data-hide');
      b.onclick = () => runTool('');
      b.title = 'Volver a herramientas';
    }
  });
  document.body.style.overflow = '';
  const content = document.getElementById('tools-content');
  if (el.parentElement !== content) content.appendChild(el);
}

// Además de "aplanar" el modal al abrirlo, deja un observador: si la propia
// herramienta lo destruye y recrea (ej. al cambiar un filtro), se vuelve a aplanar sola.
function claimModal(id, tries = 90) {
  const existing = document.getElementById(id);
  if (existing) {
    stripModal(existing);
  } else if (tries > 0) {
    return void requestAnimationFrame(() => claimModal(id, tries - 1));
  } else {
    document.getElementById('tools-content').innerHTML =
      '<p style="opacity:.7">No se pudo cargar esta herramienta. Revisa que tengas conexión/API activa e inténtalo de nuevo.</p>';
    return;
  }
  toolObserver?.disconnect();
  toolObserver = new MutationObserver(muts => {
    for (const m of muts) for (const n of m.addedNodes) {
      if (n.nodeType === 1 && n.id === id) stripModal(n);
    }
  });
  toolObserver.observe(document.body, { childList: true });
}

function runTool(name, push = true) {
  const t = window.ZNR_TOOLS.find((x) => x[0] === name);
  if (t && !tienePermiso(t[3])) name = '';
  closeAllTools();
  if (push) history.pushState({ tool: name }, '', name ? `Tools.html?tool=${name}` : 'Tools.html');
  document.getElementById('tools-menu').hidden = !!EMBED_TOOLS[name];
  document.getElementById('tools-back').hidden = !EMBED_TOOLS[name];

  try {
    if (EMBED_TOOLS[name]) {
      const [modalId, fn] = EMBED_TOOLS[name];
      fn();
      claimModal(modalId);
    } else if (ACTION_TOOLS[name]) {
      ACTION_TOOLS[name]();
    }
  } catch (err) {
    document.getElementById('tools-content').innerHTML =
      '<p style="color:#e66">Error al abrir la herramienta: ' + (err?.message || err) + '</p>';
  }
}

document.getElementById('tools-menu').addEventListener('click', e => {
  const name = e.target.closest('[data-tool]')?.dataset.tool;
  if (name) runTool(name);
});
document.getElementById('tools-back').addEventListener('click', () => runTool(''));

window.addEventListener('popstate', e => runTool(e.state?.tool || new URLSearchParams(location.search).get('tool') || '', false));

document.addEventListener('DOMContentLoaded', () => {
  if (!tienePermiso('tools-lite')) return void (location.href = 'index.html');
  const initial = new URLSearchParams(location.search).get('tool');
  if (initial) runTool(initial, false);
});
