
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
        <Package className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestão de Estoque</h1>
          <p className="text-sm sm:text-base text-gray-600">Controle produtos, movimentações e alertas do seu estoque</p>
        </div>
      </div>

      {/* Tabs principais - responsivas com scroll */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="w-full overflow-x-auto">
          <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground min-w-max">
            <TabsTrigger value="produtos" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium">
              <Package className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span>Produtos</span>
            </TabsTrigger>
            <TabsTrigger value="movimentacoes" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span>Movimentações</span>
            </TabsTrigger>
            <TabsTrigger value="alertas" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium">
              <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span>Alertas</span>
            </TabsTrigger>
            <TabsTrigger value="validades" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span>Validades</span>
            </TabsTrigger>
          </TabsList>
        </div>

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

      {/* Estatísticas */}
      <EstoqueStats data={statsData} />
    </div>
  );
};

export default EstoquePage;
