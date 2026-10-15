(function() {
  if (sessionStorage.getItem('admin_token') && sessionStorage.getItem('admin_session') === 'true') return;
  // Sin sesión (p. ej. se abrió desde un push en una pestaña nueva): ir al login
  // y volver aquí al terminar (ver _irADestinoPendiente en admin.js).
  sessionStorage.setItem('admin_next', 'notificaciones.html' + location.hash);
  window.location.replace('index.html');
})();
