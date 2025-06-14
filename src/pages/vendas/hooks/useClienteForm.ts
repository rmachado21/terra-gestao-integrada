
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Cliente, ClienteFormData } from '../types/cliente';
import { getCpfCnpjMask } from '../utils/maskUtils';

interface UseClienteFormProps {
  cliente?: Cliente | null;
  onClose: () => void;
}

export const useClienteForm = ({ cliente, onClose }: UseClienteFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<ClienteFormData>({
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

  // Estado para controlar a máscara dinâmica do CPF/CNPJ
  const [cpfCnpjMask, setCpfCnpjMask] = useState(() => 
    getCpfCnpjMask(cliente?.cpf_cnpj || '')
  );

  const mutation = useMutation({
    mutationFn: async (data: ClienteFormData) => {
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

  const handleChange = (field: keyof ClienteFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Atualizar máscara dinamicamente quando o campo CPF/CNPJ for alterado
    if (field === 'cpf_cnpj' && typeof value === 'string') {
      const newMask = getCpfCnpjMask(value);
      setCpfCnpjMask(newMask);
    }
  };

  return {
    formData,
    mutation,
    handleSubmit,
    handleChange,
    cpfCnpjMask
  };
};
