// Run before the stylesheet to avoid flashing the wrong theme on navigation.
(() => {
  let theme;
  try { theme = localStorage.getItem('do-theme'); } catch {}
  if (theme !== 'light' && theme !== 'dark') theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.documentElement.dataset.theme = theme;
})();
