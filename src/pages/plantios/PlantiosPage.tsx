
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
import { Plus, Sprout, Calendar, MapPin } from 'lucide-react';
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

interface Plantio {
  id: string;
  area_id: string;
  variedade: string;
  data_plantio: string;
  data_previsao_colheita: string;
  quantidade_mudas?: number;
  status: string;
  observacoes?: string;
  areas?: {
    nome: string;
  };
}

interface Area {
  id: string;
  nome: string;
}

const statusColors = {
  planejado: 'bg-blue-100 text-blue-800',
  plantado: 'bg-green-100 text-green-800',
  crescendo: 'bg-yellow-100 text-yellow-800',
  pronto_colheita: 'bg-orange-100 text-orange-800',
  colhido: 'bg-gray-100 text-gray-800'
};

const statusLabels = {
  planejado: 'Planejado',
  plantado: 'Plantado',
  crescendo: 'Crescendo',
  pronto_colheita: 'Pronto para Colheita',
  colhido: 'Colhido'
};

const PlantiosPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
    queryKey: ['plantios'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plantios')
        .select(`
          *,
          areas(nome)
        `)
        .order('data_plantio', { ascending: false });
      
      if (error) throw error;
      return data as Plantio[];
    },
    enabled: !!user
  });

  const { data: areas } = useQuery({
    queryKey: ['areas-select'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('areas')
        .select('id, nome')
        .eq('ativa', true)
        .order('nome');
      
      if (error) throw error;
      return data as Area[];
    },
    enabled: !!user
  });

  const createPlantioMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('plantios')
        .insert([{ ...data, user_id: user?.id }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plantios'] });
      toast({ title: 'Plantio registrado com sucesso!' });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: 'Erro ao registrar plantio',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('plantios')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plantios'] });
      toast({ title: 'Status atualizado com sucesso!' });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar status',
        description: error.message,
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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      ...formData,
      quantidade_mudas: formData.quantidade_mudas ? parseInt(formData.quantidade_mudas) : null
    };

    createPlantioMutation.mutate(data);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getDaysUntilHarvest = (harvestDate: string) => {
    const today = new Date();
    const harvest = new Date(harvestDate);
    const diffTime = harvest.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Plantios</h1>
          <p className="text-gray-600">Acompanhe todos os seus plantios e cronogramas</p>
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
              <DialogTitle>Novo Plantio</DialogTitle>
              <DialogDescription>
                Registre um novo plantio em suas áreas
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="area_id">Área</Label>
                <Select value={formData.area_id} onValueChange={(value) => setFormData({...formData, area_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma área" />
                  </SelectTrigger>
                  <SelectContent>
                    {areas?.map((area) => (
                      <SelectItem key={area.id} value={area.id}>
                        {area.nome}
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
                  onChange={(e) => setFormData({...formData, variedade: e.target.value})}
                  placeholder="Ex: Alface Crespa, Tomate Cereja..."
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
                    onChange={(e) => setFormData({...formData, data_plantio: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="data_previsao_colheita">Previsão de Colheita</Label>
                  <Input
                    id="data_previsao_colheita"
                    type="date"
                    value={formData.data_previsao_colheita}
                    onChange={(e) => setFormData({...formData, data_previsao_colheita: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="quantidade_mudas">Quantidade de Mudas</Label>
                <Input
                  id="quantidade_mudas"
                  type="number"
                  value={formData.quantidade_mudas}
                  onChange={(e) => setFormData({...formData, quantidade_mudas: e.target.value})}
                  placeholder="Ex: 500"
                />
              </div>
              
              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                  placeholder="Informações adicionais sobre o plantio..."
                />
              </div>
              
              <DialogFooter>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  Registrar Plantio
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {plantios?.map((plantio) => {
          const daysUntilHarvest = getDaysUntilHarvest(plantio.data_previsao_colheita);
          
          return (
            <Card key={plantio.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Sprout className="h-4 w-4 mr-2 text-green-600" />
                    {plantio.variedade}
                  </span>
                  <Badge className={statusColors[plantio.status as keyof typeof statusColors]}>
                    {statusLabels[plantio.status as keyof typeof statusLabels]}
                  </Badge>
                </CardTitle>
                <CardDescription className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {plantio.areas?.nome}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    <span>Plantado em {formatDate(plantio.data_plantio)}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-orange-500" />
                    <span>
                      Colheita prevista: {formatDate(plantio.data_previsao_colheita)}
                      {daysUntilHarvest > 0 && (
                        <span className="text-orange-600 ml-1">
                          ({daysUntilHarvest} dias)
                        </span>
                      )}
                      {daysUntilHarvest <= 0 && daysUntilHarvest > -7 && (
                        <span className="text-red-600 ml-1 font-medium">
                          (Pronto!)
                        </span>
                      )}
                    </span>
                  </div>
                  
                  {plantio.quantidade_mudas && (
                    <p><strong>Mudas:</strong> {plantio.quantidade_mudas}</p>
                  )}
                  
                  {plantio.observacoes && (
                    <p><strong>Obs:</strong> {plantio.observacoes}</p>
                  )}
                </div>
                
                <div className="mt-4">
                  <Select 
                    value={plantio.status} 
                    onValueChange={(value) => updateStatusMutation.mutate({ id: plantio.id, status: value })}
                  >
                    <SelectTrigger className="w-full">
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
              </CardContent>
            </Card>
          );
        })}
      </div>

      {plantios?.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Sprout className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum plantio registrado
            </h3>
            <p className="text-gray-600 mb-4">
              Comece registrando seu primeiro plantio
            </p>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-green-600 hover:bg-green-700"
            >
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
