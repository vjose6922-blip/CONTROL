// chat-soporte.js — chat en tiempo real moderador→admin→master (RTDB), con
// campanita flotante compartida en index.html/notificaciones.html/Tools.html.
// Nada de Firestore aquí: mensajes y metadata viven en RTDB (mismo motor
// que el chat de los lives). auth.uid de RTDB viene de un custom token que
// entrega admin-api (tokenChatSoporte) — este panel no usaba Firebase Auth
// para nada más.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getDatabase, ref, push, get, onValue, onChildAdded, query, limitToLast, orderByKey, endBefore } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";

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
  panel.style.cssText = "position:fixed;left:16px;bottom:80px;z-index:9999;width:340px;max-width:calc(100vw - 32px);max-height:72vh;background:var(--color-surface,#252831);border:1px solid var(--color-border-subtle,rgba(255,255,255,.07));border-radius:var(--radius-lg,18px);box-shadow:var(--shadow-soft,0 8px 24px rgba(0,0,0,.45));display:none;flex-direction:column;overflow:hidden;color:var(--color-text-primary,#dde1e8);";
  // Barra de estado: SIEMPRE visible arriba del panel (los errores no se van solos)
  const statusEl = document.createElement("div");
  statusEl.style.cssText = "display:none;padding:8px 14px;font-size:12px;line-height:1.35;";
  const body = document.createElement("div");
  body.style.cssText = "display:flex;flex-direction:column;flex:1;min-height:0;";
  panel.append(statusEl, body);
  document.body.append(bell, panel);
  // Burbujas: mismas medidas y comportamiento que .pp-b de pedidos.css / pedido-chat.js de ZNR.
  document.head.insertAdjacentHTML("beforeend", `<style id="chat-soporte-css">
    #chat-soporte-panel .cs-msgs{flex:1;min-height:240px;overflow-y:auto;padding:8px 10px;display:flex;flex-direction:column;gap:4px;overscroll-behavior:contain}
    #chat-soporte-panel .cs-b{max-width:82%;padding:6px 10px;border-radius:14px;font-size:14px;line-height:1.3;white-space:pre-wrap;word-break:break-word;align-self:flex-start;border-bottom-left-radius:4px;background:rgba(127,127,127,.2);color:inherit}
    #chat-soporte-panel .cs-b.me{align-self:flex-end;background:var(--color-primary-soft,#7c3aed);color:#fff;border-bottom-left-radius:14px;border-bottom-right-radius:4px}
    #chat-soporte-panel .cs-b .quien{font-size:11px;font-weight:700;opacity:.75;margin-bottom:1px}
    #chat-soporte-panel .cs-b time{display:block;font-size:10px;opacity:.6;margin-top:2px;text-align:right}
    #chat-soporte-panel .cs-day{align-self:center;font-size:10.5px;opacity:.6;margin:6px 0 2px}
    #chat-soporte-panel .cs-day::first-letter{text-transform:uppercase}
    #chat-soporte-panel .cs-vacio{align-self:center;text-align:center;font-size:12px;opacity:.6;padding:18px 12px}
    #chat-soporte-panel .cs-more{align-self:center;border:0;background:rgba(127,127,127,.2);color:inherit;padding:5px 12px;border-radius:999px;font-size:12px;cursor:pointer}
    #chat-soporte-panel .cs-comp{display:flex;align-items:flex-end;gap:6px;padding:6px 10px;border-top:1px solid var(--color-border-subtle,rgba(255,255,255,.07))}
    #chat-soporte-panel .cs-comp textarea{flex:1;resize:none;max-height:100px;min-height:36px;padding:8px 12px;border-radius:18px;border:1px solid var(--color-border-subtle,rgba(127,127,127,.35));background:rgba(127,127,127,.12);color:inherit;font:inherit;font-size:14px;line-height:1.25;box-sizing:border-box;outline:none}
    #chat-soporte-panel .cs-ico{width:36px;height:36px;border-radius:50%;border:0;flex-shrink:0;cursor:pointer;font-size:16px;line-height:1;background:var(--color-primary-soft,#7c3aed);color:#fff}
    #chat-soporte-panel .cs-ico:disabled{opacity:.5}
  </style>`);
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

  const VERSION = "v5";
  const PAGINA = 40;
  const chats = {}; // chatId -> valor de chats_soporte/{id}
  let chatAbierto = null; // chatId con listener de mensajes activo
  let unsubMsgs = null;

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
    const otrosNombres = Object.entries(c.participantes || {}).filter(([uid]) => uid !== MI.uid).map(([, p]) => p.nombre).join(", ");
    body.innerHTML = `
      <div style="padding:10px 14px;display:flex;justify-content:space-between;align-items:center;gap:8px;border-bottom:1px solid var(--color-border-subtle,rgba(255,255,255,.07))">
        <span style="cursor:pointer;flex-shrink:0" id="cs-volver">←</span>
        <b id="cs-titulo" style="flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:14px"></b>
        <span style="flex-shrink:0">
          <button id="cs-agregar" style="background:none;border:none;color:var(--color-info,#60a5fa);cursor:pointer">+ agregar</button>
          ${rangoMio >= rangoMax ? '<button id="cs-finalizar" style="background:none;border:none;color:var(--color-error,#f87171);cursor:pointer">Finalizar</button>' : ""}
        </span>
      </div>
      <div id="cs-mensajes" class="cs-msgs"></div>
      <div class="cs-comp">
        <textarea id="cs-input" rows="1" maxlength="1000" placeholder="Escribe un mensaje…" aria-label="Mensaje"></textarea>
        <button id="cs-enviar" class="cs-ico" aria-label="Enviar">➤</button>
      </div>`;
    body.querySelector("#cs-titulo").textContent = otrosNombres || "Chat";
    body.querySelector("#cs-volver").onclick = renderLista;
    body.querySelector("#cs-agregar").onclick = () => agregarParticipante(id);
    const finBtn = body.querySelector("#cs-finalizar");
    if (finBtn) finBtn.onclick = () => finalizar(id);

    const cont = body.querySelector("#cs-mensajes");
    const input = body.querySelector("#cs-input");
    const rutaMsgs = ref(db, `chats_soporte/${id}/mensajes`);
    const msgs = new Map();            // pushKey -> mensaje (las claves de push ordenan por fecha)
    let hayMas = false, cargoAnteriores = false, primeraVez = true, raf = 0;
    const hora = (t) => new Date(t).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
    const diaLargo = (t) => new Date(t).toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" });
    const el = (tag, cls, txt) => { const x = document.createElement(tag); if (cls) x.className = cls; if (txt !== undefined) x.textContent = txt; return x; };

    function pintar() {
      raf = 0;
      const lista = [...msgs.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1));
      if (!cargoAnteriores) hayMas = lista.length >= PAGINA;
      const cerca = cont.scrollHeight - cont.scrollTop - cont.clientHeight < 120;
      cont.replaceChildren();
      if (hayMas) {
        const mas = el("button", "cs-more", "Ver mensajes anteriores");
        mas.onclick = () => cargarAnteriores(mas, lista[0] && lista[0][0]);
        cont.appendChild(mas);
      }
      if (!lista.length) cont.appendChild(el("div", "cs-vacio", "Chat con " + (otrosNombres || "…") + " — escribe abajo"));
      let diaPrev = "", prev = null;
      for (const [, m] of lista) {
        const dia = new Date(m.ts).toDateString();
        if (dia !== diaPrev) { cont.appendChild(el("div", "cs-day", diaLargo(m.ts))); diaPrev = dia; prev = null; }
        const mio = m.uid === MI.uid;
        const seguido = prev && prev.uid === m.uid && m.ts - prev.ts < 300000; // mismo autor y menos de 5 min: se agrupa
        const b = el("div", "cs-b" + (mio ? " me" : ""));
        if (seguido) b.style.marginTop = "0"; else b.style.marginTop = "6px";
        if (!mio && !seguido) b.appendChild(el("div", "quien", m.nombre));
        b.appendChild(document.createTextNode(m.texto)); // texto plano: un mensaje con HTML no se ejecuta
        b.appendChild(el("time", "", hora(m.ts)));
        cont.appendChild(b);
        prev = m;
      }
      if (primeraVez || cerca) cont.scrollTop = cont.scrollHeight;
      primeraVez = false;
    }
    const programar = () => { if (!raf) raf = requestAnimationFrame(pintar); };

    async function cargarAnteriores(btn, primeraClave) {
      if (!primeraClave) return;
      btn.disabled = true;
      try {
        const snap = await get(query(rutaMsgs, orderByKey(), endBefore(primeraClave), limitToLast(PAGINA)));
        snap.forEach((ch) => { msgs.set(ch.key, ch.val()); });
        cargoAnteriores = true; hayMas = snap.size >= PAGINA;
        const alto = cont.scrollHeight, estabaAbajo = primeraVez;
        primeraVez = false;
        pintar();
        if (!estabaAbajo) cont.scrollTop = cont.scrollHeight - alto; // se queda donde estaba leyendo
      } catch (e) { reportar("cargarAnteriores", e); estado("No se pudieron cargar los mensajes anteriores", "error"); btn.disabled = false; }
    }

    const enviar = () => {
      const texto = input.value.trim();
      if (!texto) return;
      push(rutaMsgs, { uid: MI.uid, nombre: MI.nombre, texto, ts: Date.now() })
        .catch((e) => { reportar("enviarMensaje", e); estado("No se pudo enviar: " + (e && e.message ? e.message : e), "error"); });
      input.value = ""; input.style.height = "auto"; primeraVez = true;
    };
    body.querySelector("#cs-enviar").onclick = enviar;
    input.addEventListener("input", () => { input.style.height = "auto"; input.style.height = Math.min(input.scrollHeight, 100) + "px"; });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey && window.matchMedia("(pointer:fine)").matches) { e.preventDefault(); enviar(); }
    });

    // Solo los últimos PAGINA mensajes en vivo; los anteriores se piden bajo demanda.
    unsubMsgs = onChildAdded(query(rutaMsgs, limitToLast(PAGINA)), (snap) => {
      msgs.set(snap.key, snap.val());
      programar();
    }, (e) => { reportar("leerMensajes", e); estado("No se pueden leer los mensajes: " + (e && e.message ? e.message : e), "error"); });
    programar();
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
    if (unsubMsgs) { unsubMsgs(); unsubMsgs = null; }
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
