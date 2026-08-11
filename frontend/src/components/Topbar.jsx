import BotonTema from './BotonTema';
import { MarcaChica } from './Marca';

export default function Topbar() {
  return (
    <div className="topbar">
      <div className="topbar-inner">
        <MarcaChica />
        <BotonTema />
      </div>
    </div>
  );
}
