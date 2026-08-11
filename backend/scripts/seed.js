// Carga datos de demostración: los mismos usuarios y tareas que traía el
// prototipo (taskflow-data.js), pero persistidos en PostgreSQL con password
// real hasheada. Es idempotente: limpia usuarios/tareas/historial antes de
// insertar (los roles ya vienen del schema.sql y no se tocan).
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../src/config/db');

const CLAVE_DEMO = 'taskflow123';

const USUARIOS = [
  { nombre: 'Jose Luis Chávez', correo: 'jose.luis@taskflow.cl', cargo: 'Coordinador Administrativo', iniciales: 'JL', rol: 'administrativo' },
  { nombre: 'Marco Ruíz', correo: 'marco.ruiz@taskflow.cl', cargo: 'Analista de Contratos', iniciales: 'MR', rol: 'administrativo' },
  { nombre: 'Sofía Castro', correo: 'sofia.castro@taskflow.cl', cargo: 'Encargada de RR.HH.', iniciales: 'SC', rol: 'supervisor' },
  { nombre: 'Julián Vera', correo: 'julian.vera@taskflow.cl', cargo: 'Asistente Contable', iniciales: 'JV', rol: 'administrativo' },
  { nombre: 'Camila Fuentes', correo: 'camila.fuentes@taskflow.cl', cargo: 'Jefa de Operaciones', iniciales: 'CF', rol: 'supervisor' }
];

// asignado: índice 1-based dentro de USUARIOS (coincide con el orden de inserción -> id serial)
const TAREAS = [
  { titulo: 'Facturación Mensual', descripcion: 'Emitir y revisar las facturas de julio para los 42 clientes activos del área comercial.', estado: 'pendiente', prioridad: 'alta', asignado: 1, vence: '2026-08-09' },
  { titulo: 'Rediseño Dashboard', descripcion: 'Ajustar los indicadores del panel de control según el feedback de la última revisión.', estado: 'en_progreso', prioridad: 'alta', asignado: 2, vence: '2026-08-14' },
  { titulo: 'Entrevista de Candidatos', descripcion: 'Tres entrevistas presenciales para el cargo de asistente administrativo.', estado: 'pendiente', prioridad: 'alta', asignado: 3, vence: '2026-08-10' },
  { titulo: 'Cierre de Caja Chica', descripcion: 'Cuadrar los comprobantes del mes y dejar el saldo respaldado en el sistema contable.', estado: 'completada', prioridad: 'media', asignado: 4, vence: '2026-08-08' },
  { titulo: 'Actualizar Inventario', descripcion: 'Registrar el ingreso de insumos de oficina y dar de baja los equipos en desuso.', estado: 'en_progreso', prioridad: 'media', asignado: 5, vence: '2026-08-12' },
  { titulo: 'Informe de Gastos Q3', descripcion: 'Consolidar el gasto por centro de costo y enviarlo a gerencia con el resumen ejecutivo.', estado: 'pendiente', prioridad: 'alta', asignado: 1, vence: '2026-08-07' },
  { titulo: 'Onboarding Practicantes', descripcion: 'Preparar accesos, credenciales y el plan de inducción para los dos nuevos practicantes.', estado: 'pendiente', prioridad: 'baja', asignado: 3, vence: '2026-08-18' },
  { titulo: 'Auditoría de Contratos', descripcion: 'Revisar vigencias y cláusulas de renovación automática de los contratos de servicio.', estado: 'completada', prioridad: 'alta', asignado: 2, vence: '2026-08-06' },
  { titulo: 'Respaldo de Documentos', descripcion: 'Subir al repositorio compartido los expedientes físicos ya digitalizados.', estado: 'completada', prioridad: 'baja', asignado: 4, vence: '2026-08-05' },
  { titulo: 'Plan de Capacitación', descripcion: 'Definir las cuatro sesiones del semestre y confirmar disponibilidad de los relatores.', estado: 'pendiente', prioridad: 'media', asignado: 5, vence: '2026-08-20' },
  { titulo: 'Conciliación Bancaria', descripcion: 'Cruzar la cartola del banco con el libro mayor y documentar las diferencias.', estado: 'completada', prioridad: 'alta', asignado: 1, vence: '2026-08-13' },
  { titulo: 'Solicitud de Insumos', descripcion: 'Enviar la orden de compra trimestral al proveedor de materiales de oficina.', estado: 'completada', prioridad: 'baja', asignado: 5, vence: '2026-08-09' },
  { titulo: 'Revisión de Pólizas', descripcion: 'Comparar coberturas de las tres aseguradoras y proponer la renovación más conveniente.', estado: 'en_progreso', prioridad: 'media', asignado: 2, vence: '2026-08-11' },
  { titulo: 'Actas de Directorio', descripcion: 'Transcribir y distribuir las actas de las dos últimas sesiones del directorio.', estado: 'en_progreso', prioridad: 'media', asignado: 3, vence: '2026-08-16' },
  { titulo: 'Digitalización de Archivos', descripcion: 'Escanear las carpetas del período 2023 y nombrarlas según la nomenclatura interna.', estado: 'completada', prioridad: 'baja', asignado: 3, vence: '2026-08-04' }
];

