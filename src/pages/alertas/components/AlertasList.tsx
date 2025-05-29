
import { useState } from 'react';
import AlertaCard from './AlertaCard';
import AlertaFilters from './AlertaFilters';
import AlertaEmptyState from './AlertaEmptyState';
import { alertasMockData } from '../data/alertasMockData';
import { filterAlertas } from '../utils/alertaFilters';

const AlertasList = () => {
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroPrioridade, setFiltroPrioridade] = useState('todas');
  const [termoBusca, setTermoBusca] = useState('');

  const alertasFiltrados = filterAlertas(
    alertasMockData,
    filtroTipo,
    filtroPrioridade,
    termoBusca
  );

  return (
    <div className="space-y-6">
      <AlertaFilters
        filtroTipo={filtroTipo}
        setFiltroTipo={setFiltroTipo}
        filtroPrioridade={filtroPrioridade}
        setFiltroPrioridade={setFiltroPrioridade}
        termoBusca={termoBusca}
        setTermoBusca={setTermoBusca}
      />

      <div className="space-y-4">
        {alertasFiltrados.map((alerta) => (
          <AlertaCard key={alerta.id} alerta={alerta} />
        ))}
      </div>

      {alertasFiltrados.length === 0 && <AlertaEmptyState />}
    </div>
  );
};

export default AlertasList;
