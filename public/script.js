(function () {
  const body = document.body;
  const toggleBtn = document.getElementById('theme-toggle');
  const storedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = storedTheme || (prefersDark ? 'dark' : 'light');

  const setTheme = (value) => {
    body.classList.remove('theme-light', 'theme-dark');
    body.classList.add('theme-' + value);
    localStorage.setItem('theme', value);
    if (toggleBtn) {
      toggleBtn.textContent = value === 'dark' ? '☀️ Light' : '🌙 Dark';
    }
  };

  setTheme(theme);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      setTheme(body.classList.contains('theme-dark') ? 'light' : 'dark');
    });
  }
})();