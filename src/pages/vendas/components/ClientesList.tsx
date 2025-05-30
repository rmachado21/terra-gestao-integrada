import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, MapPin, Phone, Mail, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import ClienteForm from './ClienteForm';
interface Cliente {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  endereco: string | null;
  cidade: string | null;
  ativo: boolean;
  observacoes: string | null;
  created_at: string;
}
const ClientesList = () => {
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);

  // Buscar clientes
  const {
    data: clientes,
    isLoading
  } = useQuery({
    queryKey: ['clientes', user?.id, searchTerm],
    queryFn: async () => {
      if (!user?.id) return [];
      let query = supabase.from('clientes').select('*').eq('user_id', user.id).order('created_at', {
        ascending: false
      });
      if (searchTerm) {
        query = query.or(`nome.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,cidade.ilike.%${searchTerm}%`);
      }
      const {
        data,
        error
      } = await query;
      if (error) throw error;
      return data as Cliente[];
    },
    enabled: !!user?.id
  });

  // Deletar cliente
  const deleteClienteMutation = useMutation({
    mutationFn: async (clienteId: string) => {
      const {
        error
      } = await supabase.from('clientes').delete().eq('id', clienteId).eq('user_id', user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Cliente excluído',
        description: 'Cliente excluído com sucesso.'
      });
      queryClient.invalidateQueries({
        queryKey: ['clientes']
      });
    },
    onError: error => {
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir o cliente.',
        variant: 'destructive'
      });
    }
  });
  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setShowForm(true);
  };
  const handleDelete = (clienteId: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      deleteClienteMutation.mutate(clienteId);
    }
  };
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCliente(null);
  };
  if (isLoading) {
    return <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-200 rounded"></div>)}
          </div>
        </CardContent>
      </Card>;
  }
  return <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Clientes</span>
            </CardTitle>
            <Button onClick={() => setShowForm(true)} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
          </div>
          
          <div className="flex items-center space-x-2 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input placeholder="Buscar clientes..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="space-y-4">
            {clientes?.length === 0 ? <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum cliente encontrado</p>
                <p className="text-sm">Comece adicionando um novo cliente</p>
              </div> : clientes?.map(cliente => <div key={cliente.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-lg">{cliente.nome}</h3>
                        <Badge variant={cliente.ativo ? 'default' : 'secondary'}>
                          {cliente.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2 text-sm text-gray-600">
                        {cliente.email && <div className="flex items-center space-x-1">
                            <Mail className="h-4 w-4" />
                            <span>{cliente.email}</span>
                          </div>}
                        {cliente.telefone && <div className="flex items-center space-x-1">
                            <Phone className="h-4 w-4" />
                            <span>{cliente.telefone}</span>
                          </div>}
                        {cliente.cidade && <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{cliente.cidade}</span>
                          </div>}
                      </div>
                      
                      {cliente.endereco && <p className="text-sm text-gray-600 mt-1">{cliente.endereco}</p>}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(cliente)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(cliente.id)} className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>)}
          </div>
        </CardContent>
      </Card>

      {showForm && <ClienteForm cliente={editingCliente} onClose={handleCloseForm} />}
    </div>;
};
export default ClientesList;