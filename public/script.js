(function () {
  const toggleBtn = document.getElementById('theme-toggle');
  const hasThemeCookie = document.cookie.split('; ').find(row => row.startsWith('theme='));

  if (!hasThemeCookie) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      const newTheme = 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      document.cookie = `theme=${newTheme}; path=/; max-age=31536000; SameSite=Lax`;
      if (toggleBtn) toggleBtn.textContent = '☀️ Light';
    }
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const newTheme = isDark ? 'light' : 'dark';

      document.documentElement.setAttribute('data-theme', newTheme);
      toggleBtn.textContent = newTheme === 'dark' ? '☀️ Light' : '🌙 Dark';
      document.cookie = `theme=${newTheme}; path=/; max-age=31536000; SameSite=Lax`;
    });
  }
})();