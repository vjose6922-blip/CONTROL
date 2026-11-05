// ── Origen de datos ─────────────────────────────────────────────
// ADMIN_API_URL_ADMIN ya expone obtenerEstadisticasStaff (datos
// agregados, es lo que usa la gráfica de Chart.js en index.html).
// Este panel necesita el detalle fila-por-fila de cada acción, que
// todavía no se confirmó que exista en Firestore/admin-api. Se
// intenta primero "obtenerAuditoriaStaff" (nombre propuesto, hay
// que confirmarlo o crearlo en el backend); si no existe o falla,
// se cae a los datos de ejemplo de abajo para que el panel siga
// siendo usable mientras tanto.
const ADMIN_API_URL_AUDIT = "https://admin-api-1038143238323.us-central1.run.app";

// Mismos nombres legibles que usa admin.js para el campo `tipo` de
// staff_actividad. Lo que no esté aquí se muestra tal cual llega.
const TIPO_LABELS = {
    aprobarVendedor: "Aprobar vendedor", rechazarVendedor: "Rechazar vendedor",
    resetPasswordVendedor: "Restablecer contraseña", aprobarCambioTelefono: "Aprobar cambio de teléfono",
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
    actualizarFeedback: "Actualizar feedback de usuario", resetPasswordComprador: "Restablecer contraseña de comprador", saludarRegistroComprador: "Saludar a comprador nuevo", omitirRegistroComprador: "Omitir comprador nuevo", desconocerCuentaComprador: "Cerrar cuenta de comprador no reconocida",
};

// Etiquetas legibles para el tipo de cola pendiente (distinto de
// TIPO_LABELS, que es para acciones ya resueltas).
const PENDIENTE_LABELS = {
    vendedorNuevo: "Alta de vendedor", cambioTelefono: "Cambio de teléfono",
    resetPassword: "Reset de contraseña", solicitudPlus: "Solicitud Plan Plus",
    productoComunidad: "Producto de comunidad", reporteProducto: "Reporte de producto",
    reporteLive: "Reporte de live", reporteHistoria: "Reporte de historia", beneficiarioNuevo: "Alta de beneficiario",
    reporteBeneficiario: "Reporte de beneficiario", solicitudBeneficiario: "Solicitud de beneficiario",
    reportePedido: "Reporte de pedido personalizado", feedback: "Feedback de usuario",
};

// Reportes/feedback abiertos leídos directo de los mismos endpoints que usa el centro de
// notificaciones, para que nada quede fuera aunque el backend de auditoría no lo incluya.
// [api, action, params extra, campo de la respuesta, tipo, fn(r) -> [refId, fecha, ciudad, razón]]
const fmt = (x) => (x ? new Date(x).toLocaleString('sv-SE').slice(0, 16) : '');
const FUENTES_PENDIENTES = [
    ['catalogo', 'obtenerReportes', {}, 'reportes', 'reporteProducto', (r) => [r.reporteId || r.id, r.timestamp, r.ciudad, `${r.nombreProducto || ''}: ${r.motivo || ''}`]],
    ['beneficiarios', 'obtenerReportesBeneficiarios', {}, 'reportes', 'reporteBeneficiario', (r) => [r.id, r.fecha, r.ciudad, `${r.nombre_beneficiario || ''}: ${r.motivo || ''}`]],
    ['live', 'obtenerReportesLive', {}, 'reportes', 'reporteLive', (r) => [r.reporteId, r.timestamp, r.ciudad, `${r.liveTitulo || ''}: ${r.motivo || ''}`]],
    ['pedidos', 'obtenerReportesPedido', {}, 'reportes', 'reportePedido', (r) => [r.reporteId, r.timestamp, r.ciudad, `${r.motivoTexto || r.motivo || ''}${r.detalle ? ': ' + r.detalle : ''}`]],
    ['historias', 'obtenerReportesHistorias', {}, 'reportes', 'reporteHistoria', (r) => [r.historiaId, (r.motivos || [])[0]?.fecha, r.ciudad, (r.motivos || []).map((m) => m.motivo).join(', ')]],
    ['ventas', 'listarFeedback', { estado: 'abiertos' }, 'items', 'feedback', (r) => [r.id, r.fecha, '', `${r.tipo || ''}${r.area ? ' · ' + r.area : ''}: ${r.mensaje || ''}`]],
];
async function leerPendientes(token) {
    const lotes = await Promise.all(FUENTES_PENDIENTES.map(([api, action, extra, campo, tipo, f]) =>
        fetch(`https://${api}-api-1038143238323.us-central1.run.app`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ action, token, ...extra }) })
            .then((r) => r.json()).then((d) => (d.ok ? d[campo] || [] : []).map((r) => { const [ref, fecha, ciudad, razon] = f(r); return ['pend_' + tipo + '_' + ref, fmt(fecha), '', '', ciudad || '', PENDIENTE_LABELS[tipo], ref, 'Pendiente', razon]; }))
            .catch(() => [])));
    return lotes.flat();
}
async function obtenerFilasAuditoria(dias) {
    const token = sessionStorage.getItem("admin_token") || "";
    const params = new URLSearchParams({ action: "obtenerAuditoriaStaff", dias: dias || 30, token });
    const res = await fetch(ADMIN_API_URL_AUDIT + "?" + params.toString());
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    if (!data || !data.ok || !Array.isArray(data.registros)) {
        throw new Error("Respuesta sin 'registros' (revisar contrato del endpoint)");
    }
    // staff_actividad no guarda IP ni un texto de "detalle" libre, así
    // que esa columna del prototipo original no se incluye.
    // Sí guarda ciudad, refId y (desde el backend actualizado) razón
    // — esta última opcional: el staff la escribe si quiere al hacer
    // la acción en admin.js, así que puede venir vacía.
    const resueltas = data.registros.map((r) => [
        r.id, r.fecha, r.usuario, r.rol, r.ciudad, TIPO_LABELS[r.accion] || r.accion, r.refId, r.estado, r.razon || ''
    ]);
    // Lo pendiente (colas que aún nadie resuelve) no vive en
    // staff_actividad, así que sale de `pendientesDetalle` — sin
    // Usuario/Rol asignado todavía (nadie lo ha tomado) y con Estado
    // "Pendiente", para que se pueda filtrar junto con lo Completado
    // en la misma columna en vez de verlo aparte en un resumen.
    // Para los tipos que son un reporte (reporteProducto/reporteLive/reporteHistoria/
    // reporteBeneficiario), `detalle` trae el motivo que escribió quien
    // reportó — se muestra en la misma columna Razón que usan las
    // acciones ya resueltas, aunque acá no la escribió el staff.
    const pendientesDetalle = Array.isArray(data.pendientesDetalle) ? data.pendientesDetalle : [];
    const pendientes = pendientesDetalle.map((p) => [
        'pend_' + p.tipo + '_' + p.refId, p.fecha || '', '', '', p.ciudad, PENDIENTE_LABELS[p.tipo] || p.tipo, p.refId, 'Pendiente', p.detalle || ''
    ]);
    const vistos = new Set(pendientes.map((p) => p[0]));
    pendientes.push(...(await leerPendientes(token)).filter((p) => !vistos.has(p[0])));
    const encabezado = ['ID', 'Fecha', 'Usuario', 'Rol', 'Ciudad', 'Acción', 'Referencia', 'Estado', 'Razón'];
    const filas = [...pendientes, ...resueltas].sort((a, b) => (b[1] || '').localeCompare(a[1] || ''));
    return [encabezado, ...filas];
}

