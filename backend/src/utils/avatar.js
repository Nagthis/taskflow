// Asigna un par de colores de avatar a cada usuario de forma determinística,
// ciclando por la misma paleta que usaba el prototipo (pend, indigo, done, amber, prog).
const PALETA = [
  { bg: 'var(--tf-pend-bg)', color: 'var(--tf-pend-fg)' },
  { bg: 'var(--tf-indigo-soft)', color: 'var(--tf-indigo)' },
  { bg: 'var(--tf-done-bg)', color: 'var(--tf-done-fg)' },
  { bg: 'var(--tf-amber-bg)', color: 'var(--tf-amber-fg)' },
  { bg: 'var(--tf-prog-bg)', color: 'var(--tf-prog-fg)' }
];

function colorAvatar(id) {
  const n = (Number(id) || 1) - 1;
  return PALETA[((n % PALETA.length) + PALETA.length) % PALETA.length];
}

function iniciales(nombre) {
  return (nombre || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

module.exports = { colorAvatar, iniciales };
