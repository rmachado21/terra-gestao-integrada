
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface AlertaFiltersProps {
  filtroTipo: string;
  setFiltroTipo: (value: string) => void;
  filtroPrioridade: string;
  setFiltroPrioridade: (value: string) => void;
  termoBusca: string;
  setTermoBusca: (value: string) => void;
}

const AlertaFilters = ({
  filtroTipo,
  setFiltroTipo,
  filtroPrioridade,
  setFiltroPrioridade,
  termoBusca,
  setTermoBusca
}: AlertaFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar alertas..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <Select value={filtroTipo} onValueChange={setFiltroTipo}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Filtrar por tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos os tipos</SelectItem>
          <SelectItem value="estoque">Estoque</SelectItem>
          <SelectItem value="irrigacao">Irrigação</SelectItem>
          <SelectItem value="financeiro">Financeiro</SelectItem>
          <SelectItem value="producao">Produção</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filtroPrioridade} onValueChange={setFiltroPrioridade}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Filtrar por prioridade" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todas">Todas as prioridades</SelectItem>
          <SelectItem value="critica">Crítica</SelectItem>
          <SelectItem value="alta">Alta</SelectItem>
          <SelectItem value="media">Média</SelectItem>
          <SelectItem value="baixa">Baixa</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default AlertaFilters;
