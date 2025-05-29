
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle, 
  Package, 
  Droplets, 
  DollarSign,
  Search,
  Filter,
  Clock,
  Bell
} from 'lucide-react';

const AlertasList = () => {
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroPrioridade, setFiltroPrioridade] = useState('todas');
  const [termoBusca, setTermoBusca] = useState('');

  // Dados mock dos alertas
  const alertas = [
    {
      id: 1,
      titulo: 'Estoque Baixo - Tomates',
      descricao: 'Estoque de tomates abaixo do limite mínimo (5kg restantes)',
      tipo: 'estoque',
      prioridade: 'alta',
      dataHora: '2024-01-15 08:30',
      modulo: 'Estoque',
      status: 'ativo',
      icon: Package
    },
    {
      id: 2,
      titulo: 'Irrigação Programada',
      descricao: 'Próxima irrigação da Área A programada para hoje às 14:00',
      tipo: 'irrigacao',
      prioridade: 'media',
      dataHora: '2024-01-15 07:00',
      modulo: 'Plantios',
      status: 'ativo',
      icon: Droplets
    },
    {
      id: 3,
      titulo: 'Pagamento Vencido',
      descricao: 'Fatura de fertilizantes venceu há 3 dias (R$ 850,00)',
      tipo: 'financeiro',
      prioridade: 'critica',
      dataHora: '2024-01-12 16:45',
      modulo: 'Financeiro',
      status: 'ativo',
      icon: DollarSign
    },
    {
      id: 4,
      titulo: 'Colheita Concluída',
      descricao: 'Colheita de alface da Área B foi finalizada com sucesso',
      tipo: 'producao',
      prioridade: 'baixa',
      dataHora: '2024-01-14 11:20',
      modulo: 'Colheitas',
      status: 'resolvido',
      icon: CheckCircle
    }
  ];

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'critica': return 'bg-red-100 text-red-800 border-red-200';
      case 'alta': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'baixa': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPrioridadeIcon = (prioridade: string) => {
    switch (prioridade) {
      case 'critica': return <AlertTriangle className="h-4 w-4" />;
      case 'alta': return <AlertCircle className="h-4 w-4" />;
      case 'media': return <Info className="h-4 w-4" />;
      case 'baixa': return <CheckCircle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const alertasFiltrados = alertas.filter(alerta => {
    const matchTipo = filtroTipo === 'todos' || alerta.tipo === filtroTipo;
    const matchPrioridade = filtroPrioridade === 'todas' || alerta.prioridade === filtroPrioridade;
    const matchBusca = alerta.titulo.toLowerCase().includes(termoBusca.toLowerCase()) ||
                      alerta.descricao.toLowerCase().includes(termoBusca.toLowerCase());
    
    return matchTipo && matchPrioridade && matchBusca;
  });

  return (
    <div className="space-y-6">
      {/* Filtros e Busca */}
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

      {/* Lista de Alertas */}
      <div className="space-y-4">
        {alertasFiltrados.map((alerta) => {
          const IconComponent = alerta.icon;
          
          return (
            <Card key={alerta.id} className={`border-l-4 ${
              alerta.prioridade === 'critica' ? 'border-l-red-500' :
              alerta.prioridade === 'alta' ? 'border-l-orange-500' :
              alerta.prioridade === 'media' ? 'border-l-yellow-500' :
              'border-l-blue-500'
            }`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-100">
                      <IconComponent className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{alerta.titulo}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {alerta.modulo}
                        </Badge>
                        <Badge className={`text-xs ${getPrioridadeColor(alerta.prioridade)}`}>
                          {getPrioridadeIcon(alerta.prioridade)}
                          <span className="ml-1 capitalize">{alerta.prioridade}</span>
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    {alerta.dataHora}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-gray-600 mb-4">{alerta.descricao}</p>
                
                <div className="flex items-center justify-between">
                  <Badge 
                    variant={alerta.status === 'ativo' ? 'default' : 'secondary'}
                    className="capitalize"
                  >
                    {alerta.status}
                  </Badge>
                  
                  <div className="flex gap-2">
                    {alerta.status === 'ativo' && (
                      <>
                        <Button variant="outline" size="sm">
                          Marcar como Lido
                        </Button>
                        <Button size="sm">
                          Resolver
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {alertasFiltrados.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum alerta encontrado
            </h3>
            <p className="text-gray-600">
              Não há alertas que correspondam aos filtros selecionados.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AlertasList;
