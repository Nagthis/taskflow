export default function Avatar({ nombre, iniciales, bg, color, size = 'md' }) {
  return (
    <div
      className={`avatar avatar--${size}`}
      style={{ background: bg || 'var(--tf-line)', color: color || 'var(--tf-muted)' }}
      title={nombre}
    >
      {iniciales || '—'}
    </div>
  );
}
