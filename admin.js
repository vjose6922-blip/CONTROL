(function () {
'use strict';
// ── Servicios de Cloud Run por acción ───────────────────────────────
const VENDEDORES_API_URL_ADMIN =
  window.VENDEDORES_API_URL;
const AUTH_API_URL_ADMIN =
  window.AUTH_API_URL; // TODO: confirmá y pegá la URL real de auth-api
const CATALOGO_API_URL_ADMIN =
  window.CATALOGO_API_URL;
const ADMIN_API_URL_ADMIN =
  window.ADMIN_API_URL;
const MAPA_ACCIONES_MIGRADAS_ADMIN = {
  aprobarVendedor: VENDEDORES_API_URL_ADMIN,
  rechazarVendedor: VENDEDORES_API_URL_ADMIN,
  vendedoresAdmin: VENDEDORES_API_URL_ADMIN,
  loginAdmin: VENDEDORES_API_URL_ADMIN,
  verificarSesionAdmin: VENDEDORES_API_URL_ADMIN,
  crearAdmin: VENDEDORES_API_URL_ADMIN,
  listarAdmins: VENDEDORES_API_URL_ADMIN,
  desactivarAdmin: VENDEDORES_API_URL_ADMIN,
  reactivarAdmin: VENDEDORES_API_URL_ADMIN,
  cambiarPasswordAdmin: VENDEDORES_API_URL_ADMIN,
  iniciarTransicionAdmin: VENDEDORES_API_URL_ADMIN,
  promoverModerador: VENDEDORES_API_URL_ADMIN,
  eliminarAdmin: VENDEDORES_API_URL_ADMIN,
  resetPasswordAdmin: VENDEDORES_API_URL_ADMIN,
  guardarDatosBancariosAdmin: VENDEDORES_API_URL_ADMIN,
  obtenerDatosBancariosAdmin: VENDEDORES_API_URL_ADMIN,
  adminCobroEstado: VENDEDORES_API_URL_ADMIN,
  adminCobroConectar: VENDEDORES_API_URL_ADMIN,
  adminCobroDesconectar: VENDEDORES_API_URL_ADMIN,
  guardarPreguntaSecretaAdmin: VENDEDORES_API_URL_ADMIN,
  obtenerEstadisticasStaff: ADMIN_API_URL_ADMIN,
  tokenChatSoporte: ADMIN_API_URL_ADMIN,
  listarContactosChat: ADMIN_API_URL_ADMIN,
  crearChatSoporte: ADMIN_API_URL_ADMIN,
  agregarParticipanteChat: ADMIN_API_URL_ADMIN,
  finalizarChatSoporte: ADMIN_API_URL_ADMIN,
  login: AUTH_API_URL_ADMIN,
  verificarAdmin: AUTH_API_URL_ADMIN,
  list: CATALOGO_API_URL_ADMIN,
  create: CATALOGO_API_URL_ADMIN,
  update: CATALOGO_API_URL_ADMIN,
  delete: CATALOGO_API_URL_ADMIN,
  uploadImage: CATALOGO_API_URL_ADMIN,
};
// Si una acción no está en el mapa es un olvido: no hay servicio al que enviarla.
function resolverApiUrlAdmin(action) {
  return MAPA_ACCIONES_MIGRADAS_ADMIN[action] || null;
}
let adminSession = null;
let adminProducts = [];
let adminCurrentPage = 1;
let adminFilteredProducts = [];
let adminProductsPerPage = 10;
let lastNotifCount = 0;
let notificationInterval = null;
// ── Permisos por rol ────────────────────────────────────────────
// Fuente única de verdad para la UI. Si cambia acá, cambia en toda
// la app. El backend (catalogo-api / vendedores-api) valida lo mismo
// por su lado — esto es solo la capa de presentación.
  
async function apiRequest(method, body) {
try {
const url = resolverApiUrlAdmin((body && body.action) || "");
if (!url) throw new Error("Acción sin servicio asignado: " + ((body && body.action) || ""));
const params = Object.assign(method === "GET" ? { action: "list" } : {}, body || {});
if (!params.token && getAdminToken()) params.token = getAdminToken();
const res = await apiFetch(url, params, method === "GET" ? undefined : true);
if (!res.ok) throw new Error("HTTP " + res.status);
return await res.json();
} catch (err) {
console.error("API ERROR:", err);
throw err;
}
}
// ── Sesión persistente en este dispositivo + desbloqueo con huella ──────
// sessionStorage se borra solo al cerrar la pestaña/navegador — por eso
// la sesión se "perdía". La reflejamos también en localStorage (que sí
// sobrevive) y, al abrir la app de nuevo, la restauramos a sessionStorage
// antes de decidir qué pantalla mostrar. El resto del código (todo lo que
// lee getAdminToken(), etc.) no cambia.
//
// La huella es solo un candado LOCAL sobre esa sesión guardada — no
// reemplaza la validación real contra el servidor (verificarAdmin /
// verificarSesionAdmin), que sigue corriendo igual después. Por eso no
// hace falta backend de WebAuthn: si navigator.credentials.get() resuelve,
// el sistema operativo ya validó la huella/Face ID por su cuenta.
const LS_SESSION_KEYS = ["admin_session", "admin_token", "admin_rol", "admin_ciudad", "admin_nombre"];

function _guardarSesionEnDispositivo() {
  LS_SESSION_KEYS.forEach((k) => {
    const v = sessionStorage.getItem(k);
    if (v !== null) localStorage.setItem(k, v);
    else localStorage.removeItem(k);
  });
}

// Si el admin llegó a notificaciones.html sin sesión (p. ej. desde un push),
// esa página lo mandó a iniciar sesión aquí guardando el destino: al terminar, lo regresamos.
function _irADestinoPendiente() {
  const next = sessionStorage.getItem("admin_next");
  sessionStorage.removeItem("admin_next");
  if (/^notificaciones\.html(#[\w-]+)?$/.test(next || "")) location.replace(next);
}

function _borrarSesionDelDispositivo() {
  LS_SESSION_KEYS.forEach((k) => localStorage.removeItem(k));
  localStorage.removeItem("biometric_enabled");
  localStorage.removeItem("biometric_credential_id");
}

async function _biometricoDisponible() {
  return !!(
    window.PublicKeyCredential &&
    typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === "function" &&
    (await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable())
  );
}

function _bufferABase64(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}
function _base64ABuffer(b64) {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)).buffer;
}

async function _ofrecerActivarBiometrico(nombreCuenta) {
  if (localStorage.getItem("biometric_enabled") === "true") return;
  if (!(await _biometricoDisponible())) return;
  const quiere = await new Promise((resolve) => {
    showCustomConfirm({
      title: " Desbloqueo con huella",
      message: `¿Quieres activar el desbloqueo con huella o Face ID en este dispositivo para ${nombreCuenta || "esta cuenta"}? Así no tienes que volver a escribir tu contraseña aquí.`,
      icon: "",
      confirmText: "Sí, activar",
      cancelText: "No, gracias",
      onConfirm: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });
  if (!quiere) return;
  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const userId = crypto.getRandomValues(new Uint8Array(16));
    const credential = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: { name: "ZNR Admin" },
        user: { id: userId, name: nombreCuenta || "admin-znr", displayName: nombreCuenta || "Admin ZNR" },
        pubKeyCredParams: [{ type: "public-key", alg: -7 }, { type: "public-key", alg: -257 }],
        authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" },
        timeout: 60000,
      },
    });
    if (!credential) return;
    localStorage.setItem("biometric_credential_id", _bufferABase64(credential.rawId));
    localStorage.setItem("biometric_enabled", "true");
  } catch (err) {
    console.warn("No se pudo activar la huella:", err);
  }
}

async function _pedirDesbloqueoBiometrico() {
  const credId = localStorage.getItem("biometric_credential_id");
  if (!credId) return false;
  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge,
        allowCredentials: [{ type: "public-key", id: _base64ABuffer(credId) }],
        userVerification: "required",
        timeout: 60000,
      },
    });
    return !!assertion;
  } catch (err) {
    console.warn("Desbloqueo con huella cancelado o falló:", err);
    return false;
  }
}


async function handleAdminLogin(e) {
e.preventDefault();
const password = document.getElementById("admin-password").value;
const token = document.getElementById("admin-token").value;
showLoader("Verificando credenciales...");
try {
const data = await apiRequest("POST", { action: "login", password, token });
if (!data || !data.ok) {
await showCustomAlert({
title: " Acceso denegado",
message: "Credenciales incorrectas. Verifica tu contraseña y token.",
icon: "",
confirmText: "Intentar nuevamente"
});
return;
}
adminSession = data.session || "ok";
sessionStorage.setItem("admin_token", document.getElementById("admin-token").value);
sessionStorage.setItem("admin_session", "true");
sessionStorage.setItem("admin_rol", "master");
sessionStorage.setItem("admin_ciudad", "*");
sessionStorage.removeItem("admin_nombre");
_guardarSesionEnDispositivo();
document.getElementById("admin-login-view").hidden = true;
document.getElementById("admin-panel-view").hidden = false;
initImageUploads();
loadAdminProducts();
startNotificationMonitoring();
initAdminViewToggle();
aplicarVisibilidadPorRol();
await _ofrecerActivarBiometrico("Master");
_irADestinoPendiente();
} catch (err) {
console.error(err);
await showCustomAlert({
title: " Error",
message: "Error al iniciar sesión. Intenta nuevamente.",
icon: "",
confirmText: "Aceptar"
});
} finally {
hideLoader();
}
}

// Login individual para cuentas de admin/moderador de ciudad, creadas
// por el Master desde la sección "Administradores". Separado de
// handleAdminLogin (que sigue siendo el acceso Master con
// contraseña+token) porque valida contra una acción y colección
// distintas (loginAdmin / admins, en vez de login / auth-api).
async function handleAdminLoginCuenta(e) {
e.preventDefault();
const telefono = document.getElementById("cuenta-telefono").value;
const password = document.getElementById("cuenta-password").value;
showLoader("Verificando credenciales...");
try {
const data = await apiRequest("POST", { action: "loginAdmin", telefono, password });
if (!data || !data.ok) {
await showCustomAlert({
title: " Acceso denegado",
message: data && data.error ? data.error : "Credenciales incorrectas.",
icon: "",
confirmText: "Intentar nuevamente"
});
return;
}
adminSession = "ok";
sessionStorage.setItem("admin_token", data.token);
sessionStorage.setItem("admin_session", "true");
sessionStorage.setItem("admin_rol", data.rol || "admin");
sessionStorage.setItem("admin_ciudad", data.ciudad || "");
sessionStorage.setItem("admin_nombre", data.nombre || "");
_guardarSesionEnDispositivo();
document.getElementById("admin-login-view").hidden = true;
document.getElementById("admin-panel-view").hidden = false;
initImageUploads();
loadAdminProducts();
startNotificationMonitoring();
initAdminViewToggle();
aplicarVisibilidadPorRol();
await _ofrecerActivarBiometrico(data.nombre || "tu cuenta");
_irADestinoPendiente();
} catch (err) {
console.error(err);
await showCustomAlert({
title: " Error",
message: "Error al iniciar sesión. Intenta nuevamente.",
icon: "",
confirmText: "Aceptar"
});
} finally {
hideLoader();
}
}

