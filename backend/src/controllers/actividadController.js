const pool = require('../config/db');

async function listar(req, res, next) {
  try {
    const limite = Math.min(Number(req.query.limite) || 8, 50);
    const { rows } = await pool.query(
      `SELECT h.id, h.tarea_id, h.usuario_id, h.accion, h.valor_anterior, h.valor_nuevo, h.registrado_en,
              t.titulo AS tarea_titulo
       FROM historial_tareas h
       JOIN tareas t ON t.id = h.tarea_id
       ORDER BY h.registrado_en DESC
       LIMIT $1`,
      [limite]
    );
    res.json(
      rows.map((r) => ({
        id: r.id,
        tareaId: r.tarea_id,
        usuarioId: r.usuario_id,
        accion: r.accion,
        valorAnterior: r.valor_anterior,
        valorNuevo: r.valor_nuevo,
        objeto: r.tarea_titulo,
        registradoEn: r.registrado_en
      }))
    );
  } catch (err) {
    next(err);
  }
}

module.exports = { listar };
