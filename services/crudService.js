const pool = require('../config/db');

const TABLES = {
  categoria: { table: 'categoria', id: 'id_categoria', fields: ['descripcion'] },
  clientes: { table: 'clientes', id: 'id_cliente', fields: ['nombres', 'apellidos', 'direccion', 'telefono'] },
  proveedor: { table: 'proveedor', id: 'id_proveedor', fields: ['razonsocial', 'direccion', 'telefono'] },
  producto: { table: 'producto', id: 'id_producto', fields: ['descripcion', 'precio', 'stock', 'id_categoria', 'id_proveedor'] },
  ventas: { table: 'ventas', id: 'id_venta', fields: ['fecha', 'id_cliente'] },
  detalle_venta: { table: 'detalle_venta', id: 'id_detventa', fields: ['cantidad', 'id_producto', 'id_venta'] }
};

function getConfig(entity) {
  const config = TABLES[entity];
  if (!config) {
    const error = new Error('Entidad no válida');
    error.status = 400;
    throw error;
  }
  return config;
}

async function list(entity) {
  const config = getConfig(entity);

  if (entity === 'producto') {
    const [rows] = await pool.query(`
      SELECT p.*, c.descripcion AS categoria, pr.razonsocial AS proveedor
      FROM producto p
      LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
      LEFT JOIN proveedor pr ON p.id_proveedor = pr.id_proveedor
      ORDER BY p.id_producto DESC
    `);
    return rows;
  }

  if (entity === 'ventas') {
    const [rows] = await pool.query(`
      SELECT v.*, CONCAT(c.nombres, ' ', c.apellidos) AS cliente
      FROM ventas v
      LEFT JOIN clientes c ON v.id_cliente = c.id_cliente
      ORDER BY v.id_venta DESC
    `);
    return rows;
  }

  if (entity === 'detalle_venta') {
    const [rows] = await pool.query(`
      SELECT dv.*, p.descripcion AS producto, v.fecha AS fecha_venta
      FROM detalle_venta dv
      LEFT JOIN producto p ON dv.id_producto = p.id_producto
      LEFT JOIN ventas v ON dv.id_venta = v.id_venta
      ORDER BY dv.id_detventa DESC
    `);
    return rows;
  }

  const [rows] = await pool.query(`SELECT * FROM ${config.table} ORDER BY ${config.id} DESC`);
  return rows;
}

async function getById(entity, id) {
  const config = getConfig(entity);
  const [rows] = await pool.query(`SELECT * FROM ${config.table} WHERE ${config.id} = ?`, [id]);
  return rows[0] || null;
}

async function create(entity, data) {
  const config = getConfig(entity);
  const fields = config.fields.join(', ');
  const placeholders = config.fields.map(() => '?').join(', ');
  const values = config.fields.map((field) => data[field] ?? null);
  const [result] = await pool.query(`INSERT INTO ${config.table} (${fields}) VALUES (${placeholders})`, values);
  return getById(entity, result.insertId);
}

async function update(entity, id, data) {
  const config = getConfig(entity);
  const setClause = config.fields.map((field) => `${field} = ?`).join(', ');
  const values = config.fields.map((field) => data[field] ?? null);
  const [result] = await pool.query(`UPDATE ${config.table} SET ${setClause} WHERE ${config.id} = ?`, [...values, id]);
  if (!result.affectedRows) return null;
  return getById(entity, id);
}

async function remove(entity, id) {
  const config = getConfig(entity);
  const [result] = await pool.query(`DELETE FROM ${config.table} WHERE ${config.id} = ?`, [id]);
  return result.affectedRows > 0;
}

module.exports = { TABLES, list, getById, create, update, remove };
