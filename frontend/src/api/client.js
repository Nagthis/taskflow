const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

let token = null;
export function setToken(t) {
  token = t;
}

async function pedir(ruta, opciones = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opciones.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${ruta}`, { ...opciones, headers });
  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }

  if (!res.ok) {
    const error = new Error((data && data.error) || `Error ${res.status}`);
    error.status = res.status;
    throw error;
  }
  return data;
}

export const api = {
  get: (ruta) => pedir(ruta),
  post: (ruta, body) => pedir(ruta, { method: 'POST', body: JSON.stringify(body) }),
  patch: (ruta, body) => pedir(ruta, { method: 'PATCH', body: JSON.stringify(body) })
};
