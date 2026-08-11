import { useTema } from '../context/ThemeContext';
import { IconoLuna, IconoSol } from './Icons';

export default function BotonTema({ className = '' }) {
  const { esOscuro, alternarTema } = useTema();
  return (
    <button
      type="button"
      onClick={alternarTema}
      aria-label="Cambiar entre modo claro y oscuro"
      className={`icon-btn ${className}`.trim()}
    >
      {esOscuro ? <IconoLuna /> : <IconoSol />}
    </button>
  );
}