// Actividad reciente: [asignado (índice de USUARIOS), accion, tarea (índice de TAREAS), valorNuevo, hace (minutos)]
const ACTIVIDAD = [
  { usuario: 4, accion: 'estado', tarea: 4, valorAnterior: 'en_progreso', valorNuevo: 'completada', haceMin: 15 },
  { usuario: 2, accion: 'estado', tarea: 8, valorAnterior: 'en_progreso', valorNuevo: 'completada', haceMin: 60 },
  { usuario: 5, accion: 'estado', tarea: 5, valorAnterior: 'pendiente', valorNuevo: 'en_progreso', haceMin: 120 },
  { usuario: 1, accion: 'editada', tarea: 11, valorAnterior: null, valorNuevo: null, haceMin: 180 },
  { usuario: 3, accion: 'creada', tarea: 14, valorAnterior: null, valorNuevo: null, haceMin: 300 }
];

async function main() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('Limpiando datos anteriores (historial, tareas, usuarios)...');
    await client.query('DELETE FROM historial_tareas');
    await client.query('DELETE FROM tareas');
    await client.query('DELETE FROM usuarios');
    await client.query('ALTER SEQUENCE usuarios_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE tareas_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE historial_tareas_id_seq RESTART WITH 1');

    const { rows: roles } = await client.query('SELECT id, nombre FROM roles');
    const rolId = Object.fromEntries(roles.map((r) => [r.nombre, r.id]));

    console.log('Insertando usuarios...');
    const hash = await bcrypt.hash(CLAVE_DEMO, 10);
    const idUsuario = [];
    for (const u of USUARIOS) {
      const { rows } = await client.query(
        `INSERT INTO usuarios (nombre, correo, password_hash, cargo, iniciales, rol_id)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [u.nombre, u.correo, hash, u.cargo, u.iniciales, rolId[u.rol]]
      );
      idUsuario.push(rows[0].id);
    }

    console.log('Insertando tareas...');
    const idTarea = [];
    for (const t of TAREAS) {
      const completadoEn = t.estado === 'completada' ? `${t.vence}T17:00:00` : null;
      const { rows } = await client.query(
        `INSERT INTO tareas (titulo, descripcion, estado, prioridad, fecha_limite, asignado_id, creado_por, completado_en)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
        [t.titulo, t.descripcion, t.estado, t.prioridad, t.vence, idUsuario[t.asignado - 1], idUsuario[0], completadoEn]
      );
      idTarea.push(rows[0].id);
    }

    console.log('Insertando historial / actividad reciente...');
    for (const a of ACTIVIDAD) {
      await client.query(
        `INSERT INTO historial_tareas (tarea_id, usuario_id, accion, valor_anterior, valor_nuevo, registrado_en)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP - ($6 || ' minutes')::interval)`,
        [idTarea[a.tarea - 1], idUsuario[a.usuario - 1], a.accion, a.valorAnterior, a.valorNuevo, a.haceMin]
      );
    }

    await client.query('COMMIT');
    console.log(`Listo. ${USUARIOS.length} usuarios, ${TAREAS.length} tareas, ${ACTIVIDAD.length} eventos de historial.`);
    console.log(`Login demo: jose.luis@taskflow.cl / ${CLAVE_DEMO}`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Falló el seed, se revirtió todo:', err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
