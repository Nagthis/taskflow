import { IconoMas } from './Icons';

export default function Fab({ onClick }) {
  return (
    <div className="fab-wrap">
      <div className="fab-inner">
        <button type="button" className="fab-btn" onClick={onClick} aria-label="Nueva tarea">
          <IconoMas />
        </button>
      </div>
    </div>
  );
}
