import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDatos } from '../context/DataContext';
import { PRIO } from '../utils/estilos';
import { IconoCerrar } from './Icons';

const VACIO = { titulo: '', descripcion: '', asignadoId: '', entrega: '', prioridad: 'media' };

function formDesdeTarea(tarea) {
  return {
    titulo: tarea.titulo || '',
    descripcion: tarea.descripcion === 'Sin descripción.' ? '' : tarea.descripcion || '',
    asignadoId: tarea.asignadoId != null ? String(tarea.asignadoId) : '',
    entrega: tarea.vence || '',
    prioridad: tarea.prioridad || 'media'
  };
}

// Sin `tarea`: modo creación (POST /tareas). Con `tarea`: modo edición
// (PATCH /tareas/:id, y PATCH /tareas/:id/asignado si cambió el responsable).
export default function TaskFormModal({ tarea = null, onCerrar }) {
  const { usuarios, crearTarea, editarTarea, reasignarTarea } = useDatos();
  const navigate = useNavigate();
  const editando = !!tarea;
  const [form, setForm] = useState(() => (editando ? formDesdeTarea(tarea) : VACIO));
  const [tocado, setTocado] = useState({});
  const [enviando, setEnviando] = useState(false);

  const falta = {
    titulo: !form.titulo.trim(),
    asignadoId: !form.asignadoId,
    entrega: !form.entrega
  };
  const formValido = !falta.titulo && !falta.asignadoId && !falta.entrega;
  const err = (k) => !!(tocado[k] && falta[k]);

  const tocar = (k) => () => setTocado((t) => ({ ...t, [k]: true }));
  const cambiar = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function enviar() {
    if (!formValido) {
      setTocado({ titulo: true, asignadoId: true, entrega: true });
      return;
    }
    setEnviando(true);
    try {
      if (editando) {
        await editarTarea(tarea.id, {
          titulo: form.titulo.trim(),
          descripcion: form.descripcion.trim() || 'Sin descripción.',
          vence: form.entrega,
          prioridad: form.prioridad
        });
        if (Number(form.asignadoId) !== tarea.asignadoId) {
          await reasignarTarea(tarea.id, Number(form.asignadoId));
        }
      } else {
        await crearTarea({
          titulo: form.titulo.trim(),
          descripcion: form.descripcion.trim() || 'Sin descripción.',
          asignadoId: Number(form.asignadoId),
          vence: form.entrega,
          prioridad: form.prioridad
        });
        navigate('/tareas');
      }
      onCerrar();
    } catch (e) {
      window.alert(e.message || (editando ? 'No se pudo guardar la tarea.' : 'No se pudo crear la tarea.'));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="content--form">
        <div className="modal-head">
          <button type="button" className="modal-close" onClick={onCerrar} aria-label="Cerrar">
            <IconoCerrar />
          </button>
          <div className="modal-title">{editando ? 'Editar Tarea' : 'Nueva Tarea'}</div>
        </div>

        {formValido && (
          <div className="modal-success">
            <div className="modal-success-dot">✓</div>
            {editando ? 'Todo listo: puedes guardar los cambios.' : 'Todo listo: puedes crear la tarea.'}
          </div>
        )}

        <div className="card modal-card">
          <label className="field-label">
            Título <span style={{ color: 'var(--tf-late-fg)' }}>*</span>
          </label>
          <input
            type="text"
            className={`field-input${err('titulo') ? ' field-input--err' : ''}`}
            value={form.titulo}
            onChange={cambiar('titulo')}
            onBlur={tocar('titulo')}
            placeholder="Ej: Cierre contable de agosto"
          />
          {err('titulo') && <div className="field-error">Este campo es obligatorio</div>}

          <label className="field-label mt-18">Descripción</label>
          <textarea
            rows={3}
            className="field-textarea"
            value={form.descripcion}
            onChange={cambiar('descripcion')}
            placeholder="Detalla el alcance de la tarea"
          />

          <label className="field-label mt-18">
            Asignado <span style={{ color: 'var(--tf-late-fg)' }}>*</span>
          </label>
          <select
            className={`field-select${err('asignadoId') ? ' field-input--err' : ''}`}
            value={form.asignadoId}
            onChange={cambiar('asignadoId')}
            onBlur={tocar('asignadoId')}
          >
            <option value="">Selecciona un responsable</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nombre}
              </option>
            ))}
          </select>
          {err('asignadoId') && <div className="field-error">Este campo es obligatorio</div>}

          <label className="field-label mt-18">
            Entrega <span style={{ color: 'var(--tf-late-fg)' }}>*</span>
          </label>
          <input
            type="date"
            className={`field-input${err('entrega') ? ' field-input--err' : ''}`}
            value={form.entrega}
            onChange={cambiar('entrega')}
            onBlur={tocar('entrega')}
          />
          {err('entrega') && <div className="field-error">Este campo es obligatorio</div>}

          <label className="field-label mt-18b">Prioridad</label>
          <div className="priority-grid">
            {['baja', 'media', 'alta'].map((k) => {
              const c = PRIO[k];
              const activa = form.prioridad === k;
              return (
                <button
                  key={k}
                  type="button"
                  className="priority-btn"
                  style={
                    activa
                      ? { background: c.bg, color: c.color, borderColor: c.color, fontWeight: 700 }
                      : undefined
                  }
                  onClick={() => setForm((f) => ({ ...f, prioridad: k }))}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        <button type="button" className="btn-primary" style={{ marginTop: 18 }} disabled={!formValido || enviando} onClick={enviar}>
          {enviando ? 'Guardando…' : editando ? 'Guardar Cambios' : 'Crear Tarea'}
        </button>
        <div className="modal-cancel-wrap">
          <button type="button" className="link-btn" style={{ color: 'var(--tf-muted)', fontWeight: 500 }} onClick={onCerrar}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
