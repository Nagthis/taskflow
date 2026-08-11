import { api } from './client';

export const authApi = {
  login: (correo, clave) => api.post('/auth/login', { correo, clave }),
  me: () => api.get('/auth/me')
};

export const usuariosApi = {
  listar: () => api.get('/usuarios')
};

export const tareasApi = {
  listar: () => api.get('/tareas'),
  crear: (datos) => api.post('/tareas', datos),
  actualizar: (id, datos) => api.patch(`/tareas/${id}`, datos),
  actualizarEstado: (id, estado) => api.patch(`/tareas/${id}/estado`, { estado }),
  reasignar: (id, asignadoId) => api.patch(`/tareas/${id}/asignado`, { asignadoId })
};

export const actividadApi = {
  listar: (limite = 8) => api.get(`/actividad?limite=${limite}`)
};
