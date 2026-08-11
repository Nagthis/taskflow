const pool = require('../config/db');

const ESTADOS = ['pendiente', 'en_progreso', 'completada'];
const PRIORIDADES = ['baja', 'media', 'alta'];

function mapTarea(row) {
  return {
    id: row.id,
    titulo: row.titulo,
    descripcion: row.descripcion,
    estado: row.estado,
    prioridad: row.prioridad,
    asignadoId: row.asignado_id,
    vence: row.fecha_limite instanceof Date
      ? row.fecha_limite.toISOString().slice(0, 10)
      : row.fecha_limite,
    creadoEn: row.creado_en,
    completadoEn: row.completado_en
  };
}

async function listar(req, res, next) {
  try {
    const { rows } = await pool.query('SELECT * FROM tareas ORDER BY fecha_limite ASC');
    res.json(rows.map(mapTarea));
  } catch (err) {
    next(err);
  }
}

async function crear(req, res, next) {
  const client = await pool.connect();
  try {
    const { titulo, descripcion, asignadoId, vence, prioridad } = req.body;

    if (!titulo || !String(titulo).trim() || !asignadoId || !vence) {
      return res.status(400).json({ error: 'Título, asignado y fecha de entrega son obligatorios.' });
    }
    const prio = PRIORIDADES.includes(prioridad) ? prioridad : 'media';

    await client.query('BEGIN');

    const { rows } = await client.query(
      `INSERT INTO tareas (titulo, descripcion, prioridad, fecha_limite, asignado_id, creado_por)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        String(titulo).trim(),
        descripcion && String(descripcion).trim() ? String(descripcion).trim() : 'Sin descripción.',
        prio,
        vence,
        asignadoId,
        req.usuario.id
      ]
    );
    const tarea = rows[0];

    await client.query(
      `INSERT INTO historial_tareas (tarea_id, usuario_id, accion, valor_nuevo)
       VALUES ($1, $2, 'creada', $3)`,
      [tarea.id, req.usuario.id, tarea.titulo]
    );

    await client.query('COMMIT');
    res.status(201).json(mapTarea(tarea));
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}

async function actualizarEstado(req, res, next) {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!ESTADOS.includes(estado)) {
      return res.status(400).json({ error: `Estado inválido. Debe ser uno de: ${ESTADOS.join(', ')}.` });
    }

    await client.query('BEGIN');

    const actual = await client.query('SELECT * FROM tareas WHERE id = $1 FOR UPDATE', [id]);
    if (!actual.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Tarea no encontrada.' });
    }
    const anterior = actual.rows[0].estado;

    const { rows } = await client.query(
      `UPDATE tareas
       SET estado = $1,
           completado_en = CASE WHEN $1 = 'completada' THEN CURRENT_TIMESTAMP ELSE NULL END
       WHERE id = $2
       RETURNING *`,
      [estado, id]
    );

    if (anterior !== estado) {
      await client.query(
        `INSERT INTO historial_tareas (tarea_id, usuario_id, accion, valor_anterior, valor_nuevo)
         VALUES ($1, $2, 'estado', $3, $4)`,
        [id, req.usuario.id, anterior, estado]
      );
    }

    await client.query('COMMIT');
    res.json(mapTarea(rows[0]));
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}

async function actualizar(req, res, next) {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { titulo, descripcion, prioridad, vence } = req.body;

    if (titulo === undefined && descripcion === undefined && prioridad === undefined && vence === undefined) {
      return res.status(400).json({ error: 'Envía al menos un campo para editar (titulo, descripcion, prioridad o vence).' });
    }
    if (titulo !== undefined && !String(titulo).trim()) {
      return res.status(400).json({ error: 'El título no puede quedar vacío.' });
    }
    if (prioridad !== undefined && !PRIORIDADES.includes(prioridad)) {
      return res.status(400).json({ error: `Prioridad inválida. Debe ser una de: ${PRIORIDADES.join(', ')}.` });
    }

    await client.query('BEGIN');

    const actual = await client.query('SELECT * FROM tareas WHERE id = $1 FOR UPDATE', [id]);
    if (!actual.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Tarea no encontrada.' });
    }
    const anterior = actual.rows[0];

    const nuevo = {
      titulo: titulo !== undefined ? String(titulo).trim() : anterior.titulo,
      descripcion: descripcion !== undefined ? (String(descripcion).trim() || 'Sin descripción.') : anterior.descripcion,
      prioridad: prioridad !== undefined ? prioridad : anterior.prioridad,
      fecha_limite: vence !== undefined ? vence : anterior.fecha_limite
    };

    const { rows } = await client.query(
      `UPDATE tareas SET titulo = $1, descripcion = $2, prioridad = $3, fecha_limite = $4
       WHERE id = $5 RETURNING *`,
      [nuevo.titulo, nuevo.descripcion, nuevo.prioridad, nuevo.fecha_limite, id]
    );

    if (prioridad !== undefined && prioridad !== anterior.prioridad) {
      await client.query(
        `INSERT INTO historial_tareas (tarea_id, usuario_id, accion, valor_anterior, valor_nuevo)
         VALUES ($1, $2, 'prioridad', $3, $4)`,
        [id, req.usuario.id, anterior.prioridad, prioridad]
      );
    }

    const camposEditados = [];
    if (titulo !== undefined && nuevo.titulo !== anterior.titulo) camposEditados.push('título');
    if (descripcion !== undefined && nuevo.descripcion !== anterior.descripcion) camposEditados.push('descripción');
    if (vence !== undefined && String(nuevo.fecha_limite) !== anterior.fecha_limite.toISOString().slice(0, 10)) camposEditados.push('fecha de entrega');

    if (camposEditados.length) {
      await client.query(
        `INSERT INTO historial_tareas (tarea_id, usuario_id, accion, valor_anterior, valor_nuevo)
         VALUES ($1, $2, 'editada', $3, $4)`,
        [id, req.usuario.id, anterior.titulo, `Editó ${camposEditados.join(', ')}`]
      );
    }

    await client.query('COMMIT');
    res.json(mapTarea(rows[0]));
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}

async function reasignar(req, res, next) {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { asignadoId } = req.body;

    if (!asignadoId) {
      return res.status(400).json({ error: 'asignadoId es obligatorio.' });
    }

    await client.query('BEGIN');

    const actual = await client.query('SELECT * FROM tareas WHERE id = $1 FOR UPDATE', [id]);
    if (!actual.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Tarea no encontrada.' });
    }

    const nuevoUsuario = await client.query('SELECT id, nombre FROM usuarios WHERE id = $1 AND activo = TRUE', [asignadoId]);
    if (!nuevoUsuario.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'El usuario asignado no existe o está inactivo.' });
    }

    const anteriorId = actual.rows[0].asignado_id;
    if (anteriorId === nuevoUsuario.rows[0].id) {
      await client.query('ROLLBACK');
      return res.json(mapTarea(actual.rows[0]));
    }

    let nombreAnterior = 'Sin asignar';
    if (anteriorId) {
      const u = await client.query('SELECT nombre FROM usuarios WHERE id = $1', [anteriorId]);
      if (u.rows[0]) nombreAnterior = u.rows[0].nombre;
    }

    const { rows } = await client.query(
      `UPDATE tareas SET asignado_id = $1 WHERE id = $2 RETURNING *`,
      [nuevoUsuario.rows[0].id, id]
    );

    await client.query(
      `INSERT INTO historial_tareas (tarea_id, usuario_id, accion, valor_anterior, valor_nuevo)
       VALUES ($1, $2, 'reasignada', $3, $4)`,
      [id, req.usuario.id, nombreAnterior, nuevoUsuario.rows[0].nombre]
    );

    await client.query('COMMIT');
    res.json(mapTarea(rows[0]));
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}

module.exports = { listar, crear, actualizarEstado, actualizar, reasignar };
