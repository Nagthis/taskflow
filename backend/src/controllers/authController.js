const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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

async function login(req, res, next) {
  try {
    const { correo, clave } = req.body;
    if (!correo || !clave) {
      return res.status(400).json({ error: 'Ingresa tu correo y tu contraseña.' });
    }

    const { rows } = await pool.query(
      `SELECT u.*, r.nombre AS rol_nombre
       FROM usuarios u
       JOIN roles r ON r.id = u.rol_id
       WHERE lower(u.correo) = lower($1) AND u.activo = TRUE`,
      [correo.trim()]
    );
    const usuario = rows[0];

    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas. Revisa tu correo y contraseña.' });
    }

    const ok = await bcrypt.compare(clave, usuario.password_hash);
    if (!ok) {
      return res.status(401).json({ error: 'Credenciales inválidas. Revisa tu correo y contraseña.' });
    }

    const perfil = mapUsuario(usuario);
    const token = jwt.sign(perfil, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h'
    });

    res.json({ token, usuario: perfil });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT u.*, r.nombre AS rol_nombre
       FROM usuarios u JOIN roles r ON r.id = u.rol_id
       WHERE u.id = $1`,
      [req.usuario.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Usuario no encontrado.' });
    res.json(mapUsuario(rows[0]));
  } catch (err) {
    next(err);
  }
}

module.exports = { login, me, mapUsuario };
