'use strict';
// Shared navigation and decorative motion. Main content never depends on loading effects.
const menu = document.querySelector('.menu-button');
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  document.querySelector('#navigation').classList.toggle('open', open);
  menu.textContent = open ? 'Close −' : 'Menu +';
});
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const motionButton = document.querySelector('#motion-toggle');
let motionPaused = reduceMotion.matches;
try { motionPaused = motionPaused || localStorage.getItem('do-motion-paused') === 'true'; } catch {}
const canvas = document.querySelector('#matrix');
const ctx = canvas.getContext('2d');
let drops = [], frame = 0, lastFrame = 0;
function resizeCanvas() {
  canvas.width = innerWidth; canvas.height = innerHeight;
  drops = Array.from({length: Math.ceil(canvas.width / 25)}, () => Math.random() * -60);
}
function drawMatrix(time) {
  if (motionPaused || !ctx) return;
  if (time - lastFrame > 75) {
    ctx.fillStyle = document.documentElement.dataset.theme === 'light' ? 'rgba(245,249,244,0.18)' : 'rgba(8,13,11,0.13)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = document.documentElement.dataset.theme === 'light' ? '#16733c' : '#8dffab'; ctx.font = 'bold 18px monospace';
    drops.forEach((y, i) => {
      ctx.fillText('01<>/{}'[Math.floor(Math.random() * 7)], i * 25, y * 23);
      drops[i] = y * 23 > canvas.height && Math.random() > .975 ? 0 : y + 1;
    });
    lastFrame = time;
  }
  frame = requestAnimationFrame(drawMatrix);
}
function applyMotion() {
  cancelAnimationFrame(frame);
  document.body.classList.toggle('no-motion', motionPaused);
  motionButton.setAttribute('aria-pressed', String(motionPaused));
  motionButton.textContent = motionPaused ? 'Enable motion' : 'Pause motion';
  if (!motionPaused) frame = requestAnimationFrame(drawMatrix);
}
resizeCanvas(); applyMotion();
addEventListener('resize', resizeCanvas);
motionButton.addEventListener('click', () => {
  motionPaused = !motionPaused;
  try { localStorage.setItem('do-motion-paused', String(motionPaused)); } catch {}
  applyMotion();
});
reduceMotion.addEventListener('change', e => { motionPaused = e.matches; applyMotion(); });
try {
  if (!sessionStorage.getItem('do-visited') && !motionPaused) {
    document.querySelector('.boot').classList.add('running');
    sessionStorage.setItem('do-visited', 'true');
  }
} catch {}

