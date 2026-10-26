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
  if (!t?.ok) return;
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
  const panel = Object.assign(document.createElement("div"), { id: "chat-soporte-panel" });
  panel.style.cssText = "width:340px;max-width:calc(100vw - 32px);max-height:72vh;background:var(--color-surface,#252831);border:1px solid var(--color-border-subtle,rgba(255,255,255,.07));border-radius:var(--radius-lg,18px);box-shadow:var(--shadow-soft,0 8px 24px rgba(0,0,0,.45));display:none;flex-direction:column;overflow:hidden;color:var(--color-text-primary,#dde1e8);";
  // Barra de estado: SIEMPRE visible arriba del panel (los errores no se van solos)
  const statusEl = document.createElement("div");
  statusEl.style.cssText = "display:none;padding:8px 14px;font-size:12px;line-height:1.35;";
  const body = document.createElement("div");
  body.style.cssText = "display:flex;flex-direction:column;flex:1;min-height:0;";
  panel.append(statusEl, body);
  document.body.append(panel);
  // Burbujas: mismas medidas y comportamiento que .pp-b de pedidos.css / pedido-chat.js de ZNR.
  document.head.insertAdjacentHTML("beforeend", `<style id="chat-soporte-css">
    #chat-soporte-panel{position:fixed;right:78px;bottom:16px;z-index:9002}
    @media (max-width:520px){#chat-soporte-panel{left:10px;right:10px;bottom:10px;width:auto!important;max-width:none!important}}
    /* Burbujas flotantes: mismo diseño que burbuja-mensajes.js de ZNR */
    #csb-stack{position:fixed;right:10px;z-index:9000;width:58px;display:flex;flex-direction:column;align-items:center;gap:10px;touch-action:none;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none}
    .csb-b{position:relative;width:44px;height:44px;border-radius:50%;border:2px solid var(--color-surface,#252831);padding:0;color:#fff;font-weight:800;font-size:17px;line-height:1;font-family:inherit;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(0,0,0,.4);transition:transform .15s ease}
    .csb-b.csb-main{width:58px;height:58px;font-size:23px}
    .csb-b:active{transform:scale(.92)}
    .csb-b.csb-activa{box-shadow:0 0 0 3px var(--color-accent-solid,#8b5cf6),0 4px 14px rgba(0,0,0,.4)}
    .csb-b.csb-nueva{animation:csb-pop .38s cubic-bezier(.2,1.4,.4,1)}
    .csb-b svg{width:22px;height:22px}
    .csb-hub{background:var(--gradient-accent,linear-gradient(135deg,#ff3d7f,#ff5c6f));box-shadow:0 4px 16px rgba(var(--color-accent-rgb,255,61,127),.5)}
    .csb-count{position:absolute;top:-5px;right:-5px;min-width:18px;height:18px;padding:0 5px;box-sizing:border-box;border-radius:9px;background:#ef4444;color:#fff;font-size:11px;font-weight:800;line-height:18px;text-align:center;box-shadow:0 0 0 2px var(--color-surface,#252831)}
    #csb-card{position:fixed;z-index:9001;right:78px;width:min(310px,calc(100vw - 92px));box-sizing:border-box;background:var(--color-surface,#252831);color:var(--color-text-primary,#dde1e8);border:1px solid var(--color-border-subtle,rgba(255,255,255,.1));border-radius:16px;box-shadow:0 12px 36px rgba(0,0,0,.5);padding:12px;animation:csb-in .18s ease-out}
    .csb-head{display:flex;align-items:center;gap:10px}
    .csb-av{flex:0 0 auto;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:15px}
    .csb-who{min-width:0;flex:1}
    .csb-name{margin:0;font-size:14px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .csb-prod{margin:0;font-size:12px;opacity:.65;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .csb-x{flex:0 0 auto;border:none;background:transparent;color:inherit;opacity:.6;font-size:20px;line-height:1;cursor:pointer;padding:4px 6px}
    .csb-msgs{margin-top:8px;max-height:200px;overflow-y:auto}
    .csb-msg{margin-top:6px;padding:8px 10px;border-radius:14px 14px 14px 4px;background:rgba(139,92,246,.18);font-size:13.5px;line-height:1.35;word-break:break-word;white-space:pre-wrap}
    .csb-time{display:block;margin-top:3px;font-size:10.5px;opacity:.6}
    .csb-acts{display:flex;gap:8px;margin-top:10px}
    .csb-open{flex:1;text-align:center;border:none;cursor:pointer;font-family:inherit;padding:9px 10px;border-radius:10px;background:var(--color-accent-solid,#8b5cf6);color:#fff;font-size:13px;font-weight:700}
    .csb-dismiss{flex:0 0 auto;font-family:inherit;padding:9px 10px;border-radius:10px;border:1px solid var(--color-border-subtle,rgba(255,255,255,.14));background:transparent;color:inherit;opacity:.8;font-size:12px;font-weight:600;cursor:pointer}
    @keyframes csb-pop{0%{transform:scale(.3);opacity:0}100%{transform:scale(1);opacity:1}}
    @keyframes csb-in{from{opacity:0;transform:translateX(8px)}to{opacity:1;transform:none}}
    @media (prefers-reduced-motion:reduce){.csb-b.csb-nueva,#csb-card{animation:none}}
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
    #chat-soporte-panel .cs-row{display:flex;align-items:center;gap:10px;padding:10px 14px;cursor:pointer}
    #chat-soporte-panel .cs-row:hover{background:rgba(127,127,127,.12)}
    #chat-soporte-panel .cs-av{flex:none;width:44px;height:44px;border-radius:50%;display:grid;place-items:center;font-weight:800;font-size:17px;color:#fff;background:linear-gradient(135deg,#7c3aed,#e11d6a)}
    #chat-soporte-panel .cs-info{flex:1;min-width:0}
    #chat-soporte-panel .cs-nom{font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    #chat-soporte-panel .cs-prev{font-size:12.5px;opacity:.7;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:1px}
    #chat-soporte-panel .cs-row.nuevo .cs-nom,#chat-soporte-panel .cs-row.nuevo .cs-prev{font-weight:800;opacity:1}
    #chat-soporte-panel .cs-meta{flex:none;display:flex;flex-direction:column;align-items:flex-end;gap:5px;font-size:11px;opacity:.75}
    #chat-soporte-panel .cs-dot{width:10px;height:10px;border-radius:50%;background:var(--color-primary-soft,#7c3aed)}
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
  function posicionarPanel() { // el panel nace a la altura de la burbuja (antes salía pegado abajo)
    if (panel.style.display !== "flex" || !stackEl) return;
    const b = stackEl.querySelector(".csb-hub") || stackEl;
    panel.style.bottom = "auto";
    panel.style.top = Math.max(8, Math.min(b.getBoundingClientRect().top, window.innerHeight - panel.offsetHeight - 8)) + "px";
  }
  new ResizeObserver(posicionarPanel).observe(panel); // al pasar de lista a chat cambia el alto
  function abrirPanel() { panel.style.display = "flex"; posicionarPanel(); }
  function cerrarPanel() { cerrarMensajes(); panel.style.display = "none"; renderBurbujas(); }
  const alternarPanel = () => { if (panel.style.display === "flex") cerrarPanel(); else { abrirPanel(); renderLista(); renderBurbujas(); } };

  const VERSION = "v7";
  const PAGINA = 40;
  const chats = {}; // chatId -> valor de chats_soporte/{id}
  const ultimo = {}; // chatId -> último mensaje (para la vista previa de la lista)
  const vistoKey = (id) => "cs_visto_" + id;
  const recientes = {}; // chatId -> Map(pushKey -> mensaje): últimos 10, para saber qué hay sin leer
  let stackEl = null, cardEl = null, abierta = "", arrastrando = false, convsActuales = [], rafBurbujas = 0;
  const vistosAnim = {};
  const marcarVisto = (id, ts) => { try { localStorage.setItem(vistoKey(id), String(Math.max(Number(localStorage.getItem(vistoKey(id))) || 0, ts || Date.now()))); } catch (_) {} programarBurbujas(); };
  let chatAbierto = null; // chatId con listener de mensajes activo
  let unsubMsgs = null;

  function renderLista() {
    cerrarMensajes();
    const hora = (t) => {
      const d = new Date(t), hoy = new Date();
      return d.toDateString() === hoy.toDateString() ? d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }) : d.toLocaleDateString("es-MX", { day: "numeric", month: "short" }).replace(".", "");
    };
    body.innerHTML = '<div style="padding:14px;font-weight:600;border-bottom:1px solid var(--color-border-subtle,rgba(255,255,255,.07));display:flex;align-items:center;justify-content:space-between"><span>Chats de soporte <span style="opacity:.4;font-size:10px;font-weight:400">' + VERSION + '</span></span><span id="cs-cerrar" style="cursor:pointer;opacity:.7;font-size:18px;line-height:1" aria-label="Cerrar">✕</span></div>';
    body.querySelector("#cs-cerrar").onclick = cerrarPanel;
    // Los chats con mensajes más recientes primero, como en Messenger.
    const ids = Object.keys(chats).sort((a, b) => ((ultimo[b] && ultimo[b].ts) || 0) - ((ultimo[a] && ultimo[a].ts) || 0));
    ids.forEach((id) => {
      const c = chats[id], u = ultimo[id];
      const otros = Object.entries(c.participantes || {}).filter(([uid]) => uid !== MI.uid).map(([, p]) => p.nombre).join(", ") || "…";
      const sinLeer = !!u && u.uid !== MI.uid && u.ts > (Number(localStorage.getItem(vistoKey(id))) || 0);
      const row = document.createElement("div");
      row.className = "cs-row" + (sinLeer ? " nuevo" : "");
      const av = document.createElement("div"); av.className = "cs-av"; av.textContent = otros.trim().charAt(0).toUpperCase();
      const info = document.createElement("div"); info.className = "cs-info";
      const nom = document.createElement("div"); nom.className = "cs-nom"; nom.textContent = otros;
      const prev = document.createElement("div"); prev.className = "cs-prev";
      prev.textContent = u ? (u.uid === MI.uid ? "Tú: " : "") + u.texto : "Sin mensajes todavía";
      info.append(nom, prev);
      const meta = document.createElement("div"); meta.className = "cs-meta";
      if (u) { const t = document.createElement("span"); t.textContent = hora(u.ts); meta.appendChild(t); }
      if (sinLeer) { const d = document.createElement("span"); d.className = "cs-dot"; meta.appendChild(d); }
      row.append(av, info, meta);
      row.onclick = () => renderChat(id);
      body.appendChild(row);
    });
    if (!ids.length) body.insertAdjacentHTML("beforeend", '<div style="padding:14px;opacity:.6">Sin conversaciones abiertas</div>');
    const nuevo = Object.assign(document.createElement("div"), { textContent: "+ Iniciar chat" });
    nuevo.style.cssText = "padding:12px 14px;cursor:pointer;color:var(--color-accent,#f472b6);border-top:1px solid var(--color-border-subtle,rgba(255,255,255,.07))";
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
    marcarVisto(id);
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
          <button id="cs-cerrar" aria-label="Cerrar" style="background:none;border:none;color:inherit;opacity:.7;cursor:pointer;font-size:18px;line-height:1">✕</button>
        </span>
      </div>
      <div id="cs-mensajes" class="cs-msgs"></div>
      <div class="cs-comp">
        <textarea id="cs-input" rows="1" maxlength="1000" placeholder="Escribe un mensaje…" aria-label="Mensaje"></textarea>
        <button id="cs-enviar" class="cs-ico" aria-label="Enviar">➤</button>
      </div>`;
    body.querySelector("#cs-titulo").textContent = otrosNombres || "Chat";
    body.querySelector("#cs-volver").onclick = renderLista;
    body.querySelector("#cs-cerrar").onclick = cerrarPanel;
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
      marcarVisto(id, snap.val().ts);
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

  // ---------------------------- Burbujas flotantes (como burbuja-mensajes.js de ZNR) ----------------------------
  // Una burbuja por chat con mensajes sin leer (la más reciente grande + hasta 3 más) y una burbuja de lista
  // que abre el panel. Se arrastran en vertical (la posición se recuerda); al tocar una se ve el mensaje y desde ahí se abre el chat.
  const MAX_EXTRAS = 3, POS_KEY = "cs_burbuja_top";
  const crear = (tag, cls, texto) => { const x = document.createElement(tag); if (cls) x.className = cls; if (texto != null) x.textContent = texto; return x; };
  const colorDe = (t) => { let h = 0; for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) % 360; return `linear-gradient(135deg,hsl(${h},70%,55%),hsl(${(h + 40) % 360},70%,42%))`; };
  const otrosDe = (c) => Object.entries(c.participantes || {}).filter(([uid]) => uid !== MI.uid).map(([, p]) => p);
  const nombreDe = (c) => otrosDe(c).map((p) => p.nombre).join(", ") || "Chat";
  const rolesDe = (c) => [...new Set(otrosDe(c).map((p) => (p.rol || "").charAt(0).toUpperCase() + (p.rol || "").slice(1)))].filter(Boolean).join(" · ");
  const inicialDe = (c) => (nombreDe(c).trim().charAt(0) || "?").toUpperCase();
  const horaCorta = (t) => { const d = new Date(t); return d.toDateString() === new Date().toDateString() ? d.toLocaleTimeString("es-MX", { hour: "numeric", minute: "2-digit" }) : d.toLocaleDateString("es-MX", { day: "numeric", month: "short" }).replace(".", ""); };

  function sinLeerDe(id) {
    const visto = Number(localStorage.getItem(vistoKey(id))) || 0;
    return [...(recientes[id] || new Map()).values()].filter((m) => m.uid !== MI.uid && m.ts > visto).sort((a, b) => a.ts - b.ts);
  }
  function conversaciones() {
    const leyendo = panel.style.display === "flex" ? chatAbierto : null; // el chat que estás viendo no necesita burbuja
    return Object.keys(chats).filter((id) => chats[id].estado === "abierto" && id !== leyendo)
      .map((id) => ({ id, nuevos: sinLeerDe(id) })).filter((c) => c.nuevos.length)
      .sort((a, b) => b.nuevos[b.nuevos.length - 1].ts - a.nuevos[a.nuevos.length - 1].ts);
  }
  function programarBurbujas() { if (!rafBurbujas) rafBurbujas = requestAnimationFrame(() => { rafBurbujas = 0; renderBurbujas(); }); }

  function crearBurbuja(c, principal) {
    const chat = chats[c.id];
    const b = crear("button", "csb-b" + (principal ? " csb-main" : ""), inicialDe(chat));
    b.type = "button"; b.dataset.id = c.id; b.style.background = colorDe(c.id);
    b.setAttribute("aria-label", "Mensaje de " + nombreDe(chat));
    if (abierta === c.id) b.classList.add("csb-activa");
    if (!vistosAnim[c.id]) { b.classList.add("csb-nueva"); vistosAnim[c.id] = true; }
    b.appendChild(crear("span", "csb-count", c.nuevos.length > 9 ? "9+" : String(c.nuevos.length)));
    b.addEventListener("click", () => alternarCard(c.id));
    return b;
  }
  function crearHub(restantes) {
    const b = crear("button", "csb-b csb-hub");
    b.type = "button"; b.setAttribute("aria-label", "Abrir chats de soporte");
    b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>';
    if (restantes > 0) b.appendChild(crear("span", "csb-count", "+" + (restantes > 99 ? "99" : restantes)));
    b.addEventListener("click", () => { if (!arrastrando) alternarPanel(); });
    return b;
  }

  function renderBurbujas() {
    convsActuales = conversaciones();
    let recien = false;
    if (!stackEl) { stackEl = crear("div"); stackEl.id = "csb-stack"; document.body.appendChild(stackEl); conectarArrastre(); recien = true; }
    stackEl.textContent = "";
    const visibles = convsActuales.slice(0, 1 + MAX_EXTRAS);
    visibles.forEach((c, i) => stackEl.appendChild(crearBurbuja(c, i === 0)));
    stackEl.appendChild(crearHub(convsActuales.length - visibles.length));
    Object.keys(vistosAnim).forEach((id) => { if (!convsActuales.some((c) => c.id === id)) delete vistosAnim[id]; });
    if (abierta && !convsActuales.some((c) => c.id === abierta)) cerrarCard(); else if (abierta) pintarCard();
    posicionar(recien);
  }

  // Tarjeta con los mensajes sin leer
  function burbujaDe(id) { return stackEl ? [...stackEl.querySelectorAll(".csb-b[data-id]")].find((b) => b.dataset.id === id) : null; }
  function alternarCard(id) {
    if (arrastrando) return;
    if (abierta === id) { cerrarCard(); return; }
    abierta = id;
    stackEl.querySelectorAll(".csb-b[data-id]").forEach((b) => b.classList.toggle("csb-activa", b.dataset.id === id));
    pintarCard();
  }
  function cerrarCard() {
    abierta = "";
    if (cardEl) { cardEl.remove(); cardEl = null; }
    if (stackEl) { const act = stackEl.querySelector(".csb-activa"); if (act) act.classList.remove("csb-activa"); }
  }
  function pintarCard() {
    const c = convsActuales.find((x) => x.id === abierta), btn = burbujaDe(abierta), chat = c && chats[c.id];
    if (!c || !btn || !chat) { cerrarCard(); return; }
    if (!cardEl) { cardEl = crear("div"); cardEl.id = "csb-card"; document.body.appendChild(cardEl); }
    cardEl.textContent = "";
    const head = crear("div", "csb-head");
    const av = crear("div", "csb-av", inicialDe(chat)); av.style.background = colorDe(c.id);
    const who = crear("div", "csb-who");
    who.appendChild(crear("p", "csb-name", nombreDe(chat)));
    if (rolesDe(chat)) who.appendChild(crear("p", "csb-prod", rolesDe(chat)));
    const x = crear("button", "csb-x", "×"); x.type = "button"; x.setAttribute("aria-label", "Cerrar"); x.onclick = cerrarCard;
    head.append(av, who, x);
    const msgs = crear("div", "csb-msgs");
    c.nuevos.slice(-3).forEach((m) => {
      const d = crear("div", "csb-msg", m.texto); // texto plano
      d.appendChild(crear("span", "csb-time", horaCorta(m.ts)));
      msgs.appendChild(d);
    });
    const acts = crear("div", "csb-acts");
    const abrir = crear("button", "csb-open", "Abrir chat"); abrir.type = "button";
    abrir.onclick = () => { const id = c.id; cerrarCard(); abrirPanel(); renderChat(id); };
    const visto = crear("button", "csb-dismiss", "Marcar leído"); visto.type = "button";
    visto.onclick = () => { cerrarCard(); marcarVisto(c.id, c.nuevos[c.nuevos.length - 1].ts); };
    acts.append(abrir, visto);
    cardEl.append(head, msgs, acts);
    const r = btn.getBoundingClientRect(), alto = cardEl.offsetHeight;
    cardEl.style.top = Math.max(8, Math.min(Math.max(8, r.top + r.height / 2 - 30), window.innerHeight - alto - 8)) + "px";
  }

  // Posición y arrastre vertical
  const limitesTop = () => ({ min: 70, max: Math.max(70, window.innerHeight - (stackEl ? stackEl.offsetHeight : 60) - 90) });
  function posicionar(recien) {
    if (!stackEl) return;
    const lim = limitesTop();
    let actual = recien ? parseFloat(localStorage.getItem(POS_KEY)) : parseFloat(stackEl.style.top);
    if (isNaN(actual)) actual = window.innerHeight * 0.45;
    stackEl.style.top = Math.min(Math.max(lim.min, actual), lim.max) + "px";
    if (cardEl) pintarCard();
    posicionarPanel();
  }
  function conectarArrastre() {
    let inicio = null;
    stackEl.addEventListener("pointerdown", (e) => { if (e.button > 0) return; inicio = { y: e.clientY, top: stackEl.getBoundingClientRect().top, movio: false }; });
    window.addEventListener("pointermove", (e) => {
      if (!inicio || !stackEl) return;
      const dy = e.clientY - inicio.y;
      if (!inicio.movio && Math.abs(dy) < 6) return;
      inicio.movio = true; arrastrando = true;
      const lim = limitesTop();
      stackEl.style.top = Math.min(Math.max(lim.min, inicio.top + dy), lim.max) + "px";
      if (cardEl) pintarCard();
      posicionarPanel();
    });
    const soltar = () => {
      if (!inicio) return;
      if (inicio.movio && stackEl) { try { localStorage.setItem(POS_KEY, String(parseFloat(stackEl.style.top))); } catch (_) {} }
      inicio = null;
      setTimeout(() => { arrastrando = false; }, 60);
    };
    window.addEventListener("pointerup", soltar);
    window.addEventListener("pointercancel", soltar);
  }
  document.addEventListener("click", (e) => { if (cardEl && !cardEl.contains(e.target) && !(stackEl && stackEl.contains(e.target))) cerrarCard(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && cardEl) cerrarCard(); });
  let rafPos = 0;
  window.addEventListener("resize", () => { if (!rafPos) rafPos = requestAnimationFrame(() => { rafPos = 0; posicionar(false); }); });
  renderBurbujas(); // la burbuja de lista aparece desde el inicio

  // ---------------------------- Índice de mis chats ----------------------------
  const escuchando = new Set();
  onValue(ref(db, `chats_soporte_index/${MI.uid}`), (snap) => {
    const ids = Object.keys(snap.val() || {});
    ids.forEach((id) => {
      if (escuchando.has(id)) return;
      escuchando.add(id);
      onChildAdded(query(ref(db, `chats_soporte/${id}/mensajes`), limitToLast(10)), (m) => {
        const mapa = (recientes[id] = recientes[id] || new Map());
        mapa.set(m.key, m.val());
        ultimo[id] = [...mapa.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1)).pop()[1];
        programarBurbujas();
        if (panel.style.display === "flex" && !chatAbierto) renderLista();
      }, (e) => { reportar("ultimoMensaje", e); });
      onValue(ref(db, `chats_soporte/${id}`), (s) => {
        const val = s.val();
        if (!val) { delete chats[id]; delete recientes[id]; delete ultimo[id]; } else { chats[id] = val; }
        programarBurbujas();
        if (panel.style.display === "flex" && !chatAbierto) renderLista();
      }, (e) => { reportar("escucharChat", e); });
    });
  });
})();