const auditRowsEjemplo = [

    ['ID', 'Fecha', 'Usuario', 'Rol', 'Ciudad', 'Acción', 'Referencia', 'Estado', 'Razón'],

    [1001, '2026-09-24 09:15', 'carlos.mendoza', 'Admin', 'Nuevo Laredo', 'Aprobar vendedor', 'vend_8831', 'Completado', ''],
    [1002, '2026-09-24 10:02', 'laura.gomez', 'Moderador', 'Nuevo Laredo', 'Marcar reporte revisado', 'rep_2210', 'Completado', ''],
    [1003, '2026-09-24 11:45', 'ana.torres', 'Admin', 'Reynosa', 'Aprobar beneficiario', 'ben_0456', 'Completado', ''],
    [1004, '2026-09-24 14:30', 'javier.lopez', 'Moderador', 'Nuevo Laredo', 'Marcar reporte de live revisado', 'live_7781', 'Completado', ''],
    [1005, '2026-09-25 08:00', 'carlos.mendoza', 'Admin', 'Nuevo Laredo', 'Suspender vendedor', 'vend_5502', 'Completado', 'Múltiples reportes de compradores por producto no entregado'],
    [1006, '2026-09-25 09:20', 'laura.gomez', 'Moderador', 'Nuevo Laredo', 'Aprobar producto de comunidad', 'prod_1190', 'Completado', ''],
    ['pend_vendedorNuevo_v_1785838471889', '2026-09-26 07:40', '', '', 'Nuevo Laredo', 'Alta de vendedor', 'v_1785838471889', 'Pendiente', ''],
    ['pend_reporteProducto_rep_1790760462893_nvfobb', '2026-09-27 12:05', '', '', 'Nuevo Laredo', 'Reporte de producto', 'rep_1790760462893_nvfobb', 'Pendiente', 'Otro: No tiene imagen de referencia']

];

let auditRows = auditRowsEjemplo;

// Pinta las filas en el Excel embebido (excel.html en el iframe, mismo origen).
function pintar(filas) {
    const X = document.getElementById('excel').contentWindow.ExcelClone, wb = X.getData(), sh = wb.sheets[0];
    sh.name = 'Registro de Actividades'; sh.formulaCells = new Set();
    sh.cells = {}; filas.forEach((f, r) => f.forEach((v, c) => { sh.cells[r + ',' + c] = { v: v ?? '', fmt: r ? {} : { bold: true } }; }));
    sh.colWidths = filas[0].map((_, c) => Math.min(260, 16 + 7 * Math.max(...filas.map((f) => String(f[c] ?? '').length))));
    sh.freeze = { rows: 1, cols: 0 }; wb.sheets = [sh]; X.setData(wb);
}

// Pinta cuando hay datos Y el Excel ya arrancó, en el orden que lleguen (también si el iframe se recarga).
let datosListos = false;
function pintarSiListo() {
    const sub = document.getElementById('audit-subtitle');
    try { if (datosListos && document.getElementById('excel').contentWindow.ExcelClone?.getData()) pintar(auditRows); }
    catch (err) { console.error(err); sub.textContent = '⚠️ Error al mostrar la tabla: ' + err.message; }
}
window.addEventListener('message', (e) => { if (e.data?.type === 'excel:ready') pintarSiListo(); });

async function arrancar() {
    const subtitle = document.getElementById('audit-subtitle');
    try {
        auditRows = await obtenerFilasAuditoria(30);
    } catch (err) {
        console.warn('No se pudo cargar el registro real de auditoría, usando datos de ejemplo:', err);
        subtitle.textContent = '⚠️ Sin conexión con auditoría — datos de ejemplo';
    }
    datosListos = true;
    pintarSiListo();
}

arrancar();
