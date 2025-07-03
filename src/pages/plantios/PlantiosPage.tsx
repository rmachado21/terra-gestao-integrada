
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
import { Plus, Sprout, Calendar, MapPin, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useEffectiveUser } from '@/hooks/useEffectiveUser';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Plantio {
  id: string;
  area_id?: string;
  variedade: string;
  data_plantio: string;
  data_previsao_colheita: string;
  quantidade_mudas?: number;
  status: string;
  observacoes?: string;
  areas?: {
    nome: string;
    tamanho_hectares: number;
  };
}

interface Area {
  id: string;
  nome: string;
  tamanho_hectares: number;
}

const statusColors = {
  'planejado': 'bg-gray-100 text-gray-800',
  'plantado': 'bg-blue-100 text-blue-800',
  'crescendo': 'bg-yellow-100 text-yellow-800',
  'pronto_colheita': 'bg-green-100 text-green-800',
  'colhido': 'bg-purple-100 text-purple-800'
} as const;

const statusLabels = {
  'planejado': 'Planejado',
  'plantado': 'Plantado',
  'crescendo': 'Crescendo',
  'pronto_colheita': 'Pronto para Colheita',
  'colhido': 'Colhido'
} as const;

const PlantiosPage = () => {
  const { effectiveUserId, isImpersonating } = useEffectiveUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlantio, setEditingPlantio] = useState<Plantio | null>(null);
  const [formData, setFormData] = useState({
    area_id: '',
    variedade: '',
    data_plantio: '',
    data_previsao_colheita: '',
    quantidade_mudas: '',
    status: 'planejado',
    observacoes: ''
  });

  const { data: plantios, isLoading } = useQuery({
    queryKey: ['plantios', effectiveUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plantios')
        .select(`
          *,
          areas(nome, tamanho_hectares)
        `)
        .eq('user_id', effectiveUserId)
        .order('data_plantio', { ascending: false });

      if (error) {
        console.log('Erro ao buscar plantios:', error);
        return [];
      }
      return data as Plantio[];
    },
    enabled: !!effectiveUserId
  });

  const { data: areas } = useQuery({
    queryKey: ['areas-plantio', effectiveUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('areas')
        .select('id, nome, tamanho_hectares')
        .eq('user_id', effectiveUserId)
        .eq('ativa', true)
        .order('nome');

      if (error) throw error;
      return data as Area[];
    },
    enabled: !!effectiveUserId
  });

  const createPlantioMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('plantios')
        .insert([{
          ...data,
          user_id: effectiveUserId
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plantios'] });
      toast({
        title: 'Plantio registrado com sucesso!'
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: 'Erro ao registrar plantio',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  });

  const updatePlantioMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from('plantios')
        .update(data)
        .eq('id', id)
        .eq('user_id', effectiveUserId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plantios'] });
      toast({
        title: 'Plantio atualizado com sucesso!'
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: 'Erro ao atualizar plantio',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  });

  const deletePlantioMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('plantios')
        .delete()
        .eq('id', id)
        .eq('user_id', effectiveUserId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plantios'] });
      toast({
        title: 'Plantio removido com sucesso!'
      });
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: 'Erro ao remover plantio',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  });

  const resetForm = () => {
    setFormData({
      area_id: '',
      variedade: '',
      data_plantio: '',
      data_previsao_colheita: '',
      quantidade_mudas: '',
      status: 'planejado',
      observacoes: ''
    });
    setEditingPlantio(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      quantidade_mudas: formData.quantidade_mudas ? parseInt(formData.quantidade_mudas) : null
    };
    
    if (editingPlantio) {
      updatePlantioMutation.mutate({ id: editingPlantio.id, data });
    } else {
      createPlantioMutation.mutate(data);
    }
  };

  const handleEdit = (plantio: Plantio) => {
    setEditingPlantio(plantio);
    setFormData({
      area_id: plantio.area_id || '',
      variedade: plantio.variedade,
      data_plantio: plantio.data_plantio,
      data_previsao_colheita: plantio.data_previsao_colheita,
      quantidade_mudas: plantio.quantidade_mudas?.toString() || '',
      status: plantio.status,
      observacoes: plantio.observacoes || ''
    });
    setIsDialogOpen(true);
  };

  const handleStatusChange = (plantioId: string, newStatus: string) => {
    updatePlantioMutation.mutate({ 
      id: plantioId, 
      data: { status: newStatus }
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja remover este plantio?')) {
      deletePlantioMutation.mutate(id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getDaysUntilHarvest = (dataPrevisao: string) => {
    const hoje = new Date();
    const previsao = new Date(dataPrevisao);
    const diffTime = previsao.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Sprout className="h-8 w-8 text-green-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Controle de Plantios</h1>
            <p className="text-gray-600">
              Gerencie seus plantios e acompanhe o desenvolvimento
              {isImpersonating && <span className="text-orange-600 ml-2">(Visualizando como usuário)</span>}
            </p>
          </div>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Novo Plantio
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingPlantio ? 'Editar Plantio' : 'Registrar Plantio'}
              </DialogTitle>
              <DialogDescription>
                {editingPlantio ? 'Atualize as informações do plantio' : 'Registre um novo plantio'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="area_id">Área</Label>
                <Select value={formData.area_id} onValueChange={(value) => setFormData({ ...formData, area_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma área" />
                  </SelectTrigger>
                  <SelectContent>
                    {areas?.map(area => (
                      <SelectItem key={area.id} value={area.id}>
                        {area.nome} ({area.tamanho_hectares} ha)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="variedade">Variedade</Label>
                <Input 
                  id="variedade" 
                  value={formData.variedade} 
                  onChange={(e) => setFormData({ ...formData, variedade: e.target.value })} 
                  placeholder="Ex: Tomate Cereja, Alface Crespa..." 
                  required 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="data_plantio">Data do Plantio</Label>
                  <Input 
                    id="data_plantio" 
                    type="date" 
                    value={formData.data_plantio} 
                    onChange={(e) => setFormData({ ...formData, data_plantio: e.target.value })} 
                    required 
                  />
                </div>
                
                <div>
                  <Label htmlFor="data_previsao_colheita">Previsão de Colheita</Label>
                  <Input 
                    id="data_previsao_colheita" 
                    type="date" 
                    value={formData.data_previsao_colheita} 
                    onChange={(e) => setFormData({ ...formData, data_previsao_colheita: e.target.value })} 
                    required 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantidade_mudas">Quantidade de Mudas</Label>
                  <Input 
                    id="quantidade_mudas" 
                    type="number" 
                    value={formData.quantidade_mudas} 
                    onChange={(e) => setFormData({ ...formData, quantidade_mudas: e.target.value })} 
                    placeholder="Ex: 100" 
                  />
                </div>
                
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planejado">Planejado</SelectItem>
                      <SelectItem value="plantado">Plantado</SelectItem>
                      <SelectItem value="crescendo">Crescendo</SelectItem>
                      <SelectItem value="pronto_colheita">Pronto para Colheita</SelectItem>
                      <SelectItem value="colhido">Colhido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea 
                  id="observacoes" 
                  value={formData.observacoes} 
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })} 
                  placeholder="Informações sobre o plantio..." 
                />
              </div>
              
              <DialogFooter>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {editingPlantio ? 'Atualizar' : 'Registrar'} Plantio
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {plantios?.map(plantio => (
          <Card key={plantio.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Sprout className="h-4 w-4 mr-2 text-green-600" />
                  {plantio.variedade}
                </span>
                <div className="flex items-center space-x-1">
                  <Select 
                    value={plantio.status} 
                    onValueChange={(value) => handleStatusChange(plantio.id, value)}
                  >
                    <SelectTrigger className="w-auto h-6 px-2 text-xs border-0 focus:ring-0">
                      <SelectValue>
                        <Badge className={statusColors[plantio.status as keyof typeof statusColors]}>
                          {statusLabels[plantio.status as keyof typeof statusLabels]}
                        </Badge>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planejado">Planejado</SelectItem>
                      <SelectItem value="plantado">Plantado</SelectItem>
                      <SelectItem value="crescendo">Crescendo</SelectItem>
                      <SelectItem value="pronto_colheita">Pronto para Colheita</SelectItem>
                      <SelectItem value="colhido">Colhido</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleEdit(plantio)}
                    className="h-8 w-8 p-0"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDelete(plantio.id)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
              <CardDescription className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {plantio.areas?.nome} ({plantio.areas?.tamanho_hectares} ha)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <span>Plantado: {formatDate(plantio.data_plantio)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Previsão de colheita:</span>
                  <span className="font-medium">{formatDate(plantio.data_previsao_colheita)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Dias para colheita:</span>
                  <span className={`font-medium ${getDaysUntilHarvest(plantio.data_previsao_colheita) <= 7 ? 'text-green-600' : 'text-gray-600'}`}>
                    {getDaysUntilHarvest(plantio.data_previsao_colheita)} dias
                  </span>
                </div>
                
                {plantio.quantidade_mudas && (
                  <div className="flex justify-between">
                    <span>Mudas:</span>
                    <span className="font-medium">{plantio.quantidade_mudas}</span>
                  </div>
                )}
                
                {plantio.observacoes && (
                  <p><strong>Obs:</strong> {plantio.observacoes}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!plantios || plantios.length === 0) && (
        <Card>
          <CardContent className="text-center py-8">
            <Sprout className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum plantio registrado
            </h3>
            <p className="text-gray-600 mb-4">
              Comece registrando seu primeiro plantio
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Registrar Primeiro Plantio
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PlantiosPage;
