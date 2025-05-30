import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LancamentosFinanceiros from './components/LancamentosFinanceiros';
import FluxoCaixa from './components/FluxoCaixa';
import RelatoriosFinanceiros from './components/RelatoriosFinanceiros';
import { TrendingUp, DollarSign, PieChart, BarChart3 } from 'lucide-react';
const FinanceiroPage = () => {
  return <div className="space-y-6">
      <div className="flex items-center gap-3">
        <TrendingUp className="h-8 w-8 text-green-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financeiro</h1>
          <p className="text-gray-600">Gestão completa das finanças da propriedade</p>
        </div>
      </div>

      <Tabs defaultValue="lancamentos" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-green-950">
          <TabsTrigger value="lancamentos" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Lançamentos
          </TabsTrigger>
          <TabsTrigger value="fluxo" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Fluxo de Caixa
          </TabsTrigger>
          <TabsTrigger value="relatorios" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lancamentos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lançamentos Financeiros</CardTitle>
              <CardDescription>
                Registre receitas e despesas com categorização automática
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LancamentosFinanceiros />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fluxo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Fluxo de Caixa</CardTitle>
              <CardDescription>
                Visualize o movimento de entrada e saída de recursos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FluxoCaixa />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relatorios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Financeiros</CardTitle>
              <CardDescription>
                Análises detalhadas e insights financeiros
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RelatoriosFinanceiros />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>;
};
export default FinanceiroPage;