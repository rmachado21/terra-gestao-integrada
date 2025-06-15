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
import { Plus, Package2, Calendar, MapPin, Weight, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
interface Colheita {
  id: string;
  plantio_id: string;
  data_colheita: string;
  quantidade_kg: number;
  qualidade: string;
  destino: string;
  observacoes?: string;
  plantios?: {
    variedade: string;
    areas?: {
      nome: string;
    };
  };
}
interface PlantioOption {
  id: string;
  variedade: string;
  area_nome: string;
  data_previsao_colheita: string;
  status: string;
}
const qualidadeColors = {
  'Excelente': 'bg-green-100 text-green-800',
  'Boa': 'bg-blue-100 text-blue-800',
  'Regular': 'bg-yellow-100 text-yellow-800',
  'Ruim': 'bg-red-100 text-red-800'
} as const;
const destinoColors = {
  'venda': 'bg-green-100 text-green-800',
  'processamento': 'bg-blue-100 text-blue-800',
  'estoque': 'bg-gray-100 text-gray-800'
} as const;
const ColheitasPage = () => {
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    plantio_id: '',
    data_colheita: '',
    quantidade_kg: '',
    qualidade: 'Boa',
    destino: 'venda',
    observacoes: ''
  });
  const {
    data: colheitas,
    isLoading
  } = useQuery({
    queryKey: ['colheitas'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('colheitas').select(`
          *,
          plantios(
            variedade,
            areas(nome)
          )
        `).order('data_colheita', {
        ascending: false
      });
      if (error) throw error;
      return data as Colheita[];
    },
    enabled: !!user
  });
  const {
    data: plantiosDisponiveis
  } = useQuery({
    queryKey: ['plantios-disponiveis'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('plantios').select(`
          id,
          variedade,
          data_previsao_colheita,
          status,
          areas(nome)
        `).in('status', ['crescendo', 'pronto_colheita']).order('data_previsao_colheita');
      if (error) throw error;
      return data.map(p => ({
        id: p.id,
        variedade: p.variedade,
        area_nome: p.areas?.nome || 'Área não definida',
        data_previsao_colheita: p.data_previsao_colheita,
        status: p.status
      })) as PlantioOption[];
    },
    enabled: !!user
  });
  const createColheitaMutation = useMutation({
    mutationFn: async (data: any) => {
      const {
        error
      } = await supabase.from('colheitas').insert([{
        ...data,
        user_id: user?.id
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['colheitas']
      });
      queryClient.invalidateQueries({
        queryKey: ['plantios-disponiveis']
      });
      toast({
        title: 'Colheita registrada com sucesso!'
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: 'Erro ao registrar colheita',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  });
  const resetForm = () => {
    setFormData({
      plantio_id: '',
      data_colheita: '',
      quantidade_kg: '',
      qualidade: 'Boa',
      destino: 'venda',
      observacoes: ''
    });
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      quantidade_kg: parseFloat(formData.quantidade_kg)
    };
    createColheitaMutation.mutate(data);
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };
  const calcularEstatisticas = () => {
    if (!colheitas) return {
      total: 0,
      mediaQualidade: 0,
      totalKg: 0
    };
    const totalKg = colheitas.reduce((sum, c) => sum + c.quantidade_kg, 0);
    const qualidadeScores = {
      'Excelente': 4,
      'Boa': 3,
      'Regular': 2,
      'Ruim': 1
    };
    const mediaQualidade = colheitas.length > 0 ? colheitas.reduce((sum, c) => sum + (qualidadeScores[c.qualidade as keyof typeof qualidadeScores] || 2), 0) / colheitas.length : 0;
    return {
      total: colheitas.length,
      mediaQualidade: mediaQualidade.toFixed(1),
      totalKg
    };
  };
  const estatisticas = calcularEstatisticas();
  if (isLoading) {
    return <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>;
  }
  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Package2 className="h-8 w-8 text-green-700" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestão de Colheitas</h1>
            <p className="text-gray-600">Registre e acompanhe as colheitas da sua produção</p>
          </div>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Nova Colheita
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Colheita</DialogTitle>
              <DialogDescription>
                Registre uma nova colheita dos seus plantios
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="plantio_id">Plantio</Label>
                <Select value={formData.plantio_id} onValueChange={value => setFormData({
                ...formData,
                plantio_id: value
              })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um plantio" />
                  </SelectTrigger>
                  <SelectContent>
                    {plantiosDisponiveis?.map(plantio => <SelectItem key={plantio.id} value={plantio.id}>
                        {plantio.variedade} - {plantio.area_nome} 
                        {plantio.status === 'pronto_colheita' && ' (Pronto!)'}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="data_colheita">Data da Colheita</Label>
                  <Input id="data_colheita" type="date" value={formData.data_colheita} onChange={e => setFormData({
                  ...formData,
                  data_colheita: e.target.value
                })} required />
                </div>
                
                <div>
                  <Label htmlFor="quantidade_kg">Quantidade (kg)</Label>
                  <Input id="quantidade_kg" type="number" step="0.01" value={formData.quantidade_kg} onChange={e => setFormData({
                  ...formData,
                  quantidade_kg: e.target.value
                })} placeholder="Ex: 150.5" required />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="qualidade">Qualidade</Label>
                  <Select value={formData.qualidade} onValueChange={value => setFormData({
                  ...formData,
                  qualidade: value
                })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Excelente">Excelente</SelectItem>
                      <SelectItem value="Boa">Boa</SelectItem>
                      <SelectItem value="Regular">Regular</SelectItem>
                      <SelectItem value="Ruim">Ruim</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="destino">Destino</Label>
                  <Select value={formData.destino} onValueChange={value => setFormData({
                  ...formData,
                  destino: value
                })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="venda">Venda Direta</SelectItem>
                      <SelectItem value="processamento">Processamento</SelectItem>
                      <SelectItem value="estoque">Estoque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea id="observacoes" value={formData.observacoes} onChange={e => setFormData({
                ...formData,
                observacoes: e.target.value
              })} placeholder="Informações adicionais sobre a colheita..." />
              </div>
              
              <DialogFooter>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  Registrar Colheita
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="colheitas" className="space-y-4">
        <TabsList className=" bg-gray-300 text-gray-900">
          <TabsTrigger value="colheitas">Colheitas</TabsTrigger>
          <TabsTrigger value="estatisticas">Estatísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="colheitas">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {colheitas?.map(colheita => <Card key={colheita.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Package2 className="h-4 w-4 mr-2 text-green-600" />
                      {colheita.plantios?.variedade}
                    </span>
                    <Badge className={qualidadeColors[colheita.qualidade as keyof typeof qualidadeColors]}>
                      {colheita.qualidade}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {colheita.plantios?.areas?.nome}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <span>Colhida em {formatDate(colheita.data_colheita)}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Weight className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="font-medium">{colheita.quantidade_kg} kg</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span>Destino:</span>
                      <Badge className={destinoColors[colheita.destino as keyof typeof destinoColors]}>
                        {colheita.destino === 'venda' ? 'Venda' : colheita.destino === 'processamento' ? 'Processamento' : 'Estoque'}
                      </Badge>
                    </div>
                    
                    {colheita.observacoes && <p><strong>Obs:</strong> {colheita.observacoes}</p>}
                  </div>
                </CardContent>
              </Card>)}
          </div>

          {colheitas?.length === 0 && <Card>
              <CardContent className="text-center py-8">
                <Package2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma colheita registrada
                </h3>
                <p className="text-gray-600 mb-4">
                  Comece registrando sua primeira colheita
                </p>
                <Button onClick={() => setIsDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Primeira Colheita
                </Button>
              </CardContent>
            </Card>}
        </TabsContent>

        <TabsContent value="estatisticas">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Colheitas</CardTitle>
                <Package2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estatisticas.total}</div>
                <p className="text-xs text-muted-foreground">
                  Colheitas registradas
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Produção Total</CardTitle>
                <Weight className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estatisticas.totalKg} kg</div>
                <p className="text-xs text-muted-foreground">
                  Quilogramas colhidos
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Qualidade Média</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estatisticas.mediaQualidade}/4</div>
                <p className="text-xs text-muted-foreground">
                  Índice de qualidade
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>;
};
export default ColheitasPage;