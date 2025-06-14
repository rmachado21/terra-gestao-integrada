
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { X, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import InputMask from 'react-input-mask';

interface Cliente {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  cpf_cnpj: string | null;
  cep: string | null;
  endereco: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  ativo: boolean;
  observacoes: string | null;
}

interface ClienteFormProps {
  cliente?: Cliente | null;
  onClose: () => void;
}

const ClienteForm = ({ cliente, onClose }: ClienteFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    nome: cliente?.nome || '',
    email: cliente?.email || '',
    telefone: cliente?.telefone || '',
    cpf_cnpj: cliente?.cpf_cnpj || '',
    cep: cliente?.cep || '',
    endereco: cliente?.endereco || '',
    bairro: cliente?.bairro || '',
    cidade: cliente?.cidade || '',
    estado: cliente?.estado || '',
    observacoes: cliente?.observacoes || '',
    ativo: cliente?.ativo ?? true
  });

  // Função para determinar a máscara do CPF/CNPJ dinamicamente
  const getCpfCnpjMask = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length <= 11) {
      return '999.999.999-99'; // CPF
    } else {
      return '99.999.999/9999-99'; // CNPJ
    }
  };

  // Função para determinar a máscara do telefone dinamicamente
  const getTelefoneMask = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length <= 10) {
      return '(99) 9999-9999'; // Telefone fixo
    } else {
      return '(99) 99999-9999'; // Celular
    }
  };

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      const clienteData = {
        ...data,
        user_id: user.id,
        email: data.email || null,
        telefone: data.telefone || null,
        cpf_cnpj: data.cpf_cnpj || null,
        cep: data.cep || null,
        endereco: data.endereco || null,
        bairro: data.bairro || null,
        cidade: data.cidade || null,
        estado: data.estado || null,
        observacoes: data.observacoes || null
      };

      if (cliente) {
        const { error } = await supabase
          .from('clientes')
          .update(clienteData)
          .eq('id', cliente.id)
          .eq('user_id', user.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('clientes')
          .insert([clienteData]);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: cliente ? 'Cliente atualizado' : 'Cliente criado',
        description: `Cliente ${cliente ? 'atualizado' : 'criado'} com sucesso.`,
      });
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      onClose();
    },
    onError: (error) => {
      console.error('Erro ao salvar cliente:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar o cliente.',
        variant: 'destructive',
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      toast({
        title: 'Campo obrigatório',
        description: 'O nome é obrigatório.',
        variant: 'destructive',
      });
      return;
    }

    mutation.mutate(formData);
  };

  const handleChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card className="fixed inset-0 z-50 bg-white shadow-lg">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle>
            {cliente ? 'Editar Cliente' : 'Novo Cliente'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6 overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                placeholder="Nome do cliente"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="email@exemplo.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <InputMask
                mask={getTelefoneMask(formData.telefone)}
                value={formData.telefone}
                onChange={(e) => handleChange('telefone', e.target.value)}
              >
                {(inputProps: any) => (
                  <Input
                    {...inputProps}
                    id="telefone"
                    placeholder="(11) 99999-9999"
                  />
                )}
              </InputMask>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf_cnpj">CPF/CNPJ</Label>
              <InputMask
                mask={getCpfCnpjMask(formData.cpf_cnpj)}
                value={formData.cpf_cnpj}
                onChange={(e) => handleChange('cpf_cnpj', e.target.value)}
              >
                {(inputProps: any) => (
                  <Input
                    {...inputProps}
                    id="cpf_cnpj"
                    placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  />
                )}
              </InputMask>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cep">CEP</Label>
              <InputMask
                mask="99999-999"
                value={formData.cep}
                onChange={(e) => handleChange('cep', e.target.value)}
              >
                {(inputProps: any) => (
                  <Input
                    {...inputProps}
                    id="cep"
                    placeholder="00000-000"
                  />
                )}
              </InputMask>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bairro">Bairro</Label>
              <Input
                id="bairro"
                value={formData.bairro}
                onChange={(e) => handleChange('bairro', e.target.value)}
                placeholder="Bairro"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                value={formData.cidade}
                onChange={(e) => handleChange('cidade', e.target.value)}
                placeholder="Cidade"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Input
                id="estado"
                value={formData.estado}
                onChange={(e) => handleChange('estado', e.target.value)}
                placeholder="Estado"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço</Label>
            <Input
              id="endereco"
              value={formData.endereco}
              onChange={(e) => handleChange('endereco', e.target.value)}
              placeholder="Endereço completo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => handleChange('observacoes', e.target.value)}
              placeholder="Observações sobre o cliente..."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="ativo"
              checked={formData.ativo}
              onCheckedChange={(checked) => handleChange('ativo', checked)}
            />
            <Label htmlFor="ativo">Cliente ativo</Label>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {mutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ClienteForm;
