// chat-soporte.js — chat en tiempo real moderador→admin→master (RTDB), con
// campanita flotante compartida en index.html/notificaciones.html/Tools.html.
// Nada de Firestore aquí: mensajes y metadata viven en RTDB (mismo motor
// que el chat de los lives). auth.uid de RTDB viene de un custom token que
// entrega admin-api (tokenChatSoporte) — este panel no usaba Firebase Auth
// para nada más.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getDatabase, ref, push, get, onValue, onChildAdded, off } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";

(async function () {
  if (!sessionStorage.getItem("admin_token")) return;

  const API = "https://admin-api-1038143238323.us-central1.run.app";
  const app = initializeApp({
    apiKey: "AIzaSyAaOe_lxLdQtTFCtw2BDR8KZRSafEMkkes",
    authDomain: "znr-live.firebaseapp.com",
    databaseURL: "https://znr-live-default-rtdb.firebaseio.com",
    projectId: "znr-live",
  }, "chat-soporte");
  const db = getDatabase(app);

  async function api(action, extra) {
    const body = Object.assign({ action, token: sessionStorage.getItem("admin_token") }, extra || {});
    try {
      const res = await fetch(API, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(body).toString() });
      return await res.json();
    } catch (e) {
      reportar(action, e);
      return { ok: false, error: "Sin respuesta del servidor (" + action + "): " + (e && e.message ? e.message : e) };
    }
  }

  // Todo error del chat queda en el monitor (ZRMonitor) para verlo en Error Log / devconsole
  function reportar(accion, e) {
    const msg = e && e.message ? e.message : String(e);
    try { if (window.ZRMonitor) window.ZRMonitor.report("error", "chat-soporte", accion, msg, { stack: (e && e.stack) || "" }); } catch (_) {}
    console.error("[chat-soporte] " + accion + ":", e);
  }

  const t = await api("tokenChatSoporte");
  if (!t.ok) return;
  await signInWithCustomToken(getAuth(app), t.customToken);
  const MI = { uid: t.uid, nombre: t.nombre, rol: t.rol };
  if (typeof window.solicitarPermisoNotificacionesSiFalta === "function") {
    window.solicitarPermisoNotificacionesSiFalta("admin", MI.uid); // bucket personal, aparte del general "admin_admin"
  }

  // ---------------------------- UI ----------------------------
  const bell = Object.assign(document.createElement("button"), { id: "chat-soporte-bell", textContent: "💬" });
  bell.style.cssText = "position:fixed;left:16px;bottom:18px;z-index:9999;display:flex;align-items:center;justify-content:center;width:52px;height:52px;border-radius:999px;border:none;background:var(--color-accent-solid,#ff4f81);color:#fff;font-size:20px;box-shadow:var(--shadow-soft,0 8px 24px rgba(0,0,0,.45));cursor:pointer;";
  const panel = Object.assign(document.createElement("div"), { id: "chat-soporte-panel" });
  panel.style.cssText = "position:fixed;left:16px;bottom:80px;z-index:9999;width:320px;max-width:calc(100vw - 32px);max-height:70vh;background:var(--color-surface,#252831);border:1px solid var(--color-border-subtle,rgba(255,255,255,.07));border-radius:var(--radius-lg,18px);box-shadow:var(--shadow-soft,0 8px 24px rgba(0,0,0,.45));display:none;flex-direction:column;overflow:hidden;color:var(--color-text-primary,#dde1e8);";
  // Barra de estado: SIEMPRE visible arriba del panel (los errores no se van solos)
  const statusEl = document.createElement("div");
  statusEl.style.cssText = "display:none;padding:8px 14px;font-size:12px;line-height:1.35;";
  const body = document.createElement("div");
  body.style.cssText = "display:flex;flex-direction:column;flex:1;min-height:0;";
  panel.append(statusEl, body);
  document.body.append(bell, panel);
  let statusTimer = null;
  function estado(msg, tipo) { // tipo: "ok" | "error" | "info"
    clearTimeout(statusTimer);
    if (!msg) { statusEl.style.display = "none"; return; }
    const col = { ok: "#22c55e", error: "#f87171", info: "#60a5fa" }[tipo || "info"];
    statusEl.textContent = (tipo === "error" ? "⚠ " : tipo === "ok" ? "✓ " : "… ") + msg;
    statusEl.style.cssText = "display:block;padding:8px 14px;font-size:12px;line-height:1.35;color:" + col + ";background:rgba(255,255,255,.05);border-bottom:1px solid rgba(255,255,255,.07);";
    if (tipo !== "error") statusTimer = setTimeout(() => { statusEl.style.display = "none"; }, 4000);
  }
  function abrirPanel() { panel.style.display = "flex"; }
  bell.onclick = () => { if (panel.style.display === "flex") { panel.style.display = "none"; } else { abrirPanel(); renderLista(); } };

  const VERSION = "v2-await";
  const chats = {}; // chatId -> valor de chats_soporte/{id}
  let chatAbierto = null; // chatId con listener de mensajes activo

  function renderLista() {
    cerrarMensajes();
    const ids = Object.keys(chats);
    body.innerHTML = '<div style="padding:14px;font-weight:600;border-bottom:1px solid var(--color-border-subtle,rgba(255,255,255,.07))">Chats de soporte <span style="opacity:.4;font-size:10px;font-weight:400">' + VERSION + '</span></div>';
    ids.forEach((id) => {
      const c = chats[id];
      const otros = Object.entries(c.participantes || {}).filter(([uid]) => uid !== MI.uid).map(([, p]) => p.nombre).join(", ");
      const row = Object.assign(document.createElement("div"), { textContent: otros || "…" });
      row.style.cssText = "padding:12px 14px;cursor:pointer;border-bottom:1px solid var(--color-border-subtle,rgba(255,255,255,.07))";
      row.onclick = () => renderChat(id);
      body.appendChild(row);
    });
    if (!ids.length) body.insertAdjacentHTML("beforeend", '<div style="padding:14px;opacity:.6">Sin conversaciones abiertas</div>');
    const nuevo = Object.assign(document.createElement("div"), { textContent: "+ Iniciar chat" });
    nuevo.style.cssText = "padding:12px 14px;cursor:pointer;color:var(--color-accent,#f472b6)";
    nuevo.onclick = iniciarChat;
    body.appendChild(nuevo);
  }

  async function iniciarChat() {
    try {
      estado("Buscando contactos…", "info");
      const r = await api("listarContactosChat");
      if (!r.ok || !r.personas || !r.personas.length) { estado(r.error || "No hay a quién escribirle todavía.", "error"); return; }
      const opciones = r.personas.map((p, i) => `${i + 1}) ${p.nombre} (${p.rol})`).join("\n");
      const resp = await prompt(`¿Con quién? Escribe el número:\n${opciones}`);
      if (resp === null) { estado(""); return; } // canceló
      const idx = Number(resp) - 1;
      const elegido = r.personas[idx];
      if (!elegido) { estado(`"${resp}" no es una opción válida (1 a ${r.personas.length}).`, "error"); return; }

      abrirPanel(); // por si algo lo cerró mientras estaba el modal
      estado(`Creando chat con ${elegido.nombre}…`, "info");
      const c = await api("crearChatSoporte", { destinatarioUid: elegido.uid });
      if (!c.ok) { estado(c.error || "No se pudo crear el chat.", "error"); return; }

      // Chat local de respaldo: se abre YA, sin depender de que RTDB responda a tiempo
      chats[c.chatId] = {
        participantes: { [MI.uid]: { nombre: MI.nombre, rol: MI.rol }, [elegido.uid]: { nombre: elegido.nombre, rol: elegido.rol } },
        estado: "abierto",
      };
      try {
        const snap = await get(ref(db, `chats_soporte/${c.chatId}`));
        if (snap.val()) chats[c.chatId] = snap.val();
      } catch (e) {
        reportar("leerChatCreado", e);
        estado("Chat creado, pero RTDB no dejó leerlo (¿reglas?): " + (e && e.message ? e.message : e), "error");
      }
      renderChat(c.chatId);
    } catch (e) {
      reportar("iniciarChat", e);
      abrirPanel();
      estado("Error al iniciar chat: " + (e && e.message ? e.message : e), "error");
    }
  }

  function renderChat(id) {
    cerrarMensajes();
    chatAbierto = id;
    const c = chats[id];
    if (!c) { estado("No se pudo abrir el chat, intenta de nuevo.", "error"); renderLista(); return; }
    abrirPanel();
    const rangoMio = { moderador: 1, admin: 2, master: 3 }[MI.rol];
    const rangoMax = Math.max(...Object.values(c.participantes).map((p) => ({ moderador: 1, admin: 2, master: 3 }[p.rol])));
    body.innerHTML = `
      <div style="padding:10px 14px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--color-border-subtle,rgba(255,255,255,.07))">
        <span style="cursor:pointer" id="cs-volver">← Volver</span>
        <span>
          <button id="cs-agregar" style="background:none;border:none;color:var(--color-info,#60a5fa);cursor:pointer">+ agregar</button>
          ${rangoMio >= rangoMax ? '<button id="cs-finalizar" style="background:none;border:none;color:var(--color-error,#f87171);cursor:pointer">Finalizar</button>' : ""}
        </span>
      </div>
      <div id="cs-mensajes" style="flex:1;overflow-y:auto;padding:10px 14px;display:flex;flex-direction:column;gap:6px;max-height:40vh"></div>
      <div style="display:flex;border-top:1px solid var(--color-border-subtle,rgba(255,255,255,.07))">
        <input id="cs-input" placeholder="Escribe…" style="flex:1;border:none;background:transparent;color:inherit;padding:10px 14px;outline:none">
        <button id="cs-enviar" style="border:none;background:none;color:var(--color-accent,#f472b6);padding:0 14px;cursor:pointer">Enviar</button>
      </div>`;
    body.querySelector("#cs-volver").onclick = renderLista;
    body.querySelector("#cs-agregar").onclick = () => agregarParticipante(id);
    const finBtn = body.querySelector("#cs-finalizar");
    if (finBtn) finBtn.onclick = () => finalizar(id);
    const input = body.querySelector("#cs-input");
    const enviar = () => {
      const texto = input.value.trim();
      if (!texto) return;
      push(ref(db, `chats_soporte/${id}/mensajes`), { uid: MI.uid, nombre: MI.nombre, texto, ts: Date.now() })
        .catch((e) => { reportar("enviarMensaje", e); estado("No se pudo enviar: " + (e && e.message ? e.message : e), "error"); });
      input.value = "";
    };
    body.querySelector("#cs-enviar").onclick = enviar;
    input.onkeydown = (e) => { if (e.key === "Enter") enviar(); };

    const cont = body.querySelector("#cs-mensajes");
    const otrosNombres = Object.entries(c.participantes || {}).filter(([uid]) => uid !== MI.uid).map(([, p]) => p.nombre).join(", ");
    cont.innerHTML = `<div style="opacity:.6;font-size:12px;text-align:center">Chat con ${otrosNombres.replace(/</g, "&lt;")} — escribe abajo</div>`;
    onChildAdded(ref(db, `chats_soporte/${id}/mensajes`), (snap) => {
      const m = snap.val();
      const linea = document.createElement("div");
      linea.style.cssText = `align-self:${m.uid === MI.uid ? "flex-end" : "flex-start"};background:${m.uid === MI.uid ? "var(--color-accent-soft,rgba(244,114,182,.15))" : "var(--color-bg,#1e2128)"};padding:6px 10px;border-radius:var(--radius-md,12px);max-width:85%`;
      const quien = document.createElement("div");
      quien.style.cssText = "font-size:11px;opacity:.6";
      quien.textContent = m.nombre;
      const txt = document.createElement("div");
      txt.textContent = m.texto; // textContent: un mensaje con HTML no se ejecuta
      linea.append(quien, txt);
      cont.appendChild(linea);
      cont.scrollTop = cont.scrollHeight;
    }, (e) => { reportar("leerMensajes", e); estado("No se pueden leer los mensajes: " + (e && e.message ? e.message : e), "error"); });
  }

  async function agregarParticipante(id) {
    const r = await api("listarContactosChat");
    if (!r.ok || !r.personas.length) { estado(r.error || "No hay nadie más para agregar.", "error"); return; }
    const opciones = r.personas.map((p, i) => `${i + 1}) ${p.nombre} (${p.rol})`).join("\n");
    const idx = Number(await prompt(`¿A quién agregas?\n${opciones}`)) - 1;
    const elegido = r.personas[idx];
    if (!elegido) { estado("Opción no válida.", "error"); return; }
    const res = await api("agregarParticipanteChat", { chatId: id, uidNuevo: elegido.uid });
    if (!res.ok) estado(res.error, "error"); else estado(`${elegido.nombre} agregado al chat`, "ok");
  }

  async function finalizar(id) {
    if (!(await confirm("¿Finalizar este chat? Se eliminará en 7 días."))) return;
    const res = await api("finalizarChatSoporte", { chatId: id });
    if (!res.ok) estado(res.error, "error"); else estado("Chat finalizado", "ok");
  }

  function cerrarMensajes() {
    if (chatAbierto) off(ref(db, `chats_soporte/${chatAbierto}/mensajes`));
    chatAbierto = null;
  }

  // ---------------------------- Índice de mis chats (campanita) ----------------------------
  const escuchando = new Set();
  onValue(ref(db, `chats_soporte_index/${MI.uid}`), (snap) => {
    const ids = Object.keys(snap.val() || {});
    ids.forEach((id) => {
      if (escuchando.has(id)) return;
      escuchando.add(id);
      onValue(ref(db, `chats_soporte/${id}`), (s) => {
        const val = s.val();
        if (!val) { delete chats[id]; } else { chats[id] = val; }
        const abiertos = Object.values(chats).filter((c) => c.estado === "abierto").length;
        bell.textContent = abiertos ? `💬 ${abiertos}` : "💬";
        if (panel.style.display === "flex" && !chatAbierto) renderLista();
      }, (e) => { reportar("escucharChat", e); });
    });
  });
})();
