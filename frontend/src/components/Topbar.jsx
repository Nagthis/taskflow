import BotonTema from './BotonTema';
import BotonVista from './BotonVista';
import { IconoMas } from './Icons';
import { MarcaChica } from './Marca';

export default function Topbar({ onNuevaTarea, mostrarNuevaTarea }) {
  return (
    <div className="topbar">
      <div className="topbar-inner">
        <div className="topbar-brand-mobile">
          <MarcaChica />
        </div>
        <div className="topbar-actions">
          {mostrarNuevaTarea && (
            <button type="button" className="btn-primary topbar-new-btn" onClick={onNuevaTarea}>
              <IconoMas size={16} /> Nueva tarea
            </button>
          )}
          <BotonVista />
          <BotonTema />
        </div>
      </div>
    </div>
  );
}
