import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import BotonTema from '../components/BotonTema';
import { IconoOjo } from '../components/Icons';
import { MarcaGrande } from '../components/Marca';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { autenticado, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [verPass, setVerPass] = useState(false);
  const [recordar, setRecordar] = useState(true);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (autenticado) return <Navigate to="/dashboard" replace />;

  async function onLogin() {
    if (!email.trim() || !pass) {
      setError('Ingresa tu correo y tu contraseña.');
      return;
    }
    setEnviando(true);
    try {
      await login(email, pass, recordar);
      navigate('/dashboard');
    } catch (e) {
      setError(e.message || 'Credenciales inválidas. Revisa tu correo y contraseña.');
    } finally {
      setEnviando(false);
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Enter') onLogin();
  }

  return (
    <div className="login-page">
      <BotonTema className="login-theme-btn" />
      <div className="login-wrap">
        <MarcaGrande />

        <div className="login-heading">
          <h1>Bienvenido de nuevo</h1>
          <p>Organiza tu día con claridad y propósito</p>
        </div>

        <div className="card login-card">
          {error && (
            <div className="login-error">
              <div className="login-error-dot">!</div>
              <div>{error}</div>
            </div>
          )}

          <label className="field-label">Correo electrónico</label>
          <div className="field-block">
            <input
              type="email"
              className="field-input"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              onKeyDown={onKeyDown}
              placeholder="nombre@taskflow.cl"
            />
          </div>

          <label className="field-label">Contraseña</label>
          <div className="password-field">
            <input
              type={verPass ? 'text' : 'password'}
              className="field-input"
              value={pass}
              onChange={(e) => {
                setPass(e.target.value);
                setError('');
              }}
              onKeyDown={onKeyDown}
              placeholder="••••••••"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setVerPass((v) => !v)}
              aria-label="Mostrar u ocultar contraseña"
            >
              <IconoOjo tachado={!verPass} />
            </button>
          </div>

          <div className="login-row">
            <label className="checkbox-label">
              <input type="checkbox" checked={recordar} onChange={(e) => setRecordar(e.target.checked)} />
              Mantener sesión
            </label>
            <button type="button" className="link-btn" onClick={() => window.alert('Te enviamos un enlace de recuperación.')}>
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <button type="button" className="btn-primary" onClick={onLogin} disabled={enviando}>
            {enviando ? 'Ingresando…' : 'Iniciar Sesión'}
          </button>
        </div>

        <div className="login-demo-hint">demo · jose.luis@taskflow.cl / taskflow123</div>
      </div>
    </div>
  );
}
