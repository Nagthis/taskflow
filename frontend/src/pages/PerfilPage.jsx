import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../components/Avatar';
import { useAuth } from '../context/AuthContext';
import { useDatos } from '../context/DataContext';

export default function PerfilPage() {
  const { usuario, logout } = useAuth();
  const { tareas } = useDatos();
  const navigate = useNavigate();
  const [vistaDefecto, setVistaDefecto] = useState('lista');

  const perfil = useMemo(() => {
    const mias = tareas.filter((t) => t.asignadoId === usuario?.id);
    const completadas = mias.filter((t) => t.estado === 'completada').length;
    return {
      asignadas: mias.length,
      completadas,
      avance: mias.length ? Math.round((completadas / mias.length) * 100) : 0
    };
  }, [tareas, usuario]);

  function salir() {
    logout();
    navigate('/login');
  }

  const opciones = [
    { label: 'Notificaciones', valor: 'Activadas', color: 'var(--tf-green)' },
    { label: 'Idioma', valor: 'Español', color: 'var(--tf-muted)' },
    { label: 'Vista de tareas por defecto', valor: vistaDefecto === 'kanban' ? 'Kanban' : 'Lista', color: 'var(--tf-indigo)', onClick: () => setVistaDefecto((v) => (v === 'kanban' ? 'lista' : 'kanban')) },
    { label: 'Ayuda y soporte', valor: '›', color: 'var(--tf-faint)' }
  ];

  return (
    <>
      <div className="page-title mb-18">Perfil</div>

      <div className="card profile-card">
        <div className="profile-avatar" style={{ display: 'inline-block' }}>
          <Avatar nombre={usuario?.nombre} iniciales={usuario?.iniciales} bg={usuario?.avatarBg} color={usuario?.avatarColor} size="xl" />
        </div>
        <div className="profile-name">{usuario?.nombre}</div>
        <div className="profile-role">{usuario?.cargo}</div>
        <div className="profile-email">{usuario?.correo}</div>

        <div className="profile-stats">
          <div className="profile-stat">
            <div className="profile-stat-value">{perfil.asignadas}</div>
            <div className="profile-stat-label">Asignadas</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-value" style={{ color: 'var(--tf-done-fg)' }}>{perfil.completadas}</div>
            <div className="profile-stat-label">Completadas</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-value" style={{ color: 'var(--tf-indigo)' }}>{perfil.avance}%</div>
            <div className="profile-stat-label">Avance</div>
          </div>
        </div>
      </div>

      <div className="card profile-options">
        {opciones.map((o) => (
          <button key={o.label} type="button" className="profile-option" onClick={o.onClick || (() => {})}>
            <div className="profile-option-label">{o.label}</div>
            <div className="profile-option-value" style={{ color: o.color }}>{o.valor}</div>
          </button>
        ))}
      </div>

      <button type="button" className="logout-btn" onClick={salir}>Cerrar sesión</button>
    </>
  );
}
