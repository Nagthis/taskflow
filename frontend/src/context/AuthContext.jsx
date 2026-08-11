import { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../api';
import { setToken as setTokenApi } from '../api/client';

const AuthContext = createContext(null);
const CLAVE_TOKEN = 'taskflow-token';
const CLAVE_USUARIO = 'taskflow-usuario';

function leerAlmacen(clave) {
  try {
    return localStorage.getItem(clave) || sessionStorage.getItem(clave);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const token = leerAlmacen(CLAVE_TOKEN);
    const usuarioGuardado = leerAlmacen(CLAVE_USUARIO);
    if (token && usuarioGuardado) {
      setTokenApi(token);
      try {
        setUsuario(JSON.parse(usuarioGuardado));
      } catch {
        setUsuario(null);
      }
    }
    setCargando(false);
  }, []);

  async function login(correo, clave, recordar) {
    const { token, usuario: perfil } = await authApi.login(correo, clave);
    setTokenApi(token);
    setUsuario(perfil);
    const almacen = recordar ? localStorage : sessionStorage;
    try {
      almacen.setItem(CLAVE_TOKEN, token);
      almacen.setItem(CLAVE_USUARIO, JSON.stringify(perfil));
    } catch {
      /* almacenamiento no disponible */
    }
    return perfil;
  }

  function logout() {
    setTokenApi(null);
    setUsuario(null);
    try {
      localStorage.removeItem(CLAVE_TOKEN);
      localStorage.removeItem(CLAVE_USUARIO);
      sessionStorage.removeItem(CLAVE_TOKEN);
      sessionStorage.removeItem(CLAVE_USUARIO);
    } catch {
      /* almacenamiento no disponible */
    }
  }

  return (
    <AuthContext.Provider value={{ usuario, cargando, autenticado: !!usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
