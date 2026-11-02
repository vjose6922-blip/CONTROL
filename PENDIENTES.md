# Pendientes

## Por probar (sesión de banners, oct 2026, ya en main)
- [ ] Banners de temporada: un banner vencido muestra **"Renovar <año>"** y queda con las fechas del año siguiente.
      Las temporadas que cambian de fecha (Semana Santa, Día del Padre, Buen Fin…) ajustarlas con "Editar" después de renovar.
- [ ] Los banners creados antes de la opción **"Dónde mostrar"** salen solo en Comunidad: editarlos si deben salir en Inicio.
- [ ] Notificaciones → Beneficiarios: los contadores suman Nuevas + Ediciones + Reportes, y "Aprobados" lista los refugios.

## Por probar (sesión del monitor de errores y el panel, oct 2026, ya en main)
- [ ] Sesión en otro dispositivo: entrar con la misma cuenta en otro teléfono → el panel anterior cierra sesión
      y el login muestra el aviso rojo "Tu sesión se cerró porque se inició sesión… en otro dispositivo".
- [ ] Estadísticas de vendedor (en Inicio y en Herramientas): Activar/Quitar Plus, Ajustar días, Suspender y Eliminar
      no dejan confirmar sin motivo, y el motivo sale en `Audit.html` (necesita `vendedores-api` desplegado, ver znr-backend).
- [ ] Cuentas existentes (Master): filtro por ciudad y la lista usa toda la pantalla.
- [ ] Chat de soporte con RTDB real: botón de ventana completa y "Agregar personas" con buscador y varias a la vez.
- [ ] Error monitor: que ya no aparezcan `showPanel is not defined`, CSP `connect-src` de firebaseio en `plan-plus.html`,
      `Cannot read properties of null (reading 'ok')` ni `Failed to fetch`.

Pendientes del sitio y del backend: ver `PENDIENTES.md` en `znr` y en `znr-backend`.
