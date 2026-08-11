import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../components/Avatar';
import { useAuth } from '../context/AuthContext';
import { useDatos } from '../context/DataContext';
import { describirActividad } from '../utils/actividad';
import { diasHasta, estaVencida, formatearRelativo, formatearVencimiento } from '../utils/fechas';

export default function DashboardPage() {
  const { usuario } = useAuth();
  const { tareas, usuarios, actividad, usuarioPorId, cargando } = useDatos();
  const navigate = useNavigate();

  const nombreCorto = (usuario?.nombre || '').split(' ')[0];

  const kpi = useMemo(() => {
    const vencidas = tareas.filter((t) => estaVencida(t));
    return {
      pendientes: tareas.filter((t) => t.estado === 'pendiente').length,
      enProgreso: tareas.filter((t) => t.estado === 'en_progreso').length,
      completadas: tareas.filter((t) => t.estado === 'completada').length,
      vencidas: vencidas.length
    };
  }, [tareas]);

  const criticas = useMemo(() => {
    return tareas
      .filter((t) => t.estado !== 'completada' && (estaVencida(t) || t.prioridad === 'alta'))
      .sort((a, b) => diasHasta(a.vence) - diasHasta(b.vence))
      .slice(0, 3);
  }, [tareas]);

  if (cargando) return <div className="state-loading">Cargando…</div>;

  return (
    <>
      <div className="dash-header">
        <div>
          <div className="dash-greeting">Hola, {nombreCorto}</div>
          <div className="dash-sub">Aquí está el resumen de hoy</div>
        </div>
        <Avatar nombre={usuario?.nombre} iniciales={usuario?.iniciales} bg={usuario?.avatarBg} color={usuario?.avatarColor} size="lg" />
      </div>

      <div className="kpi-grid">
        <div className="card kpi-card">
          <div className="kpi-value">{kpi.pendientes}</div>
          <div className="kpi-pill" style={{ background: 'var(--tf-pend-bg)', color: 'var(--tf-pend-fg)' }}>Pendientes</div>
        </div>
        <div className="card kpi-card">
          <div className="kpi-value">{kpi.enProgreso}</div>
          <div className="kpi-pill" style={{ background: 'var(--tf-prog-bg)', color: 'var(--tf-prog-fg)' }}>En progreso</div>
        </div>
        <div className="card kpi-card">
          <div className="kpi-value">{kpi.completadas}</div>
          <div className="kpi-pill" style={{ background: 'var(--tf-done-bg)', color: 'var(--tf-done-fg)' }}>Completadas</div>
        </div>
        <div className="kpi-card" style={{ background: 'var(--tf-red-bg)', borderRadius: 16, boxShadow: '0 1px 3px var(--tf-sh-c)' }}>
          <div className="kpi-value" style={{ color: 'var(--tf-late-fg)' }}>{kpi.vencidas}</div>
          <div className="kpi-pill" style={{ background: 'var(--tf-late-bg)', color: 'var(--tf-late-fg)' }}>Vencidas</div>
        </div>
      </div>

      <div className="section-header">
        <div className="section-title">Tareas Críticas</div>
        <a href="#tareas" onClick={(e) => { e.preventDefault(); navigate('/tareas'); }}>Ver todas</a>
      </div>
      <div className="critical-list">
        {criticas.length === 0 && <div className="card" style={{ padding: 16, color: 'var(--tf-muted)', fontSize: 14 }}>Sin tareas críticas por ahora.</div>}
        {criticas.map((t) => {
          const roja = estaVencida(t);
          const u = usuarioPorId(t.asignadoId);
          return (
            <button
              key={t.id}
              type="button"
              className="critical-card"
              style={{
                background: roja ? 'var(--tf-red-bg)' : 'var(--tf-warn-bg)',
                borderColor: roja ? 'var(--tf-red-brd)' : 'var(--tf-warn-brd)'
              }}
              onClick={() => navigate('/tareas')}
            >
              <div className="critical-accent" style={{ background: roja ? 'var(--tf-late-fg)' : 'var(--tf-warn-fg)' }} />
              <div className="critical-body">
                <div className="critical-title">{t.titulo}</div>
                <div className="critical-meta">
                  <span className="badge" style={{ background: 'var(--tf-late-bg)', color: 'var(--tf-late-fg)' }}>{t.prioridad}</span>
                  <span className="critical-due" style={{ color: roja ? 'var(--tf-late-fg)' : 'var(--tf-warn-fg)' }}>
                    {formatearVencimiento(t.vence)}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="section-title mb-12">Actividad Reciente</div>
      <div className="card activity-card">
        {actividad.length === 0 && <div style={{ padding: '16px 0', color: 'var(--tf-muted)', fontSize: 14 }}>Sin actividad todavía.</div>}
        {actividad.map((a) => {
          const u = usuarios.length ? usuarioPorId(a.usuarioId) : null;
          const { antes, despues } = describirActividad(a);
          return (
            <div key={a.id} className="activity-row">
              <Avatar nombre={u?.nombre} iniciales={u?.iniciales} bg={u?.avatarBg} color={u?.avatarColor} size="md" />
              <div className="activity-text">
                <b>{u?.nombre || 'Alguien'}</b> {antes} <span className="obj">{a.objeto}</span>{despues}
                <span className="when"> · {formatearRelativo(a.registradoEn)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