// Muestra/oculta la sección "Administradores" según el rol de la
// sesión activa. Las sesiones guardadas ANTES de este cambio no
// tienen admin_rol en sessionStorage — se tratan como Master por
// compatibilidad, ya que hasta ahora solo tú usabas este panel.
function aplicarVisibilidadPorRol() {
  const rol = sessionStorage.getItem("admin_rol") || "master";

  // Refleja el rol en <body> para que el CSS también pueda reaccionar
  document.body.dataset.rol = rol;

  // 1) Secciones / tiles con data-role
  document.querySelectorAll("[data-role]").forEach((el) => {
    const requeridos = el.dataset.role.split(/\s+/);
    el.hidden = !requeridos.some(tienePermiso);
  });

  // 2) Cargar datos que dependen del rol
  if (tienePermiso("admins")) cargarListaAdmins();
  if (tienePermiso("stats")) cargarEstadisticasStaff();

  // "Nueva cuenta" / "Cuentas existentes": el Master gestiona admins y
  // moderadores de cualquier ciudad; un admin de ciudad solo da de alta y
  // ve SUS PROPIOS moderadores, siempre en su propia ciudad. El backend ya
  // impone esto (crearAdmin/listarAdmins) — aquí solo ajustamos el
  // formulario para que no ofrezca opciones que de todos modos se van a
  // ignorar o rechazar.
  const rolSelect = document.getElementById("nuevo-admin-rol");
  const paisRow = document.getElementById("nuevo-admin-pais")?.closest(".form-row");
  const ciudadRow = document.getElementById("nuevo-admin-ciudad")?.closest(".form-row");
  const seccionTitulo = document.getElementById("admin-master-section-title");
  const crearSubtitulo = document.getElementById("crear-cuenta-subtitle");
  const listaTitulo = document.getElementById("lista-cuentas-title");
  const paisSelect = document.getElementById("nuevo-admin-pais");
  const ciudadSelect = document.getElementById("nuevo-admin-ciudad");
  if (rol === "admin") {
    if (rolSelect) { rolSelect.value = "moderador"; rolSelect.disabled = true; }
    if (paisRow) paisRow.style.display = "none";
    if (ciudadRow) ciudadRow.style.display = "none";
    if (paisSelect) paisSelect.required = false;
    if (ciudadSelect) ciudadSelect.required = false;
    if (seccionTitulo) seccionTitulo.textContent = "Mis moderadores";
    if (crearSubtitulo) crearSubtitulo.textContent = "Dar de alta un moderador en tu ciudad";
    if (listaTitulo) listaTitulo.textContent = "Moderadores existentes";
  } else if (rol === "master") {
    if (rolSelect) rolSelect.disabled = false;
    if (paisRow) paisRow.style.display = "";
    if (ciudadRow) ciudadRow.style.display = "";
    if (paisSelect) paisSelect.required = true;
    if (ciudadSelect) ciudadSelect.required = true;
    if (seccionTitulo) seccionTitulo.textContent = "Administradores";
    if (crearSubtitulo) crearSubtitulo.textContent = "Dar de alta un admin o moderador de ciudad";
    if (listaTitulo) listaTitulo.textContent = "Cuentas existentes";
  }

  // "Mi cuenta": todos ven Cerrar sesión; contraseña y datos bancarios no aplican al
  // Master heredado (sin doc en `admins`, no puede usar cambiarPasswordAdmin).
  ["admin-cambiar-password-section", "admin-datos-bancarios-section", "admin-pregunta-secreta-section"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = rol === "master" ? "none" : "";
  });
  if (rol !== "master") { cargarDatosBancarios(); cargarCobroTarjeta(); }
  // Cabecera de perfil de "Mi cuenta"
  const nombre = sessionStorage.getItem("admin_nombre") || (rol === "master" ? "Master" : "Mi cuenta");
  const ciudad = sessionStorage.getItem("admin_ciudad");
  document.getElementById("mi-perfil-av").textContent = nombre.trim().charAt(0).toUpperCase();
  document.getElementById("mi-perfil-nombre").textContent = nombre;
  document.getElementById("mi-perfil-meta").textContent = `${rol[0].toUpperCase() + rol.slice(1)} · ${!ciudad || ciudad === "*" ? "Todas las ciudades" : ciudad}`;

  // 3) Ciudad de publicación en el form de producto Z&R: solo el Master
  // la elige (admin/moderador de ciudad la tienen fija en el backend).
  const filaCiudad = document.getElementById("product-ciudad-row");
  if (filaCiudad) {
    filaCiudad.style.display = rol === "master" ? "" : "none";
    if (rol === "master" && window.ZNR_CIUDADES) {
      enlazarPaisCiudad(document.getElementById("product-pais"), document.getElementById("product-ciudad"));
    }
  }
}


// Estadísticas de desempeño de admins/moderadores para el Master: lee
// obtenerEstadisticasStaff (admin-api), que a su vez agrega la colección
// staff_actividad que van llenando las demás APIs cada vez que alguien
// resuelve algo en Notificaciones o en una herramienta. `dias` es la
// ventana de tiempo que se está mirando (30 por defecto).
let _statsChart = null;
let _statsData = [];
let _statsRolFiltro = "todos";
let _statsCiudadFiltro = "todas";
let _statsMetrica = "volumen";

async function cargarEstadisticasStaff(dias) {
  const cont = document.getElementById("stats-staff-list");
  if (cont) cont.innerHTML = '<p class="empty-state">Cargando...</p>';
  try {
    const diasSel = dias || document.getElementById("stats-dias-select")?.value || 30;
    const data = await apiRequest("GET", { action: "obtenerEstadisticasStaff", dias: diasSel });
    if (!data || !data.ok) {
      if (cont) cont.innerHTML = '<p class="empty-state">No se pudieron cargar las estadísticas.</p>';
      return;
    }
    _statsData = data.staff || [];
    poblarStatsCiudades();
    renderEstadisticasStaff();
  } catch (err) {
    console.error(err);
    if (cont) cont.innerHTML = '<p class="empty-state">No se pudieron cargar las estadísticas.</p>';
  }
}

// Rearma el <select> de ciudades con las que de verdad aparecen en la
// respuesta (el Master no cuenta: no pertenece a ninguna ciudad). Solo se
// llama al recargar datos, no en cada render, para no perder la selección.
function poblarStatsCiudades() {
  const sel = document.getElementById("stats-ciudad-select");
  if (!sel) return;
  const ciudades = [...new Set(_statsData.filter((p) => p.rol !== "master").map((p) => p.ciudad))].sort();
  sel.innerHTML = '<option value="todas">Todas las ciudades</option>' +
    ciudades.map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
  sel.value = ciudades.includes(_statsCiudadFiltro) ? _statsCiudadFiltro : "todas";
  _statsCiudadFiltro = sel.value;
}

// Chips de rol, select de ciudad y tabs de métrica filtran/recalculan sobre
// _statsData (ya descargada) en vez de volver a pedirle al backend —
// instantáneo y sin requests extra al cambiar de vista.
function setStatsRolFiltro(rol, btn) {
  _statsRolFiltro = rol;
  document.querySelectorAll("#stats-rol-chips .stats-chip").forEach((b) => b.classList.toggle("active", b === btn));
  renderEstadisticasStaff();
}

function setStatsCiudadFiltro(ciudad) {
  _statsCiudadFiltro = ciudad;
  renderEstadisticasStaff();
}

function setStatsMetrica(metrica, btn) {
  _statsMetrica = metrica;
  document.querySelectorAll(".stats-tab-row .stats-tab").forEach((b) => b.classList.toggle("active", b === btn));
  renderEstadisticasStaff();
}

// Nombres legibles para el campo `tipo` de staff_actividad (nombres de
// función tal cual, en admin-api). Lo que no esté aquí se muestra tal cual.
const TIPO_LABELS = {
  aprobarVendedor: "Aprobar vendedor", rechazarVendedor: "Rechazar vendedor",
  resetPasswordVendedor: "Restablecer contraseña", resetPasswordComprador: "Restablecer contraseña de comprador", saludarRegistroComprador: "Saludar a comprador nuevo", omitirRegistroComprador: "Omitir comprador nuevo", desconocerCuentaComprador: "Cerrar cuenta de comprador no reconocida", aprobarCambioTelefono: "Aprobar cambio de teléfono",
  rechazarCambioTelefono: "Rechazar cambio de teléfono", marcarVendedorConfiable: "Marcar vendedor confiable",
  marcarVendedorPlan: "Cambiar plan de vendedor", ajustarDiasPlanPlus: "Ajustar días Plan Plus",
  suspenderVendedor: "Suspender vendedor", reactivarVendedor: "Reactivar vendedor",
  responderSolicitudPlus: "Responder solicitud Plus", recordarInteresPlus: "Recordar interés en Plus",
  marcarReporteBeneficiarioRevisado: "Marcar reporte de beneficiario revisado",
  aprobarBeneficiario: "Aprobar beneficiario", rechazarBeneficiario: "Rechazar beneficiario",
  aprobarSolicitudBeneficiario: "Aprobar solicitud de beneficiario", rechazarSolicitudBeneficiario: "Rechazar solicitud de beneficiario",
  aprobarProductoComunidad: "Aprobar producto de comunidad", rechazarProductoComunidad: "Rechazar producto de comunidad",
  marcarReporteRevisado: "Marcar reporte revisado", marcarReporteLiveRevisado: "Marcar reporte de live revisado",
  verConversacionPedido: "Revisar conversación reportada", resolverReportePedido: "Resolver reporte de pedido personalizado", resolverReporteHistoria: "Resolver reporte de historia",
  crearAdmin: "Crear admin", desactivarAdmin: "Desactivar admin", reactivarAdmin: "Reactivar admin",
  iniciarTransicionAdmin: "Iniciar transición de admin", promoverModerador: "Promover moderador a admin",
  eliminarAdmin: "Eliminar admin", cambiarPasswordAdmin: "Cambiar contraseña de admin",
  eliminarCuentaVendedor: "Eliminar cuenta de vendedor", asignarCiudadVendedor: "Asignar ciudad a vendedor",
  asignarCiudadMasivaProductosZNR: "Asignar ciudad masiva (productos ZNR)", crearProductoZNR: "Crear producto ZNR",
  eliminarProductosDeAdmin: "Eliminar productos ZNR de un admin", actualizarProductoZNR: "Actualizar producto ZNR",
  eliminarProductoZNR: "Eliminar producto ZNR", deleteProductoComunidadAdmin: "Eliminar producto de comunidad (admin)",
  marcarProductoConfiable: "Marcar producto confiable", eliminarBeneficiario: "Eliminar beneficiario",
  guardarDatosBancariosAdmin: "Actualizar datos bancarios", guardarPreguntaSecretaAdmin: "Guardar pregunta secreta", recuperarCuentaAdmin: "Recuperar cuenta con pregunta secreta", marcarPagoAdminMes: "Marcar pago mensual a admin",
  sincronizarPlanPlusAdminsExistentes: "Sincronizar Plan Plus retroactivo (admins)",
  confirmGroupPurchase: "Confirmar compra grupal (tienda)", cancelGroupPurchase: "Cancelar compra grupal (tienda)",
  removeOutOfStockNotifications: "Quitar productos sin stock (tienda)",
};

function renderEstadisticasStaff() {
  const cont = document.getElementById("stats-staff-list");
  const esTiempo = _statsMetrica === "tiempo";
  const esTipos = _statsMetrica === "tipos";

  // El Master es respaldo/histórico, no personal de una ciudad: siempre
  // tendría el volumen más alto y aplastaría la escala del ranking, así que
  // se muestra aparte como referencia y no entra a competir por ciudad.
  const master = _statsData.find((p) => p.rol === "master");
  renderStatsMasterNote(master);

  let staff = _statsData.filter((p) => p.rol !== "master");
  if (_statsRolFiltro !== "todos") staff = staff.filter((p) => p.rol === _statsRolFiltro);
  if (_statsCiudadFiltro !== "todas") staff = staff.filter((p) => p.ciudad === _statsCiudadFiltro);

  if (esTipos) {
    const totales = {};
    staff.forEach((p) => Object.entries(p.porTipo || {}).forEach(([t, n]) => { totales[t] = (totales[t] || 0) + n; }));
    const tipos = Object.entries(totales).sort((a, b) => b[1] - a[1]);
    if (cont) {
      cont.innerHTML = !tipos.length
        ? '<p class="empty-state">Sin datos para este filtro.</p>'
        : tipos.map(([t, n]) => `
          <div class="stats-staff-row">
            <div class="stats-staff-name">${escapeHtml(TIPO_LABELS[t] || t)}</div>
            <div class="stats-staff-metrics"><span>${n} vez${n === 1 ? "" : "es"}</span></div>
          </div>
        `).join("");
    }
    return dibujarStatsChart(tipos.map(([t]) => TIPO_LABELS[t] || t), tipos.map(([, n]) => n), "Veces resuelta", "#4ade80");
  }

  if (esTiempo) staff = staff.filter((p) => p.tiempoRespuestaPromedioMin != null);
  staff = [...staff].sort((a, b) => (esTiempo ? a.tiempoRespuestaPromedioMin - b.tiempoRespuestaPromedioMin : b.total - a.total));

  if (cont) {
    cont.innerHTML = !staff.length
      ? '<p class="empty-state">Sin datos para este filtro.</p>'
      : staff.map((p) => `
        <div class="stats-staff-row">
          <div class="stats-staff-name">${escapeHtml(p.nombre)} <span class="stats-staff-rol">${escapeHtml(p.rol)} · ${escapeHtml(p.ciudad)}</span></div>
          <div class="stats-staff-metrics">
            <span>${p.total} acción${p.total === 1 ? "" : "es"} resuelta${p.total === 1 ? "" : "s"}</span>
            <span>${p.tiempoRespuestaPromedioMin != null ? "~" + p.tiempoRespuestaPromedioMin + " min de respuesta" : "Sin solicitudes con tiempo medible"}</span>
            ${p.pendientes != null ? `<span class="${p.pendientes > 0 ? "stats-staff-pendientes-alerta" : ""}">${p.pendientes} pendiente${p.pendientes === 1 ? "" : "s"}</span>` : ""}
          </div>
        </div>
      `).join("");
  }

  dibujarStatsChart(staff.map((p) => p.nombre), staff.map((p) => (esTiempo ? p.tiempoRespuestaPromedioMin : p.total)),
    esTiempo ? "Tiempo de respuesta promedio (min)" : "Acciones resueltas", esTiempo ? "#ff9f4f" : "#a78bfa");
}

