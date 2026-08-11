import { useState } from 'react';
import KanbanView from '../components/KanbanView';
import TaskListView from '../components/TaskListView';
import { useDatos } from '../context/DataContext';

export default function TareasPage() {
  const { cargando } = useDatos();
  const [vista, setVista] = useState('lista');

  if (cargando) return <div className="state-loading">Cargando…</div>;

  return (
    <>
      <div className="tareas-header">
        <div className="page-title">{vista === 'kanban' ? 'Tablero Kanban' : 'Lista de Tareas'}</div>
        <div className="segmented">
          <button type="button" className={`segmented-btn${vista === 'lista' ? ' segmented-btn--active' : ''}`} onClick={() => setVista('lista')}>Lista</button>
          <button type="button" className={`segmented-btn${vista === 'kanban' ? ' segmented-btn--active' : ''}`} onClick={() => setVista('kanban')}>Kanban</button>
        </div>
      </div>

      {vista === 'lista' ? <TaskListView /> : <KanbanView />}
    </>
  );
}
