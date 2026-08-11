// Helpers de fecha — misma lógica que traía el prototipo (taskflow-data.js),
// pero usando la fecha real del sistema en vez de una constante fija.
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

export function diasHasta(iso, hoy = hoyISO()) {
  const a = new Date(iso + 'T00:00:00');
  const b = new Date(hoy + 'T00:00:00');
  return Math.round((a - b) / 86400000);
}

export function estaVencida(tarea, hoy = hoyISO()) {
  return tarea.estado !== 'completada' && diasHasta(tarea.vence, hoy) < 0;
}

export function fechaCorta(iso) {
  const d = new Date(iso + 'T00:00:00');
  return d.getDate() + ' ' + MESES[d.getMonth()];
}

export function formatearVencimiento(iso, hoy = hoyISO()) {
  const d = diasHasta(iso, hoy);
  if (d < -1) return 'Venció hace ' + Math.abs(d) + ' días';
  if (d === -1) return 'Venció ayer';
  if (d === 0) return 'Vence hoy';
  if (d === 1) return 'Vence mañana';
  if (d <= 7) return 'Vence en ' + d + ' días';
  return 'Vence el ' + fechaCorta(iso);
}

export function formatearRelativo(iso) {
  const ahora = Date.now();
  const t = new Date(iso).getTime();
  const seg = Math.max(0, Math.round((ahora - t) / 1000));
  if (seg < 60) return 'hace instantes';
  const min = Math.round(seg / 60);
  if (min < 60) return 'hace ' + min + ' min';
  const horas = Math.round(min / 60);
  if (horas < 24) return 'hace ' + horas + ' h';
  const dias = Math.round(horas / 24);
  return 'hace ' + dias + (dias === 1 ? ' día' : ' días');
}
