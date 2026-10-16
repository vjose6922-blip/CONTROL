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
  if (!getAdminToken()) return;

  const API = window.ADMIN_API_URL;
  const app = initializeApp({
    apiKey: "AIzaSyAaOe_lxLdQtTFCtw2BDR8KZRSafEMkkes",
    authDomain: "znr-live.firebaseapp.com",
    databaseURL: "https://znr-live-default-rtdb.firebaseio.com",
    projectId: "znr-live",
  }, "chat-soporte");
  const db = getDatabase(app);

  async function api(action, extra) {
    const body = Object.assign({ action, token: getAdminToken() }, extra || {});
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 25000);
    const t0 = Date.now();
    try {
      const res = await fetch(API, { method: "POST", signal: ctrl.signal, headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(body).toString() });
      const j = await res.json();
      return j;
    } catch (e) {
      reportar(action, e);
      const motivo = e && e.name === "AbortError" ? "el servidor no respondió en 25s" : (e && e.message ? e.message : e);
      return { ok: false, error: `${action}: ${motivo}` };
    } finally { clearTimeout(timer); }
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

  // Vigilante de conexión a RTDB: si en 10s no conecta, la barra lo dice (posible firewall/red corporativa)
  let rtdbConectado = false;
  onValue(ref(db, ".info/connected"), (s) => {
    rtdbConectado = s.val() === true;
    if (rtdbConectado && statusEl.textContent.indexOf("RTDB sin conexión") !== -1) estado("");
  });
  setTimeout(() => {
    if (!rtdbConectado) {
      reportar("conexionRTDB", new Error("Sin conexión a znr-live-default-rtdb.firebaseio.com tras 10s"));
      estado("RTDB sin conexión (¿firewall/red bloquea firebaseio.com?). El chat no podrá enviar ni recibir mensajes.", "error");
    }
  }, 10000);

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
    if (tipo === "ok") statusTimer = setTimeout(() => { statusEl.style.display = "none"; }, 4000);
  }
  function abrirPanel() { panel.style.display = "flex"; }
  bell.onclick = () => { if (panel.style.display === "flex") { panel.style.display = "none"; } else { abrirPanel(); renderLista(); } };

  const VERSION = "v4-diag";
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
      // Se abre el chat YA. La lectura a RTDB va en segundo plano con límite de tiempo:
      // si RTDB no responde (conexión/firewall/reglas) nos enteramos por la barra, sin trabar nada.
      renderChat(c.chatId);
      estado("Chat abierto — conectando con RTDB…", "info");
      Promise.race([
        get(ref(db, `chats_soporte/${c.chatId}`)),
        new Promise((_, rej) => setTimeout(() => rej(new Error("RTDB no respondió en 8s")), 8000)),
      ]).then((snap) => {
        if (snap.val()) chats[c.chatId] = snap.val();
        estado("Chat listo", "ok");
      }).catch((e) => {
        reportar("leerChatCreado", e);
        estado("El chat existe, pero RTDB falló: " + (e && e.message ? e.message : e), "error");
      });
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
      <div id="cs-mensajes" style="flex:1;overflow-y:auto;padding:12px 12px 8px;display:flex;flex-direction:column;gap:2px;max-height:40vh"></div>
      <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-top:1px solid var(--color-border-subtle,rgba(255,255,255,.07))">
        <input id="cs-input" placeholder="Aa" style="flex:1;border:none;background:var(--color-surface-3,rgba(127,127,127,.18));color:inherit;padding:9px 14px;border-radius:20px;outline:none;font:inherit">
        <button id="cs-enviar" aria-label="Enviar" style="flex:none;width:36px;height:36px;border:none;border-radius:50%;background:linear-gradient(135deg,#e11d6a,#c026d3);color:#fff;cursor:pointer;font-size:16px;line-height:1">➤</button>
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
    let ult = {};
    onChildAdded(ref(db, `chats_soporte/${id}/mensajes`), (snap) => {
      const m = snap.val(), mio = m.uid === MI.uid;
      const seguido = ult.uid === m.uid && m.ts - ult.ts < 300000; // mismo autor y menos de 5 min: se agrupa
      if (ult.hora) ult.hora.remove();
      if (seguido && ult.burbuja) ult.burbuja.style[mio ? "borderBottomRightRadius" : "borderBottomLeftRadius"] = "6px";
      const fila = document.createElement("div");
      fila.style.cssText = `align-self:${mio ? "flex-end" : "flex-start"};max-width:80%;display:flex;flex-direction:column;align-items:${mio ? "flex-end" : "flex-start"};margin-top:${seguido ? 0 : 8}px`;
      if (!mio && !seguido) {
        const quien = document.createElement("div");
        quien.style.cssText = "font-size:11px;opacity:.6;margin:0 0 2px 10px";
        quien.textContent = m.nombre;
        fila.appendChild(quien);
      }
      const txt = document.createElement("div");
      txt.style.cssText = `padding:8px 13px;border-radius:18px;${mio ? "border-bottom-right-radius:4px;background:linear-gradient(135deg,#e11d6a,#c026d3);color:#fff" : "border-bottom-left-radius:4px;background:var(--color-surface-3,rgba(127,127,127,.2));color:var(--color-text-main,inherit)"};word-break:break-word;white-space:pre-wrap;line-height:1.35`;
      txt.textContent = m.texto; // textContent: un mensaje con HTML no se ejecuta
      const hora = document.createElement("div");
      hora.style.cssText = "font-size:10px;opacity:.55;margin:2px 6px 0";
      hora.textContent = new Date(m.ts).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
      fila.append(txt, hora);
      cont.appendChild(fila);
      ult = { uid: m.uid, ts: m.ts, burbuja: txt, hora };
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
