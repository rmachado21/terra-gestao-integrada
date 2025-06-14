
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Cliente, ClienteFormData } from '../types/cliente';
import { getCpfCnpjMask } from '@/lib/maskUtils';

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
    endereco: {
      cep: cliente?.cep || '',
      logradouro: cliente?.endereco || '',
      numero: '',
      complemento: '',
      bairro: cliente?.bairro || '',
      cidade: cliente?.cidade || '',
      estado: cliente?.estado || '',
    },
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
        nome: data.nome,
        email: data.email || null,
        telefone: data.telefone || null,
        cpf_cnpj: data.cpf_cnpj || null,
        cep: data.endereco.cep || null,
        endereco: data.endereco.logradouro || null,
        bairro: data.endereco.bairro || null,
        cidade: data.endereco.cidade || null,
        estado: data.endereco.estado || null,
        observacoes: data.observacoes || null,
        ativo: data.ativo,
        user_id: user.id
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

  const handleChange = (field: keyof ClienteFormData | string, value: string | boolean) => {
    if (field.includes('.')) {
      // Handle nested fields like 'endereco.cep'
      const [parent, child] = field.split('.');
      if (parent === 'endereco') {
        setFormData(prev => ({
          ...prev,
          endereco: {
            ...prev.endereco,
            [child]: value
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }

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
