(function () {
  'use strict';

  const STORAGE_KEY = 'taskboard.tasks.v1';
  const THEME_KEY = 'taskboard.theme';
  const CATEGORIES = ['Work', 'Personal', 'Study', 'Other'];

  // ---- State ----
  let tasks = [];
  let statusFilter = 'all';
  let categoryFilter = '';
  let searchQuery = '';
  let editingId = null;
  let dragId = null;

  const $ = (id) => document.getElementById(id);
  const els = {
    list: $('taskList'), text: $('taskText'), category: $('taskCategory'), due: $('taskDue'),
    add: $('addBtn'), search: $('searchInput'), catFilter: $('categoryFilter'), clear: $('clearBtn'),
    summary: $('summary'), bar: $('progressBar'), theme: $('themeBtn'),
    countAll: $('countAll'), countActive: $('countActive'), countDone: $('countDone')
  };

  // ---- Persistence ----
  function saveToLocalStorage() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); } catch (e) { /* storage unavailable */ }
  }
  function loadFromLocalStorage() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(data) ? data : [];
    } catch (e) { return []; }
  }

  // ---- Helpers ----
  const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  function todayString() {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  }
  function formatDate(str) {
    const [y, m, d] = str.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString(undefined, {
      month: 'short', day: 'numeric',
      year: y === new Date().getFullYear() ? undefined : 'numeric'
    });
  }
  const categoryOptions = (selected) =>
    CATEGORIES.map((c) => `<option${c === selected ? ' selected' : ''}>${c}</option>`).join('');

  // ---- CRUD ----
  function addTask() {
    const text = els.text.value.trim();
    if (!text) { els.text.focus(); return; }
    tasks.unshift({ id: uid(), text, category: els.category.value, due: els.due.value, done: false });
    els.text.value = ''; els.due.value = '';
    saveToLocalStorage(); render(); els.text.focus();
  }
  function updateTask(id, changes) {
    tasks = tasks.map((t) => (t.id === id ? { ...t, ...changes } : t));
    saveToLocalStorage();
  }
  function deleteTask(id, row) {
    const remove = () => { tasks = tasks.filter((t) => t.id !== id); saveToLocalStorage(); render(); };
    if (row) { row.classList.add('removing'); setTimeout(remove, 260); } else remove();
  }

  // ---- Rendering ----
  function visibleTasks() {
    const q = searchQuery.toLowerCase();
    return tasks.filter((t) => {
      if (statusFilter === 'active' && t.done) return false;
      if (statusFilter === 'completed' && !t.done) return false;
      if (categoryFilter && t.category !== categoryFilter) return false;
      if (q && !t.text.toLowerCase().includes(q)) return false;
      return true;
    });
  }

  function rowHtml(t, today) {
    const key = t.category.toLowerCase();
    if (t.id === editingId) {
      return `<li class="task" data-id="${t.id}">
        <span></span><span></span>
        <div class="edit-form">
          <input class="field grow" id="editText" type="text" maxlength="200" value="${escapeHtml(t.text)}" aria-label="Task title">
          <select class="field" id="editCategory" aria-label="Category">${categoryOptions(t.category)}</select>
          <input class="field" id="editDue" type="date" value="${escapeHtml(t.due)}" aria-label="Due date">
          <button class="btn btn-primary" data-action="save" type="button">Save</button>
          <button class="btn btn-ghost" data-action="cancel" type="button">Cancel</button>
        </div></li>`;
    }
    let due = '';
    if (t.due) {
      const overdue = !t.done && t.due < today;
      due = `<span class="${overdue ? 'overdue' : ''}">${overdue ? 'Overdue, ' : 'Due '}${formatDate(t.due)}</span>`;
    }
    return `<li class="task${t.done ? ' done' : ''}" data-id="${t.id}">
      <span class="grip" data-grip aria-hidden="true" title="Drag to reorder">&#8942;&#8942;</span>
      <input class="check" type="checkbox" ${t.done ? 'checked' : ''} aria-label="Mark complete: ${escapeHtml(t.text)}">
      <div class="task-main">
        <span class="task-title">${escapeHtml(t.text)}</span>
        <div class="task-meta"><span class="badge badge-${key}">${escapeHtml(t.category)}</span>${due}</div>
      </div>
      <div class="task-actions">
        <button class="icon-btn" data-action="edit" type="button">Edit</button>
        <button class="icon-btn danger" data-action="delete" type="button">Delete</button>
      </div></li>`;
  }

  function render() {
    const today = todayString();
    const items = visibleTasks();
    if (items.length) {
      els.list.innerHTML = items.map((t) => rowHtml(t, today)).join('');
    } else {
      els.list.innerHTML = tasks.length
        ? '<li class="empty"><strong>No matching tasks</strong>Adjust the filters or search to see more.</li>'
        : '<li class="empty"><strong>No tasks yet</strong>Add your first task above to get started.</li>';
    }
    updateSummary();
    if (editingId) { const f = $('editText'); if (f) { f.focus(); f.select(); } }
  }

  function updateSummary() {
    const done = tasks.filter((t) => t.done).length;
    const total = tasks.length;
    els.summary.textContent = total ? `${total - done} active, ${done} completed` : 'No tasks yet';
    els.bar.style.width = total ? Math.round((done / total) * 100) + '%' : '0%';
    els.countAll.textContent = total;
    els.countActive.textContent = total - done;
    els.countDone.textContent = done;
  }

  function saveEdit(row, id) {
    const text = row.querySelector('#editText').value.trim();
    if (!text) { row.querySelector('#editText').focus(); return; }
    updateTask(id, {
      text,
      category: row.querySelector('#editCategory').value,
      due: row.querySelector('#editDue').value
    });
    editingId = null; render();
  }

  // ---- Events ----
  els.add.addEventListener('click', addTask);
  els.text.addEventListener('keydown', (e) => { if (e.key === 'Enter') addTask(); });
  els.search.addEventListener('input', (e) => { searchQuery = e.target.value.trim(); render(); });
  els.catFilter.addEventListener('change', (e) => { categoryFilter = e.target.value; render(); });

  document.querySelectorAll('[data-filter]').forEach((btn) => {
    btn.addEventListener('click', () => {
      statusFilter = btn.dataset.filter;
      document.querySelectorAll('[data-filter]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      render();
    });
  });

  els.clear.addEventListener('click', () => {
    if (!tasks.some((t) => t.done)) return;
    tasks = tasks.filter((t) => !t.done);
    saveToLocalStorage(); render();
  });

  els.list.addEventListener('change', (e) => {
    if (!e.target.classList.contains('check')) return;
    const row = e.target.closest('.task');
    row.classList.toggle('done', e.target.checked); // animate in place
    updateTask(row.dataset.id, { done: e.target.checked });
    updateSummary();
    setTimeout(render, 450); // re-apply status filter after the animation
  });

  els.list.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const row = btn.closest('.task');
    const id = row.dataset.id;
    switch (btn.dataset.action) {
      case 'delete': deleteTask(id, row); break;
      case 'edit': editingId = id; render(); break;
      case 'cancel': editingId = null; render(); break;
      case 'save': saveEdit(row, id); break;
    }
  });

  els.list.addEventListener('keydown', (e) => {
    const row = e.target.closest('.task');
    if (!row || row.dataset.id !== editingId) return;
    if (e.key === 'Enter') saveEdit(row, row.dataset.id);
    if (e.key === 'Escape') { editingId = null; render(); }
  });

  // Drag and drop (handle only)
  els.list.addEventListener('mousedown', (e) => {
    const row = e.target.closest('.task');
    if (row) row.draggable = !!e.target.closest('[data-grip]');
  });
  els.list.addEventListener('dragstart', (e) => {
    const row = e.target.closest('.task');
    if (!row || !row.draggable) { e.preventDefault(); return; }
    dragId = row.dataset.id;
    row.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', dragId);
  });
  els.list.addEventListener('dragover', (e) => {
    if (!dragId) return;
    e.preventDefault();
    els.list.querySelectorAll('.drop-target').forEach((el) => el.classList.remove('drop-target'));
    const row = e.target.closest('.task');
    if (row && row.dataset.id !== dragId) row.classList.add('drop-target');
  });
  els.list.addEventListener('drop', (e) => {
    e.preventDefault();
    const row = e.target.closest('.task');
    if (row && dragId && row.dataset.id !== dragId) {
      const moved = tasks.find((t) => t.id === dragId);
      tasks = tasks.filter((t) => t.id !== dragId);
      tasks.splice(tasks.findIndex((t) => t.id === row.dataset.id), 0, moved);
      saveToLocalStorage();
    }
    dragId = null; render();
  });
  els.list.addEventListener('dragend', () => { dragId = null; render(); });

  // Theme
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    els.theme.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
  }
  els.theme.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* ignore */ }
  });

  // ---- Init ----
  let savedTheme = null;
  try { savedTheme = localStorage.getItem(THEME_KEY); } catch (e) { /* ignore */ }
  applyTheme(savedTheme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  tasks = loadFromLocalStorage();
  render();
})();
