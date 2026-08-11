import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);
const CLAVE = 'taskflow-tema';

export function ThemeProvider({ children }) {
  const [tema, setTema] = useState(() => {
    try {
      return localStorage.getItem(CLAVE) || 'claro';
    } catch {
      return 'claro';
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-tf-tema', tema);
    try {
      localStorage.setItem(CLAVE, tema);
    } catch {
      /* localStorage no disponible */
    }
  }, [tema]);

  const alternarTema = () => setTema((t) => (t === 'oscuro' ? 'claro' : 'oscuro'));

  return (
    <ThemeContext.Provider value={{ tema, alternarTema, esOscuro: tema === 'oscuro' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTema() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTema debe usarse dentro de <ThemeProvider>');
  return ctx;
}
