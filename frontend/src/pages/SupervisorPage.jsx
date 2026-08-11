import { useMemo } from 'react';
import Avatar from '../components/Avatar';
import { useDatos } from '../context/DataContext';
import { diasHasta, estaVencida } from '../utils/fechas';

const OBJETIVO_CUMPLIMIENTO = 85;

export default function SupervisorPage() {
  const { tareas, usuarios, cargando } = useDatos();

  const kpi = useMemo(() => {
    const vencidas = tareas.filter((t) => estaVencida(t));
    const completadas = tareas.filter((t) => t.estado === 'completada').length;
    const cerradas = completadas + vencidas.length;
    const cumplimiento = cerradas ? Math.round((completadas / cerradas) * 100) : 0;
    return {
      vencidas: vencidas.length,
      completadas,
      cumplimiento,
      cumplimientoAncho: Math.min(100, cumplimiento) + '%',
      productividad: usuarios.length ? (tareas.length / usuarios.length).toFixed(1) : '0'
    };
  }, [tareas, usuarios]);

  const rendimiento = useMemo(() => {
    return usuarios
      .map((u) => {
        const suyas = tareas.filter((t) => t.asignadoId === u.id);
        const comp = suyas.filter((t) => t.estado === 'completada').length;
        const prog = suyas.filter((t) => t.estado === 'en_progreso').length;
        const pct = suyas.length ? Math.round(((comp + prog * 0.5) / suyas.length) * 100) : 0;
        return {
          u, pct, comp, total: suyas.length,
          color: pct >= 70 ? 'var(--tf-green)' : pct >= 40 ? 'var(--tf-indigo)' : 'var(--tf-orange)'
        };
      })
      .sort((a, b) => b.pct - a.pct);
  }, [tareas, usuarios]);

  const alertas = useMemo(() => {
    const vencidas = tareas.filter((t) => estaVencida(t));
    const venceHoyAlta = tareas.filter((t) => t.estado !== 'completada' && t.prioridad === 'alta' && diasHasta(t.vence) === 0);
    const porUsuario = usuarios
      .map((u) => ({ u, n: tareas.filter((t) => t.asignadoId === u.id && t.estado !== 'completada').length }))
      .sort((a, b) => b.n - a.n)[0];

    const lista = [];
    if (vencidas.length) {
      lista.push({ bg: 'var(--tf-red-bg)', borde: 'var(--tf-red-brd)', iconoBg: 'var(--tf-red-solid)', color: 'var(--tf-late-fg)', icono: '!', titulo: `${vencidas.length} tareas vencidas`, detalle: vencidas.map((t) => t.titulo).join(' · ') });
    }
    if (venceHoyAlta.length) {
      lista.push({ bg: 'var(--tf-violet-bg)', borde: 'var(--tf-violet-brd)', iconoBg: 'var(--tf-violet)', color: 'var(--tf-prog-fg)', icono: '◆', titulo: `${venceHoyAlta.length} tareas de alta prioridad vencen hoy`, detalle: venceHoyAlta.map((t) => t.titulo).join(' · ') });
    }
    if (porUsuario && porUsuario.n >= 3) {
      lista.push({ bg: 'var(--tf-violet-bg)', borde: 'var(--tf-violet-brd)', iconoBg: 'var(--tf-violet)', color: 'var(--tf-prog-fg)', icono: '≡', titulo: `Carga concentrada en ${porUsuario.u.nombre}`, detalle: `${porUsuario.n} tareas abiertas. Considera redistribuir antes del cierre de semana.` });
    }
    if (kpi.cumplimiento < OBJETIVO_CUMPLIMIENTO) {
      lista.push({ bg: 'var(--tf-red-bg)', borde: 'var(--tf-red-brd)', iconoBg: 'var(--tf-red-solid)', color: 'var(--tf-late-fg)', icono: '↓', titulo: 'Cumplimiento bajo el objetivo', detalle: `Estás ${OBJETIVO_CUMPLIMIENTO - kpi.cumplimiento} puntos por debajo de la meta de ${OBJETIVO_CUMPLIMIENTO}%.` });
    }
    return lista;
  }, [tareas, usuarios, kpi.cumplimiento]);

  if (cargando) return <div className="state-loading">Cargando…</div>;

  return (
    <>
      <div className="page-title mb-4">Métricas de Control</div>
      <div className="supervisor-sub">Equipo administrativo · {tareas.length} tareas activas</div>

      <div className="compliance-card">
        <div className="compliance-label">Tasa de cumplimiento</div>
        <div className="compliance-row">
          <div className="compliance-value">{kpi.cumplimiento}%</div>
          <div className="compliance-target">Objetivo {OBJETIVO_CUMPLIMIENTO}%</div>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: kpi.cumplimientoAncho }} />
        </div>
        <div className="compliance-msg">
          {kpi.cumplimiento >= OBJETIVO_CUMPLIMIENTO ? 'Meta alcanzada esta semana.' : `Faltan ${OBJETIVO_CUMPLIMIENTO - kpi.cumplimiento} puntos para la meta.`}
        </div>
      </div>

      <div className="metrics-grid">
        <div className="card metric-card">
          <div className="metric-label">Retrasos</div>
          <div className="metric-value" style={{ color: 'var(--tf-late-fg)' }}>{kpi.vencidas}</div>
          <div className="metric-sub">tareas críticas vencidas hoy</div>
        </div>
        <div className="card metric-card">
          <div className="metric-label">Productividad</div>
          <div className="metric-value" style={{ color: 'var(--tf-prog-fg)' }}>{kpi.productividad}</div>
          <div className="metric-sub">media de tareas por usuario</div>
        </div>
      </div>

      <div className="section-title mb-12">Rendimiento por Equipo</div>
      <div className="card performance-card">
        {rendimiento.map(({ u, pct, comp, total, color }) => (
          <div key={u.id} className="performance-row">
            <div className="performance-head">
              <Avatar nombre={u.nombre} iniciales={u.iniciales} bg={u.avatarBg} color={u.avatarColor} size="md" />
              <div className="performance-body">
                <div className="performance-name">{u.nombre}</div>
                <div className="performance-detail">{comp} de {total} completadas</div>
              </div>
              <div className="performance-pct" style={{ color }}>{pct}%</div>
            </div>
            <div className="progress-track progress-track--muted">
              <div className="progress-fill" style={{ width: pct + '%', background: color }} />
            </div>
          </div>
        ))}
      </div>

      <div className="section-title mb-12">Alertas Activas</div>
      <div className="alerts-list">
        {alertas.length === 0 && <div className="card" style={{ padding: 16, color: 'var(--tf-muted)', fontSize: 14 }}>Sin alertas activas.</div>}
        {alertas.map((al, i) => (
          <div key={i} className="alert-card" style={{ background: al.bg, borderColor: al.borde }}>
            <div className="alert-icon" style={{ background: al.iconoBg }}>{al.icono}</div>
            <div>
              <div className="alert-title" style={{ color: al.color }}>{al.titulo}</div>
              <div className="alert-detail">{al.detalle}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
