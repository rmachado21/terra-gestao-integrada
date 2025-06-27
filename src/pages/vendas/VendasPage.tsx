
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import VendasStats from './components/VendasStats';
import PedidosList from './components/PedidosList';
import ClientesList from './components/ClientesList';
import EntregasList from './components/EntregasList';
import RelatoriosVendas from './components/RelatoriosVendas';
import { ShoppingCart } from 'lucide-react';
import { useVendasStats } from './hooks/useVendasStats';

const VendasPage = () => {
  const { data: vendasStatsData, isLoading: isLoadingStats } = useVendasStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ShoppingCart className="h-8 w-8 text-purple-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendas</h1>
          <p className="text-gray-600">Gestão completa de vendas e relacionamento com clientes</p>
        </div>
      </div>

      <Tabs defaultValue="pedidos" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-300 text-gray-900">
          <TabsTrigger value="pedidos">
            Pedidos
          </TabsTrigger>
          <TabsTrigger value="clientes">
            Clientes
          </TabsTrigger>
          <TabsTrigger value="entregas">
            Entregas
          </TabsTrigger>
          <TabsTrigger value="relatorios">
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pedidos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Pedidos</CardTitle>
              <CardDescription>
                Controle todos os pedidos de vendas da propriedade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PedidosList />
            </CardContent>
          </Card>
          <VendasStats data={isLoadingStats ? null : vendasStatsData} />
        </TabsContent>

        <TabsContent value="clientes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Clientes</CardTitle>
              <CardDescription>
                Cadastro e acompanhamento de clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClientesList />
            </CardContent>
          </Card>
          <VendasStats data={isLoadingStats ? null : vendasStatsData} />
        </TabsContent>

        <TabsContent value="entregas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Controle de Entregas</CardTitle>
              <CardDescription>
                Acompanhe o status das entregas e logística
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EntregasList />
            </CardContent>
          </Card>
          <VendasStats data={isLoadingStats ? null : vendasStatsData} />
        </TabsContent>

        <TabsContent value="relatorios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios de Vendas</CardTitle>
              <CardDescription>
                Análises e insights sobre performance de vendas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RelatoriosVendas />
            </CardContent>
          </Card>
          <VendasStats data={isLoadingStats ? null : vendasStatsData} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendasPage;