// Nota de referencia del Master, siempre visible y ajena al filtro de
// ciudad/rol (no compite por ciudad). Si `pendientes` no viene del backend
// todavía, simplemente no se muestra esa parte — no rompe nada.
function renderStatsMasterNote(master) {
  const el = document.getElementById("stats-master-note");
  if (!el) return;
  if (!master) { el.textContent = ""; return; }
  const partes = [`${master.total} acción${master.total === 1 ? "" : "es"}`];
  if (master.tiempoRespuestaPromedioMin != null) partes.push(`~${master.tiempoRespuestaPromedioMin} min`);
  if (master.pendientes != null) partes.push(`${master.pendientes} pendiente${master.pendientes === 1 ? "" : "s"}`);
  el.textContent = `${master.nombre}: ${partes.join(" · ")} (referencia, no compite por ciudad)`;
}

function dibujarStatsChart(labels, data, label, color) {
  if (!window.Chart) return; // Chart.js no cargó (offline, bloqueado, etc.) — la lista de arriba sigue funcionando igual.
  const ctx = document.getElementById("stats-chart");
  if (!ctx) return;
  if (_statsChart) _statsChart.destroy();

  // Alto dinámico según cuántas barras hay: con pocas se ve compacto, con
  // muchas cada una sigue teniendo espacio (evita que Chart.js las aplaste
  // en un contenedor de altura fija).
  const chartBox = ctx.closest(".chart-box");
  if (chartBox) chartBox.style.height = Math.max(220, labels.length * 46) + "px";

  _statsChart = new Chart(ctx, {
    type: "bar",
    data: { labels, datasets: [{ label, data, backgroundColor: color, borderRadius: 6, maxBarThickness: 34 }] },
    options: {
      indexAxis: "y", // barras horizontales: los nombres se leen completos incluso en pantalla angosta
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { beginAtZero: true, ticks: { precision: 0 } },
        y: { ticks: { autoSkip: false } },
      },
    },
  });
}

async function cargarListaAdmins() {
  const cont = document.getElementById("admin-cuentas-list");
  const countLabel = document.getElementById("tile-admin-count");
  if (!cont) return;
  try {
    const data = await apiRequest("GET", { action: "listarAdmins" });
    if (!data || !data.ok) throw new Error((data && data.error) || "Error desconocido");

    // ▼ ÚNICO CAMBIO: blindaje contra respuestas que no sean array
    const admins = Array.isArray(data.admins) ? data.admins : [];
    // ▲

    if (countLabel) countLabel.textContent = admins.length + (admins.length === 1 ? " cuenta" : " cuentas");
    if (admins.length === 0) {
      cont.innerHTML = '<div style="text-align:center;padding:24px;color:#999;">Aún no hay cuentas creadas</div>';
      return;
    }
    window._ultimaListaAdmins = admins; // para que los botones de abajo busquen el nombre por uid sin meterlo en atributos HTML
    const rolSesion = sessionStorage.getItem("admin_rol") || "master";
cont.innerHTML = admins.map((a) => {
const btn = (fn, txt, extra = "") => `<button type="button" class="text-button" ${extra} data-uid="${escapeHtml(a.uid)}" data-click="${fn}" data-args="${dargs(ARG.THIS)}">${txt}</button>`;
const esMaster = rolSesion === "master";
return `<div class="acct-card${a.activo ? "" : " is-off"}">
  <div class="acct-top">
    <div class="acct-av">${escapeHtml((a.nombre || "?").trim().charAt(0).toUpperCase())}</div>
    <div class="acct-info">
      <div class="acct-name">${escapeHtml(a.nombre)} <span class="acct-pill ${escapeHtml(a.rol)}">${escapeHtml(a.rol)}</span></div>
      <div class="acct-meta">${escapeHtml(a.ciudad)} · ${escapeHtml(a.telefono)}${a.rol === "admin" ? " · " + (a.cobro && a.cobro.length ? "Cobra con " + escapeHtml(a.cobro.join(" y ")) : "Sin cobro con tarjeta") : ""}</div>
    </div>
    <span class="acct-st ${a.activo ? "on" : "off"}">${a.activo ? "Activa" : "Desactivada"}</span>
  </div>
  ${a.estado === "en_transicion" ? `<div class="acct-warn">⏳ En transición${a.fechaLimiteTransicion ? " hasta " + new Date(a.fechaLimiteTransicion).toLocaleDateString("es-MX") : ""}</div>` : ""}
  <div class="acct-actions">
    ${btn("handleToggleAdminActivo", a.activo ? "Desactivar" : "Reactivar", `data-activo="${a.activo ? "1" : "0"}"`)}
    ${esMaster && a.rol === "admin" && a.estado !== "en_transicion" ? btn("handleIniciarTransicion", "Iniciar transición") : ""}
    ${esMaster && a.rol === "moderador" ? btn("handlePromoverModerador", "Promover a admin") : ""}
    ${btn("handleResetPasswordAdmin", "Restablecer contraseña")}
    ${esMaster ? btn("handleEliminarAdmin", "Eliminar cuenta", 'style="color:#e5484d;"') : ""}
  </div>
</div>`;
}).join("");
} catch (err) {
console.error(err);
cont.innerHTML = '<div style="text-align:center;padding:24px;color:#e53935;">Error al cargar cuentas</div>';
}
}

function _nombrePorUid(uid) {
  const a = (window._ultimaListaAdmins || []).find((x) => x.uid === uid);
  return a ? a.nombre : uid;
}

