// Solo Master puede ver este panel. Mismo criterio que el resto del
// panel admin (admin.js): si no hay sesión, o el rol guardado no es
// "master", se regresa a index.html antes de pintar nada.
(function () {
    const rol = sessionStorage.getItem('admin_rol') || 'master';
    if (!sessionStorage.getItem('admin_token') || rol !== 'master') {
        location.href = 'index.html';
    }
})();
