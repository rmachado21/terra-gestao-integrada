
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  Package,
  Droplets,
  DollarSign,
  Calendar
} from 'lucide-react';

const ConfiguracaoRegras = () => {
  const [regras, setRegras] = useState([
    {
      id: 1,
      nome: 'Estoque Baixo',
      modulo: 'estoque',
      condicao: 'quantidade <= quantidade_minima',
      prioridade: 'alta',
      ativo: true,
      canais: ['email', 'sistema'],
      descricao: 'Alerta quando produto atingir estoque mínimo'
    },
    {
      id: 2,
      nome: 'Pagamento Vencido',
      modulo: 'financeiro',
      condicao: 'data_vencimento < hoje',
      prioridade: 'critica',
      ativo: true,
      canais: ['email', 'sms', 'sistema'],
      descricao: 'Notifica sobre pagamentos em atraso'
    },
    {
      id: 3,
      nome: 'Irrigação Programada',
      modulo: 'plantios',
      condicao: 'data_irrigacao = hoje',
      prioridade: 'media',
      ativo: true,
      canais: ['sistema'],
      descricao: 'Lembrete de irrigação programada'
    }
  ]);

  const [editandoRegra, setEditandoRegra] = useState<number | null>(null);
  const [novaRegra, setNovaRegra] = useState({
    nome: '',
    modulo: '',
    condicao: '',
    prioridade: 'media',
    ativo: true,
    canais: ['sistema'],
    descricao: ''
  });

  const getModuloIcon = (modulo: string) => {
    switch (modulo) {
      case 'estoque': return <Package className="h-4 w-4" />;
      case 'financeiro': return <DollarSign className="h-4 w-4" />;
      case 'plantios': return <Droplets className="h-4 w-4" />;
      case 'colheitas': return <Calendar className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'critica': return 'bg-red-100 text-red-800';
      case 'alta': return 'bg-orange-100 text-orange-800';
      case 'media': return 'bg-yellow-100 text-yellow-800';
      case 'baixa': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const adicionarRegra = () => {
    const novaId = Math.max(...regras.map(r => r.id)) + 1;
    setRegras([...regras, { ...novaRegra, id: novaId }]);
    setNovaRegra({
      nome: '',
      modulo: '',
      condicao: '',
      prioridade: 'media',
      ativo: true,
      canais: ['sistema'],
      descricao: ''
    });
  };

  const removerRegra = (id: number) => {
    setRegras(regras.filter(r => r.id !== id));
  };

  const toggleRegraAtiva = (id: number) => {
    setRegras(regras.map(r => 
      r.id === id ? { ...r, ativo: !r.ativo } : r
    ));
  };

  return (
    <div className="space-y-6">
      {/* Formulário para Nova Regra */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Criar Nova Regra
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome">Nome da Regra</Label>
              <Input
                id="nome"
                value={novaRegra.nome}
                onChange={(e) => setNovaRegra({...novaRegra, nome: e.target.value})}
                placeholder="Ex: Estoque Baixo"
              />
            </div>
            
            <div>
              <Label htmlFor="modulo">Módulo</Label>
              <Select 
                value={novaRegra.modulo} 
                onValueChange={(value) => setNovaRegra({...novaRegra, modulo: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o módulo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="estoque">Estoque</SelectItem>
                  <SelectItem value="financeiro">Financeiro</SelectItem>
                  <SelectItem value="plantios">Plantios</SelectItem>
                  <SelectItem value="colheitas">Colheitas</SelectItem>
                  <SelectItem value="vendas">Vendas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="condicao">Condição (Lógica)</Label>
            <Input
              id="condicao"
              value={novaRegra.condicao}
              onChange={(e) => setNovaRegra({...novaRegra, condicao: e.target.value})}
              placeholder="Ex: quantidade <= quantidade_minima"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="prioridade">Prioridade</Label>
              <Select 
                value={novaRegra.prioridade} 
                onValueChange={(value) => setNovaRegra({...novaRegra, prioridade: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="critica">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Canais de Notificação</Label>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">Sistema</Badge>
                <Badge variant="outline">Email</Badge>
                <Badge variant="outline">SMS</Badge>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={novaRegra.descricao}
              onChange={(e) => setNovaRegra({...novaRegra, descricao: e.target.value})}
              placeholder="Descreva quando esta regra deve ser acionada"
              rows={3}
            />
          </div>

          <Button onClick={adicionarRegra} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Criar Regra
          </Button>
        </CardContent>
      </Card>

      {/* Lista de Regras Existentes */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Regras Configuradas</h3>
        
        {regras.map((regra) => (
          <Card key={regra.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getModuloIcon(regra.modulo)}
                  <div>
                    <CardTitle className="text-lg">{regra.nome}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{regra.descricao}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className={getPrioridadeColor(regra.prioridade)}>
                    {regra.prioridade.charAt(0).toUpperCase() + regra.prioridade.slice(1)}
                  </Badge>
                  <Switch
                    checked={regra.ativo}
                    onCheckedChange={() => toggleRegraAtiva(regra.id)}
                  />
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Condição:</Label>
                  <code className="block mt-1 p-2 bg-gray-100 rounded text-sm">
                    {regra.condicao}
                  </code>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Canais:</Label>
                  <div className="flex gap-2 mt-1">
                    {regra.canais.map(canal => (
                      <Badge key={canal} variant="secondary">
                        {canal}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => removerRegra(regra.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remover
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ConfiguracaoRegras;