// Paso 1 de la transición: marca al admin saliente como "en_transicion".
// Sus productos siguen exactamente igual (mismo nombre, visibles) — esto
// solo arranca el plazo de 15 días y lo deja anotado en el panel.
async function handleIniciarTransicion(btn) {
  const uid = btn.dataset.uid;
  const nombre = _nombrePorUid(uid);
  const confirmado = await new Promise((resolve) => {
    showCustomConfirm({
      title: "Iniciar transición",
      message: `${nombre} quedará marcado "en transición" por 15 días. Sus productos siguen visibles con su nombre igual que ahora — esto no cambia nada más todavía. ¿Continuar?`,
      icon: "",
      confirmText: "Sí, iniciar",
      cancelText: "Cancelar",
      onConfirm: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });
  if (!confirmado) return;
  showLoader("Iniciando transición...");
  try {
    const data = await apiRequest("POST", { action: "iniciarTransicionAdmin", uid, dias: 15 });
    if (!data || !data.ok) throw new Error((data && data.error) || "Error desconocido");
    cargarListaAdmins();
  } catch (err) {
    console.error(err);
    await showCustomAlert({ title: " Error", message: "No se pudo iniciar la transición.", icon: "", confirmText: "Aceptar" });
  } finally {
    hideLoader();
  }
}
window.handleIniciarTransicion = handleIniciarTransicion;

async function handleResetPasswordAdmin(btn) {
  const uid = btn.dataset.uid;
  const nombre = _nombrePorUid(uid);
  const confirmado = await new Promise((resolve) => {
    showCustomConfirm({
      title: "Restablecer contraseña",
      message: `Se generará una contraseña nueva para ${nombre}, válida tanto para su cuenta de admin/moderador como para su cuenta de vendedor. La anterior dejará de funcionar. ¿Continuar?`,
      icon: "", confirmText: "Sí, restablecer", cancelText: "Cancelar",
      onConfirm: () => resolve(true), onCancel: () => resolve(false),
    });
  });
  if (!confirmado) return;
  showLoader("Generando contraseña...");
  try {
    const data = await apiRequest("POST", { action: "resetPasswordAdmin", uid });
    if (!data || !data.ok) throw new Error((data && data.error) || "Error desconocido");
    await showCustomAlert({
      title: "Contraseña generada",
      message: `Comparte esta contraseña con ${data.nombre} (teléfono ${data.telefono}) — sirve para su cuenta de admin/moderador y para su cuenta de vendedor: ${data.codigo}`,
      confirmText: "Listo",
    });
  } catch (err) {
    console.error(err);
    await showCustomAlert({ title: " Error", message: "No se pudo restablecer la contraseña.", icon: "", confirmText: "Aceptar" });
  } finally {
    hideLoader();
  }
}
window.handleResetPasswordAdmin = handleResetPasswordAdmin;

// Paso 2: sube de rol al moderador candidato (mismo uid, mismo teléfono y
// contraseña — no es una cuenta nueva). Desde ese momento puede crear y ver
// productos como cualquier admin.
async function handlePromoverModerador(btn) {
  const uid = btn.dataset.uid;
  const nombre = _nombrePorUid(uid);
  const confirmado = await new Promise((resolve) => {
    showCustomConfirm({
      title: "Promover a admin",
      message: `${nombre} pasará de moderador a admin, con acceso para crear y ver productos. ¿Continuar?`,
      icon: "",
      confirmText: "Sí, promover",
      cancelText: "Cancelar",
      onConfirm: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });
  if (!confirmado) return;
  showLoader("Promoviendo cuenta...");
  try {
    const data = await apiRequest("POST", { action: "promoverModerador", uid });
    if (!data || !data.ok) throw new Error((data && data.error) || "Error desconocido");
    cargarListaAdmins();
  } catch (err) {
    console.error(err);
    await showCustomAlert({ title: " Error", message: "No se pudo promover la cuenta.", icon: "", confirmText: "Aceptar" });
  } finally {
    hideLoader();
  }
}
window.handlePromoverModerador = handlePromoverModerador;

// Paso 3: borra la cuenta del admin saliente. Esto también borra sus
// productos ZNR (creadoPor = su uid) para que los del nuevo admin ocupen el
// lugar al instante — avisar bien fuerte antes, no tiene vuelta atrás.
async function handleEliminarAdmin(btn) {
  const uid = btn.dataset.uid;
  const nombre = _nombrePorUid(uid);
  const razon = await new Promise((resolve) => {
    showCustomConfirm({
      title: "Eliminar cuenta",
      message: `Esto borra la cuenta de ${nombre} Y TODOS sus productos ZNR de inmediato. Asegúrate de que el nuevo admin ya subió los suyos antes de continuar. Esta acción no se puede deshacer. ¿Eliminar de todos modos?`,
      icon: "",
      confirmText: "Sí, eliminar todo",
      cancelText: "Cancelar",
      askReason: true,
      reasonPlaceholder: "Motivo de la eliminación (opcional)",
      onConfirm: (r) => resolve(r === undefined ? "" : r),
      onCancel: () => resolve(null),
    });
  });
  if (razon === null) return;
  showLoader("Eliminando cuenta y productos...");
  try {
    const data = await apiRequest("POST", { action: "eliminarAdmin", uid, razon });
    if (!data || !data.ok) throw new Error((data && data.error) || "Error desconocido");
    cargarListaAdmins();
  } catch (err) {
    console.error(err);
    await showCustomAlert({ title: " Error", message: "No se pudo eliminar la cuenta.", icon: "", confirmText: "Aceptar" });
  } finally {
    hideLoader();
  }
}
window.handleEliminarAdmin = handleEliminarAdmin;

async function handleToggleAdminActivo(btn) {
const uid = btn.dataset.uid;
const activo = btn.dataset.activo === "1";
if (!activo) {
  // Reactivar: sin fricción, como estaba.
  showLoader("Reactivando...");
  try {
    const data = await apiRequest("POST", { action: "reactivarAdmin", uid });
    if (!data || !data.ok) throw new Error((data && data.error) || "Error desconocido");
    cargarListaAdmins();
  } catch (err) {
    console.error(err);
    await showCustomAlert({ title: " Error", message: "No se pudo actualizar la cuenta.", icon: "", confirmText: "Aceptar" });
  } finally {
    hideLoader();
  }
  return;
}
// Desactivar: sí pedimos motivo, queda en la auditoría.
const nombre = _nombrePorUid(uid);
const razon = await new Promise((resolve) => {
  showCustomConfirm({
    title: "Desactivar cuenta",
    message: `${nombre} no podrá acceder al panel hasta que la reactives. ¿Continuar?`,
    icon: "",
    confirmText: "Sí, desactivar",
    cancelText: "Cancelar",
    askReason: true,
    reasonPlaceholder: "Motivo de la desactivación (opcional)",
    onConfirm: (r) => resolve(r === undefined ? "" : r),
    onCancel: () => resolve(null),
  });
});
if (razon === null) return;
showLoader("Desactivando...");
try {
const data = await apiRequest("POST", { action: "desactivarAdmin", uid, razon });
if (!data || !data.ok) throw new Error((data && data.error) || "Error desconocido");
cargarListaAdmins();
} catch (err) {
console.error(err);
await showCustomAlert({ title: " Error", message: "No se pudo actualizar la cuenta.", icon: "", confirmText: "Aceptar" });
} finally {
hideLoader();
}
}
window.handleToggleAdminActivo = handleToggleAdminActivo;

// El Master elige país/ciudad al crear la cuenta desde ciudades.js —
// la misma fuente que ya usa el registro de vendedor y el selector
// de ciudad del comprador, así todo el proyecto habla de las mismas
// ciudades. Un admin de ciudad no elige nada de esto: crea siempre un
// moderador en su propia ciudad, y el backend ignora lo que mande aquí
// para ese caso (ver crearAdmin en vendedores-api).
async function handleCrearAdminSubmit(e) {
e.preventDefault();
const rolSesion = sessionStorage.getItem("admin_rol") || "master";
const nombre = document.getElementById("nuevo-admin-nombre").value;
const telefono = document.getElementById("nuevo-admin-telefono").value;
const rol = document.getElementById("nuevo-admin-rol").value;
const pais = document.getElementById("nuevo-admin-pais").value;
const ciudad = document.getElementById("nuevo-admin-ciudad").value;
if (rolSesion === "master" && (!pais || !ciudad)) {
await showCustomAlert({ title: " Falta ciudad", message: "Selecciona país y ciudad para esta cuenta.", icon: "", confirmText: "Aceptar" });
return;
}
showLoader("Creando cuenta...");
try {
const data = await apiRequest("POST", { action: "crearAdmin", nombre, telefono, rol, pais, ciudad });
if (!data || !data.ok) {
await showCustomAlert({ title: " No se pudo crear", message: (data && data.error) || "Intenta de nuevo.", icon: "", confirmText: "Aceptar" });
return;
}
const msg = `*Cuenta creada*\n\nHola ${nombre}, tu acceso a Z&R:\n\nTeléfono: ${data.telefono}\nContraseña temporal: *${data.codigo}*\n\nCámbiala después de iniciar sesión.`;
const waLink = `https://wa.me/52${data.telefono}?text=${encodeURIComponent(msg)}`;
const cred = document.getElementById("nuevo-admin-credenciales");
cred.style.display = "block";
cred.innerHTML = `<div class="cred-card">
  <div class="cred-head"><span class="cred-ok">✓</span> Cuenta creada <span class="acct-pill ${escapeHtml(rol)}">${escapeHtml(rol)}</span></div>
  <div class="cred-row"><small>Nombre</small><b>${escapeHtml(nombre)}</b></div>
  <div class="cred-row"><small>Teléfono</small><b>${escapeHtml(data.telefono)}</b></div>
  <div class="cred-row"><small>Contraseña temporal</small><span class="cred-pass">${escapeHtml(data.codigo)}</span></div>
  <div class="cred-actions">
    <button type="button" class="text-button" data-copy="${escapeHtml(data.codigo)}" data-click="copiarCredencial" data-args="${dargs(ARG.THIS)}">Copiar contraseña</button>
    <a class="wa-btn" href="${waLink}" target="_blank" rel="noopener">Enviar por WhatsApp</a>
  </div>
</div>`;
document.getElementById("crear-admin-form").reset();
cargarListaAdmins();
} catch (err) {
console.error(err);
await showCustomAlert({ title: " Error", message: "Error al crear la cuenta.", icon: "", confirmText: "Aceptar" });
} finally {
hideLoader();
}
}

// Autoservicio de contraseña para admin/moderador de ciudad. La cuenta
// Master heredada (ADMIN_TOKEN) no tiene doc en `admins` — cambiarPasswordAdmin
// la rechaza por diseño, así que este formulario ni se muestra para ese rol
// (ver aplicarVisibilidadPorRol).
async function handleCambiarPasswordSubmit(e) {
  e.preventDefault();
  const oldPassword = document.getElementById("cambiar-password-actual").value;
  const newPassword = document.getElementById("cambiar-password-nueva").value;
  const confirmPassword = document.getElementById("cambiar-password-confirmar").value;

  if (newPassword !== confirmPassword) {
    await showCustomAlert({ title: " Las contraseñas no coinciden", message: "La nueva contraseña y su confirmación deben ser iguales.", icon: "", confirmText: "Aceptar" });
    return;
  }
  if (!passwordValida(newPassword)) {
    await showCustomAlert({ title: " Contraseña poco segura", message: POLITICA_PASSWORD, icon: "", confirmText: "Aceptar" });
    return;
  }

  showLoader("Actualizando contraseña...");
  try {
    const data = await apiRequest("POST", { action: "cambiarPasswordAdmin", oldPassword, newPassword });
    if (!data || !data.ok) {
      await showCustomAlert({ title: " No se pudo cambiar", message: (data && data.error) || "Intenta de nuevo.", icon: "", confirmText: "Aceptar" });
      return;
    }
    document.getElementById("cambiar-password-form").reset();
    await showCustomAlert({ title: " Contraseña actualizada", message: "Tu contraseña se cambió correctamente.", icon: "", confirmText: "Listo" });
  } catch (err) {
    console.error(err);
    await showCustomAlert({ title: " Error", message: "Error al cambiar la contraseña.", icon: "", confirmText: "Aceptar" });
  } finally {
    hideLoader();
  }
}

// Autoservicio de datos bancarios (CLABE/tarjeta) para que el Master les
// pague su porcentaje mensual. Igual que la contraseña, el Master
// heredado no tiene doc en `admins` y el backend lo rechaza por diseño.
let _bancarios = null, _bancVisible = false;
function renderTarjetaBancaria() {
  const el = document.getElementById("tarjeta-bancaria");
  const d = _bancarios;
  if (!el) return;
  if (!d || (!d.clabe && !d.tarjeta)) { el.innerHTML = ""; return; }
  const fmt = (n) => _bancVisible ? escapeHtml(n).replace(/(.{4})(?=.)/g, "$1 ") : "•••• " + escapeHtml(n.slice(-4));
  const fila = (t, n) => n ? `<div class="bk-row"><small>${t}</small><div class="bk-num">${fmt(n)}</div></div>` : "";
  el.innerHTML = `<div class="bank-card">
    <div class="bk-top"><span>Datos bancarios</span><button type="button" class="bk-eye" data-click="toggleDatosBancarios" data-args="[]">${_bancVisible ? "Ocultar" : "Mostrar"}</button></div>
    ${fila("Tarjeta", d.tarjeta)}${fila("CLABE", d.clabe)}
    <div class="bk-name">${escapeHtml(d.titular || "Sin titular")}</div></div>`;
}
window.toggleDatosBancarios = () => { _bancVisible = !_bancVisible; renderTarjetaBancaria(); };
window.copiarCredencial = (btn) => navigator.clipboard?.writeText(btn.dataset.copy).then(() => showTemporaryMessage("Contraseña copiada", "success"));
function setDatosBancarios(d) {
  _bancarios = d; _bancVisible = false;
  ["titular", "clabe", "tarjeta"].forEach((k) => { const i = document.getElementById("datos-bancarios-" + k); if (i) i.value = (d && d[k]) || ""; });
  renderTarjetaBancaria();
}
// Requiere la acción obtenerDatosBancariosAdmin en el backend; si aún no existe, la tarjeta solo aparece tras guardar.
async function cargarDatosBancarios() {
  try { const r = await apiRequest("GET", { action: "obtenerDatosBancariosAdmin" }); if (r && r.ok) setDatosBancarios(r.datos || r); } catch (_) {}
}
// Cobro con tarjeta de la Tienda Z&R: el admin conecta SU Stripe y/o Mercado Pago y los pedidos de la tienda de
// su ciudad le caen directo (Z&R se queda con el 5%). Sin ninguna, el comprador ve la CLABE de arriba.
async function cargarCobroTarjeta() {
  const el = document.getElementById("cobro-tarjeta");
  if (!el) return;
  try {
    const r = await apiRequest("POST", { action: "adminCobroEstado" });
    if (!r.ok) throw new Error(r.error || "No se pudo cargar");
    if (!r.aplica) { el.innerHTML = ""; return; }
    const fila = (p, nombre, estado) => {
      const [txt, accion, color] = estado === "listo" ? ["Desconectar", "desconectarCobro", "#dc2626"] : [estado === "pendiente" ? "Terminar registro" : "Conectar", "conectarCobro", "#7c3aed"];
      return `<div style="display:flex;align-items:center;gap:10px;margin:8px 0;font-size:.85rem;"><span style="flex:1;">${estado === "listo" ? "✅" : "○"} ${nombre}${estado === "pendiente" ? " · registro pendiente" : ""}</span>
        <button type="button" data-click="${accion}" data-args="${dargs(p)}" style="padding:7px 12px;border-radius:10px;border:1px solid ${color};background:transparent;color:${color};font-weight:700;cursor:pointer;">${txt}</button></div>`;
    };
    el.innerHTML = `<h3 style="font-size:.95rem;margin:18px 0 4px;">Cobrar con tarjeta (Tienda Z&R)</h3>
      <p style="font-size:.8rem;color:var(--color-text-soft);margin:0 0 6px;">Conecta tu cuenta para que los pedidos de la tienda de tu ciudad te paguen directo. Z&R se queda con el 5%. Si no conectas ninguna, el comprador ve tu CLABE.</p>
      ${fila("stripe", "Stripe · tarjeta, OXXO, Apple Pay, Google Pay", r.stripe)}${fila("mp", "Mercado Pago", r.mp ? "listo" : "no")}`;
  } catch (err) { el.innerHTML = `<p style="color:#dc2626;font-size:.8rem;">Cobro con tarjeta: ${escapeHtml(err.message)}</p>`; }
}
window.conectarCobro = async (pasarela) => {
  showLoader("Abriendo el registro...");
  try {
    const r = await apiRequest("POST", { action: "adminCobroConectar", pasarela, volver: location.href.split("#")[0] });
    if (!r.ok) throw new Error(r.error || "No se pudo iniciar la conexión");
    location.href = r.url;
  } catch (err) { hideLoader(); showCustomAlert({ title: "No se pudo conectar", message: err.message, icon: "", confirmText: "Aceptar" }); }
};
window.desconectarCobro = (pasarela) => showCustomConfirm({
  title: "Desconectar", message: "Los compradores de tu ciudad ya no podrán pagarte con " + (pasarela === "mp" ? "Mercado Pago" : "Stripe") + ".",
  icon: "", confirmText: "Desconectar", cancelText: "Volver",
  onConfirm: async () => { await apiRequest("POST", { action: "adminCobroDesconectar", pasarela }).catch(() => {}); cargarCobroTarjeta(); },
});
async function handleDatosBancariosSubmit(e) {
  e.preventDefault();
  const titular = document.getElementById("datos-bancarios-titular").value;
  const clabe = document.getElementById("datos-bancarios-clabe").value;
  const tarjeta = document.getElementById("datos-bancarios-tarjeta").value;

  if (!clabe.trim() && !tarjeta.trim()) {
    await showCustomAlert({ title: " Falta un dato", message: "Da al menos una CLABE o número de tarjeta.", icon: "", confirmText: "Aceptar" });
    return;
  }

  showLoader("Guardando datos bancarios...");
  try {
    const data = await apiRequest("POST", { action: "guardarDatosBancariosAdmin", titular, clabe, tarjeta });
    if (!data || !data.ok) {
      await showCustomAlert({ title: " No se pudo guardar", message: (data && data.error) || "Intenta de nuevo.", icon: "", confirmText: "Aceptar" });
      return;
    }
    setDatosBancarios({ titular, clabe, tarjeta });
    await showCustomAlert({ title: " Listo", message: "Tus datos bancarios se guardaron correctamente.", icon: "", confirmText: "Listo" });
  } catch (err) {
    console.error(err);
    await showCustomAlert({ title: " Error", message: "Error al guardar tus datos bancarios.", icon: "", confirmText: "Aceptar" });
  } finally {
    hideLoader();
  }
}


// Política de contraseñas elegidas (misma regla que vendedores-api): mínimo 8, con mayúscula, número y símbolo.
const POLITICA_PASSWORD = "La contraseña debe tener al menos 8 caracteres, con una mayúscula, un número y un carácter especial (por ejemplo ! @ $ *).";
const passwordValida = (p) => p.length >= 8 && /\p{Lu}/u.test(p) && /\d/.test(p) && /[^\p{L}\p{N}\s]/u.test(p);

// ---------- Pregunta secreta y recuperación de cuenta (admin / moderador) ----------
// El orden debe coincidir con PREGUNTAS_SECRETAS de vendedores-api (se manda el índice).
const PREGUNTAS_SECRETAS = ["¿Cómo se llamaba tu primera mascota?", "¿En qué ciudad nació tu mamá?", "¿Cómo se llamaba tu primera escuela?", "¿Cuál fue tu primer trabajo?", "¿Cuál era tu apodo de niño/a?"];
const _selPregunta = document.getElementById("pregunta-secreta-idx");
if (_selPregunta) _selPregunta.innerHTML = PREGUNTAS_SECRETAS.map((p, i) => `<option value="${i}">${escapeHtml(p)}</option>`).join("");

async function handlePreguntaSecretaSubmit(e) {
  e.preventDefault();
  showLoader("Guardando...");
  try {
    const data = await apiRequest("POST", {
      action: "guardarPreguntaSecretaAdmin",
      preguntaIdx: _selPregunta.value,
      respuesta: document.getElementById("pregunta-secreta-respuesta").value,
      password: document.getElementById("pregunta-secreta-password").value,
    });
    if (!data || !data.ok) { await showCustomAlert({ title: " No se pudo guardar", message: (data && data.error) || "Intenta de nuevo.", icon: "", confirmText: "Aceptar" }); return; }
    e.target.reset();
    await showCustomAlert({ title: " Listo", message: "Tu pregunta secreta quedó guardada.", icon: "", confirmText: "Listo" });
  } catch (err) {
    console.error(err);
    await showCustomAlert({ title: " Error", message: "Error al guardar la pregunta secreta.", icon: "", confirmText: "Aceptar" });
  } finally { hideLoader(); }
}
const _formPregunta = document.getElementById("pregunta-secreta-form");
if (_formPregunta) _formPregunta.addEventListener("submit", handlePreguntaSecretaSubmit);

// Recuperación sin sesión: teléfono → pregunta → respuesta + contraseña nueva.
function abrirRecuperarCuenta() {
  const modal = document.createElement("div");
  modal.className = "custom-alert-modal";
  modal.innerHTML = `<div class="custom-alert-content">
    <div class="custom-alert-header"><h3>Recuperar cuenta</h3></div>
    <div class="custom-alert-body">
      <p id="rec-msg">Escribe tu teléfono para ver tu pregunta secreta.</p>
      <input class="custom-alert-input" id="rec-tel" type="tel" placeholder="Teléfono (10 dígitos)" style="font-family:inherit;width:100%;">
      <div id="rec-paso2" hidden>
        <p id="rec-pregunta" style="font-weight:700;margin-top:12px;"></p>
        <input class="custom-alert-input" id="rec-resp" type="text" autocomplete="off" placeholder="Tu respuesta" style="font-family:inherit;width:100%;margin-top:6px;">
        <input class="custom-alert-input" id="rec-pass" type="password" autocomplete="new-password" placeholder="Nueva contraseña (mín. 8, A-Z, 0-9, símbolo)" style="font-family:inherit;width:100%;margin-top:6px;">
      </div>
    </div>
    <div class="custom-alert-footer">
      <button type="button" class="custom-alert-btn cancel" id="rec-cancel">Cancelar</button>
      <button type="button" class="custom-alert-btn confirm" id="rec-ok">Continuar</button>
    </div></div>`;
  document.body.appendChild(modal);
  const $ = (id) => modal.querySelector("#" + id);
  const msg = (t) => { $("rec-msg").textContent = t; };
  const llamar = (body) => apiFetch(window.VENDEDORES_API_URL, body, true).then((r) => r.json());
  $("rec-cancel").onclick = () => modal.remove();
  $("rec-ok").onclick = async () => {
    const btn = $("rec-ok"); btn.disabled = true;
    try {
      if ($("rec-paso2").hidden) {
        const d = await llamar({ action: "obtenerPreguntaSecretaAdmin", telefono: $("rec-tel").value });
        if (!d.ok) return msg(d.error || "No se pudo continuar.");
        $("rec-pregunta").textContent = d.pregunta; $("rec-paso2").hidden = false; $("rec-tel").disabled = true;
        msg("Responde y elige tu nueva contraseña."); btn.textContent = "Cambiar contraseña";
      } else {
        if (!passwordValida($("rec-pass").value)) return msg(POLITICA_PASSWORD);
        const d = await llamar({ action: "recuperarCuentaAdmin", telefono: $("rec-tel").value, respuesta: $("rec-resp").value, nuevaPassword: $("rec-pass").value });
        if (!d.ok) return msg(d.error || "No se pudo recuperar la cuenta.");
        modal.remove();
        showCustomAlert({ title: " Contraseña actualizada", message: "Ya puedes iniciar sesión con tu nueva contraseña.", icon: "", confirmText: "Aceptar" });
      }
    } catch (err) { msg("Error de conexión. Intenta de nuevo."); }
    finally { btn.disabled = false; }
  };
}
const _olvide = document.getElementById("olvide-password-btn");
if (_olvide) _olvide.addEventListener("click", abrirRecuperarCuenta);

const _badgeAuto = document.getElementById("product-badge-auto");
if (_badgeAuto) _badgeAuto.addEventListener("change", () => { document.getElementById("product-badge").disabled = _badgeAuto.checked; });

async function loadAdminProducts() {
  showLoader("Cargando productos...");
  try {
    const data = await apiRequest("GET", { action: "list" });

    // El servidor puede devolver varias formas; aceptamos solo las que
    // resulten en un array real. Si no, mostramos el error del backend
    // en vez de tirar un TypeError críptico más abajo.
    const lista = Array.isArray(data)
      ? data
      : (data && Array.isArray(data.products))
        ? data.products
        : null;

    if (!lista) {
      throw new Error((data && data.error) || "Respuesta inválida del servidor");
    }

    adminProducts = lista;
    updateAdminStats();
    populateAdminCategoryFilter();
    adminCurrentPage = 1;
    renderAdminProductsWithFilters();
  } catch (err) {
    console.error(err);
    await showCustomAlert({
      title: "Error",
      message: "Error al cargar productos: " + (err.message || "Verifica tu conexión."),
      icon: "",
      confirmText: "Aceptar"
    });
  } finally {
    hideLoader();
  }
}
  
function renderAdminProductsWithFilters() {
const searchTerm = document.getElementById("admin-search-input")?.value.toLowerCase() || "";
const categoryFilter = document.getElementById("admin-category-filter")?.value || "";
const stockFilter = document.getElementById("admin-stock-filter")?.value || "";
adminFilteredProducts = adminProducts.filter(product => {
const matchesSearch = !searchTerm ||
(product.Nombre || "").toLowerCase().includes(searchTerm) ||
String(product.ID || "").includes(searchTerm);
const matchesCategory = !categoryFilter || (product.Categoria || "") === categoryFilter;
const stock = Number(product.Stock || 0);
let matchesStock = true;
if (stockFilter === "low") matchesStock = stock > 0 && stock <= 5;
else if (stockFilter === "out") matchesStock = stock === 0;
else if (stockFilter === "in") matchesStock = stock > 0;
return matchesSearch && matchesCategory && matchesStock;
});
const totalPages = Math.ceil(adminFilteredProducts.length / adminProductsPerPage);
const start = (adminCurrentPage - 1) * adminProductsPerPage;
const end = start + adminProductsPerPage;
const pageProducts = adminFilteredProducts.slice(start, end);
renderAdminProductsList(pageProducts);
renderAdminPagination(totalPages);
}

const ADMIN_VIEW_KEY = 'admin_product_view';
let adminProductView = localStorage.getItem(ADMIN_VIEW_KEY) || 'list';

function initAdminViewToggle() {
 const btnList = document.getElementById('btn-view-list');
 const btnGrid = document.getElementById('btn-view-grid');
 if (!btnList || !btnGrid) return;

 function applyView(view) {
 adminProductView = view;
 localStorage.setItem(ADMIN_VIEW_KEY, view);
 btnList.classList.toggle('active', view === 'list');
 btnGrid.classList.toggle('active', view === 'grid');

 const list = document.getElementById('admin-products-list');
 if (list) {
   list.className = view === 'grid' ? 'admin-products-grid' : 'admin-products-list';
   list.id = 'admin-products-list';
 }

 if (adminProducts && adminProducts.length > 0) {
   renderAdminProductsWithFilters();
 }
 }

 btnList.addEventListener('click', () => applyView('list'));
 btnGrid.addEventListener('click', () => applyView('grid'));

 applyView(adminProductView);
}

function renderAdminProductsList(products) {
const list = document.getElementById("admin-products-list");
if (!list) return;

if (adminProductView === 'grid') {
list.className = 'admin-products-grid';
renderAdminProductsGrid(products, list);
return;
}
list.className = 'admin-products-list';
list.innerHTML = "";
if (!products || products.length === 0) {
list.innerHTML = '<div style="text-align:center; padding:40px; color:#999;">No hay productos que coincidan con los filtros.</div>';
return;
}
products.forEach((p) => {
const row = document.createElement("div");
row.className = "admin-product-row";
const stock = Number(p.Stock || 0);
let stockClass = "";
let stockText = "";
if (stock === 0) {
stockClass = "out-stock";
stockText = " Sin stock";
} else if (stock <= 5) {
stockClass = "low-stock";
stockText = ` ${stock} unidades`;
} else {
stockText = ` ${stock} unidades`;
}
row.innerHTML = `
<div class="admin-product-id">#${escapeHtml(String(p.ID || "N/A"))}</div>
<div class="admin-product-name">${escapeHtml(p.Nombre || "Sin nombre")}</div>
<div class="admin-product-price">${formatCurrency(p.Precio)}</div>
<div class="admin-product-stock ${stockClass}">${escapeHtml(stockText)}</div>
<div class="admin-product-actions">
<button class="edit-product-btn" data-id="${escapeHtml(String(p.ID))}"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" aria-hidden="true"><use href="#ic-edit"/></svg> Editar</button>
<button class="delete-product-btn" data-id="${escapeHtml(String(p.ID))}"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" aria-hidden="true"><use href="#ic-trash"/></svg> Eliminar</button>
</div>
`;
list.appendChild(row);
});
document.querySelectorAll(".edit-product-btn").forEach(btn => {
btn.addEventListener("click", () => {
const id = btn.getAttribute("data-id");
const product = adminProducts.find(p =>String(p.ID) === id);
if (product) fillFormForEdit(product);
});
});
document.querySelectorAll(".delete-product-btn").forEach(btn => {
btn.addEventListener("click", () => {
const id = btn.getAttribute("data-id");
deleteProduct(id);
});
});
}

function renderAdminProductsGrid(products, list) {
list.innerHTML = '';
if (!products || products.length === 0) {
list.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#999;">No hay productos que coincidan con los filtros.</div>';
return;
}
products.forEach(p => {
const stock  = Number(p.Stock || 0);
const id  = escapeHtml(String(p.ID || ''));
const nombre = escapeHtml(p.Nombre || 'Sin nombre');
const cat  = escapeHtml(p.Categoria || '');
const img  = p.Imagen1 ? escapeHtml(p.Imagen1) : '';

let statusClass, statusLabel;
if (stock === 0)  { statusClass = 'status-out';  statusLabel = 'Agotado'; }
else if (stock <= 5) { statusClass = 'status-low';  statusLabel = 'Stock bajo'; }
else  { statusClass = 'status-active';  statusLabel = 'Activo'; }

let stockClass = '';
if (stock === 0)  stockClass = 'stock-zero';
else if (stock <= 5) stockClass = 'stock-low';

const card = document.createElement('div');
card.className = 'admin-product-card';
card.innerHTML = `
<div class="admin-card-img-wrap">
${img
 ? `<img src="${img}" alt="${nombre}" loading="lazy" data-fb="placeholder">`
 : '<div class="admin-card-img-placeholder"></div>'}
<span class="admin-card-badge-status ${statusClass}">${statusLabel}</span>
${cat ? `<span class="admin-card-badge-cat"><span>${cat}</span></span>` : ''}
</div>
<div class="admin-card-body">
<div class="admin-card-name" title="${nombre}">${nombre}</div>
<div class="admin-card-price">${formatCurrency(p.Precio)}</div>
<div class="admin-card-stock ${stockClass}">
 <span>${stock === 0 ? 'Sin stock' : stock + ' uds'}</span>
</div>
</div>
<div class="admin-card-actions">
<button class="btn-edit-card edit-product-btn" data-id="${id}"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" aria-hidden="true"><use href="#ic-edit"/></svg> Editar</button>
<button class="btn-delete-card delete-product-btn" data-id="${id}"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" aria-hidden="true"><use href="#ic-trash"/></svg> Eliminar</button>
</div>`;
list.appendChild(card);
});

document.querySelectorAll('.edit-product-btn').forEach(btn => {
btn.addEventListener('click', () => {
const product = adminProducts.find(p =>String(p.ID) === btn.getAttribute('data-id'));
if (product) fillFormForEdit(product);
});
});
document.querySelectorAll('.delete-product-btn').forEach(btn => {
btn.addEventListener('click', () => deleteProduct(btn.getAttribute('data-id')));
});

applyCategoryBadgeScroll();
if (scrollObserver) {
 scrollObserver.disconnect();
 initBadgeScrollObserver();
}

}

function renderAdminPagination(totalPages) {
const pagination = document.getElementById("admin-pagination");
if (!pagination) return;
pagination.innerHTML = "";
if (totalPages <= 1) return;
if (adminCurrentPage > 1) {
const prevBtn = document.createElement("button");
prevBtn.innerHTML = Icon('arrow-left') + " Anterior";
prevBtn.onclick = () => { adminCurrentPage--; renderAdminProductsWithFilters(); window.scrollTo({ top: 0, behavior: 'smooth' }); };
pagination.appendChild(prevBtn);
}
let startPage = Math.max(1, adminCurrentPage - 2);
let endPage = Math.min(totalPages, startPage + 4);
if (endPage - startPage < 4 && startPage > 1) startPage = Math.max(1, endPage - 4);
for (let i = startPage; i <= endPage; i++) {
const btn = document.createElement("button");
btn.textContent = i;
if (i === adminCurrentPage) btn.classList.add("active-page");
btn.onclick = () => { adminCurrentPage = i; renderAdminProductsWithFilters(); window.scrollTo({ top: 0, behavior: 'smooth' }); };
pagination.appendChild(btn);
}
if (adminCurrentPage < totalPages) {
const nextBtn = document.createElement("button");
nextBtn.innerHTML = "Siguiente " + Icon('arrow-right');
nextBtn.onclick = () => { adminCurrentPage++; renderAdminProductsWithFilters(); window.scrollTo({ top: 0, behavior: 'smooth' }); };
pagination.appendChild(nextBtn);
}
}
function populateAdminCategoryFilter() {
const select = document.getElementById("admin-category-filter");
if (!select) return;
const categories = new Set();
adminProducts.forEach(p => { if (p.Categoria) categories.add(p.Categoria); });
select.innerHTML = '<option value="">Todas las categorías</option>';
Array.from(categories).sort().forEach(cat => {
const opt = document.createElement("option");
opt.value = cat;
opt.textContent = cat;
select.appendChild(opt);
});
}
function updateAdminStats() {
const totalProducts = adminProducts.length;
const totalInventoryValue = adminProducts.reduce((sum, p) => sum + (Number(p.Precio || 0) * Number(p.Stock || 0)), 0);
const outOfStock = adminProducts.filter(p =>Number(p.Stock || 0) <= 0).length;
const totalStockElem = document.getElementById("stat-total-products");
const totalValueElem = document.getElementById("stat-total-stock");
const outStockElem = document.getElementById("stat-out-of-stock");
if (totalStockElem) totalStockElem.textContent = totalProducts;
if (totalValueElem) totalValueElem.textContent = formatCurrency(totalInventoryValue);
if (outStockElem) outStockElem.textContent = outOfStock;
}
function resetProductForm() {
  document.getElementById("product-form").reset();
  document.getElementById("product-id").value = "";
  document.getElementById("product-form-title").textContent = " Crear Producto";
  clearImageUploads();
}

function clearProductFormImages() {

    const imgInputs = ["product-image1", "product-image2", "product-image3"];
    imgInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) input.value = "";
    });
    

    const previews = ["preview-image-upload-1", "preview-image-upload-2", "preview-image-upload-3"];
    previews.forEach(id => {
        const preview = document.getElementById(id);
        if (preview) {
            preview.removeAttribute("src");
            preview.style.display = "none";
        }
    });

    // Los botones de "quitar imagen" solo tienen sentido mientras haya una
    // imagen puesta — se ocultan junto con la vista previa.
    ["remove-image-1", "remove-image-2", "remove-image-3"].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.style.display = "none";
    });
    

    const fileInputs = ["image-upload-1", "image-upload-2", "image-upload-3"];
    fileInputs.forEach(id => {
        const fileInput = document.getElementById(id);
        if (fileInput) fileInput.value = "";
    });
}

