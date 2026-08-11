// Mapas de estado/prioridad -> colores. Réplica de PILL/PRIO del prototipo.
export const PILL = {
  pendiente: { label: 'Pendiente', bg: 'var(--tf-pend-bg)', color: 'var(--tf-pend-fg)' },
  en_progreso: { label: 'En progreso', bg: 'var(--tf-prog-bg)', color: 'var(--tf-prog-fg)' },
  completada: { label: 'Completada', bg: 'var(--tf-done-bg)', color: 'var(--tf-done-fg)' },
  vencida: { label: 'Vencida', bg: 'var(--tf-late-bg)', color: 'var(--tf-late-fg)' }
};

export const PRIO = {
  baja: { label: 'Baja', bg: 'var(--tf-line)', color: 'var(--tf-text3)', borde: 'var(--tf-border)' },
  media: { label: 'Media', bg: 'var(--tf-amber-bg)', color: 'var(--tf-amber-fg)', borde: 'var(--tf-amber-brd)' },
  alta: { label: 'Alta', bg: 'var(--tf-late-bg)', color: 'var(--tf-late-fg)', borde: 'var(--tf-red-brd)' }
};

export const COLUMNAS = [
  { key: 'pendiente', titulo: 'Pendiente' },
  { key: 'en_progreso', titulo: 'En progreso' },
  { key: 'completada', titulo: 'Completada' }
];

export function pillDe(tarea, vencida) {
  return vencida ? PILL.vencida : PILL[tarea.estado];
}

export function filtroPillEstilo(activo) {
  return activo
    ? { background: 'var(--tf-indigo-soft)', color: 'var(--tf-indigo)', borderColor: 'var(--tf-indigo-brd)' }
    : {};
}
