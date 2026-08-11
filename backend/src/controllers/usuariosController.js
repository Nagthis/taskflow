const pool = require('../config/db');
const { colorAvatar } = require('../utils/avatar');

function mapUsuario(row) {
  const avatar = colorAvatar(row.id);
  return {
    id: row.id,
    nombre: row.nombre,
    correo: row.correo,
    cargo: row.cargo,
    iniciales: row.iniciales,
    rol: row.rol_nombre,
    avatarBg: avatar.bg,
    avatarColor: avatar.color
  };
}

async function listar(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT u.*, r.nombre AS rol_nombre
       FROM usuarios u JOIN roles r ON r.id = u.rol_id
       WHERE u.activo = TRUE
       ORDER BY u.nombre`
    );
    res.json(rows.map(mapUsuario));
  } catch (err) {
    next(err);
  }
}

module.exports = { listar };
