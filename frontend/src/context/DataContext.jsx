import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { actividadApi, tareasApi, usuariosApi } from '../api';
import { useAuth } from './AuthContext';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { autenticado } = useAuth();
  const [tareas, setTareas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [actividad, setActividad] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [toast, setToast] = useState('');
  const toastTimer = useRef(null);

  const cargarTodo = useCallback(async () => {
    setCargando(true);
    try {
      const [t, u, a] = await Promise.all([tareasApi.listar(), usuariosApi.listar(), actividadApi.listar()]);
      setTareas(t);
      setUsuarios(u);
      setActividad(a);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (autenticado) {
      cargarTodo();
    } else {
      setTareas([]);
      setUsuarios([]);
      setActividad([]);
      setCargando(false);
    }
  }, [autenticado, cargarTodo]);

  const avisar = useCallback((mensaje) => {
    clearTimeout(toastTimer.current);
    setToast(mensaje);
    toastTimer.current = setTimeout(() => setToast(''), 2200);
  }, []);

  const recargarActividad = useCallback(async () => {
    setActividad(await actividadApi.listar());
  }, []);

  const crearTarea = useCallback(
    async (datos) => {
      const nueva = await tareasApi.crear(datos);
      setTareas((prev) => [nueva, ...prev]);
      avisar('Tarea creada');
      recargarActividad();
      return nueva;
    },
    [avisar, recargarActividad]
  );

  const cambiarEstado = useCallback(
    async (id, estado, mensaje) => {
      const actualizada = await tareasApi.actualizarEstado(id, estado);
      setTareas((prev) => prev.map((t) => (t.id === id ? actualizada : t)));
      if (mensaje) avisar(mensaje);
      recargarActividad();
      return actualizada;
    },
    [avisar, recargarActividad]
  );

  const editarTarea = useCallback(
    async (id, datos) => {
      const actualizada = await tareasApi.actualizar(id, datos);
      setTareas((prev) => prev.map((t) => (t.id === id ? actualizada : t)));
      avisar('Tarea actualizada');
      recargarActividad();
      return actualizada;
    },
    [avisar, recargarActividad]
  );

  const reasignarTarea = useCallback(
    async (id, asignadoId) => {
      const actualizada = await tareasApi.reasignar(id, asignadoId);
      setTareas((prev) => prev.map((t) => (t.id === id ? actualizada : t)));
      avisar('Tarea reasignada');
      recargarActividad();
      return actualizada;
    },
    [avisar, recargarActividad]
  );

  const usuarioPorId = useCallback((id) => usuarios.find((u) => u.id === id), [usuarios]);

  return (
    <DataContext.Provider
      value={{
        tareas,
        usuarios,
        actividad,
        cargando,
        toast,
        avisar,
        crearTarea,
        cambiarEstado,
        editarTarea,
        reasignarTarea,
        usuarioPorId,
        recargar: cargarTodo
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useDatos() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useDatos debe usarse dentro de <DataProvider>');
  return ctx;
}
