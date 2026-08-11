// Iconos SVG tomados literalmente del prototipo.
export function IconoSol({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8.6" fill="currentColor" />
      <circle cx="16.8" cy="7.8" r="7.6" fill="var(--tf-card)" />
    </svg>
  );
}

export function IconoLuna({ size = 19 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="4.4" />
      <line x1="12" y1="2.6" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="21.4" />
      <line x1="2.6" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="21.4" y2="12" />
    </svg>
  );
}

export function IconoEscritorio({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <line x1="8" y1="20" x2="16" y2="20" />
      <line x1="12" y1="16" x2="12" y2="20" />
    </svg>
  );
}

export function IconoMovil({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
      <line x1="10.3" y1="19" x2="13.7" y2="19" />
    </svg>
  );
}

// Monitor con un teléfono superpuesto: representa el modo "auto" (se
// ajusta solo según el ancho real de la ventana).
export function IconoAuto({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4.5" width="14.5" height="10" rx="1.8" />
      <line x1="6.5" y1="17.5" x2="12.5" y2="17.5" />
      <rect x="13.5" y="8.5" width="8.5" height="13" rx="2.2" fill="var(--tf-card)" />
    </svg>
  );
}

export function IconoOjo({ tachado }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <ellipse cx="12" cy="12" rx="9.5" ry="5.5" />
      <circle cx="12" cy="12" r="2.6" />
      <line x1="4" y1="20" x2="20" y2="4" style={{ opacity: tachado ? 1 : 0 }} />
    </svg>
  );
}

export function IconoCalendario() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="8" y1="3" x2="8" y2="7" />
      <line x1="16" y1="3" x2="16" y2="7" />
    </svg>
  );
}

export function IconoMas({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function IconoCerrar() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <line x1="5" y1="5" x2="19" y2="19" />
      <line x1="19" y1="5" x2="5" y2="19" />
    </svg>
  );
}

export function IconoDashboard() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <rect x="3" y="3" width="7.5" height="7.5" rx="2" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="2" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" />
    </svg>
  );
}

export function IconoTareas() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
      <circle cx="5" cy="6.5" r="1.6" />
      <circle cx="5" cy="12" r="1.6" />
      <circle cx="5" cy="17.5" r="1.6" />
      <line x1="10" y1="6.5" x2="20" y2="6.5" />
      <line x1="10" y1="12" x2="20" y2="12" />
      <line x1="10" y1="17.5" x2="20" y2="17.5" />
    </svg>
  );
}

export function IconoSupervisor() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
      <rect x="3" y="12" width="4.6" height="8.5" rx="1.6" />
      <rect x="9.7" y="7" width="4.6" height="13.5" rx="1.6" />
      <rect x="16.4" y="3.5" width="4.6" height="17" rx="1.6" />
    </svg>
  );
}

export function IconoPerfil() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
      <circle cx="12" cy="8" r="3.8" />
      <path d="M4.5 20.5c0-3.9 3.4-6.3 7.5-6.3s7.5 2.4 7.5 6.3" />
    </svg>
  );
}
