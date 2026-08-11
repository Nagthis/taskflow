import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconoDashboard, IconoMas, IconoPerfil, IconoSupervisor, IconoTareas } from './Icons';
import { MarcaChica } from './Marca';
import Avatar from './Avatar';

const ITEMS = [
  { to: '/dashboard', label: 'Dashboard', Icono: IconoDashboard },
  { to: '/tareas', label: 'Tareas', Icono: IconoTareas },
  { to: '/supervisor', label: 'Supervisor', Icono: IconoSupervisor },
  { to: '/perfil', label: 'Perfil', Icono: IconoPerfil }
];

// Navegación de escritorio (≥900px, ver .sidebar en app.css). En mobile
// se oculta y manda la BottomNav; esta barra no se monta dos veces, solo
// cambia su visibilidad por CSS para no duplicar estado de navegación.
export default function Sidebar({ onNuevaTarea }) {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  function salir() {
    logout();
    navigate('/login');
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <MarcaChica />
      </div>

      <button type="button" className="sidebar-new-btn" onClick={onNuevaTarea}>
        <IconoMas size={18} />
        Nueva tarea
      </button>

      <nav className="sidebar-nav">
        {ITEMS.map(({ to, label, Icono }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `sidebar-nav-link${isActive ? ' sidebar-nav-link--active' : ''}`}>
            <Icono />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-user">
        <Avatar nombre={usuario?.nombre} iniciales={usuario?.iniciales} bg={usuario?.avatarBg} color={usuario?.avatarColor} size="sm" />
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{usuario?.nombre}</div>
          <div className="sidebar-user-role">{usuario?.cargo}</div>
        </div>
      </div>
      <button type="button" className="sidebar-logout" onClick={salir}>Cerrar sesión</button>
    </aside>
  );
}
