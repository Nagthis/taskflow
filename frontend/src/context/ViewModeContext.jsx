import { createContext, useContext, useEffect, useState } from 'react';

const ViewModeContext = createContext(null);
const CLAVE = 'taskflow-vista';
const CONSULTA = '(min-width: 900px)';
const OPCIONES = ['auto', 'movil', 'escritorio'];

function ventanaEsAncha() {
  try {
    return window.matchMedia(CONSULTA).matches;
  } catch {
    return false;
  }
}

// "auto" deja que el layout lo decida el ancho real de la ventana (como
// cualquier sitio responsivo). "movil"/"escritorio" lo fuerzan sin
// importar el ancho, para poder mostrar ambos layouts desde un botón
// -tal como el tema claro/oscuro- sin tener que redimensionar la ventana.
export function ViewModeProvider({ children }) {
  const [preferencia, setPreferenciaState] = useState(() => {
    try {
      const guardada = localStorage.getItem(CLAVE);
      return OPCIONES.includes(guardada) ? guardada : 'auto';
    } catch {
      return 'auto';
    }
  });
  const [ventanaAncha, setVentanaAncha] = useState(ventanaEsAncha);

  useEffect(() => {
    const mq = window.matchMedia(CONSULTA);
    const onChange = (e) => setVentanaAncha(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const efectivo = preferencia === 'auto' ? (ventanaAncha ? 'escritorio' : 'movil') : preferencia;

  useEffect(() => {
    document.documentElement.setAttribute('data-tf-vista', efectivo);
  }, [efectivo]);

  function setPreferencia(valor) {
    setPreferenciaState(valor);
    try {
      localStorage.setItem(CLAVE, valor);
    } catch {
      /* localStorage no disponible */
    }
  }

  function alternarPreferencia() {
    const i = OPCIONES.indexOf(preferencia);
    setPreferencia(OPCIONES[(i + 1) % OPCIONES.length]);
  }

  return (
    <ViewModeContext.Provider value={{ preferencia, efectivo, setPreferencia, alternarPreferencia }}>
      {children}
    </ViewModeContext.Provider>
  );
}

export function useVista() {
  const ctx = useContext(ViewModeContext);
  if (!ctx) throw new Error('useVista debe usarse dentro de <ViewModeProvider>');
  return ctx;
}