// Quita una sola imagen del formulario (por si el admin se equivocó al
// subir), sin tocar las otras dos ni el resto del producto. Solo limpia
// el estado local del formulario — el borrado real en Storage/Drive (si
// ya se había llegado a subir el archivo) ocurre al guardar, ya que
// actualizarProductoZNR compara contra la imagen anterior y borra la que
// cambió/desapareció.
function removeAdminImage(slot) {
    const textInput = document.getElementById(`product-image${slot}`);
    if (textInput) textInput.value = "";

    const preview = document.getElementById(`preview-image-upload-${slot}`);
    if (preview) {
        preview.removeAttribute("src");
        preview.style.display = "none";
    }

    const removeBtn = document.getElementById(`remove-image-${slot}`);
    if (removeBtn) removeBtn.style.display = "none";

    const fileInput = document.getElementById(`image-upload-${slot}`);
    if (fileInput) fileInput.value = "";

    const progress = document.getElementById(`progress-image-upload-${slot}`);
    if (progress) progress.style.width = "0%";
}
window.removeAdminImage = removeAdminImage;

function fillFormForEdit(product) {

    clearProductFormImages();
    

    document.getElementById("product-id").value = product.ID || "";
    document.getElementById("product-name").value = product.Nombre || "";
    document.getElementById("product-price").value = product.Precio || "";
    document.getElementById("product-stock").value = product.Stock || "";
    document.getElementById("product-description").value = product.Descripcion || "";
    document.getElementById("product-sizes").value = product.Talla || "";
    document.getElementById("product-category").value = product.Categoria || "";
    document.getElementById("product-badge").value = product.Badge || "";
    document.getElementById("product-badge-auto").checked = !!product.BadgeAuto;
    document.getElementById("product-badge").disabled = !!product.BadgeAuto;
    

    const img1 = document.getElementById("product-image1");
    if (img1) img1.value = product.Imagen1 || "";
    
    const img2 = document.getElementById("product-image2");
    if (img2) img2.value = product.Imagen2 || "";
    
    const img3 = document.getElementById("product-image3");
    if (img3) img3.value = product.Imagen3 || "";
    

    document.getElementById("product-form-title").innerHTML = Icon('edit') + " Editar Producto";
    

    if (product.Imagen1) {
        const preview1 = document.getElementById("preview-image-upload-1");
        if (preview1) {
            preview1.src = product.Imagen1;
            preview1.style.display = "block";
        }
        const removeBtn1 = document.getElementById("remove-image-1");
        if (removeBtn1) removeBtn1.style.display = "flex";
    }
    
    if (product.Imagen2) {
        const preview2 = document.getElementById("preview-image-upload-2");
        if (preview2) {
            preview2.src = product.Imagen2;
            preview2.style.display = "block";
        }
        const removeBtn2 = document.getElementById("remove-image-2");
        if (removeBtn2) removeBtn2.style.display = "flex";
    }
    
    if (product.Imagen3) {
        const preview3 = document.getElementById("preview-image-upload-3");
        if (preview3) {
            preview3.src = product.Imagen3;
            preview3.style.display = "block";
        }
        const removeBtn3 = document.getElementById("remove-image-3");
        if (removeBtn3) removeBtn3.style.display = "flex";
    }
    

    // Abrir la tarjeta del formulario automáticamente — antes había que
    // abrirla manualmente después de tocar "Editar" en la tarjeta del
    // producto, aunque los datos ya estuvieran cargados adentro.
    if (typeof window.closeGridTile === 'function') {
        // Si el listado estaba abierto, se cierra primero — ambas tarjetas
        // expandidas a la vez se superponen (las dos usan position:fixed
        // pantalla completa).
        window.closeGridTile('admin-list-section', 'list-products-body');
    }
    if (typeof window.openGridTile === 'function') {
        window.openGridTile('admin-create-section', 'create-product-body');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function handleProductFormSubmit(e) {
  e.preventDefault();
  if (!adminSession) { showTemporaryMessage(" Sesión no válida", "error"); return; }

  // ▼▼▼ ESTAS 4 LÍNEAS SON LO ÚNICO NUEVO ▼▼▼
  if (!tienePermiso("productos-escribir")) {
    showTemporaryMessage("Tu rol no puede modificar el catálogo", "error");
    return;
  }
  // ▲▲▲ FIN DE LO NUEVO ▲▲▲

  if (window.hasPendingImageUploads && window.hasPendingImageUploads()) {
    showTemporaryMessage(" Espera a que terminen de subir las imágenes...", "error");
    return;
  }
if (window.znrSubirPendientes) {
  try { await window.znrSubirPendientes(); } catch (err) { showTemporaryMessage("Error subiendo imágenes: " + err.message, "error"); return; }
}
const id = document.getElementById("product-id").value;
const data = {
Nombre: document.getElementById("product-name").value.trim(),
Precio: Number(document.getElementById("product-price").value || 0),
Stock: Number(document.getElementById("product-stock").value || 0),
Descripcion: document.getElementById("product-description").value.trim(),
Talla: document.getElementById("product-sizes").value.trim(),
Categoria: document.getElementById("product-category").value.trim(),
Badge: document.getElementById("product-badge").value,
BadgeAuto: document.getElementById("product-badge-auto").checked,
Imagen1: document.getElementById("product-image1").value.trim(),
Imagen2: document.getElementById("product-image2").value.trim(),
Imagen3: document.getElementById("product-image3").value.trim(),
};
if ((sessionStorage.getItem("admin_rol") || "master") === "master") {
  data.pais = document.getElementById("product-pais")?.value || "";
  data.ciudad = document.getElementById("product-ciudad")?.value || "";
}
if (!data.Nombre) {
await showCustomAlert({
title: " Campo requerido",
message: "El nombre del producto es obligatorio.",
icon: "",
confirmText: "Aceptar"
});
return;
}
showLoader(id ? "Actualizando producto..." : "Creando producto...");
try {
let res;
if (id) {
res = await apiRequest("POST", { action: "update", id, ...data });
} else {
res = await apiRequest("POST", { action: "create", ...data });
}
if (!res || !res.ok) {
throw new Error(res?.error || "Error desconocido");
}
resetProductForm();
clearImageUploads();
await loadAdminProducts();
await showCustomAlert({
title: id ? " Producto actualizado" : " Producto creado",
message: id ? "El producto se ha actualizado correctamente." : "El producto se ha creado correctamente.",
icon: "",
confirmText: "Aceptar"
});
} catch (err) {
console.error(err);
await showCustomAlert({
title: " Error",
message: "Error al guardar el producto: " + err.message,
icon: "",
confirmText: "Aceptar"
});
} finally {
hideLoader();
}
}
async function deleteProduct(id) {
  if (!adminSession) { showTemporaryMessage(" Sesión no válida", "error"); return; }

  // ▼▼▼ ESTAS 4 LÍNEAS SON LO ÚNICO NUEVO ▼▼▼
  if (!tienePermiso("productos-escribir")) {
    showTemporaryMessage("Tu rol no puede eliminar productos", "error");
    return;
  }
const confirmDelete = await new Promise((resolve) => {
showCustomConfirm({
title: "Eliminar producto",
message: "¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.",
icon: "",
confirmText: "Sí, eliminar",
cancelText: "Cancelar",
askReason: true,
reasonPlaceholder: "Motivo de la eliminación (opcional)",
onConfirm: (razon) => resolve(razon === undefined ? "" : razon),
onCancel: () => resolve(null)
});
});
if (confirmDelete === null) return;
showLoader("Eliminando producto...");
try {
await apiRequest("POST", { action: "delete", id, razon: confirmDelete });
await loadAdminProducts();
} catch (err) {
console.error(err);
} finally  {
hideLoader();
}
}
let _imageUploadsInitialized = false;
function initImageUploads(force = false) {
if (_imageUploadsInitialized && !force) { return; }
_imageUploadsInitialized = true;
setupImageUpload("image-upload-1", "product-image1", "preview-image-upload-1", "progress-image-upload-1");
setupImageUpload("image-upload-2", "product-image2", "preview-image-upload-2", "progress-image-upload-2");
setupImageUpload("image-upload-3", "product-image3", "preview-image-upload-3", "progress-image-upload-3");
}


function setupImageUpload(fileInputId, textInputId, previewId, progressId) {
    const fileInput = document.getElementById(fileInputId);
    if (!fileInput) return;

    const newListener = async function(e) {
        const files = this.files;
        if (!files || files.length === 0) { return; }

        // Extraer el número de slot del id (ej: image-upload-1 → slot 1)
        const slotMatch = fileInputId.match(/\d+$/);
        const startSlot = slotMatch ? parseInt(slotMatch[0]) : 1;

        // Mostrar el botón de "quitar" en cuanto se eligen archivos, en los
        // mismos slots donde uploadImagesInQueue va a pintar la miniatura
        // (startSlot, startSlot+1, ... hasta el slot 3 como tope).
        const numSlots = Math.min(files.length, 3 - startSlot + 1);
        for (let i = 0; i < numSlots; i++) {
            const btn = document.getElementById(`remove-image-${startSlot + i}`);
            if (btn) btn.style.display = "flex";
        }

        // Función de subida para admin (usa token de admin)
        const adminUploadFn = async (file, slot) => {
            // Quitar fondo (bg-remove.js): si está activo, devuelve la foto con fondo blanco; si no, la original
            if (typeof window.znrPreprocesarFoto === 'function') {
                try { file = await window.znrPreprocesarFoto(file, slot); } catch (e) { console.error(e); }
            }
            // Usamos la función existente uploadImageToDrive que ya tiene la lógica de compresión y token
            return await uploadImageToDrive(file);
        };

        // Callback para actualizar el progreso (opcional)
        const onProgress = (slot, percent) => {
            const prog = document.getElementById(`progress-image-upload-${slot}`);
            if (prog) prog.style.width = percent + '%';
        };

        // Callback para cuando se sube una imagen (puede ser útil)
        const onSuccess = (slot, url) => {
            // Ya se actualiza el campo de texto dentro de uploadImagesInQueue
            // Pero podemos hacer algo adicional si queremos
        };

        // Llamar a la función central
        await window.uploadImagesInQueue(files, startSlot, adminUploadFn, onProgress, onSuccess);
        // Limpiar input para permitir nueva selección
        this.value = '';
    };

    fileInput._listener = newListener;
    fileInput.onchange = newListener;
}

async function compressImage(file) {
return new Promise((resolve) => {
const img = new Image();
const reader = new FileReader();
reader.onload = e => img.src = e.target.result;
img.onload = () => {
const canvas = document.createElement("canvas");
const MAX = 1200;
let w = img.width, h = img.height;
if (w >MAX || h >MAX) {
if (w > h) {
h *= MAX / w;
w = MAX;
} else {
w *= MAX / h;
h = MAX;
}
}
canvas.width = w;
canvas.height = h;
const ctx = canvas.getContext("2d");
ctx.drawImage(img, 0, 0, w, h);
resolve(canvas.toDataURL("image/jpeg", 0.8));
};
reader.readAsDataURL(file);
});
}
async function uploadImageToDrive(file) {
    const dataUrl = await compressImage(file); // data:image/jpeg;base64,....
    const base64 = dataUrl.split(',')[1];
    const fileName = (file.name || 'imagen').replace(/\.[^.]+$/, '') + '.jpg';
    const result = await apiRequest('POST', {
        action: 'uploadImage',
        data: base64,
        mimeType: 'image/jpeg',
        fileName: fileName
    });
    if (!result || !result.ok) throw new Error((result && result.error) || 'Error al subir la imagen');
    return result.url;
}
function clearImageUploads() {
  const previews = document.querySelectorAll(".image-preview");
  previews.forEach(img => {
    img.removeAttribute("src");
    img.style.display = "none";
  });
  const progressBars = document.querySelectorAll(".upload-progress");
  progressBars.forEach(bar => {
    if (bar) bar.style.width = "0%";
  });
    const fileInputs = document.querySelectorAll("input[type=file]");
  fileInputs.forEach(input => {
    if (input) input.value = "";
  });
    const imageTextInputs = ["product-image1", "product-image2", "product-image3"];
  imageTextInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
    document.querySelectorAll(".admin-remove-img-btn").forEach(btn => {
        btn.style.display = "none";
    });
    const extraPreviews = document.querySelectorAll(".custom-preview"); 
  extraPreviews.forEach(preview => {
    preview.style.backgroundImage = "none";
  });
}

async function checkNotifications() {
  try {
    const token = getAdminToken();
    const VENDEDORES_API_BADGES = window.VENDEDORES_API_URL;
    const CATALOGO_API_BADGES = window.CATALOGO_API_URL;
    const BENEFICIARIOS_API_BADGES = window.BENEFICIARIOS_API_URL;
    const LIVE_API_BADGES = window.LIVE_API_URL;

    const TIENDA_API_BADGES = window.TIENDA_ZNR_API_URL;
    const PEDIDOS_API_BADGES = window.PEDIDOS_API_URL;
    const VENTAS_API_BADGES = window.VENTAS_API_URL;
    const HISTORIAS_API_BADGES = window.HISTORIAS_API_URL;
    const [gasRes, vendRes, pendRes, repRes, benRes, benRepRes, plusRes, liveRes, pedRepRes, fbRes, histRepRes] = await Promise.all([
      apiFetch(TIENDA_API_BADGES, { action: 'notificationsBatch', page: 1, pageSize: 500, token })
        .then(r => r.json())
        .then(d => ({ ok: d.ok, solicitudes: d.ok ? (d.groups || []).filter(g => g.availableCount > 0).length : 0 }))
        .catch(() => ({ ok: false })),
      apiFetch(VENDEDORES_API_BADGES, { action: 'vendedoresAdmin', token }).then(r => r.json()).catch(() => ({ ok: false })),
      apiFetch(CATALOGO_API_BADGES, { action: 'productosPendientes', token }).then(r => r.json()).catch(() => ({ ok: false })),
      apiFetch(CATALOGO_API_BADGES, { action: 'obtenerReportes', token }).then(r => r.json()).catch(() => ({ ok: false })),
      apiFetch(BENEFICIARIOS_API_BADGES, { action: 'obtenerBeneficiarios', estado: 'pendiente', token }).then(r => r.json()).catch(() => ({ ok: false })),
      apiFetch(BENEFICIARIOS_API_BADGES, { action: 'obtenerReportesBeneficiarios', token }).then(r => r.json()).catch(() => ({ ok: false })),
      apiFetch(VENDEDORES_API_BADGES, { action: 'solicitudesPlus', token }).then(r => r.json()).catch(() => ({ ok: false })),
      apiFetch(LIVE_API_BADGES, { action: 'obtenerReportesLive', token }).then(r => r.json()).catch(() => ({ ok: false })),
      apiFetch(PEDIDOS_API_BADGES, { action: 'obtenerReportesPedido', token }).then(r => r.json()).catch(() => ({ ok: false })),
      apiFetch(VENTAS_API_BADGES, { action: 'listarFeedback', estado: 'abiertos', token }).then(r => r.json()).catch(() => ({ ok: false })),
      apiFetch(HISTORIAS_API_BADGES, { action: 'obtenerReportesHistorias', token }).then(r => r.json()).catch(() => ({ ok: false })),
    ]);

    const vendors = vendRes.ok ? (vendRes.vendors || []) : [];
    const data = {
      ok: true,
      solicitudes: gasRes.ok ? gasRes.solicitudes : 0,
      vendors: vendors.filter(v => v.estado === 'pendiente' || v.resetSolicitado).length,
      pending: pendRes.ok ? (pendRes.products || []).length : 0,
      reportes: repRes.ok ? (repRes.reportes || []).length : 0,
      plus: plusRes.ok ? (plusRes.solicitudes || []).length : 0,
      beneficiarios: benRes.ok ? (benRes.beneficiarios || []).length + (benRepRes.ok ? (benRepRes.reportes || []).length : 0) : 0,
      reportesLive: liveRes.ok ? (liveRes.reportes || []).length : 0,
      reportesPedidos: pedRepRes.ok ? (pedRepRes.reportes || []).length : 0,
      reportesHistorias: histRepRes.ok ? (histRepRes.reportes || []).length : 0,
      feedback: fbRes.ok ? (fbRes.items || []).length : 0,
    };
    data.total = data.solicitudes + data.vendors + data.pending + data.reportes + data.plus + data.beneficiarios + data.reportesLive + data.reportesPedidos + data.reportesHistorias + data.feedback;
    if (!data.ok) return;
 
    const count = data.solicitudes;
    const badge = document.getElementById("notif-badge");
    if (badge) {
      badge.textContent = data.total > 0 ? data.total : '0';
      if (data.total > 0) {
        badge.classList.add('has-notifs');
        badge.style.animation = "pulse 0.5s ease";
        setTimeout(() => { if (badge) badge.style.animation = ""; }, 500);
      } else {
        badge.classList.remove('has-notifs');
      }
    }
    if (count > lastNotifCount && count > 0 && adminSession) {
      const bell = document.querySelector(".admin-notification-bell");
      if (bell) {
        bell.style.transform = "scale(1.05)";
        bell.style.boxShadow = "0 0 20px rgba(255,79,129,0.6)";
        setTimeout(() => { if (bell) { bell.style.transform = ""; bell.style.boxShadow = ""; } }, 1000);
      }
    }
    lastNotifCount = count;
 
    if (typeof window._updateNotifTabBadge === 'function') {
      window._updateNotifTabBadge('solicitudes', data.solicitudes);
      window._updateNotifTabBadge('vendors', data.vendors);
      window._updateNotifTabBadge('pending', data.pending);
      window._updateNotifTabBadge('reportes', data.reportes);
      window._updateNotifTabBadge('reportes_live', data.reportesLive);
      window._updateNotifTabBadge('reportes_pedidos', data.reportesPedidos);
      window._updateNotifTabBadge('reportes_historias', data.reportesHistorias);
      window._updateNotifTabBadge('feedback', data.feedback);
    }
    const secBadge = document.getElementById('notif-badge-header');
    if (secBadge) { secBadge.textContent = data.total; secBadge.style.display = data.total > 0 ? 'inline' : 'none'; }
 
    setBadge('notif-panel-solicitudes-count', data.solicitudes);
    setBadge('notif-panel-vendors-count',  data.vendors);
    setBadge('notif-panel-pending-count',  data.pending);
    setBadge('notif-panel-reportes-count', data.reportes);
    setBadge('notif-panel-plus-count',     data.plus);
    setBadge('notif-panel-beneficiarios-count', data.beneficiarios);
    setBadge('notif-panel-reportes-live-count', data.reportesLive);
    setBadge('notif-panel-reportes-pedidos-count', data.reportesPedidos);
    setBadge('notif-panel-reportes-historias-count', data.reportesHistorias);
    setBadge('notif-panel-feedback-count', data.feedback);
    window.actualizarContadoresHerramientas?.();
 
  } catch(err) {
    reportError('admin-badges', err);
  }
}
 
let _adminNotifPushWired = false;
function startNotificationMonitoring() {
  if (notificationInterval) notificationInterval.stop();
  checkNotifications();

  // 🔧 Push ya cubre esto en tiempo real (enviarPushA('admin', ...) dispara
  // znr-nueva-notificacion en todas las pestañas admin abiertas). El poll
  // fijo ahora es solo una red de seguridad ante push perdido, no la vía
  // principal de actualización — de ahí que baje de 45s a 3 min.
  if (!_adminNotifPushWired) {
    _adminNotifPushWired = true;
    window.addEventListener('znr:nueva-notificacion', checkNotifications);
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'znr-nueva-notificacion') checkNotifications();
      });
    }
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) checkNotifications();
    });
  }

  notificationInterval = intervalConJitter(checkNotifications, 180000, 20000); // 🔧 red de seguridad: 3 min ±0-20s
}
function stopNotificationMonitoring() {
  if (notificationInterval) {
    if (notificationInterval) notificationInterval.stop();
    notificationInterval = null;
  }
}
function openNotifications() {
window.location.href = "notificaciones.html";
}
document.addEventListener("DOMContentLoaded", () => {
const loginForm = document.getElementById("admin-login-form");
if (loginForm) loginForm.addEventListener("submit", handleAdminLogin);
const loginFormCuenta = document.getElementById("admin-login-form-cuenta");
if (loginFormCuenta) loginFormCuenta.addEventListener("submit", handleAdminLoginCuenta);
const switchCuenta = document.getElementById("login-switch-cuenta");
const switchMaster = document.getElementById("login-switch-master");
const loginTitle = document.getElementById("login-view-title");
if (switchCuenta && switchMaster && loginForm && loginFormCuenta) {
function _mostrarLogin(rolElegido) {
const esMaster = rolElegido === "master";
loginForm.style.display = esMaster ? "" : "none";
loginFormCuenta.style.display = esMaster ? "none" : "";
switchMaster.classList.toggle("is-active", esMaster);
switchCuenta.classList.toggle("is-active", !esMaster);
if (loginTitle) loginTitle.textContent = esMaster ? "Master" : "Admin / Moderador";
}
switchCuenta.addEventListener("click", () => _mostrarLogin("cuenta"));
switchMaster.addEventListener("click", () => _mostrarLogin("master"));
_mostrarLogin("cuenta");
}
const bioUnlockBtn = document.getElementById("biometric-unlock-btn");
const bioUsePasswordBtn = document.getElementById("biometric-use-password-btn");
if (bioUnlockBtn) {
bioUnlockBtn.addEventListener("click", async () => {
bioUnlockBtn.disabled = true;
bioUnlockBtn.textContent = "Verificando…";
const ok = await _pedirDesbloqueoBiometrico();
if (ok) {
document.getElementById("biometric-unlock-card").hidden = true;
_continuarConSesionGuardada();
} else {
bioUnlockBtn.disabled = false;
bioUnlockBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" aria-hidden="true"><use href="#ic-lock"/></svg> Desbloquear con huella';
}
});
}
if (bioUsePasswordBtn) {
bioUsePasswordBtn.addEventListener("click", () => {
_borrarSesionDelDispositivo();
document.getElementById("biometric-unlock-card").hidden = true;
const loginFormsCard = document.getElementById("login-forms-card");
if (loginFormsCard) loginFormsCard.hidden = false;
});
}
const crearAdminForm = document.getElementById("crear-admin-form");
if (crearAdminForm) crearAdminForm.addEventListener("submit", handleCrearAdminSubmit);
const cambiarPasswordForm = document.getElementById("cambiar-password-form");
if (cambiarPasswordForm) cambiarPasswordForm.addEventListener("submit", handleCambiarPasswordSubmit);
const datosBancariosForm = document.getElementById("datos-bancarios-form");
if (datosBancariosForm) datosBancariosForm.addEventListener("submit", handleDatosBancariosSubmit);
const btnDesactivarHuella = document.getElementById("btn-desactivar-huella");
if (btnDesactivarHuella) {
if (localStorage.getItem("biometric_enabled") === "true") btnDesactivarHuella.style.display = "";
btnDesactivarHuella.addEventListener("click", () => {
localStorage.removeItem("biometric_enabled");
localStorage.removeItem("biometric_credential_id");
btnDesactivarHuella.style.display = "none";
showTemporaryMessage(" Huella desactivada en este dispositivo", "success");
});
}
const nuevoAdminPais = document.getElementById("nuevo-admin-pais");
const nuevoAdminCiudad = document.getElementById("nuevo-admin-ciudad");
if (nuevoAdminPais && nuevoAdminCiudad && typeof enlazarPaisCiudad === "function") {
enlazarPaisCiudad(nuevoAdminPais, nuevoAdminCiudad);
}
const logoutBtn = document.getElementById("admin-logout-btn");
if (logoutBtn) {
const newLogoutBtn = logoutBtn.cloneNode(true);
logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);
newLogoutBtn.addEventListener("click", (e) => {
e.preventDefault();
e.stopPropagation();
doAdminLogout();
});
}
const productForm = document.getElementById("product-form");
if (productForm) productForm.addEventListener("submit", handleProductFormSubmit);

// Mientras haya imágenes subiéndose, bloquear el botón de "Guardar Producto"
// para evitar guardar el producto con campos de imagen aún vacíos.
if (productForm) {
const submitBtn = productForm.querySelector('button[type="submit"]');
if (submitBtn) {
const originalLabel = submitBtn.innerHTML;
window.addEventListener('znr:uploads-status', (e) => {
  const pending = e.detail.pending > 0;
  submitBtn.disabled = pending;
  submitBtn.style.opacity = pending ? '0.6' : '';
  submitBtn.style.cursor = pending ? 'not-allowed' : '';
  if (pending) {
    submitBtn.dataset.originalLabel = submitBtn.dataset.originalLabel || originalLabel;
    submitBtn.innerHTML = ' Subiendo imágenes...';
  } else if (submitBtn.dataset.originalLabel) {
    submitBtn.innerHTML = submitBtn.dataset.originalLabel;
  }
});
}
}
const resetBtn = document.getElementById("reset-form-btn");
if (resetBtn) resetBtn.addEventListener("click", resetProductForm);
const refreshBtn = document.getElementById("admin-refresh-btn");
if (refreshBtn) refreshBtn.addEventListener("click", loadAdminProducts);
const adminSearch = document.getElementById("admin-search-input");
const adminCategory = document.getElementById("admin-category-filter");
const adminStock = document.getElementById("admin-stock-filter");
if (adminSearch) {
adminSearch.addEventListener("input", () => {
adminCurrentPage = 1;
renderAdminProductsWithFilters();
});
}
if (adminCategory) {
adminCategory.addEventListener("change", () => {
adminCurrentPage = 1;
renderAdminProductsWithFilters();
});
}
if (adminStock) {
adminStock.addEventListener("change", () => {
adminCurrentPage = 1;
renderAdminProductsWithFilters();
});
}
// Si esta pestaña no tiene sesión pero el dispositivo sí tiene una
// guardada (localStorage), la restauramos antes de decidir qué mostrar.
// Así la sesión sobrevive a cerrar la página/el navegador.
if (!sessionStorage.getItem("admin_session") && localStorage.getItem("admin_session") === "true") {
LS_SESSION_KEYS.forEach((k) => {
const v = localStorage.getItem(k);
if (v !== null) sessionStorage.setItem(k, v);
});
}
const hasSession = sessionStorage.getItem("admin_session");
const savedToken = getAdminToken();
const savedRol = sessionStorage.getItem("admin_rol") || "master";
function _forceAdminLogout() {
document.documentElement.classList.remove("has-session");
_imageUploadsInitialized = false;
sessionStorage.removeItem("admin_session");
sessionStorage.removeItem("admin_token");
sessionStorage.removeItem("admin_rol");
sessionStorage.removeItem("admin_ciudad");
sessionStorage.removeItem("admin_nombre");
_borrarSesionDelDispositivo();
adminSession = null;
}
async function _continuarConSesionGuardada() {
try {
let sesionValida = false;
if (savedRol === "master") {
const apiUrl = resolverApiUrlAdmin("verificarAdmin");
if (!apiUrl) { _forceAdminLogout(); return; }
const res = await apiFetch(apiUrl, { action: "verificarAdmin", token: savedToken });
const data = await res.json();
sesionValida = !!(data && (data.valid === true || data.ok === true));
} else {
const data = await apiRequest("GET", { action: "verificarSesionAdmin" });
sesionValida = !!(data && data.ok);
if (sesionValida) {
sessionStorage.setItem("admin_rol", data.rol || savedRol);
sessionStorage.setItem("admin_ciudad", data.ciudad || "");
}
}

if (sesionValida) {
adminSession = "ok";
_irADestinoPendiente();
document.getElementById("admin-login-view").hidden = true;
document.getElementById("admin-panel-view").hidden = false;
setTimeout(() => {
  initImageUploads();
  loadAdminProducts();
  startNotificationMonitoring();
  initAdminViewToggle();
  aplicarVisibilidadPorRol();
  window.dispatchEvent(new CustomEvent('adminReady'));
}, 200);
} else {
_forceAdminLogout();
showTemporaryMessage(" Sesión expirada, inicia sesión de nuevo", "error");
}
} catch(e) {

console.warn("No se pudo verificar sesión con el servidor, confiando en sessionStorage:", e);
adminSession = "ok";
_irADestinoPendiente();
document.getElementById("admin-login-view").hidden = true;
document.getElementById("admin-panel-view").hidden = false;
initImageUploads();
loadAdminProducts();
startNotificationMonitoring();
initAdminViewToggle();
aplicarVisibilidadPorRol();
window.dispatchEvent(new CustomEvent('adminReady'));
}
}
if (hasSession === "true" && savedToken && document.getElementById("admin-panel-view")) {
if (localStorage.getItem("biometric_enabled") === "true") {
// Hay huella activada en este dispositivo: pedimos el desbloqueo
// ANTES de restaurar la sesión, en vez de entrar directo.
const loginFormsCard = document.getElementById("login-forms-card");
const bioCard = document.getElementById("biometric-unlock-card");
if (loginFormsCard) loginFormsCard.hidden = true;
if (bioCard) bioCard.hidden = false;
} else {
_continuarConSesionGuardada();
}
} else if (hasSession === "true" && !savedToken) {
_forceAdminLogout();
}
});
function doAdminLogout() {
stopNotificationMonitoring();
adminSession = null;
sessionStorage.removeItem("admin_session");
sessionStorage.removeItem("admin_token");
sessionStorage.removeItem("admin_rol");
sessionStorage.removeItem("admin_ciudad");
sessionStorage.removeItem("admin_nombre");
_borrarSesionDelDispositivo();
const loginView = document.getElementById("admin-login-view");
const panelView = document.getElementById("admin-panel-view");
if (loginView) loginView.hidden = false;
if (panelView) panelView.hidden = true;
const loginForm = document.getElementById("admin-login-form");
if (loginForm) loginForm.reset();
  location.reload();
}

