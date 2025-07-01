
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
import { Plus, Wheat, Calendar, Scale, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useEffectiveUser } from '@/hooks/useEffectiveUser';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Colheita {
  id: string;
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

interface PlantioDisponivel {
  id: string;
  variedade: string;
  area_nome: string;
  data_plantio: string;
  status: string;
}

const qualidadeColors = {
  'Excelente': 'bg-green-100 text-green-800',
  'Boa': 'bg-blue-100 text-blue-800',
  'Regular': 'bg-yellow-100 text-yellow-800',
  'Baixa': 'bg-red-100 text-red-800'
} as const;

const destinoColors = {
  'venda': 'bg-emerald-100 text-emerald-800',
  'processamento': 'bg-purple-100 text-purple-800',
  'consumo': 'bg-orange-100 text-orange-800',
  'descarte': 'bg-gray-100 text-gray-800'
} as const;

const ColheitasPage = () => {
  const { effectiveUserId, isImpersonating } = useEffectiveUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingColheita, setEditingColheita] = useState<Colheita | null>(null);
  const [formData, setFormData] = useState({
    plantio_id: '',
    data_colheita: '',
    quantidade_kg: '',
    qualidade: 'Boa',
    destino: 'venda',
    observacoes: ''
  });

  const { data: colheitas, isLoading } = useQuery({
    queryKey: ['colheitas', effectiveUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('colheitas')
        .select(`
          *,
          plantios(
            variedade,
            areas(nome)
          )
        `)
        .eq('user_id', effectiveUserId)
        .order('data_colheita', { ascending: false });

      if (error) {
        console.log('Erro ao buscar colheitas:', error);
        return [];
      }
      return data as Colheita[];
    },
    enabled: !!effectiveUserId
  });

  const { data: plantiosDisponiveis } = useQuery({
    queryKey: ['plantios-colheita', effectiveUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plantios')
        .select(`
          id,
          variedade,
          data_plantio,
          status,
          areas(nome)
        `)
        .eq('user_id', effectiveUserId)
        .in('status', ['plantado', 'crescimento', 'maduro'])
        .order('data_plantio', { ascending: false });

      if (error) throw error;
      return data.map(p => ({
        id: p.id,
        variedade: p.variedade,
        area_nome: p.areas?.nome || 'Área não definida',
        data_plantio: p.data_plantio,
        status: p.status
      })) as PlantioDisponivel[];
    },
    enabled: !!effectiveUserId
  });

  const createColheitaMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('colheitas')
        .insert([{
          ...data,
          user_id: effectiveUserId
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colheitas'] });
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

  const updateColheitaMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from('colheitas')
        .update(data)
        .eq('id', id)
        .eq('user_id', effectiveUserId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colheitas'] });
      toast({
        title: 'Colheita atualizada com sucesso!'
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: 'Erro ao atualizar colheita',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  });

  const deleteColheitaMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('colheitas')
        .delete()
        .eq('id', id)
        .eq('user_id', effectiveUserId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colheitas'] });
      toast({
        title: 'Colheita removida com sucesso!'
      });
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: 'Erro ao remover colheita',
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
    setEditingColheita(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      quantidade_kg: parseFloat(formData.quantidade_kg)
    };
    
    if (editingColheita) {
      updateColheitaMutation.mutate({ id: editingColheita.id, data });
    } else {
      createColheitaMutation.mutate(data);
    }
  };

  const handleEdit = (colheita: Colheita) => {
    setEditingColheita(colheita);
    setFormData({
      plantio_id: colheita.plantio_id || '',
      data_colheita: colheita.data_colheita,
      quantidade_kg: colheita.quantidade_kg.toString(),
      qualidade: colheita.qualidade || 'Boa',
      destino: colheita.destino || 'venda',
      observacoes: colheita.observacoes || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja remover esta colheita?')) {
      deleteColheitaMutation.mutate(id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getTotalColhido = () => {
    return colheitas?.reduce((total, colheita) => total + colheita.quantidade_kg, 0) || 0;
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
          <Wheat className="h-8 w-8 text-amber-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Controle de Colheitas</h1>
            <p className="text-gray-600">
              Registre e acompanhe suas colheitas
              {isImpersonating && <span className="text-orange-600 ml-2">(Visualizando como usuário)</span>}
            </p>
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
              <DialogTitle>
                {editingColheita ? 'Editar Colheita' : 'Registrar Colheita'}
              </DialogTitle>
              <DialogDescription>
                {editingColheita ? 'Atualize os dados da colheita' : 'Registre uma nova colheita'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="plantio_id">Plantio</Label>
                <Select value={formData.plantio_id} onValueChange={(value) => setFormData({ ...formData, plantio_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um plantio" />
                  </SelectTrigger>
                  <SelectContent>
                    {plantiosDisponiveis?.map(plantio => (
                      <SelectItem key={plantio.id} value={plantio.id}>
                        {plantio.variedade} - {plantio.area_nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="data_colheita">Data da Colheita</Label>
                  <Input 
                    id="data_colheita" 
                    type="date" 
                    value={formData.data_colheita} 
                    onChange={(e) => setFormData({ ...formData, data_colheita: e.target.value })} 
                    required 
                  />
                </div>
                
                <div>
                  <Label htmlFor="quantidade_kg">Quantidade (kg)</Label>
                  <Input 
                    id="quantidade_kg" 
                    type="number" 
                    step="0.01" 
                    value={formData.quantidade_kg} 
                    onChange={(e) => setFormData({ ...formData, quantidade_kg: e.target.value })} 
                    placeholder="Ex: 25.5" 
                    required 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="qualidade">Qualidade</Label>
                  <Select value={formData.qualidade} onValueChange={(value) => setFormData({ ...formData, qualidade: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Excelente">Excelente</SelectItem>
                      <SelectItem value="Boa">Boa</SelectItem>
                      <SelectItem value="Regular">Regular</SelectItem>
                      <SelectItem value="Baixa">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="destino">Destino</Label>
                  <Select value={formData.destino} onValueChange={(value) => setFormData({ ...formData, destino: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="venda">Venda</SelectItem>
                      <SelectItem value="processamento">Processamento</SelectItem>
                      <SelectItem value="consumo">Consumo Próprio</SelectItem>
                      <SelectItem value="descarte">Descarte</SelectItem>
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
                  placeholder="Informações sobre a colheita..." 
                />
              </div>
              
              <DialogFooter>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {editingColheita ? 'Atualizar' : 'Registrar'} Colheita
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas resumidas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Colhido</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalColhido().toFixed(1)} kg</div>
            <p className="text-xs text-muted-foreground">
              Em {colheitas?.length || 0} colheitas registradas
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Colheita</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {colheitas?.[0] ? formatDate(colheitas[0].data_colheita) : '-'}
            </div>
            <p className="text-xs text-muted-foreground">
              {colheitas?.[0] ? `${colheitas[0].quantidade_kg} kg` : 'Nenhuma colheita'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média por Colheita</CardTitle>
            <Wheat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {colheitas?.length ? (getTotalColhido() / colheitas.length).toFixed(1) : '0'} kg
            </div>
            <p className="text-xs text-muted-foreground">
              Produtividade média
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {colheitas?.map(colheita => (
          <Card key={colheita.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Wheat className="h-4 w-4 mr-2 text-green-600" />
                  {colheita.plantios?.variedade}
                </span>
                <div className="flex space-x-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleEdit(colheita)}
                    className="h-8 w-8 p-0"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDelete(colheita.id)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
              <CardDescription className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDate(colheita.data_colheita)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Quantidade:</span>
                  <span className="font-medium">{colheita.quantidade_kg} kg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Qualidade:</span>
                  <Badge className={qualidadeColors[colheita.qualidade as keyof typeof qualidadeColors]}>
                    {colheita.qualidade}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Destino:</span>
                  <Badge className={destinoColors[colheita.destino as keyof typeof destinoColors]}>
                    {colheita.destino === 'venda' ? 'Venda' : 
                     colheita.destino === 'processamento' ? 'Processamento' :
                     colheita.destino === 'consumo' ? 'Consumo' : 'Descarte'}
                  </Badge>
                </div>
                {colheita.plantios?.areas?.nome && (
                  <p><strong>Área:</strong> {colheita.plantios.areas.nome}</p>
                )}
                {colheita.observacoes && (
                  <p><strong>Obs:</strong> {colheita.observacoes}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!colheitas || colheitas.length === 0) && (
        <Card>
          <CardContent className="text-center py-8">
            <Wheat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
        </Card>
      )}
    </div>
  );
};

export default ColheitasPage;
