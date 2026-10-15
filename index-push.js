// Registra el token de notificaciones push del admin.
// Se dispara al enviar el login (dando tiempo a admin.js para validar y
// guardar admin_token en sessionStorage) y también si la sesión ya existía
// al recargar la página.
document.addEventListener('DOMContentLoaded', () => {
  function pedirPushAdmin() {
    if (sessionStorage.getItem('admin_token') && typeof window.solicitarPermisoNotificacionesSiFalta === 'function') {
      window.solicitarPermisoNotificacionesSiFalta('admin', 'admin');
    }
  }
  const form = document.getElementById('admin-login-form');
  if (form) {
    form.addEventListener('submit', () => setTimeout(pedirPushAdmin, 1500));
  }
  pedirPushAdmin();
});
