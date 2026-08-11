import { useVista } from '../context/ViewModeContext';
import { IconoAuto, IconoEscritorio, IconoMovil } from './Icons';

const INFO = {
  auto: { Icono: IconoAuto, etiqueta: 'Automático', siguiente: 'vista Móvil' },
  movil: { Icono: IconoMovil, etiqueta: 'Móvil', siguiente: 'vista Escritorio' },
  escritorio: { Icono: IconoEscritorio, etiqueta: 'Escritorio', siguiente: 'vista Automática' }
};

// Fuerza el layout mobile/desktop sin depender del ancho real de la
// ventana — útil para exhibir ambas versiones (p. ej. en una demo) sin
// tener que redimensionar el navegador. Ciclo: auto -> móvil -> escritorio.
export default function BotonVista({ className = '' }) {
  const { preferencia, alternarPreferencia } = useVista();
  const { Icono, etiqueta, siguiente } = INFO[preferencia];

  return (
    <button
      type="button"
      onClick={alternarPreferencia}
      className={`icon-btn boton-vista ${className}`.trim()}
      aria-label={`Vista: ${etiqueta}. Cambiar a ${siguiente}.`}
      title={`Vista: ${etiqueta}`}
    >
      <Icono />
    </button>
  );
}
