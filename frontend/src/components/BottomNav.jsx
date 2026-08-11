import { NavLink } from 'react-router-dom';
import { IconoDashboard, IconoPerfil, IconoSupervisor, IconoTareas } from './Icons';

const ITEMS = [
  { to: '/dashboard', label: 'Dashboard', Icono: IconoDashboard },
  { to: '/tareas', label: 'Tareas', Icono: IconoTareas },
  { to: '/supervisor', label: 'Supervisor', Icono: IconoSupervisor },
  { to: '/perfil', label: 'Perfil', Icono: IconoPerfil }
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        {ITEMS.map(({ to, label, Icono }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `nav-btn${isActive ? ' nav-btn--active' : ''}`}>
            <Icono />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
