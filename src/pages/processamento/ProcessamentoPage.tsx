
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Package, Calendar, Barcode, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ProcessamentoItem {
  id: string;
  colheita_id: string;
  lote: string;
  data_processamento: string;
  tipo_processamento: string;
  quantidade_entrada_kg: number;
  quantidade_saida_kg: number;
  perda_percentual: number;
  observacoes?: string;
  colheitas?: {
    quantidade_kg: number;
    plantios?: {
      variedade: string;
      areas?: {
        nome: string;
      };
    };
  };
}

interface ColheitaDisponivel {
  id: string;
  quantidade_kg: number;
  variedade: string;
  area_nome: string;
  data_colheita: string;
}

const tipoProcessamentoColors = {
  'Lavagem': 'bg-blue-100 text-blue-800',
  'Secagem': 'bg-yellow-100 text-yellow-800',
  'Empacotamento': 'bg-green-100 text-green-800',
  'Beneficiamento': 'bg-purple-100 text-purple-800'
} as const;

const ProcessamentoPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    colheita_id: '',
    lote: '',
    data_processamento: '',
    tipo_processamento: 'Lavagem',
    quantidade_entrada_kg: '',
    quantidade_saida_kg: '',
    observacoes: ''
  });

  const { data: processamentos, isLoading } = useQuery({
    queryKey: ['processamentos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('processamentos')
        .select(`
          *,
          colheitas(
            quantidade_kg,
            plantios(
              variedade,
              areas(nome)
            )
          )
        `)
        .order('data_processamento', { ascending: false });
      
      if (error) {
        console.log('Erro ao buscar processamentos:', error);
        return [];
      }
      return data as ProcessamentoItem[];
    },
    enabled: !!user
  });

  const { data: colheitasDisponiveis } = useQuery({
    queryKey: ['colheitas-processamento'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('colheitas')
        .select(`
          id,
          quantidade_kg,
          data_colheita,
          plantios(
            variedade,
            areas(nome)
          )
        `)
        .eq('destino', 'processamento')
        .order('data_colheita', { ascending: false });
      
      if (error) throw error;
      return data.map(c => ({
        id: c.id,
        quantidade_kg: c.quantidade_kg,
        variedade: c.plantios?.variedade || 'Variedade não definida',
        area_nome: c.plantios?.areas?.nome || 'Área não definida',
        data_colheita: c.data_colheita
      })) as ColheitaDisponivel[];
    },
    enabled: !!user
  });

  const createProcessamentoMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('processamentos')
        .insert([{ ...data, user_id: user?.id }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processamentos'] });
      toast({ title: 'Processamento registrado com sucesso!' });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: 'Erro ao registrar processamento',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const resetForm = () => {
    setFormData({
      colheita_id: '',
      lote: '',
      data_processamento: '',
      tipo_processamento: 'Lavagem',
      quantidade_entrada_kg: '',
      quantidade_saida_kg: '',
      observacoes: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const entradaKg = parseFloat(formData.quantidade_entrada_kg);
    const saidaKg = parseFloat(formData.quantidade_saida_kg);

    const data = {
      ...formData,
      quantidade_entrada_kg: entradaKg,
      quantidade_saida_kg: saidaKg,
      lote: formData.lote || `LOTE-${Date.now()}`
    };

    createProcessamentoMutation.mutate(data);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const calcularEstatisticas = () => {
    if (!processamentos || processamentos.length === 0) {
      return { total: 0, perdaMedia: 0, eficienciaMedia: 0 };
    }
    
    const perdaMedia = processamentos.reduce((sum, p) => sum + (p.perda_percentual || 0), 0) / processamentos.length;
    const eficienciaMedia = 100 - perdaMedia;

    return {
      total: processamentos.length,
      perdaMedia: perdaMedia.toFixed(1),
      eficienciaMedia: eficienciaMedia.toFixed(1)
    };
  };

  const estatisticas = calcularEstatisticas();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Controle de Processamento</h1>
          <p className="text-gray-600">Gerencie o processamento e rastreabilidade dos lotes</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Novo Processamento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Processamento</DialogTitle>
              <DialogDescription>
                Registre um novo processamento de colheita
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="colheita_id">Colheita</Label>
                <Select value={formData.colheita_id} onValueChange={(value) => setFormData({...formData, colheita_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma colheita" />
                  </SelectTrigger>
                  <SelectContent>
                    {colheitasDisponiveis?.map((colheita) => (
                      <SelectItem key={colheita.id} value={colheita.id}>
                        {colheita.variedade} - {colheita.area_nome} ({colheita.quantidade_kg} kg)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lote">Lote</Label>
                  <Input
                    id="lote"
                    value={formData.lote}
                    onChange={(e) => setFormData({...formData, lote: e.target.value})}
                    placeholder="Ex: LOTE-001 (opcional)"
                  />
                </div>
                
                <div>
                  <Label htmlFor="data_processamento">Data do Processamento</Label>
                  <Input
                    id="data_processamento"
                    type="date"
                    value={formData.data_processamento}
                    onChange={(e) => setFormData({...formData, data_processamento: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="tipo_processamento">Tipo de Processamento</Label>
                <Select value={formData.tipo_processamento} onValueChange={(value) => setFormData({...formData, tipo_processamento: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lavagem">Lavagem</SelectItem>
                    <SelectItem value="Secagem">Secagem</SelectItem>
                    <SelectItem value="Empacotamento">Empacotamento</SelectItem>
                    <SelectItem value="Beneficiamento">Beneficiamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantidade_entrada_kg">Qtd. Entrada (kg)</Label>
                  <Input
                    id="quantidade_entrada_kg"
                    type="number"
                    step="0.01"
                    value={formData.quantidade_entrada_kg}
                    onChange={(e) => setFormData({...formData, quantidade_entrada_kg: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="quantidade_saida_kg">Qtd. Saída (kg)</Label>
                  <Input
                    id="quantidade_saida_kg"
                    type="number"
                    step="0.01"
                    value={formData.quantidade_saida_kg}
                    onChange={(e) => setFormData({...formData, quantidade_saida_kg: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                  placeholder="Informações sobre o processamento..."
                />
              </div>
              
              <DialogFooter>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  Registrar Processamento
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="processamentos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="processamentos">Processamentos</TabsTrigger>
          <TabsTrigger value="rastreabilidade">Rastreabilidade</TabsTrigger>
          <TabsTrigger value="estatisticas">Estatísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="processamentos">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {processamentos?.map((processamento) => (
              <Card key={processamento.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Package className="h-4 w-4 mr-2 text-green-600" />
                      {processamento.colheitas?.plantios?.variedade}
                    </span>
                    <Badge className={tipoProcessamentoColors[processamento.tipo_processamento as keyof typeof tipoProcessamentoColors]}>
                      {processamento.tipo_processamento}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="flex items-center">
                    <Barcode className="h-4 w-4 mr-1" />
                    Lote: {processamento.lote}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{formatDate(processamento.data_processamento)}</span>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Entrada:</span>
                        <span className="font-medium">{processamento.quantidade_entrada_kg} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Saída:</span>
                        <span className="font-medium">{processamento.quantidade_saida_kg} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Perda:</span>
                        <span className={`font-medium ${processamento.perda_percentual > 10 ? 'text-red-600' : 'text-green-600'}`}>
                          {processamento.perda_percentual?.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    
                    {processamento.observacoes && (
                      <p><strong>Obs:</strong> {processamento.observacoes}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {(!processamentos || processamentos.length === 0) && (
            <Card>
              <CardContent className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum processamento registrado
                </h3>
                <p className="text-gray-600 mb-4">
                  Comece registrando seu primeiro processamento
                </p>
                <Button 
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Primeiro Processamento
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="rastreabilidade">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Rastreabilidade de Lotes</CardTitle>
                <CardDescription>
                  Acompanhe a origem e destino de cada lote processado
                </CardDescription>
              </CardHeader>
              <CardContent>
                {processamentos?.map((processamento) => (
                  <div key={processamento.id} className="border-l-4 border-green-500 pl-4 mb-4 last:mb-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{processamento.lote}</h4>
                      <Badge variant="outline">{processamento.tipo_processamento}</Badge>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      <p>Origem: {processamento.colheitas?.plantios?.variedade} - {processamento.colheitas?.plantios?.areas?.nome}</p>
                      <p>Processado em: {formatDate(processamento.data_processamento)}</p>
                      <p>Rendimento: {((processamento.quantidade_saida_kg / processamento.quantidade_entrada_kg) * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="estatisticas">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Processado</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estatisticas.total}</div>
                <p className="text-xs text-muted-foreground">
                  Lotes processados
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Eficiência Média</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estatisticas.eficienciaMedia}%</div>
                <p className="text-xs text-muted-foreground">
                  Rendimento do processamento
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Perda Média</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estatisticas.perdaMedia}%</div>
                <p className="text-xs text-muted-foreground">
                  Perda no processamento
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProcessamentoPage;
