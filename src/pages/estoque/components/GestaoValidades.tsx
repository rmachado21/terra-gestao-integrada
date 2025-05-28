
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProdutoValidade {
  id: string;
  produto_nome: string;
  unidade_medida: string;
  quantidade: number;
  data_validade: string;
  lote: string | null;
  dias_para_vencer: number;
  status: 'vencido' | 'vencendo' | 'normal';
}

const GestaoValidades = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  // Buscar produtos com validade
  const { data: produtos, isLoading } = useQuery({
    queryKey: ['produtos-validade', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('estoque')
        .select(`
          id,
          quantidade,
          data_validade,
          lote,
          produtos (nome, unidade_medida)
        `)
        .eq('user_id', user.id)
        .not('data_validade', 'is', null)
        .order('data_validade', { ascending: true });

      if (error) throw error;

      const hoje = new Date();
      
      return data.map(item => {
        const dataVencimento = new Date(item.data_validade!);
        const diasParaVencer = differenceInDays(dataVencimento, hoje);
        
        let status: 'vencido' | 'vencendo' | 'normal' = 'normal';
        if (diasParaVencer < 0) {
          status = 'vencido';
        } else if (diasParaVencer <= 30) {
          status = 'vencendo';
        }

        return {
          id: item.id,
          produto_nome: item.produtos?.nome || 'Produto',
          unidade_medida: item.produtos?.unidade_medida || '',
          quantidade: item.quantidade,
          data_validade: item.data_validade!,
          lote: item.lote,
          dias_para_vencer: diasParaVencer,
          status
        } as ProdutoValidade;
      });
    },
    enabled: !!user?.id
  });

  // Filtrar produtos
  const produtosFiltrados = produtos?.filter(produto => {
    const matchesSearch = produto.produto_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         produto.lote?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || produto.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Agrupar por status para estatísticas
  const stats = produtos?.reduce((acc, produto) => {
    acc[produto.status] = (acc[produto.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'vencido':
        return AlertTriangle;
      case 'vencendo':
        return Clock;
      case 'normal':
        return CheckCircle;
      default:
        return Calendar;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'vencido':
        return 'text-red-600';
      case 'vencendo':
        return 'text-yellow-600';
      case 'normal':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'vencido':
        return { label: 'Vencido', variant: 'destructive' as const };
      case 'vencendo':
        return { label: 'Vencendo', variant: 'secondary' as const };
      case 'normal':
        return { label: 'Normal', variant: 'default' as const };
      default:
        return { label: 'Desconhecido', variant: 'outline' as const };
    }
  };

  const formatDiasParaVencer = (dias: number) => {
    if (dias < 0) {
      return `Venceu há ${Math.abs(dias)} dias`;
    } else if (dias === 0) {
      return 'Vence hoje';
    } else if (dias === 1) {
      return 'Vence amanhã';
    } else {
      return `Vence em ${dias} dias`;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando produtos...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas de validade */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total com Validade</p>
                <p className="text-2xl font-bold">{produtos?.length || 0}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Produtos Vencidos</p>
                <p className="text-2xl font-bold text-red-600">{stats.vencido || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vencendo (30 dias)</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.vencendo || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Em Bom Estado</p>
                <p className="text-2xl font-bold text-green-600">{stats.normal || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de produtos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Controle de Validades</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {/* Filtros */}
          <div className="flex space-x-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Buscar por produto ou lote..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="vencido">Vencidos</SelectItem>
                  <SelectItem value="vencendo">Vencendo</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabela */}
          {produtosFiltrados && produtosFiltrados.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Lote</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Data de Validade</TableHead>
                  <TableHead>Dias para Vencer</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {produtosFiltrados.map((produto) => {
                  const StatusIcon = getStatusIcon(produto.status);
                  const statusColor = getStatusColor(produto.status);
                  const badge = getStatusBadge(produto.status);
                  
                  return (
                    <TableRow key={produto.id}>
                      <TableCell className="font-medium">
                        {produto.produto_nome}
                        <div className="text-sm text-gray-500">
                          {produto.unidade_medida}
                        </div>
                      </TableCell>
                      <TableCell>{produto.lote || '-'}</TableCell>
                      <TableCell>
                        {produto.quantidade} {produto.unidade_medida}
                      </TableCell>
                      <TableCell>
                        {format(new Date(produto.data_validade), 'dd/MM/yyyy', { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <div className={`flex items-center space-x-2 ${statusColor}`}>
                          <StatusIcon className="h-4 w-4" />
                          <span>{formatDiasParaVencer(produto.dias_para_vencer)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={badge.variant}>
                          {badge.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {produtos?.length === 0 
                ? 'Nenhum produto com data de validade cadastrada.'
                : 'Nenhum produto encontrado com os filtros aplicados.'
              }
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GestaoValidades;
