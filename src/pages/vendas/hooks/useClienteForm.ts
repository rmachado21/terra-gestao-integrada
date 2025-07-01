
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffectiveUser } from '@/hooks/useEffectiveUser';
import { useToast } from '@/hooks/use-toast';
import { Cliente, ClienteFormData } from '../types/cliente';

interface UseClienteFormProps {
  cliente?: Cliente | null;
  onClose: () => void;
}

export const useClienteForm = ({ cliente, onClose }: UseClienteFormProps) => {
  const { effectiveUserId } = useEffectiveUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Determinar tipo inicial baseado no valor existente do CPF/CNPJ
  const getInitialDocumentType = (cpfCnpj: string | null) => {
    if (!cpfCnpj) return 'cpf';
    const cleanValue = cpfCnpj.replace(/\D/g, '');
    return cleanValue.length > 11 ? 'cnpj' : 'cpf';
  };
  
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
    ativo: cliente?.ativo ?? true,
    documentType: getInitialDocumentType(cliente?.cpf_cnpj || null)
  });

  // Função para obter a máscara baseada no tipo selecionado
  const getDocumentMask = (documentType: 'cpf' | 'cnpj') => {
    return documentType === 'cpf' ? '999.999.999-99' : '99.999.999/9999-99';
  };

  const mutation = useMutation({
    mutationFn: async (data: ClienteFormData) => {
      if (!effectiveUserId) throw new Error('Usuário não autenticado');

      const clienteData = {
        nome: data.nome,
        email: data.email || null,
        telefone: data.telefone || null,
        cpf_cnpj: data.cpf_cnpj || null,
        cep: data.cep || null,
        endereco: data.endereco || null,
        bairro: data.bairro || null,
        cidade: data.cidade || null,
        estado: data.estado || null,
        observacoes: data.observacoes || null,
        ativo: data.ativo,
        user_id: effectiveUserId
      };

      if (cliente) {
        const { error } = await supabase
          .from('clientes')
          .update(clienteData)
          .eq('id', cliente.id)
          .eq('user_id', effectiveUserId);
        
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

    // Limpar o campo CPF/CNPJ quando trocar o tipo de documento
    if (field === 'documentType') {
      setFormData(prev => ({
        ...prev,
        documentType: value as 'cpf' | 'cnpj',
        cpf_cnpj: ''
      }));
    }
  };

  return {
    formData,
    mutation,
    handleSubmit,
    handleChange,
    getDocumentMask
  };
};
