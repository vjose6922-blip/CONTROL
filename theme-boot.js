document.documentElement.dataset.theme = localStorage.getItem('theme') || document.currentScript.dataset.default;
const _ses = (s) => s.getItem('admin_session') === 'true' && s.getItem('admin_token');
if (_ses(sessionStorage) || _ses(localStorage)) document.documentElement.classList.add('has-session');