function applyCategoryBadgeScroll() {
 const badges = document.querySelectorAll('.admin-card-badge-cat');
 badges.forEach(badge => {
 const span = badge.querySelector('span');
 if (!span) return;

 span.style.display = 'inline-block';
 span.style.whiteSpace = 'nowrap';
 const needsScroll = span.scrollWidth > badge.clientWidth;
 if (needsScroll) {
 badge.classList.add('scroll');
 } else {
 badge.classList.remove('scroll');
 }
 });
}

let scrollObserver = null;
function initBadgeScrollObserver() {
 if (scrollObserver) scrollObserver.disconnect();
 scrollObserver = new IntersectionObserver((entries) => {
 entries.forEach(entry => {
 if (entry.isIntersecting) {
 const badge = entry.target;
 const span = badge.querySelector('span');
 if (span && span.scrollWidth > badge.clientWidth) {
 badge.classList.add('scroll');
 } else {
 badge.classList.remove('scroll');
 }

 }
 });
 }, { threshold: 0.1 });

 document.querySelectorAll('.admin-card-badge-cat').forEach(badge => {
 scrollObserver.observe(badge);
 });
}

let resizeTimeout;
function handleResizeForBadges() {
 clearTimeout(resizeTimeout);
 resizeTimeout = setTimeout(() => {
 applyCategoryBadgeScroll();

 if (scrollObserver) {
 scrollObserver.disconnect();
 initBadgeScrollObserver();
 }
 }, 200);
}

window.addEventListener('load', () => {
 applyCategoryBadgeScroll();
 initBadgeScrollObserver();
 window.addEventListener('resize', handleResizeForBadges);
});

window.handleAdminLogin  = handleAdminLogin;
window.doAdminLogout  = doAdminLogout;
window.openNotifications  = openNotifications;
window.handleProductFormSubmit = handleProductFormSubmit;
window.deleteProduct  = deleteProduct;
window.resetProductForm  = resetProductForm;
window.clearImageUploads  = clearImageUploads;
window.loadAdminProducts  = loadAdminProducts;
window.initImageUploads  = initImageUploads;
window.uploadImageToDrive = uploadImageToDrive;
window.cargarEstadisticasStaff = cargarEstadisticasStaff;
window.setStatsRolFiltro = setStatsRolFiltro;
window.setStatsMetrica = setStatsMetrica;
window.setStatsCiudadFiltro    = setStatsCiudadFiltro;  
})();
