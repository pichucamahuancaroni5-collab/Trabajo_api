async function api(path, options = {}) {
  const response = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...options });
  let data = null;
  try { data = await response.json(); } catch (_) {}
  if (!response.ok) throw new Error(data?.error || 'Ocurrió un error');
  return data;
}
function showMessage(text, type='success') {
  const el = document.getElementById('message');
  el.textContent = text; el.className = `message ${type}`;
  setTimeout(() => { el.className='message'; el.textContent=''; }, 3000);
}
function setFormData(fields, data={}) { for (const field of fields) { const input = document.getElementById(field.name); if (input) input.value = data[field.name] ?? ''; } }
function getFormData(fields) { const data = {}; for (const field of fields) { const input = document.getElementById(field.name); data[field.name] = input?.value ?? ''; } return data; }
function resetForm(fields, idField) { document.getElementById(idField).value=''; setFormData(fields, {}); }
async function fillSelect(selectId, endpoint, valueField, textBuilder) {
  const items = await api(endpoint);
  const select = document.getElementById(selectId);
  if (!select) return;
  select.innerHTML = '<option value="">Seleccione</option>' + items.map(item => `<option value="${item[valueField]}">${textBuilder(item)}</option>`).join('');
}
