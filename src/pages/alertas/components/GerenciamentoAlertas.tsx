
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Mail, 
  MessageSquare, 
  Bell, 
  Settings,
  Plus,
  Edit,
  Trash2,
  Clock,
  BarChart3
} from 'lucide-react';

const GerenciamentoAlertas = () => {
  const [usuarios, setUsuarios] = useState([
    {
      id: 1,
      nome: 'João Silva',
      email: 'joao@fazenda.com',
      telefone: '+55 11 99999-9999',
      canais: ['email', 'sms', 'sistema'],
      ativo: true
    },
    {
      id: 2,
      nome: 'Maria Santos',
      email: 'maria@fazenda.com',
      telefone: '+55 11 88888-8888',
      canais: ['email', 'sistema'],
      ativo: true
    }
  ]);

  const [configuracaoCanais, setConfiguracaoCanais] = useState({
    email: {
      ativo: true,
      servidor: 'smtp.gmail.com',
      porta: 587,
      usuario: 'alertas@fazenda.com'
    },
    sms: {
      ativo: false,
      provedor: 'twilio',
      chaveApi: '***hidden***'
    },
    sistema: {
      ativo: true,
      persistir: true,
      tempoRetencao: 30 // dias
    }
  });

  const estatisticas = {
    totalAlertas: 45,
    alertasAtivos: 12,
    alertasResolvidos: 33,
    alertasHoje: 5,
    distribuicaoPorModulo: [
      { modulo: 'Estoque', quantidade: 15 },
      { modulo: 'Financeiro', quantidade: 12 },
      { modulo: 'Plantios', quantidade: 10 },
      { modulo: 'Colheitas', quantidade: 8 }
    ]
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="usuarios" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
          <TabsTrigger value="canais">Canais</TabsTrigger>
          <TabsTrigger value="estatisticas">Estatísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="usuarios" className="space-y-4">
          {/* Gerenciamento de Usuários */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Usuários do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {usuarios.map((usuario) => (
                  <div key={usuario.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{usuario.nome}</h4>
                        <p className="text-sm text-gray-600">{usuario.email}</p>
                        <p className="text-sm text-gray-600">{usuario.telefone}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={usuario.ativo} />
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Canais habilitados:</Label>
                      <div className="flex gap-2 mt-1">
                        {usuario.canais.map(canal => (
                          <Badge key={canal} variant="secondary">
                            {canal === 'email' && <Mail className="h-3 w-3 mr-1" />}
                            {canal === 'sms' && <MessageSquare className="h-3 w-3 mr-1" />}
                            {canal === 'sistema' && <Bell className="h-3 w-3 mr-1" />}
                            {canal}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Usuário
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="canais" className="space-y-4">
          {/* Configuração de Canais */}
          <div className="grid gap-4">
            {/* Email */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Configuração de Email
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Canal Email</Label>
                  <Switch checked={configuracaoCanais.email.ativo} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="servidor">Servidor SMTP</Label>
                    <Input id="servidor" value={configuracaoCanais.email.servidor} />
                  </div>
                  <div>
                    <Label htmlFor="porta">Porta</Label>
                    <Input id="porta" value={configuracaoCanais.email.porta} />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="usuario">Usuário</Label>
                  <Input id="usuario" value={configuracaoCanais.email.usuario} />
                </div>
              </CardContent>
            </Card>

            {/* SMS */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Configuração de SMS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Canal SMS</Label>
                  <Switch checked={configuracaoCanais.sms.ativo} />
                </div>
                
                <div>
                  <Label htmlFor="provedor">Provedor</Label>
                  <Input id="provedor" value={configuracaoCanais.sms.provedor} />
                </div>
                
                <div>
                  <Label htmlFor="chaveApi">Chave da API</Label>
                  <Input id="chaveApi" type="password" value={configuracaoCanais.sms.chaveApi} />
                </div>
              </CardContent>
            </Card>

            {/* Sistema */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Configuração do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Notificações do Sistema</Label>
                  <Switch checked={configuracaoCanais.sistema.ativo} />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Persistir Alertas</Label>
                  <Switch checked={configuracaoCanais.sistema.persistir} />
                </div>
                
                <div>
                  <Label htmlFor="retencao">Tempo de Retenção (dias)</Label>
                  <Input id="retencao" type="number" value={configuracaoCanais.sistema.tempoRetencao} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="estatisticas" className="space-y-4">
          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Bell className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total de Alertas</p>
                    <p className="text-2xl font-bold">{estatisticas.totalAlertas}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Alertas Ativos</p>
                    <p className="text-2xl font-bold">{estatisticas.alertasAtivos}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <BarChart3 className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Resolvidos</p>
                    <p className="text-2xl font-bold">{estatisticas.alertasResolvidos}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Hoje</p>
                    <p className="text-2xl font-bold">{estatisticas.alertasHoje}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Módulo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {estatisticas.distribuicaoPorModulo.map((item) => (
                  <div key={item.modulo} className="flex items-center justify-between">
                    <span className="font-medium">{item.modulo}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(item.quantidade / estatisticas.totalAlertas) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-8">{item.quantidade}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GerenciamentoAlertas;