// Planner: task objects live in an array. Render rebuilds the visible list safely.
const taskForm = document.querySelector('#task-form');
if (taskForm) {
  const key = 'do-academic-tasks-v1';
  const list = document.querySelector('#task-list');
  const status = document.querySelector('#task-status');
  let tasks = [], filter = 'all';
  try {
    const stored = JSON.parse(localStorage.getItem(key) || '[]');
    if (!Array.isArray(stored)) throw new Error('Invalid saved tasks');
    tasks = stored.filter(t => t && typeof t.id === 'string' && typeof t.title === 'string' && typeof t.completed === 'boolean' && typeof t.date === 'string');
  } catch { document.querySelector('#storage-warning').textContent = 'Saved tasks could not be loaded. You can still use the planner for this visit.'; }
  function saveTasks() {
    try { localStorage.setItem(key, JSON.stringify(tasks)); }
    catch { document.querySelector('#storage-warning').textContent = 'Browser storage is unavailable. Changes will last only for this visit.'; }
  }
  function renderTasks() {
    list.replaceChildren();
    const visible = tasks.filter(t => filter === 'all' || (filter === 'completed' ? t.completed : !t.completed));
    document.querySelector('#task-count').textContent = `${tasks.filter(t => t.completed).length} OF ${tasks.length} COMPLETE`;
    const empty = document.querySelector('#task-empty');
    empty.hidden = visible.length > 0;
    empty.textContent = tasks.length ? 'No tasks match this filter.' : 'Your planner is clear. Add your first task to get started.';
    visible.forEach(t => {
      const li = document.createElement('li'); li.classList.toggle('done', t.completed);
      const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.checked = t.completed;
      checkbox.id = `task-${t.id}`;
      const label = document.createElement('label'); label.htmlFor = checkbox.id;
      const title = document.createElement('span'); title.textContent = t.title; label.append(title);
      if (t.date) { const date = document.createElement('small'); date.textContent = `Due ${t.date}`; label.append(date); }
      checkbox.addEventListener('change', () => {
        t.completed = checkbox.checked; saveTasks(); renderTasks();
        document.getElementById(checkbox.id)?.focus();
        status.textContent = `${t.title} marked ${t.completed ? 'complete' : 'active'}.`;
      });
      const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = 'Delete';
      remove.setAttribute('aria-label', `Delete ${t.title}`);
      remove.addEventListener('click', () => {
        tasks = tasks.filter(item => item.id !== t.id); saveTasks(); renderTasks();
        document.querySelector('#task-title').focus(); status.textContent = `${t.title} deleted.`;
      });
      li.append(checkbox, label, remove); list.append(li);
    });
  }
  taskForm.addEventListener('submit', e => {
    e.preventDefault();
    const input = document.querySelector('#task-title');
    const title = input.value.trim();
    if (!title) { input.setCustomValidity('Enter a task name.'); input.reportValidity(); return; }
    tasks.push({id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`, title, date: document.querySelector('#task-date').value, completed: false});
    saveTasks(); taskForm.reset(); filter = 'all';
    document.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filter === filter)));
    renderTasks(); input.focus(); status.textContent = 'Task added.';
  });
  document.querySelector('#task-title').addEventListener('input', e => e.target.setCustomValidity(''));
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    filter = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    renderTasks();
  }));
  renderTasks();
}

// Validate as users type and again on submission, including pasted input.
const contactForm = document.querySelector('#contact-form');
if (contactForm) {
  const fields = ['name', 'email', 'phone', 'message'];
  function validateField(id) {
    const field = document.getElementById(id);
    const value = field.value.trim();
    let error = value ? '' : 'This field is required.';
    if (!error && id === 'email' && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || field.validity.typeMismatch)) error = 'Enter a valid email address, such as name@example.com.';
    if (!error && id === 'phone' && !/^[0-9]+$/.test(field.value)) error = 'Use digits only. Letters, spaces and symbols are not allowed.';
    document.getElementById(`${id}-error`).textContent = error;
    field.setAttribute('aria-invalid', String(Boolean(error)));
    return !error;
  }
  fields.forEach(id => {
    const field = document.getElementById(id);
    field.addEventListener('input', () => {
      validateField(id);
      document.querySelector('#email-draft').hidden = true;
      document.querySelector('#contact-status').textContent = '';
    });
    field.addEventListener('blur', () => validateField(id));
  });
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    let firstInvalid = null;
    fields.forEach(id => { if (!validateField(id) && !firstInvalid) firstInvalid = document.getElementById(id); });
    const status = document.querySelector('#contact-status');
    const draft = document.querySelector('#email-draft');
    draft.hidden = true;
    if (firstInvalid) { firstInvalid.focus(); status.textContent = 'Please correct the highlighted fields.'; return; }
    const values = Object.fromEntries(fields.map(id => [id, document.getElementById(id).value.trim()]));
    const body = `Name: ${values.name}\nEmail: ${values.email}\nPhone: ${values.phone}\n\n${values.message}`;
    draft.href = `mailto:damifreelance@gmail.com?subject=${encodeURIComponent('Portfolio enquiry from ' + values.name)}&body=${encodeURIComponent(body)}`;
    draft.hidden = false;
    status.textContent = 'Details validated. Open your email app below, review the draft, then send it there. No message has been sent yet.';
  });
}

// Theme preference persists across pages and visits; system preference is the default.
const themeButton = document.querySelector('#theme-toggle');
const systemTheme = matchMedia('(prefers-color-scheme: dark)');
function updateThemeButton() {
  const dark = document.documentElement.dataset.theme === 'dark';
  themeButton.setAttribute('aria-pressed', String(dark));
  themeButton.textContent = dark ? 'Light mode' : 'Dark mode';
}
function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  updateThemeButton();
}
updateThemeButton();
themeButton.addEventListener('click', () => {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  setTheme(theme);
  try { localStorage.setItem('do-theme', theme); } catch {}
});
systemTheme.addEventListener('change', e => {
  let saved = null;
  try { saved = localStorage.getItem('do-theme'); } catch {}
  if (saved !== 'light' && saved !== 'dark') setTheme(e.matches ? 'dark' : 'light');
});
