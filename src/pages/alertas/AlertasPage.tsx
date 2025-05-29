
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AlertasList from './components/AlertasList';
import ConfiguracaoRegras from './components/ConfiguracaoRegras';
import GerenciamentoAlertas from './components/GerenciamentoAlertas';
import { Bell, Settings, Users, BarChart3 } from 'lucide-react';

const AlertasPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Bell className="h-8 w-8 text-orange-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Alertas</h1>
          <p className="text-gray-600">Gerenciamento inteligente de notificações e alertas</p>
        </div>
      </div>

      <Tabs defaultValue="alertas" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="alertas" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Alertas Ativos
          </TabsTrigger>
          <TabsTrigger value="configuracao" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuração
          </TabsTrigger>
          <TabsTrigger value="gerenciamento" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Gerenciamento
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alertas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Alertas Ativos</CardTitle>
              <CardDescription>
                Visualize e gerencie todos os alertas do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertasList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuracao" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Regras</CardTitle>
              <CardDescription>
                Configure as regras de negócio para geração automática de alertas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConfiguracaoRegras />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gerenciamento" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Alertas</CardTitle>
              <CardDescription>
                Gerencie usuários, canais de notificação e histórico
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GerenciamentoAlertas />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AlertasPage;
