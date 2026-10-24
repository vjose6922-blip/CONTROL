 function switchNotifTab(section, btn) {

 ['solicitudes','vendors','pending','reportes','reportes_live','reportes_pedidos','reportes_historias','feedback','plus','beneficiarios','pagos'].forEach(s => {
 const el = document.getElementById('section-' + s);
 if (el) el.style.display = 'none';
 });

 const target = document.getElementById('section-' + section);
 if (target) target.style.display = 'block';

 document.querySelectorAll('.notif-tab').forEach(t => t.classList.remove('active'));
 if (btn) btn.classList.add('active');

 history.replaceState(null, '', '#' + section);
 if (section === 'beneficiarios' && typeof loadBeneficiarios === 'function') loadBeneficiarios();
if (section === 'beneficiarios' && typeof loadSolicitudesBeneficiario === 'function') loadSolicitudesBeneficiario();
if (section === 'beneficiarios' && typeof loadReportesBeneficiarios === 'function') loadReportesBeneficiarios();
 if (section === 'reportes_live' && typeof loadReportesLive === 'function') loadReportesLive();
 if (section === 'reportes_pedidos' && typeof loadReportesPedidos === 'function') loadReportesPedidos();
 if (section === 'reportes_historias' && typeof loadReportesHistorias === 'function') loadReportesHistorias();
 if (section === 'feedback' && typeof loadFeedbackReportes === 'function') loadFeedbackReportes();
 if (section === 'pagos' && typeof loadPagos === 'function') loadPagos();
 }

 function updateTabBadge(section, count) {
 if (window._updateNotifTabBadge) { window._updateNotifTabBadge(section, count); return; }
 const el = document.getElementById('tab-badge-' + section);
 if (el) el.textContent = count;
 const sc = document.getElementById('sc-' + section);
 if (sc) sc.textContent = count;
 }

 window.refreshNotifPageKeepScroll = function() {
 const scrollY = window.scrollY || document.documentElement.scrollTop;
 if (window.AdminComunidad) {
 AdminComunidad.loadVendors();
 AdminComunidad.loadPendingProducts();
 AdminComunidad.loadReportes();
 }
 if (typeof loadReportesLive === 'function') loadReportesLive();
 if (window.NotifManager && typeof window.NotifManager.reload === 'function') {
 window.NotifManager.reload();
 } else if (typeof checkNotifications === 'function') {
 checkNotifications();
 }

 requestAnimationFrame(() => {
 setTimeout(() => { window.scrollTo({ top: scrollY, behavior: 'instant' }); }, 50);
 });
 };

 document.getElementById('main-refresh-btn')?.addEventListener('click', () => {
 window.refreshNotifPageKeepScroll();
 });

 document.getElementById('refresh-reportes-live-btn')?.addEventListener('click', () => {
 if (typeof loadReportesLive === 'function') loadReportesLive();
 });

 document.getElementById('refresh-reportes-pedidos-btn')?.addEventListener('click', () => {
 if (typeof loadReportesPedidos === 'function') loadReportesPedidos();
 });

 document.getElementById('refresh-reportes-historias-btn')?.addEventListener('click', () => {
 if (typeof loadReportesHistorias === 'function') loadReportesHistorias();
 });

 document.getElementById('refresh-feedback-btn')?.addEventListener('click', () => {
 if (typeof loadFeedbackReportes === 'function') loadFeedbackReportes();
 });

 window.addEventListener('DOMContentLoaded', () => {
 const hash = window.location.hash.replace('#','');
 if (['solicitudes','vendors','pending','reportes','reportes_live','reportes_pedidos','reportes_historias','feedback','plus','beneficiarios','pagos'].includes(hash)) {
 const btn = document.querySelector(`.notif-tab[data-section="${hash}"]`);
 if (btn) switchNotifTab(hash, btn);
 }

 setTimeout(() => {
 if (typeof checkNotifications === 'function') checkNotifications();
 }, 600);

 loadSolicitudesPlus();
 // Pagos es solo del Master: para los demás la pestaña ni aparece. Se carga al inicio para el contador de alertas.
 if ((sessionStorage.getItem('admin_rol') || 'master') === 'master') {
 const tabPagos = document.querySelector('.notif-tab[data-section="pagos"]');
 if (tabPagos) tabPagos.hidden = false;
 if (typeof loadPagos === 'function') loadPagos();
 }
 if (typeof loadReportesLive === 'function') loadReportesLive();
 if (typeof loadBeneficiarios === 'function') loadBeneficiarios();
 if (typeof loadSolicitudesBeneficiario === 'function') loadSolicitudesBeneficiario();
 if (typeof loadReportesBeneficiarios === 'function') loadReportesBeneficiarios();

 window.refreshAllAdminBadges = function() {
 window.refreshNotifPageKeepScroll && window.refreshNotifPageKeepScroll();
 loadSolicitudesPlus();
 };

 const hbEl = document.getElementById('notif-badge-header');
 if (hbEl && window.MutationObserver) {
 let _guardActive = false;
 new MutationObserver(() => {
 if (_guardActive) return;
 const total = Object.values(window._notifSectionCounts || {}).reduce((a,b)=>a+b,0);
 const current = parseInt(hbEl.textContent) || 0;
 if (current !== total) {
 _guardActive = true;
 hbEl.textContent = total;
 hbEl.style.display = total > 0 ? 'inline' : 'none';
 _guardActive = false;
 }
 }).observe(hbEl, { childList: true, characterData: true, subtree: true });
 }
 });

 window._notifSectionCounts = { solicitudes: 0, vendors: 0, pending: 0, reportes: 0, reportes_live: 0, reportes_pedidos: 0, reportes_historias: 0, feedback: 0, plus: 0, beneficiarios: 0, pagos: 0 };

 function _rebuildHeaderBadge() {
 const total = Object.values(window._notifSectionCounts).reduce((a, b) => a + b, 0);
 const hb = document.getElementById('notif-badge-header');
 if (hb) { hb.textContent = total; hb.style.display = total > 0 ? 'inline' : 'none'; }
 }

 window._updateNotifTabBadge = function(section, count) {
 const tabBadge = document.getElementById('tab-badge-' + section);
 if (tabBadge) {
 tabBadge.textContent = count;
 tabBadge.style.display = count > 0 ? 'inline-flex' : 'none';
 }
 const sc = document.getElementById('sc-' + section);
 if (sc) sc.textContent = count;

 if (window._notifSectionCounts.hasOwnProperty(section)) {
 window._notifSectionCounts[section] = count;
 }
 _rebuildHeaderBadge();

 setTimeout(_rebuildHeaderBadge, 50);
 };

 document.addEventListener('DOMContentLoaded', () => {
 ['solicitudes','vendors','pending','reportes','reportes_live','reportes_pedidos','reportes_historias','feedback'].forEach(s => {
 const tb = document.getElementById('tab-badge-' + s);
 if (tb && (tb.textContent === '0' || tb.textContent === '')) tb.style.display = 'none';
 });
 });

window.recargarBeneficiarios = () => { loadBeneficiarios(true); loadSolicitudesBeneficiario(true); loadReportesBeneficiarios(true); };
