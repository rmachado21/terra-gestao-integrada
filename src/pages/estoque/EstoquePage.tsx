
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { LoadingPage, LoadingStats } from '@/components/ui/loading';
import ProdutosList from './components/ProdutosList';
import EstoqueMovimentacoes from './components/EstoqueMovimentacoes';
import AlertasEstoque from './components/AlertasEstoque';
import GestaoValidades from './components/GestaoValidades';
import EstoqueStats from './components/EstoqueStats';

const EstoquePage = () => {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('estoque');

  // Buscar estatísticas gerais do estoque
  const {
    data: statsData,
    isLoading: statsLoading
  } = useQuery({
    queryKey: ['estoque-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const [produtosRes, estoqueRes] = await Promise.all([
        supabase.from('produtos').select('id').eq('user_id', user.id).eq('ativo', true),
        supabase.from('estoque').select('quantidade, quantidade_minima, data_validade').eq('user_id', user.id)
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

  if (authLoading) {
    return <LoadingPage message="Carregando autenticação..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Package className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="font-bold text-gray-900 text-2xl">Gestão de Estoque</h1>
          <p className="text-gray-600">Controle produtos, movimentações e alertas do seu estoque</p>
        </div>
      </div>

      {/* Tabs principais */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-stone-200">
          <TabsTrigger value="estoque" className="transition-all duration-200">
            <span>Estoque</span>
          </TabsTrigger>
          <TabsTrigger value="produtos" className="transition-all duration-200">
            <span>Produtos</span>
          </TabsTrigger>
          <TabsTrigger value="validades" className="transition-all duration-200">
            <span>Validades</span>
          </TabsTrigger>
          <TabsTrigger value="alertas" className="transition-all duration-200">
            <span>Alertas</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="estoque" className="animate-fade-in">
          <EstoqueMovimentacoes />
        </TabsContent>

        <TabsContent value="produtos" className="animate-fade-in">
          <ProdutosList />
        </TabsContent>

        <TabsContent value="validades" className="animate-fade-in">
          <GestaoValidades />
        </TabsContent>

        <TabsContent value="alertas" className="animate-fade-in">
          <AlertasEstoque />
        </TabsContent>
      </Tabs>

      {/* Estatísticas - com loading state */}
      <div className="animate-fade-in">
        {statsLoading ? (
          <LoadingStats count={5} />
        ) : (
          <EstoqueStats data={statsData} />
        )}
      </div>
    </div>
  );
};

export default EstoquePage;
