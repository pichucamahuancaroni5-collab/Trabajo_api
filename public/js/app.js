
const MODULES = [
  { file: 'index.html', label: 'Inicio', entity: null, desc: 'Resumen general del sistema' },
  { file: 'categorias.html', label: 'Categorías', entity: 'categoria', desc: 'Clasificación de productos' },
  { file: 'clientes.html', label: 'Clientes', entity: 'clientes', desc: 'Gestión de clientes registrados' },
  { file: 'proveedores.html', label: 'Proveedores', entity: 'proveedor', desc: 'Empresas proveedoras' },
  { file: 'productos.html', label: 'Productos', entity: 'producto', desc: 'Inventario y relaciones' },
  { file: 'ventas.html', label: 'Ventas', entity: 'ventas', desc: 'Registro de ventas' },
  { file: 'detalle_venta.html', label: 'Detalle venta', entity: 'detalle_venta', desc: 'Items por venta' }
];

async function api(path, options = {}) {
  const response = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...options });
  let data = null;
  try { data = await response.json(); } catch (_) {}
  if (!response.ok) throw new Error(data?.error || 'Ocurrió un error');
  return data;
}
function showMessage(text, type='success') {
  const el = document.getElementById('message');
  if (!el) return;
  el.textContent = text; el.className = `message ${type}`;
  setTimeout(() => { el.className='message'; el.textContent=''; }, 3200);
}
function setFormData(fields, data={}) { for (const field of fields) { const input = document.getElementById(field.name); if (input) input.value = data[field.name] ?? ''; } }
function getFormData(fields) { const data = {}; for (const field of fields) { const input = document.getElementById(field.name); data[field.name] = input?.value ?? ''; } return data; }
function resetForm(fields, idField) { const idInput=document.getElementById(idField); if(idInput) idInput.value=''; setFormData(fields, {}); }
async function fillSelect(selectId, endpoint, valueField, textBuilder) {
  const items = await api(endpoint);
  const select = document.getElementById(selectId);
  if (!select) return;
  select.innerHTML = '<option value="">Seleccione</option>' + items.map(item => `<option value="${item[valueField]}">${textBuilder(item)}</option>`).join('');
}
function getActiveFile() {
  const current = window.location.pathname.split('/').pop() || 'index.html';
  return current;
}
function buildSidebar() {
  const active = getActiveFile();
  return `
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-badge">BD</div>
        <div>
          <h1>Panel CRUD</h1>
          <p>basedatos · Node + Express</p>
        </div>
      </div>
      <div class="nav-title">Navegación</div>
      <nav class="nav-menu">
        ${MODULES.map(m => `
          <a class="nav-link ${active===m.file?'active':''}" href="/${m.file}">
            <div>
              <strong>${m.label}</strong>
              <span>${m.desc}</span>
            </div>
          </a>`).join('')}
      </nav>
      <div class="nav-title">Estado</div>
      <div class="panel" style="padding:16px; margin-top:8px;">
        <div class="muted">Proyecto conectado a tu base de datos. Desde aquí puedes registrar, editar y eliminar información.</div>
      </div>
    </aside>`;
}
function renderShell(content) {
  document.body.innerHTML = `<div class="app-shell">${buildSidebar()}<main class="main">${content}</main></div>`;
}
function renderCrudPage({ title, subtitle, idField, fields, tableHead, searchPlaceholder='Buscar en la tabla...' }) {
  const formFields = fields.map(field => {
    const input = field.type === 'select'
      ? `<select id="${field.name}"></select>`
      : `<input type="${field.type || 'text'}" id="${field.name}" ${field.min !== undefined ? `min="${field.min}"` : ''} />`;
    return `<div><label for="${field.name}">${field.label}</label>${input}</div>`;
  }).join('');
  const twoCols = fields.length >= 4 ? 'field-grid two' : 'field-grid';
  return `
    <div class="page-header">
      <div>
        <div class="page-breadcrumb">Inicio / ${title}</div>
        <h1 class="page-title">${title}</h1>
        <div class="page-subtitle">${subtitle}</div>
      </div>
      <a href="/index.html" class="btn btn-ghost">Volver al panel</a>
    </div>
    <div id="message" class="message"></div>
    <div class="content-grid">
      <section class="form-card">
        <div class="kicker">Formulario principal</div>
        <h2 class="section-title">Registrar o editar</h2>
        <input type="hidden" id="${idField}" />
        <div class="${twoCols}">${formFields}</div>
        <div class="actions" style="margin-top:18px;">
          <button class="btn-primary" onclick="saveRecord()">Guardar</button>
          <button class="btn-warning" onclick="clearForm()">Limpiar</button>
        </div>
        <div class="footer-note">Usa el botón editar desde la tabla para cargar un registro existente.</div>
      </section>
      <section class="table-card">
        <div class="toolbar">
          <div>
            <h2 class="section-title" style="margin-bottom:6px;">Listado general</h2>
            <div class="muted">Visualiza y administra los registros de este módulo.</div>
          </div>
          <div class="search-box">
            <input type="text" id="tableSearch" placeholder="${searchPlaceholder}" oninput="applyTableFilter()" />
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr>${tableHead.map(h => `<th>${h}</th>`).join('')}</tr></thead>
            <tbody id="tableBody"><tr><td colspan="${tableHead.length}" class="empty-state">Cargando datos...</td></tr></tbody>
          </table>
        </div>
      </section>
    </div>`;
}
let __tableRows = [];
function setRows(rows) { __tableRows = Array.isArray(rows) ? rows : []; }
function applyTableFilter() {
  if (typeof renderTable !== 'function') return;
  const term = (document.getElementById('tableSearch')?.value || '').trim().toLowerCase();
  if (!term) return renderTable(__tableRows);
  const filtered = __tableRows.filter(item => JSON.stringify(item).toLowerCase().includes(term));
  renderTable(filtered);
}
function renderEmpty(colspan, text='No hay registros disponibles.') {
  return `<tr><td colspan="${colspan}" class="empty-state">${text}</td></tr>`;
}
async function loadDashboard() {
  const content = `
    <section class="hero">
      <div class="hero-card">
        <div class="kicker">Sistema de gestión</div>
        <h2>Dashboard de tu base de datos</h2>
        <p>Administra categorías, clientes, proveedores, productos, ventas y detalle de venta desde un panel moderno, responsive y conectado a Express + MySQL.</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="/productos.html">Ir a productos</a>
          <a class="btn btn-ghost" href="/ventas.html">Ir a ventas</a>
        </div>
      </div>
      <div class="hero-card" style="max-width:360px;">
        <div class="stat-label">Estado del sistema</div>
        <p id="healthState" class="stat-value" style="font-size:1.5rem;">Verificando…</p>
        <div class="stat-caption">Conexión con servidor y base de datos.</div>
      </div>
    </section>
    <section class="stat-grid" id="statsGrid"></section>
    <section class="dashboard-grid">
      <div class="welcome-card">
        <h3 class="section-title">Módulos principales</h3>
        <div class="module-list">
          ${MODULES.filter(m=>m.entity).map(m => `<a class="module-item" href="/${m.file}"><div><strong>${m.label}</strong><small>${m.desc}</small></div><span class="badge">Abrir</span></a>`).join('')}
        </div>
      </div>
      <div class="panel">
        <h3 class="section-title">Qué puedes hacer aquí</h3>
        <div class="module-list">
          <div class="module-item"><div><strong>Registrar</strong><small>Agrega nuevos datos en cada tabla</small></div><span class="badge">Create</span></div>
          <div class="module-item"><div><strong>Actualizar</strong><small>Edita registros desde la tabla</small></div><span class="badge">Update</span></div>
          <div class="module-item"><div><strong>Eliminar</strong><small>Quita registros cuando lo necesites</small></div><span class="badge">Delete</span></div>
          <div class="module-item"><div><strong>Buscar</strong><small>Filtra información rápidamente</small></div><span class="badge">Read</span></div>
        </div>
      </div>
    </section>`;
  renderShell(content);
  try {
    const [health, categorias, clientes, proveedores, productos, ventas, detalle] = await Promise.all([
      api('/health'), api('/api/categoria'), api('/api/clientes'), api('/api/proveedor'), api('/api/producto'), api('/api/ventas'), api('/api/detalle_venta')
    ]);
    document.getElementById('healthState').textContent = health.db ? 'Conectado' : 'Revisar';
    const stats = [
      ['Categorías', categorias.length, 'Tipos de producto'],
      ['Clientes', clientes.length, 'Personas registradas'],
      ['Proveedores', proveedores.length, 'Empresas proveedoras'],
      ['Productos', productos.length, 'Items en inventario'],
      ['Ventas', ventas.length, 'Registros de venta'],
      ['Detalle venta', detalle.length, 'Items vendidos']
    ];
    document.getElementById('statsGrid').innerHTML = stats.map(([label,value,caption]) => `
      <div class="stat-card">
        <div class="stat-label">${label}</div>
        <div class="stat-value">${value}</div>
        <div class="stat-caption">${caption}</div>
      </div>`).join('');
  } catch (error) {
    document.getElementById('healthState').textContent = 'Error';
    document.getElementById('statsGrid').innerHTML = `<div class="stat-card"><div class="stat-label">Estado</div><div class="stat-value" style="font-size:1.2rem;">No se pudo cargar el resumen</div><div class="stat-caption">${error.message}</div></div>`;
  }
}
