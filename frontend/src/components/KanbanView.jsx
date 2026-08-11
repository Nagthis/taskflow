import { useState } from 'react';
import Avatar from './Avatar';
import { useDatos } from '../context/DataContext';
import { COLUMNAS, PILL, PRIO } from '../utils/estilos';
import { estaVencida, formatearVencimiento } from '../utils/fechas';

export default function KanbanView() {
  const { tareas, usuarioPorId, cambiarEstado } = useDatos();
  const [arrastrandoId, setArrastrandoId] = useState(null);
  const [columnaSobre, setColumnaSobre] = useState(null);

  const idx = (k) => COLUMNAS.findIndex((c) => c.key === k);

  async function moverA(id, dir) {
    const t = tareas.find((x) => x.id === id);
    const n = idx(t.estado) + dir;
    if (n >= 0 && n < COLUMNAS.length) await cambiarEstado(id, COLUMNAS[n].key);
  }

  async function soltar(e, colKey) {
    e.preventDefault();
    setColumnaSobre(null);
    let id = arrastrandoId;
    try {
      const raw = e.dataTransfer.getData('text/plain');
      if (raw) id = Number(raw);
    } catch {
      /* drag no soportado */
    }
    setArrastrandoId(null);
    const t = tareas.find((x) => x.id === id);
    if (t && t.estado !== colKey) {
      const col = COLUMNAS.find((c) => c.key === colKey);
      await cambiarEstado(id, colKey, `Tarea movida a ${col.titulo}`);
    }
  }

  return (
    <>
      <div className="kanban-hint">Arrastra una tarjeta entre columnas para cambiar su estado.</div>
      <div className="kanban-board">
        {COLUMNAS.map((c) => {
          const pill = PILL[c.key];
          const sobre = columnaSobre === c.key;
          const lista = tareas.filter((t) => t.estado === c.key);
          return (
            <div
              key={c.key}
              className={`kanban-col${sobre ? ' kanban-col--over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setColumnaSobre(c.key); }}
              onDragLeave={() => setColumnaSobre((actual) => (actual === c.key ? null : actual))}
              onDrop={(e) => soltar(e, c.key)}
            >
              <div className="kanban-col-head">
                <span className="status-pill" style={{ background: pill.bg, color: pill.color }}>{c.titulo}</span>
                <span className="kanban-col-count">{lista.length}</span>
              </div>
              <div className="kanban-cards">
                {lista.map((t) => {
                  const vencida = estaVencida(t);
                  const prio = PRIO[t.prioridad];
                  const u = usuarioPorId(t.asignadoId);
                  const i = idx(t.estado);
                  const hoyMismo = formatearVencimiento(t.vence) === 'Vence hoy';
                  return (
                    <div
                      key={t.id}
                      draggable
                      onDragStart={(e) => {
                        try { e.dataTransfer.setData('text/plain', String(t.id)); e.dataTransfer.effectAllowed = 'move'; } catch { /* noop */ }
                        setArrastrandoId(t.id);
                      }}
                      onDragEnd={() => { setArrastrandoId(null); setColumnaSobre(null); }}
                      className={`kanban-card${arrastrandoId === t.id ? ' kanban-card--dragging' : ''}`}
                    >
                      <div className="kanban-card-head">
                        <span className="prio-pill" style={{ background: prio.bg, color: prio.color }}>{prio.label}</span>
                        <span className="kanban-card-due" style={{ color: vencida ? 'var(--tf-late-fg)' : hoyMismo ? 'var(--tf-warn-fg)' : 'var(--tf-muted)' }}>
                          {formatearVencimiento(t.vence)}
                        </span>
                      </div>
                      <div className="kanban-card-title">{t.titulo}</div>
                      <div className="kanban-card-footer">
                        <div className="kanban-card-assignee">
                          <Avatar nombre={u?.nombre} iniciales={u?.iniciales} bg={u?.avatarBg} color={u?.avatarColor} size="xs" />
                          <div className="kanban-card-assignee-name">{u?.nombre || 'Sin asignar'}</div>
                        </div>
                        <div className="kanban-nav">
                          <button type="button" className="kanban-nav-btn" disabled={i === 0} aria-label="Mover a la columna anterior" onClick={() => moverA(t.id, -1)}>‹</button>
                          <button type="button" className="kanban-nav-btn" disabled={i === COLUMNAS.length - 1} aria-label="Mover a la columna siguiente" onClick={() => moverA(t.id, 1)}>›</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
