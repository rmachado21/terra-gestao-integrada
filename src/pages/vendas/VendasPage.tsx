import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, ShoppingCart, Truck, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import ClientesList from './components/ClientesList';
import PedidosList from './components/PedidosList';
import EntregasList from './components/EntregasList';
import RelatoriosVendas from './components/RelatoriosVendas';
import VendasStats from './components/VendasStats';

const VendasPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('clientes');

  // Buscar estatísticas gerais de vendas
  const { data: statsData } = useQuery({
    queryKey: ['vendas-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const [clientesRes, pedidosRes, entregasRes] = await Promise.all([
        supabase
          .from('clientes')
          .select('id')
          .eq('user_id', user.id)
          .eq('ativo', true),
        supabase
          .from('pedidos')
          .select('valor_total, status, data_pedido')
          .eq('user_id', user.id),
        supabase
          .from('pedidos')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'entregue')
      ]);

      const totalClientes = clientesRes.data?.length || 0;
      const totalPedidos = pedidosRes.data?.length || 0;
      const pedidosPendentes = pedidosRes.data?.filter(p => p.status === 'pendente').length || 0;
      const entregasRealizadas = entregasRes.data?.length || 0;
      
      const faturamentoTotal = pedidosRes.data?.reduce((sum, pedido) => {
        return sum + (pedido.valor_total || 0);
      }, 0) || 0;

      // Faturamento do mês atual
      const hoje = new Date();
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const faturamentoMes = pedidosRes.data?.filter(pedido => {
        const dataPedido = new Date(pedido.data_pedido);
        return dataPedido >= inicioMes;
      }).reduce((sum, pedido) => sum + (pedido.valor_total || 0), 0) || 0;

      return {
        totalClientes,
        totalPedidos,
        pedidosPendentes,
        entregasRealizadas,
        faturamentoTotal,
        faturamentoMes
      };
    },
    enabled: !!user?.id
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ShoppingCart className="h-8 w-8 text-purple-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Módulo de Vendas</h1>
          <p className="text-gray-600">Gerencie clientes, pedidos, entregas e relatórios de vendas</p>
        </div>
      </div>

      {/* Estatísticas */}
      <VendasStats data={statsData} />

      {/* Tabs principais */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="clientes" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Clientes</span>
          </TabsTrigger>
          <TabsTrigger value="pedidos" className="flex items-center space-x-2">
            <ShoppingCart className="h-4 w-4" />
            <span>Pedidos</span>
          </TabsTrigger>
          <TabsTrigger value="entregas" className="flex items-center space-x-2">
            <Truck className="h-4 w-4" />
            <span>Entregas</span>
          </TabsTrigger>
          <TabsTrigger value="relatorios" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Relatórios</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clientes">
          <ClientesList />
        </TabsContent>

        <TabsContent value="pedidos">
          <PedidosList />
        </TabsContent>

        <TabsContent value="entregas">
          <EntregasList />
        </TabsContent>

        <TabsContent value="relatorios">
          <RelatoriosVendas />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendasPage;
