-- ============================================================
-- TaskFlow — Modelo físico de datos (PostgreSQL)
-- Proyecto de Título · Instituto IACC
-- ============================================================

DROP TABLE IF EXISTS historial_tareas CASCADE;
DROP TABLE IF EXISTS tareas CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- ------------------------------------------------------------
-- 1. ROLES
-- Tabla separada (3FN): el perfil no se repite como texto en
-- cada usuario, evitando redundancia e inconsistencias.
-- ------------------------------------------------------------
CREATE TABLE roles (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(50) UNIQUE NOT NULL,
    descripcion VARCHAR(200)
);

INSERT INTO roles (nombre, descripcion) VALUES
    ('administrativo', 'Crea y gestiona tareas del equipo'),
    ('supervisor',     'Monitorea indicadores y rendimiento');

-- ------------------------------------------------------------
-- 2. USUARIOS
-- password_hash almacena el hash bcrypt, nunca la contraseña.
-- 255 caracteres cubren cualquier algoritmo de hashing.
-- ------------------------------------------------------------
CREATE TABLE usuarios (
    id            SERIAL PRIMARY KEY,
    nombre        VARCHAR(100) NOT NULL,
    correo        VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    cargo         VARCHAR(100),
    iniciales     VARCHAR(4),
    rol_id        INTEGER NOT NULL REFERENCES roles(id),
    activo        BOOLEAN DEFAULT TRUE,
    creado_en     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usuarios_correo ON usuarios(correo);

-- ------------------------------------------------------------
-- 3. TAREAS
-- Los CHECK garantizan a nivel de motor que jamás entre un
-- estado o prioridad inválido, aunque falle la validación
-- del frontend o alguien consulte la API directamente.
-- ------------------------------------------------------------
CREATE TABLE tareas (
    id            SERIAL PRIMARY KEY,
    titulo        VARCHAR(200) NOT NULL,
    descripcion   TEXT,
    estado        VARCHAR(20) NOT NULL DEFAULT 'pendiente'
                  CHECK (estado IN ('pendiente','en_progreso','completada')),
    prioridad     VARCHAR(10) NOT NULL DEFAULT 'media'
                  CHECK (prioridad IN ('baja','media','alta')),
    fecha_limite  DATE NOT NULL,
    asignado_id   INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    creado_por    INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    creado_en     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completado_en TIMESTAMP
);

CREATE INDEX idx_tareas_estado      ON tareas(estado);
CREATE INDEX idx_tareas_asignado    ON tareas(asignado_id);
CREATE INDEX idx_tareas_vencimiento ON tareas(fecha_limite);

-- ------------------------------------------------------------
-- 4. HISTORIAL DE TAREAS
-- Implementa la TRAZABILIDAD declarada en el informe: registra
-- quien cambio que y cuando. Alimenta "Actividad Reciente".
-- ------------------------------------------------------------
CREATE TABLE historial_tareas (
    id            SERIAL PRIMARY KEY,
    tarea_id      INTEGER NOT NULL REFERENCES tareas(id) ON DELETE CASCADE,
    usuario_id    INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    accion        VARCHAR(30) NOT NULL
                  CHECK (accion IN ('creada','estado','prioridad',
                                    'reasignada','editada','eliminada')),
    valor_anterior VARCHAR(100),
    valor_nuevo    VARCHAR(100),
    registrado_en  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_historial_tarea ON historial_tareas(tarea_id);
CREATE INDEX idx_historial_fecha ON historial_tareas(registrado_en DESC);

-- ============================================================
-- VISTA: tareas con datos derivados
-- "vencida" NO se almacena: se calcula. Un dato almacenado
-- quedaria desactualizado al dia siguiente.
-- ============================================================
CREATE OR REPLACE VIEW v_tareas_detalle AS
SELECT
    t.id,
    t.titulo,
    t.descripcion,
    t.estado,
    t.prioridad,
    t.fecha_limite,
    u.nombre        AS asignado_nombre,
    u.iniciales     AS asignado_iniciales,
    t.asignado_id,
    (t.estado <> 'completada' AND t.fecha_limite < CURRENT_DATE) AS vencida,
    (t.fecha_limite - CURRENT_DATE) AS dias_restantes
FROM tareas t
LEFT JOIN usuarios u ON u.id = t.asignado_id;

-- ============================================================
-- CONSULTAS DE LOS KPI (vista supervisor)
-- Replican exactamente la logica del frontend.
-- ============================================================

-- Contadores del dashboard
-- SELECT
--     COUNT(*) FILTER (WHERE estado = 'pendiente')   AS pendientes,
--     COUNT(*) FILTER (WHERE estado = 'en_progreso') AS en_progreso,
--     COUNT(*) FILTER (WHERE estado = 'completada')  AS completadas,
--     COUNT(*) FILTER (WHERE vencida)                AS vencidas
-- FROM v_tareas_detalle;

-- Tasa de cumplimiento = completadas / (completadas + vencidas)
-- SELECT ROUND(
--     100.0 * COUNT(*) FILTER (WHERE estado = 'completada')
--     / NULLIF(COUNT(*) FILTER (WHERE estado = 'completada' OR vencida), 0)
-- ) AS tasa_cumplimiento
-- FROM v_tareas_detalle;

-- Rendimiento por integrante (en progreso pondera 0.5)
-- SELECT
--     u.nombre,
--     COUNT(t.id) AS asignadas,
--     ROUND(100.0 * (
--         COUNT(*) FILTER (WHERE t.estado = 'completada')
--         + 0.5 * COUNT(*) FILTER (WHERE t.estado = 'en_progreso')
--     ) / NULLIF(COUNT(t.id), 0)) AS rendimiento
-- FROM usuarios u
-- LEFT JOIN tareas t ON t.asignado_id = u.id
-- GROUP BY u.id, u.nombre
-- ORDER BY rendimiento DESC;

-- Actividad reciente (reemplaza el arreglo fijo del prototipo)
-- SELECT u.nombre, h.accion, t.titulo, h.valor_nuevo, h.registrado_en
-- FROM historial_tareas h
-- JOIN tareas   t ON t.id = h.tarea_id
-- LEFT JOIN usuarios u ON u.id = h.usuario_id
-- ORDER BY h.registrado_en DESC
-- LIMIT 5;
