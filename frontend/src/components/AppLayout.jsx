import { useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BottomNav from './BottomNav';
import Fab from './Fab';
import TaskFormModal from './TaskFormModal';
import Toast from './Toast';
import Topbar from './Topbar';

const RUTAS_CON_FAB = ['/dashboard', '/tareas'];

export default function AppLayout() {
  const { autenticado, cargando } = useAuth();
  const location = useLocation();
  const [formAbierto, setFormAbierto] = useState(false);

  if (cargando) return <div className="state-loading">Cargando…</div>;
  if (!autenticado) return <Navigate to="/login" replace />;

  const mostrarFab = RUTAS_CON_FAB.includes(location.pathname);

  return (
    <div className="app-shell">
      <Topbar />
      <div className="content">
        <Outlet />
      </div>
      {mostrarFab && <Fab onClick={() => setFormAbierto(true)} />}
      <BottomNav />
      <Toast />
      {formAbierto && <TaskFormModal onCerrar={() => setFormAbierto(false)} />}
    </div>
  );
}
