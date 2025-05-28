
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Package, Calendar, TrendingDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AlertaEstoque {
  id: string;
  tipo: 'estoque_baixo' | 'produto_vencendo' | 'produto_vencido';
  produto_nome: string;
  quantidade: number;
  quantidade_minima: number;
  data_validade: string | null;
  lote: string | null;
  unidade_medida: string;
  dias_para_vencer?: number;
}

const AlertasEstoque = () => {
  const { user } = useAuth();

  // Buscar alertas de estoque
  const { data: alertas, isLoading } = useQuery({
    queryKey: ['alertas-estoque', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('estoque')
        .select(`
          id,
          quantidade,
          quantidade_minima,
          data_validade,
          lote,
          produtos (nome, unidade_medida)
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const alertas: AlertaEstoque[] = [];
      const hoje = new Date();

      data.forEach(item => {
        // Verificar estoque baixo
        if (item.quantidade_minima > 0 && item.quantidade <= item.quantidade_minima) {
          alertas.push({
            id: `estoque_baixo_${item.id}`,
            tipo: 'estoque_baixo',
            produto_nome: item.produtos?.nome || 'Produto',
            quantidade: item.quantidade,
            quantidade_minima: item.quantidade_minima,
            data_validade: item.data_validade,
            lote: item.lote,
            unidade_medida: item.produtos?.unidade_medida || ''
          });
        }

        // Verificar produtos vencendo ou vencidos
        if (item.data_validade) {
          const dataVencimento = new Date(item.data_validade);
          const diasParaVencer = Math.ceil((dataVencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diasParaVencer < 0) {
            // Produto vencido
            alertas.push({
              id: `vencido_${item.id}`,
              tipo: 'produto_vencido',
              produto_nome: item.produtos?.nome || 'Produto',
              quantidade: item.quantidade,
              quantidade_minima: item.quantidade_minima,
              data_validade: item.data_validade,
              lote: item.lote,
              unidade_medida: item.produtos?.unidade_medida || '',
              dias_para_vencer: diasParaVencer
            });
          } else if (diasParaVencer <= 30) {
            // Produto vencendo em 30 dias
            alertas.push({
              id: `vencendo_${item.id}`,
              tipo: 'produto_vencendo',
              produto_nome: item.produtos?.nome || 'Produto',
              quantidade: item.quantidade,
              quantidade_minima: item.quantidade_minima,
              data_validade: item.data_validade,
              lote: item.lote,
              unidade_medida: item.produtos?.unidade_medida || '',
              dias_para_vencer: diasParaVencer
            });
          }
        }
      });

      return alertas.sort((a, b) => {
        // Ordenar por prioridade: vencidos, estoque baixo, vencendo
        const prioridade = { produto_vencido: 3, estoque_baixo: 2, produto_vencendo: 1 };
        return prioridade[b.tipo] - prioridade[a.tipo];
      });
    },
    enabled: !!user?.id
  });

  const getAlertIcon = (tipo: string) => {
    switch (tipo) {
      case 'estoque_baixo':
        return TrendingDown;
      case 'produto_vencendo':
        return Calendar;
      case 'produto_vencido':
        return AlertTriangle;
      default:
        return Package;
    }
  };

  const getAlertColor = (tipo: string) => {
    switch (tipo) {
      case 'estoque_baixo':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'produto_vencendo':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'produto_vencido':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getAlertBadge = (tipo: string) => {
    switch (tipo) {
      case 'estoque_baixo':
        return { label: 'Estoque Baixo', variant: 'secondary' as const };
      case 'produto_vencendo':
        return { label: 'Vencendo', variant: 'secondary' as const };
      case 'produto_vencido':
        return { label: 'Vencido', variant: 'destructive' as const };
      default:
        return { label: 'Alerta', variant: 'outline' as const };
    }
  };

  const getAlertMessage = (alerta: AlertaEstoque) => {
    switch (alerta.tipo) {
      case 'estoque_baixo':
        return `Quantidade atual: ${alerta.quantidade} ${alerta.unidade_medida} (mínimo: ${alerta.quantidade_minima})`;
      case 'produto_vencendo':
        return `Vence em ${alerta.dias_para_vencer} dias - ${format(new Date(alerta.data_validade!), 'dd/MM/yyyy')}`;
      case 'produto_vencido':
        return `Venceu há ${Math.abs(alerta.dias_para_vencer!)} dias - ${format(new Date(alerta.data_validade!), 'dd/MM/yyyy')}`;
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando alertas...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          <span>Alertas Automáticos do Estoque</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {alertas && alertas.length > 0 ? (
          <div className="space-y-4">
            {alertas.map((alerta) => {
              const Icon = getAlertIcon(alerta.tipo);
              const colorClass = getAlertColor(alerta.tipo);
              const badge = getAlertBadge(alerta.tipo);
              
              return (
                <div key={alerta.id} className={`p-4 rounded-lg border ${colorClass}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{alerta.produto_nome}</span>
                      {alerta.lote && (
                        <span className="text-sm text-gray-500">- Lote: {alerta.lote}</span>
                      )}
                    </div>
                    <Badge variant={badge.variant} className="text-xs">
                      {badge.label}
                    </Badge>
                  </div>
                  
                  <p className="text-sm opacity-90 mb-2">
                    {getAlertMessage(alerta)}
                  </p>
                  
                  <div className="text-xs opacity-70">
                    Quantidade em estoque: {alerta.quantidade} {alerta.unidade_medida}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium mb-2">Nenhum alerta ativo</p>
            <p className="text-gray-400 text-sm">
              Seu estoque está em boas condições! Alertas automáticos aparecerão aqui quando:
            </p>
            <ul className="text-gray-400 text-sm mt-2 space-y-1">
              <li>• Produtos atingirem a quantidade mínima</li>
              <li>• Produtos estiverem próximos do vencimento (30 dias)</li>
              <li>• Produtos estiverem vencidos</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertasEstoque;
