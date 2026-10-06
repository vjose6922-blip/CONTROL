/* bg-remove.js — Quitar fondo y poner blanco (solo panel admin)
 * Modelo: U²-Net pequeño (u2netp, Apache-2.0), corre en el navegador con onnxruntime-web.
 * Requiere el archivo models/u2netp.onnx junto a index.html.
 * Se carga DESPUÉS de admin.js: envuelve window.uploadImageToDrive sin modificar admin.js.
 * Si algo falla, sube la foto original (nunca bloquea la publicación).
 */
(function () {
  'use strict';

  var MODEL_URL = 'models/u2netp.onnx';
  var ORT_JS = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.20.1/dist/ort.min.js';
  var ORT_WASM_PATH = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.20.1/dist/';
  var MAX_LADO = 1200;           // igual que compressImage de admin.js
  var SIZE = 320;                // entrada fija del modelo
  var MEAN = [0.485, 0.456, 0.406];
  var STD = [0.229, 0.224, 0.225];
  var LS_KEY = 'znr_quitar_fondo';

  var sesion = null;
  var cola = Promise.resolve();  // procesa una foto a la vez
  var chk = null, estado = null;

  function msg(t, err) {
    if (!estado) return;
    estado.textContent = t || '';
    estado.style.color = err ? '#d32f2f' : '';
  }

  function cargarOrt() {
    if (window.ort) return Promise.resolve();
    return new Promise(function (ok, fail) {
      var s = document.createElement('script');
      s.src = ORT_JS;
      s.onload = ok;
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
    if (buf.byteLength < 1000000) throw new Error('El archivo del modelo es inválido.');
    sesion = await ort.InferenceSession.create(buf, { executionProviders: ['wasm'] });
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

  // common.js pinta la foto original en la miniatura; aquí la reemplazamos por la procesada
  function mostrarVistaPrevia(archivo, slot) {
    if (!slot) return;
    var url = URL.createObjectURL(archivo);
    var prev = document.getElementById('preview-image-upload-' + slot);
    if (prev) { prev.src = url; prev.style.display = 'block'; }
    var slotDiv = document.getElementById('slot-' + slot);
    var img = slotDiv && slotDiv.querySelector('img');
    if (img) img.src = url;
  }

  function crearControl() {
    var form = document.getElementById('product-form');
    if (!form) return;
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
    lab.style.cssText = 'display:flex;align-items:center;gap:8px;cursor:pointer;';
    chk = document.createElement('input');
    chk.type = 'checkbox';
    chk.id = 'chk-quitar-fondo';
    try { chk.checked = localStorage.getItem(LS_KEY) === '1'; } catch (e) {}
    chk.addEventListener('change', function () {
      try { localStorage.setItem(LS_KEY, chk.checked ? '1' : '0'); } catch (e) {}
    });
    // product-form.reset() (admin.js) desmarca la casilla: se restaura la preferencia guardada
    form.addEventListener('reset', function () {
      setTimeout(function () {
        try { chk.checked = localStorage.getItem(LS_KEY) === '1'; } catch (e) {}
        msg('');
      }, 0);
    });
    lab.appendChild(chk);
    lab.appendChild(document.createTextNode('Quitar fondo y poner blanco (al subir las fotos)'));
    estado = document.createElement('small');
    estado.id = 'bg-estado';
    fila.appendChild(lab);
    fila.appendChild(estado);
    primera.parentNode.insertBefore(fila, primera);
  }

  function enganchar() {
    var original = window.uploadImageToDrive;
    if (typeof original !== 'function') {
      console.warn('[bg-remove] uploadImageToDrive no existe; no se activa.');
      return;
    }
    window.uploadImageToDrive = function (file, slot) {
      if (!chk || !chk.checked) return original(file, slot);
      var p = cola.then(async function () {
        var usar = file;
        try {
          usar = await procesar(file);
          mostrarVistaPrevia(usar, slot);
          msg('Fondo quitado. Subiendo…');
        } catch (e) {
          console.error('[bg-remove]', e);
          msg('No se pudo quitar el fondo; se subió la foto original. (' + (e && e.message) + ')', true);
        }
        return original(usar, slot);
      });
      cola = p.catch(function () {});
      return p;
    };
  }

  crearControl();
  enganchar();
})();
