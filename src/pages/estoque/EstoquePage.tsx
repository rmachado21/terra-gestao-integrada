
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, AlertTriangle, TrendingUp, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import ProdutosList from './components/ProdutosList';
import EstoqueMovimentacoes from './components/EstoqueMovimentacoes';
import AlertasEstoque from './components/AlertasEstoque';
import GestaoValidades from './components/GestaoValidades';
import EstoqueStats from './components/EstoqueStats';

const EstoquePage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('produtos');

  // Buscar estatísticas gerais do estoque
  const { data: statsData } = useQuery({
    queryKey: ['estoque-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const [produtosRes, estoqueRes] = await Promise.all([
        supabase
          .from('produtos')
          .select('id')
          .eq('user_id', user.id)
          .eq('ativo', true),
        supabase
          .from('estoque')
          .select('quantidade, quantidade_minima, data_validade')
          .eq('user_id', user.id)
      ]);

      const totalProdutos = produtosRes.data?.length || 0;
      const itensEstoque = estoqueRes.data?.length || 0;
      const estoqueTotal = estoqueRes.data?.reduce((sum, item) => sum + item.quantidade, 0) || 0;
      
      // Calcular alertas
      const estoqueBaixo = estoqueRes.data?.filter(item => 
        item.quantidade_minima && item.quantidade <= item.quantidade_minima
      ).length || 0;
      
      const produtosVencendo = estoqueRes.data?.filter(item => {
        if (!item.data_validade) return false;
        const hoje = new Date();
        const vencimento = new Date(item.data_validade);
        const diasParaVencer = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
        return diasParaVencer <= 30 && diasParaVencer >= 0;
      }).length || 0;

      return {
        totalProdutos,
        itensEstoque,
        estoqueTotal,
        estoqueBaixo,
        produtosVencendo
      };
    },
    enabled: !!user?.id
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Package className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Estoque</h1>
          <p className="text-gray-600">Controle produtos, movimentações e alertas do seu estoque</p>
        </div>
      </div>

      {/* Estatísticas */}
      <EstoqueStats data={statsData} />

      {/* Tabs principais */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="produtos">
            <Package className="h-4 w-4 mr-2" />
            Produtos
          </TabsTrigger>
          <TabsTrigger value="movimentacoes">
            <TrendingUp className="h-4 w-4 mr-2" />
            Movimentações
          </TabsTrigger>
          <TabsTrigger value="alertas">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Alertas
          </TabsTrigger>
          <TabsTrigger value="validades">
            <Calendar className="h-4 w-4 mr-2" />
            Validades
          </TabsTrigger>
        </TabsList>

        <TabsContent value="produtos">
          <ProdutosList />
        </TabsContent>

        <TabsContent value="movimentacoes">
          <EstoqueMovimentacoes />
        </TabsContent>

        <TabsContent value="alertas">
          <AlertasEstoque />
        </TabsContent>

        <TabsContent value="validades">
          <GestaoValidades />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EstoquePage;
