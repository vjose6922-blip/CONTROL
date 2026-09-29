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
    const res = await fetch(API, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(body).toString() });
    return res.json();
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
  document.body.append(bell, panel);
  bell.onclick = () => { panel.style.display = panel.style.display === "flex" ? "none" : "flex"; if (panel.style.display === "flex") renderLista(); };

  const chats = {}; // chatId -> valor de chats_soporte/{id}
  let chatAbierto = null; // chatId con listener de mensajes activo

  function renderLista() {
    cerrarMensajes();
    const ids = Object.keys(chats);
    panel.innerHTML = '<div style="padding:14px;font-weight:600;border-bottom:1px solid var(--color-border-subtle,rgba(255,255,255,.07))">Chats de soporte</div>';
    ids.forEach((id) => {
      const c = chats[id];
      const otros = Object.entries(c.participantes || {}).filter(([uid]) => uid !== MI.uid).map(([, p]) => p.nombre).join(", ");
      const row = Object.assign(document.createElement("div"), { textContent: otros || "…" });
      row.style.cssText = "padding:12px 14px;cursor:pointer;border-bottom:1px solid var(--color-border-subtle,rgba(255,255,255,.07))";
      row.onclick = () => renderChat(id);
      panel.appendChild(row);
    });
    if (!ids.length) panel.insertAdjacentHTML("beforeend", '<div style="padding:14px;opacity:.6">Sin conversaciones abiertas</div>');
    const nuevo = Object.assign(document.createElement("div"), { textContent: "+ Iniciar chat" });
    nuevo.style.cssText = "padding:12px 14px;cursor:pointer;color:var(--color-accent,#f472b6)";
    nuevo.onclick = iniciarChat;
    panel.appendChild(nuevo);
  }

  async function iniciarChat() {
    const r = await api("listarContactosChat");
    if (!r.ok || !r.personas.length) { alert(r.error || "No hay a quién escribirle todavía."); return; }
    const opciones = r.personas.map((p, i) => `${i + 1}) ${p.nombre} (${p.rol})`).join("\n");
    const idx = Number(await prompt(`¿Con quién? Escribe el número:\n${opciones}`)) - 1;
    const elegido = r.personas[idx];
    if (!elegido) return;
    const c = await api("crearChatSoporte", { destinatarioUid: elegido.uid });
    if (!c.ok) { alert(c.error); return; }
    try {
      // el listener de chats_soporte_index puede tardar en notificar el chat recién creado — lo leemos directo para no esperarlo
      const snap = await get(ref(db, `chats_soporte/${c.chatId}`));
      chats[c.chatId] = snap.val();
      renderChat(c.chatId);
    } catch (e) {
      alert("El chat se creó pero no se pudo abrir: " + (e && e.message ? e.message : e));
    }
  }

  function renderChat(id) {
    cerrarMensajes();
    chatAbierto = id;
    const c = chats[id];
    if (!c) { alert("No se pudo abrir el chat, intenta de nuevo."); renderLista(); return; }
    const rangoMio = { moderador: 1, admin: 2, master: 3 }[MI.rol];
    const rangoMax = Math.max(...Object.values(c.participantes).map((p) => ({ moderador: 1, admin: 2, master: 3 }[p.rol])));
    panel.innerHTML = `
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
    panel.querySelector("#cs-volver").onclick = renderLista;
    panel.querySelector("#cs-agregar").onclick = () => agregarParticipante(id);
    const finBtn = panel.querySelector("#cs-finalizar");
    if (finBtn) finBtn.onclick = () => finalizar(id);
    const input = panel.querySelector("#cs-input");
    const enviar = () => {
      const texto = input.value.trim();
      if (!texto) return;
      push(ref(db, `chats_soporte/${id}/mensajes`), { uid: MI.uid, nombre: MI.nombre, texto, ts: Date.now() });
      input.value = "";
    };
    panel.querySelector("#cs-enviar").onclick = enviar;
    input.onkeydown = (e) => { if (e.key === "Enter") enviar(); };

    const cont = panel.querySelector("#cs-mensajes");
    onChildAdded(ref(db, `chats_soporte/${id}/mensajes`), (snap) => {
      const m = snap.val();
      const linea = document.createElement("div");
      linea.style.cssText = `align-self:${m.uid === MI.uid ? "flex-end" : "flex-start"};background:${m.uid === MI.uid ? "var(--color-accent-soft,rgba(244,114,182,.15))" : "var(--color-bg,#1e2128)"};padding:6px 10px;border-radius:var(--radius-md,12px);max-width:85%`;
      linea.innerHTML = `<div style="font-size:11px;opacity:.6">${m.nombre}</div>${m.texto}`;
      cont.appendChild(linea);
      cont.scrollTop = cont.scrollHeight;
    });
  }

  async function agregarParticipante(id) {
    const r = await api("listarContactosChat");
    if (!r.ok || !r.personas.length) { alert(r.error || "No hay nadie más para agregar."); return; }
    const opciones = r.personas.map((p, i) => `${i + 1}) ${p.nombre} (${p.rol})`).join("\n");
    const idx = Number(await prompt(`¿A quién agregas?\n${opciones}`)) - 1;
    const elegido = r.personas[idx];
    if (!elegido) return;
    const res = await api("agregarParticipanteChat", { chatId: id, uidNuevo: elegido.uid });
    if (!res.ok) alert(res.error);
  }

  async function finalizar(id) {
    if (!(await confirm("¿Finalizar este chat? Se eliminará en 7 días."))) return;
    const res = await api("finalizarChatSoporte", { chatId: id });
    if (!res.ok) alert(res.error);
  }

  function cerrarMensajes() {
    if (chatAbierto) off(ref(db, `chats_soporte/${chatAbierto}/mensajes`));
    chatAbierto = null;
  }

  // ---------------------------- Índice de mis chats (campanita) ----------------------------
  onValue(ref(db, `chats_soporte_index/${MI.uid}`), (snap) => {
    const ids = Object.keys(snap.val() || {});
    ids.forEach((id) => {
      onValue(ref(db, `chats_soporte/${id}`), (s) => {
        const val = s.val();
        if (!val) { delete chats[id]; } else { chats[id] = val; }
        const abiertos = Object.values(chats).filter((c) => c.estado === "abierto").length;
        bell.textContent = abiertos ? `💬 ${abiertos}` : "💬";
        if (panel.style.display === "flex" && !chatAbierto) renderLista();
      });
    });
  });
})();
