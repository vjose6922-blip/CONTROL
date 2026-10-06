/* bg-remove.js — Quitar fondo y poner blanco (solo panel admin)
 * Modelo: U²-Net pequeño (u2netp, Apache-2.0), corre en el navegador con onnxruntime-web.
 * Requiere el archivo u2netp.onnx junto a index.html.
 * Intercepta el 'change' de los inputs image-upload-N (captura) y reenvía las fotos ya procesadas.
 * No necesita cambios en admin.js ni en common.js.
 * Si algo falla, sube la foto original (nunca bloquea la publicación).
 */
(function () {
  'use strict';

  var MODEL_URL = 'u2netp.onnx';   // en la raíz del repo, junto a index.html
  var ORT_JS = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.20.1/dist/ort.min.js';
  var ORT_WASM_PATH = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.20.1/dist/';
  var MAX_LADO = 1200;           // igual que compressImage de admin.js
  var SIZE = 320;                // entrada fija del modelo
  var MEAN = [0.485, 0.456, 0.406];
  var STD = [0.229, 0.224, 0.225];
  var LS_KEY = 'znr_quitar_fondo';

  var sesion = null;
  var cola = Promise.resolve();  // procesa una foto a la vez
  var lineas = [];
  // Se buscan por id cada vez: offline-manager.js clona (cloneNode) el formulario y deja las referencias viejas desconectadas del DOM
  var $ = function (id) { return document.getElementById(id); };
  var chkOn = function () { var c = $('chk-quitar-fondo'); return !!(c && c.checked); };

  function log(t) {
    var d = new Date();
    lineas.push(d.toTimeString().slice(0, 8) + ' ' + t);
    if (lineas.length > 12) lineas.shift();
    var logEl = $('bg-log');
    if (logEl) logEl.textContent = lineas.join('\n');
    try { console.log('[bg-remove]', t); } catch (e) {}
  }

  function msg(t, err) {
    if (t) log(t);
    var estado = $('bg-estado');
    if (!estado) return;
    estado.textContent = t || '';
    estado.style.color = err ? '#d32f2f' : '';
  }

  function cargarOrt() {
    if (window.ort) return Promise.resolve();
    log('cargando onnxruntime…');
    return new Promise(function (ok, fail) {
      var s = document.createElement('script');
      s.src = ORT_JS;
      s.onload = function () { log('onnxruntime cargado'); ok(); };
      s.onerror = function () { fail(new Error('No cargó onnxruntime (revisa la CSP y la conexión).')); };
      document.head.appendChild(s);
    });
  }

  async function cargarModelo() {
    if (sesion) return sesion;
    await cargarOrt();
    ort.env.wasm.wasmPaths = ORT_WASM_PATH;
    ort.env.wasm.numThreads = 1;
    msg('Cargando modelo (la primera vez tarda más)…');
    var r = await fetch(MODEL_URL);
    if (!r.ok) throw new Error('No se encontró ' + MODEL_URL + ' (HTTP ' + r.status + ').');
    var buf = await r.arrayBuffer();
    log('modelo descargado: ' + buf.byteLength + ' bytes');
    if (buf.byteLength < 1000000) throw new Error('El archivo del modelo es inválido.');
    sesion = await ort.InferenceSession.create(buf, { executionProviders: ['wasm'] });
    log('sesión del modelo lista');
    return sesion;
  }

  async function procesar(file) {
    var s = await cargarModelo();
    msg('Quitando fondo…');
    await new Promise(function (r) { setTimeout(r, 30); });

    var bmp = await createImageBitmap(file);
    var k = Math.min(1, MAX_LADO / Math.max(bmp.width, bmp.height));
    var w = Math.round(bmp.width * k), h = Math.round(bmp.height * k);
    var fuente = document.createElement('canvas');
    fuente.width = w; fuente.height = h;
    var fctx = fuente.getContext('2d', { willReadFrequently: true });
    fctx.drawImage(bmp, 0, 0, w, h);

    // Entrada 320x320 normalizada
    var pq = document.createElement('canvas');
    pq.width = pq.height = SIZE;
    var pctx = pq.getContext('2d', { willReadFrequently: true });
    pctx.drawImage(fuente, 0, 0, SIZE, SIZE);
    var px = pctx.getImageData(0, 0, SIZE, SIZE).data;
    var n = SIZE * SIZE, maxP = 1, i, c;
    for (i = 0; i < n; i++) {
      var o = i * 4;
      if (px[o] > maxP) maxP = px[o];
      if (px[o + 1] > maxP) maxP = px[o + 1];
      if (px[o + 2] > maxP) maxP = px[o + 2];
    }
    var t = new Float32Array(3 * n);
    for (i = 0; i < n; i++) {
      for (c = 0; c < 3; c++) t[c * n + i] = (px[i * 4 + c] / maxP - MEAN[c]) / STD[c];
    }

    var feeds = {};
    feeds[s.inputNames[0]] = new ort.Tensor('float32', t, [1, 3, SIZE, SIZE]);
    var salida = await s.run(feeds);
    var m = salida[s.outputNames[0]].data;
    log('inferencia lista');
    var mn = Infinity, mx = -Infinity;
    for (i = 0; i < n; i++) { if (m[i] < mn) mn = m[i]; if (m[i] > mx) mx = m[i]; }
    var rango = (mx - mn) || 1;

    // Máscara 320 -> tamaño de la foto
    var mq = document.createElement('canvas');
    mq.width = mq.height = SIZE;
    var mctx = mq.getContext('2d');
    var mi = mctx.createImageData(SIZE, SIZE);
    for (i = 0; i < n; i++) {
      var v = Math.round(((m[i] - mn) / rango) * 255);
      mi.data[i * 4] = mi.data[i * 4 + 1] = mi.data[i * 4 + 2] = v;
      mi.data[i * 4 + 3] = 255;
    }
    mctx.putImageData(mi, 0, 0);
    var mg = document.createElement('canvas');
    mg.width = w; mg.height = h;
    var mgctx = mg.getContext('2d', { willReadFrequently: true });
    mgctx.imageSmoothingEnabled = true;
    mgctx.imageSmoothingQuality = 'high';
    mgctx.drawImage(mq, 0, 0, w, h);
    var md = mgctx.getImageData(0, 0, w, h).data;

    // Recorte con transparencia (0.15 y 0.7 ajustan la dureza del borde)
    var im = fctx.getImageData(0, 0, w, h);
    for (i = 0; i < w * h; i++) {
      var a = (md[i * 4] / 255 - 0.15) / 0.7;
      im.data[i * 4 + 3] = Math.round(Math.max(0, Math.min(1, a)) * 255);
    }
    var recorte = document.createElement('canvas');
    recorte.width = w; recorte.height = h;
    recorte.getContext('2d').putImageData(im, 0, 0);

    // Fondo blanco
    var fin = document.createElement('canvas');
    fin.width = w; fin.height = h;
    var ctx = fin.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(recorte, 0, 0);

    var blob = await new Promise(function (res) { fin.toBlob(res, 'image/jpeg', 0.92); });
    if (!blob) throw new Error('No se pudo generar la imagen final.');
    var base = (file.name || 'imagen').replace(/\.[^.]+$/, '');
    return new File([blob], base + '.jpg', { type: 'image/jpeg' });
  }

  function crearControl() {
    var form = $('product-form');
    if (!form || $('chk-quitar-fondo')) return;
    var filas = form.querySelectorAll('.form-row');
    var primera = null;
    for (var i = 0; i < filas.length; i++) {
      var lb = filas[i].querySelector('label');
      if (lb && lb.textContent.trim() === 'Imagen 1') { primera = filas[i]; break; }
    }
    if (!primera) return;

    var fila = document.createElement('div');
    fila.className = 'form-row';
    var lab = document.createElement('label');
    lab.style.cssText = 'display:flex;align-items:center;justify-content:flex-start;gap:10px;width:100%;cursor:pointer;';
    var chk = document.createElement('input');
    chk.type = 'checkbox';
    chk.id = 'chk-quitar-fondo';
    chk.style.cssText = 'width:22px;height:22px;flex:none;margin:0;';
    try { chk.checked = localStorage.getItem(LS_KEY) === '1'; } catch (e) {}
    lab.appendChild(chk);
    lab.appendChild(document.createTextNode('Quitar fondo y poner blanco (al subir las fotos)'));
    var estado = document.createElement('div');
    estado.id = 'bg-estado';
    estado.style.cssText = 'display:block;margin-top:6px;font-size:.9rem;';
    fila.appendChild(lab);
    fila.appendChild(estado);
    var logEl = document.createElement('pre');
    logEl.id = 'bg-log';
    logEl.style.cssText = 'margin:6px 0 0;font-size:.72rem;line-height:1.3;white-space:pre-wrap;word-break:break-word;opacity:.85;';
    fila.appendChild(logEl);
    msg('Listo para usar (bg-remove v5).');
    primera.parentNode.insertBefore(fila, primera);
  }

  // Intercepta la selección de fotos (fase de captura, antes que cualquier otro manejador),
  // las procesa y reenvía el evento 'change' con las fotos ya con fondo blanco.
  // No depende de admin.js ni de common.js.
  async function procesarLista(archivos) {
    var salida = [];
    for (var i = 0; i < archivos.length; i++) {
      msg('Quitando fondo… (' + (i + 1) + ' de ' + archivos.length + ')');
      try {
        salida.push(await procesar(archivos[i]));
      } catch (e) {
        console.error('[bg-remove]', e);
        var texto = 'No se pudo quitar el fondo; se usa la foto original. (' + (e && e.message) + ')';
        msg(texto, true);
        if (typeof showTemporaryMessage === 'function') { try { showTemporaryMessage(texto, 'error'); } catch (x) {} }
        salida.push(archivos[i]);
      }
    }
    return salida;
  }

  function instalarInterceptor() {
    window.addEventListener('change', function (ev) {
      var inp = ev.target;
      if (inp && inp.type === 'file') {
        log('change en input id=' + (inp.id || '(sin id)') + ' archivos=' + (inp.files ? inp.files.length : 0) + ' casilla=' + chkOn());
      }
      if (!inp || inp.type !== 'file' || !/^image-upload-\d+$/.test(inp.id || '')) return;
      if (inp._znrBgListo) { inp._znrBgListo = false; return; }   // reenvío ya procesado
      if (!chkOn()) return;
      var archivos = Array.prototype.slice.call(inp.files || []);
      if (!archivos.length) return;

      ev.stopImmediatePropagation();
      ev.preventDefault();
      msg('Procesando foto…');

      cola = cola.then(function () {
        return procesarLista(archivos).then(function (lista) {
          try {
            var dt = new DataTransfer();
            lista.forEach(function (f) { dt.items.add(f); });
            inp.files = dt.files;
          } catch (e) { console.error('[bg-remove] no se pudo reemplazar los archivos', e); }
          msg('Listo. Subiendo…');
          inp._znrBgListo = true;
          inp.dispatchEvent(new Event('change', { bubbles: true }));
        });
      }).catch(function (e) { console.error('[bg-remove]', e); });
    }, true);
  }

  window.addEventListener('error', function (e) { log('ERROR: ' + (e && e.message)); });
  window.addEventListener('unhandledrejection', function (e) { log('ERROR promesa: ' + (e && e.reason && (e.reason.message || e.reason))); });
  document.addEventListener('securitypolicyviolation', function (e) { log('CSP bloqueó: ' + e.blockedURI + ' (' + e.violatedDirective + ')'); });

  // Delegados en document: sobreviven al clonado del formulario
  document.addEventListener('change', function (e) {
    if (e.target && e.target.id === 'chk-quitar-fondo') { try { localStorage.setItem(LS_KEY, e.target.checked ? '1' : '0'); } catch (x) {} }
  });
  // product-form.reset() (admin.js) desmarca la casilla: se restaura la preferencia guardada
  document.addEventListener('reset', function (e) {
    if (!e.target || e.target.id !== 'product-form') return;
    setTimeout(function () {
      var c = $('chk-quitar-fondo');
      try { if (c) c.checked = localStorage.getItem(LS_KEY) === '1'; } catch (x) {}
      msg('');
    }, 0);
  });

  crearControl();
  instalarInterceptor();
})();
