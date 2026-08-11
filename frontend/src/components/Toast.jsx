import { useDatos } from '../context/DataContext';

export default function Toast() {
  const { toast } = useDatos();
  if (!toast) return null;
  return (
    <div className="toast-wrap">
      <div className="toast">{toast}</div>
    </div>
  );
}
