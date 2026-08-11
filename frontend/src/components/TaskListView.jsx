import { useMemo, useState } from 'react';
import Avatar from './Avatar';
import { useDatos } from '../context/DataContext';
import { PILL, PRIO } from '../utils/estilos';
import { estaVencida, formatearVencimiento } from '../utils/fechas';
import { IconoCalendario } from './Icons';
import TaskFormModal from './TaskFormModal';

const ETIQUETA_ESTADO = { todos: 'Estado', pendiente: 'Pendiente', en_progreso: 'En progreso', completada: 'Completada', vencida: 'Vencida' };
const ETIQUETA_PRIO = { todos: 'Prioridad', baja: 'Baja', media: 'Media', alta: 'Alta' };

export default function TaskListView() {
  const { tareas, usuarios, usuarioPorId, cambiarEstado, reasignarTarea } = useDatos();
  const [filtros, setFiltros] = useState({ estado: 'todos', prioridad: 'todos', asignado: 'todos' });
  const [filtroAbierto, setFiltroAbierto] = useState(null);
  const [menuTareaId, setMenuTareaId] = useState(null);
  const [reasignandoId, setReasignandoId] = useState(null);
  const [tareaEditando, setTareaEditando] = useState(null);

  const abrir = (k) => () => setFiltroAbierto((actual) => (actual === k ? null : k));
  const elegir = (k, v) => () => {
    setFiltros((f) => ({ ...f, [k]: v }));
    setFiltroAbierto(null);
  };

  const filtradas = useMemo(() => {
    return tareas.filter((t) => {
      if (filtros.estado === 'vencida' && !estaVencida(t)) return false;
      if (filtros.estado !== 'todos' && filtros.estado !== 'vencida' && t.estado !== filtros.estado) return false;
      if (filtros.prioridad !== 'todos' && t.prioridad !== filtros.prioridad) return false;
      if (filtros.asignado !== 'todos' && t.asignadoId !== Number(filtros.asignado)) return false;
      return true;
    });
  }, [tareas, filtros]);

  let opcionesFiltro = [];
  if (filtroAbierto === 'estado') {
    opcionesFiltro = Object.entries(ETIQUETA_ESTADO).filter(([v]) => v !== 'todos' || true).map(([v, label]) => ({ v, label, activo: filtros.estado === v, onClick: elegir('estado', v) }));
  } else if (filtroAbierto === 'prioridad') {
    opcionesFiltro = Object.entries(ETIQUETA_PRIO).map(([v, label]) => ({ v, label, activo: filtros.prioridad === v, onClick: elegir('prioridad', v) }));
  } else if (filtroAbierto === 'asignado') {
    opcionesFiltro = [{ v: 'todos', label: 'Todos', activo: filtros.asignado === 'todos', onClick: elegir('asignado', 'todos') }].concat(
      usuarios.map((u) => ({ v: String(u.id), label: u.nombre, activo: filtros.asignado === String(u.id), onClick: elegir('asignado', String(u.id)) }))
    );
  }

  async function moverA(id, estado, etiqueta) {
    setMenuTareaId(null);
    await cambiarEstado(id, estado, `Tarea movida a ${etiqueta}`);
  }

  return (
    <>
      <div className="filters-row">
        <button type="button" className={`filter-btn${filtros.estado !== 'todos' || filtroAbierto === 'estado' ? ' filter-btn--active' : ''}`} onClick={abrir('estado')}>
          {ETIQUETA_ESTADO[filtros.estado]}
        </button>
        <button type="button" className={`filter-btn${filtros.prioridad !== 'todos' || filtroAbierto === 'prioridad' ? ' filter-btn--active' : ''}`} onClick={abrir('prioridad')}>
          {ETIQUETA_PRIO[filtros.prioridad]}
        </button>
        <button type="button" className={`filter-btn${filtros.asignado !== 'todos' || filtroAbierto === 'asignado' ? ' filter-btn--active' : ''}`} onClick={abrir('asignado')}>
          {filtros.asignado === 'todos' ? 'Asignado' : usuarioPorId(Number(filtros.asignado))?.nombre}
        </button>
      </div>

      {filtroAbierto && (
        <div className="card filter-options">
          {opcionesFiltro.map((o) => (
            <button key={o.v} type="button" className={`filter-option${o.activo ? ' filter-option--active' : ''}`} onClick={o.onClick}>
              {o.label}
            </button>
          ))}
        </div>
      )}

      <div className="filter-summary">{filtradas.length === 1 ? '1 tarea' : `${filtradas.length} tareas`}</div>

      <div className="task-list">
        {filtradas.map((t) => {
          const vencida = estaVencida(t);
          const pill = vencida ? PILL.vencida : PILL[t.estado];
          const prio = PRIO[t.prioridad];
          const u = usuarioPorId(t.asignadoId);
          const menuAbierto = menuTareaId === t.id;
          const hoyMismo = formatearVencimiento(t.vence) === 'Vence hoy';

          return (
            <div key={t.id} className="card task-card">
              <div className="task-card-head">
                <span className="status-pill" style={{ background: pill.bg, color: pill.color }}>{pill.label}</span>
                <span className="due-pill" style={{ color: vencida ? 'var(--tf-late-fg)' : hoyMismo ? 'var(--tf-warn-fg)' : 'var(--tf-muted)' }}>
                  <IconoCalendario /> {formatearVencimiento(t.vence)}
                </span>
              </div>
              <div className="task-title">{t.titulo}</div>
              <div className="task-desc">{t.descripcion}</div>
              <div className="task-footer">
                <div className="task-assignee">
                  <Avatar nombre={u?.nombre} iniciales={u?.iniciales} bg={u?.avatarBg} color={u?.avatarColor} size="sm" />
                  <div className="task-assignee-name">{u?.nombre || 'Sin asignar'}</div>
                  <span className="prio-pill" style={{ background: prio.bg, color: prio.color }}>{prio.label}</span>
                </div>
                <button type="button" className="menu-btn" aria-label="Más opciones" onClick={() => setMenuTareaId(menuAbierto ? null : t.id)}>
                  <span></span><span></span><span></span>
                </button>
              </div>
              {menuAbierto && reasignandoId !== t.id && (
                <div className="task-menu">
                  {t.estado !== 'pendiente' && <button type="button" className="task-menu-opt" onClick={() => moverA(t.id, 'pendiente', 'Pendiente')}>Marcar pendiente</button>}
                  {t.estado !== 'en_progreso' && <button type="button" className="task-menu-opt" style={{ background: 'var(--tf-prog-bg)', color: 'var(--tf-prog-fg)', borderColor: 'var(--tf-violet-brd)' }} onClick={() => moverA(t.id, 'en_progreso', 'En progreso')}>Mover a En progreso</button>}
                  {t.estado !== 'completada' && <button type="button" className="task-menu-opt" style={{ background: 'var(--tf-done-bg)', color: 'var(--tf-done-fg)', borderColor: 'var(--tf-green-brd)' }} onClick={() => moverA(t.id, 'completada', 'Completada')}>Completar</button>}
                  <button type="button" className="task-menu-opt" onClick={() => { setMenuTareaId(null); setTareaEditando(t); }}>Editar</button>
                  <button type="button" className="task-menu-opt" onClick={() => setReasignandoId(t.id)}>Reasignar</button>
                  <button type="button" className="task-menu-opt" onClick={() => setMenuTareaId(null)}>Cerrar</button>
                </div>
              )}
              {menuAbierto && reasignandoId === t.id && (
                <div className="task-menu">
                  {usuarios.filter((u2) => u2.id !== t.asignadoId).map((u2) => (
                    <button
                      key={u2.id}
                      type="button"
                      className="task-menu-opt"
                      onClick={async () => {
                        setReasignandoId(null);
                        setMenuTareaId(null);
                        await reasignarTarea(t.id, u2.id);
                      }}
                    >
                      {u2.nombre}
                    </button>
                  ))}
                  <button type="button" className="task-menu-opt" onClick={() => setReasignandoId(null)}>Cancelar</button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtradas.length === 0 && (
        <div className="card empty-state">
          <div className="empty-state-title">Sin tareas para estos filtros</div>
          <div className="empty-state-sub">Ajusta el estado, la prioridad o el responsable.</div>
        </div>
      )}

      {tareaEditando && <TaskFormModal tarea={tareaEditando} onCerrar={() => setTareaEditando(null)} />}
    </>
  );
}
