
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, AlertTriangle, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useEffectiveUser } from '@/hooks/useEffectiveUser';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ItemValidade {
  id: string;
  quantidade: number;
  data_validade: string;
  lote?: string;
  produtos?: {
    nome: string;
    unidade_medida: string;
  };
  dias_para_vencer: number;
  status: 'vencido' | 'vencendo' | 'normal';
}

const GestaoValidades = () => {
  const { effectiveUserId } = useEffectiveUser();

  const { data: itensValidade, isLoading } = useQuery({
    queryKey: ['validades', effectiveUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('estoque')
        .select(`
          id,
          quantidade,
          data_validade,
          lote,
          produtos (nome, unidade_medida)
        `)
        .eq('user_id', effectiveUserId)
        .not('data_validade', 'is', null)
        .order('data_validade', { ascending: true });

      if (error) throw error;

      const hoje = new Date();
      const itensProcessados = data.map(item => {
        const dataValidade = new Date(item.data_validade!);
        const diasParaVencer = differenceInDays(dataValidade, hoje);
        
        let status: 'vencido' | 'vencendo' | 'normal';
        if (diasParaVencer < 0) {
          status = 'vencido';
        } else if (diasParaVencer <= 30) {
          status = 'vencendo';
        } else {
          status = 'normal';
        }

        return {
          ...item,
          dias_para_vencer: diasParaVencer,
          status
        } as ItemValidade;
      });

      // Ordenar por prioridade: vencidos primeiro, depois vencendo, depois normais
      return itensProcessados.sort((a, b) => {
        if (a.status === 'vencido' && b.status !== 'vencido') return -1;
        if (b.status === 'vencido' && a.status !== 'vencido') return 1;
        if (a.status === 'vencendo' && b.status === 'normal') return -1;
        if (b.status === 'vencendo' && a.status === 'normal') return 1;
        return a.dias_para_vencer - b.dias_para_vencer;
      });
    },
    enabled: !!effectiveUserId
  });

  const getStatusBadge = (status: string, diasParaVencer: number) => {
    switch (status) {
      case 'vencido':
        return {
          variant: 'destructive' as const,
          label: `Vencido há ${Math.abs(diasParaVencer)} dias`
        };
      case 'vencendo':
        return {
          variant: 'secondary' as const,
          label: diasParaVencer === 0 ? 'Vence hoje' : `Vence em ${diasParaVencer} dias`
        };
      default:
        return {
          variant: 'outline' as const,
          label: `Vence em ${diasParaVencer} dias`
        };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'vencido':
        return 'border-red-200 bg-red-50';
      case 'vencendo':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando validades...</div>
        </CardContent>
      </Card>
    );
  }

  const itensVencidos = itensValidade?.filter(item => item.status === 'vencido') || [];
  const itensVencendo = itensValidade?.filter(item => item.status === 'vencendo') || [];
  const itensNormais = itensValidade?.filter(item => item.status === 'normal') || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Produtos Vencidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{itensVencidos.length}</div>
            <p className="text-xs text-red-600">Requer ação imediata</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Vencendo (30 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{itensVencendo.length}</div>
            <p className="text-xs text-yellow-600">Atenção necessária</p>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Dentro da Validade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{itensNormais.length}</div>
            <p className="text-xs text-green-600">Situação normal</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span>Controle de Validades</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {itensValidade && itensValidade.length > 0 ? (
            <div className="space-y-4">
              {itensValidade.map((item) => {
                const statusBadge = getStatusBadge(item.status, item.dias_para_vencer);
                const statusColor = getStatusColor(item.status);
                
                return (
                  <div key={item.id} className={`p-4 rounded-lg border ${statusColor}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Package className="h-5 w-5 text-gray-500" />
                        <span className="font-medium">{item.produtos?.nome}</span>
                        {item.lote && (
                          <span className="text-sm text-gray-500">- Lote: {item.lote}</span>
                        )}
                      </div>
                      <Badge variant={statusBadge.variant}>
                        {statusBadge.label}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <strong>Quantidade:</strong> {item.quantidade} {item.produtos?.unidade_medida}
                      </div>
                      <div>
                        <strong>Data de Validade:</strong> {format(new Date(item.data_validade), 'dd/MM/yyyy', { locale: ptBR })}
                      </div>
                      <div className={`font-medium ${
                        item.status === 'vencido' ? 'text-red-600' : 
                        item.status === 'vencendo' ? 'text-yellow-600' : 
                        'text-green-600'
                      }`}>
                        {item.status === 'vencido' ? 
                          `Vencido há ${Math.abs(item.dias_para_vencer)} dias` :
                          item.dias_para_vencer === 0 ? 'Vence hoje' :
                          `Vence em ${item.dias_para_vencer} dias`
                        }
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium mb-2">Nenhum produto com data de validade</p>
              <p className="text-gray-400 text-sm">
                Produtos com datas de validade aparecerão aqui para controle
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GestaoValidades;
