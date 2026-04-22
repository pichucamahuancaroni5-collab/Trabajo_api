const { TABLES, list, getById, create, update, remove } = require('../services/crudService');

async function getMeta(req, res) { res.json(TABLES); }

async function listRecords(req, res) {
  try { res.json(await list(req.params.entity)); }
  catch (error) { res.status(error.status || 500).json({ error: error.message }); }
}

async function getRecord(req, res) {
  try {
    const row = await getById(req.params.entity, req.params.id);
    if (!row) return res.status(404).json({ error: 'Registro no encontrado' });
    res.json(row);
  } catch (error) { res.status(error.status || 500).json({ error: error.message }); }
}

async function createRecord(req, res) {
  try { res.status(201).json(await create(req.params.entity, req.body)); }
  catch (error) { res.status(error.status || 500).json({ error: error.message }); }
}

async function updateRecord(req, res) {
  try {
    const row = await update(req.params.entity, req.params.id, req.body);
    if (!row) return res.status(404).json({ error: 'Registro no encontrado' });
    res.json(row);
  } catch (error) { res.status(error.status || 500).json({ error: error.message }); }
}

async function deleteRecord(req, res) {
  try {
    const ok = await remove(req.params.entity, req.params.id);
    if (!ok) return res.status(404).json({ error: 'Registro no encontrado' });
    res.json({ message: 'Registro eliminado correctamente' });
  } catch (error) { res.status(error.status || 500).json({ error: error.message }); }
}

module.exports = { getMeta, listRecords, getRecord, createRecord, updateRecord, deleteRecord };
