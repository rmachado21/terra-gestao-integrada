import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardStats from "@/components/DashboardStats";
import QuickActions from "@/components/QuickActions";
import RecentActivities from "@/components/RecentActivities";
import AlertsPanel from "@/components/AlertsPanel";
import { Sprout, Package, TrendingUp, Users, DollarSign, Bell } from "lucide-react";

const Index = () => {
  const [activeModule, setActiveModule] = useState("dashboard");

  const modules = [
    {
      id: "planting",
      title: "Planejamento e Plantio",
      icon: Sprout,
      color: "bg-green-500",
      description: "Controle de plantios e cronograma"
    },
    {
      id: "production",
      title: "Produção",
      icon: Package,
      color: "bg-orange-500",
      description: "Monitoramento de colheitas"
    },
    {
      id: "stock",
      title: "Estoque",
      icon: Package,
      color: "bg-blue-500",
      description: "Gestão de produtos e lotes"
    },
    {
      id: "sales",
      title: "Vendas",
      icon: TrendingUp,
      color: "bg-purple-500",
      description: "Clientes e pedidos"
    },
    {
      id: "financial",
      title: "Financeiro",
      icon: DollarSign,
      color: "bg-yellow-500",
      description: "Controle de receitas e despesas"
    },
    {
      id: "alerts",
      title: "Alertas",
      icon: Bell,
      color: "bg-red-500",
      description: "Lembretes e tarefas"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50">
      
      <main className="container mx-auto px-4 py-8">
        {activeModule === "dashboard" && (
          <>
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-green-800 mb-2">
                Bem da Terra
              </h1>
              <p className="text-lg text-gray-600">
                Sistema de Gestão Integrado - Produção de Mandioca
              </p>
            </div>

            {/* Dashboard Stats */}
            <DashboardStats />

            {/* Quick Actions */}
            <QuickActions />

            {/* Modules Grid */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Módulos do Sistema</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map((module) => (
                  <Card 
                    key={module.id}
                    className="hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                    onClick={() => setActiveModule(module.id)}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-3 rounded-lg ${module.color} text-white`}>
                          <module.icon className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{module.title}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">{module.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Recent Activities and Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <RecentActivities />
              <AlertsPanel />
            </div>
          </>
        )}

        {activeModule === "planting" && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-green-800">Planejamento e Controle de Plantio</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Plantios Ativos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { area: "Setor A - 2.5 ha", variety: "Mandioca Branca", planted: "15/03/2024", harvest: "15/03/2025", status: "Crescendo" },
                      { area: "Setor B - 3.0 ha", variety: "Mandioca Amarela", planted: "22/03/2024", harvest: "22/03/2025", status: "Plantio" },
                      { area: "Setor C - 1.8 ha", variety: "Mandioca Branca", planted: "01/04/2024", harvest: "01/04/2025", status: "Preparando" }
                    ].map((planting, index) => (
                      <div key={index} className="p-4 border rounded-lg bg-green-50">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-green-800">{planting.area}</h3>
                          <Badge variant={planting.status === "Crescendo" ? "default" : "secondary"}>
                            {planting.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">Variedade: {planting.variety}</p>
                        <p className="text-sm text-gray-600 mb-1">Plantado em: {planting.planted}</p>
                        <p className="text-sm text-gray-600">Previsão colheita: {planting.harvest}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Novo Plantio
                  </Button>
                  <Button variant="outline" className="w-full">
                    Cronograma
                  </Button>
                  <Button variant="outline" className="w-full">
                    Relatórios
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeModule === "production" && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-orange-800">Controle de Produção</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Colheitas Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { date: "20/05/2024", area: "Setor D", quantity: "1.200 kg", type: "Mandioca in natura" },
                      { date: "18/05/2024", area: "Setor E", quantity: "800 kg", type: "Para farinha" },
                      { date: "15/05/2024", area: "Setor F", quantity: "950 kg", type: "Mandioca in natura" }
                    ].map((harvest, index) => (
                      <div key={index} className="p-3 border rounded bg-orange-50">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{harvest.area}</p>
                            <p className="text-sm text-gray-600">{harvest.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-orange-700">{harvest.quantity}</p>
                            <p className="text-sm text-gray-600">{harvest.type}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Processamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <h3 className="font-semibold mb-2">Produção de Farinha</h3>
                      <p className="text-sm text-gray-600 mb-2">Lote em processamento: 500kg mandioca</p>
                      <p className="text-sm text-gray-600">Previsão: 125kg farinha</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold mb-2">Embalagem a Vácuo</h3>
                      <p className="text-sm text-gray-600 mb-2">Prontos: 200 pacotes 1kg</p>
                      <p className="text-sm text-gray-600">Aguardando: 150 pacotes 500g</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeModule === "stock" && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-blue-800">Gestão de Estoque</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Produtos em Estoque</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { product: "Farinha de Mandioca 1kg", quantity: 150, unit: "pacotes", expiry: "30/08/2024", status: "normal" },
                      { product: "Farinha de Mandioca 500g", quantity: 80, unit: "pacotes", expiry: "25/08/2024", status: "low" },
                      { product: "Mandioca Embalada 2kg", quantity: 45, unit: "pacotes", expiry: "10/06/2024", status: "critical" },
                      { product: "Mandioca in Natura", quantity: 300, unit: "kg", expiry: "05/06/2024", status: "normal" }
                    ].map((item, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{item.product}</h3>
                            <p className="text-sm text-gray-600">Validade: {item.expiry}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{item.quantity} {item.unit}</p>
                            <Badge 
                              variant={
                                item.status === "critical" ? "destructive" : 
                                item.status === "low" ? "secondary" : "default"
                              }
                            >
                              {item.status === "critical" ? "Crítico" : 
                               item.status === "low" ? "Baixo" : "Normal"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Alertas de Estoque</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-red-50 border border-red-200 rounded">
                      <p className="text-sm font-medium text-red-800">Mandioca 2kg - Estoque crítico</p>
                    </div>
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-sm font-medium text-yellow-800">Farinha 500g - Estoque baixo</p>
                    </div>
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                      <p className="text-sm font-medium text-orange-800">Produtos vencendo em 5 dias</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeModule === "sales" && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-purple-800">Vendas e Clientes</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pedidos Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { client: "Mercado Central", date: "22/05/2024", value: "R$ 450,00", status: "Entregue" },
                      { client: "Padaria São José", date: "21/05/2024", value: "R$ 280,00", status: "Pendente" },
                      { client: "Restaurante Sabor Rural", date: "20/05/2024", value: "R$ 320,00", status: "Entregue" }
                    ].map((order, index) => (
                      <div key={index} className="p-3 border rounded bg-purple-50">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{order.client}</p>
                            <p className="text-sm text-gray-600">{order.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-purple-700">{order.value}</p>
                            <Badge variant={order.status === "Entregue" ? "default" : "secondary"}>
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Top Clientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: "Mercado Central", orders: 15, total: "R$ 4.500,00" },
                      { name: "Padaria São José", orders: 12, total: "R$ 3.200,00" },
                      { name: "Restaurante Sabor Rural", orders: 8, total: "R$ 2.800,00" }
                    ].map((client, index) => (
                      <div key={index} className="p-3 border rounded">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{client.name}</p>
                            <p className="text-sm text-gray-600">{client.orders} pedidos</p>
                          </div>
                          <p className="font-semibold text-green-600">{client.total}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeModule === "financial" && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-yellow-800">Controle Financeiro</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">Receitas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-600">R$ 12.450,00</p>
                  <p className="text-sm text-gray-600">Este mês</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Despesas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-red-600">R$ 5.280,00</p>
                  <p className="text-sm text-gray-600">Este mês</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-600">Lucro Líquido</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-blue-600">R$ 7.170,00</p>
                  <p className="text-sm text-gray-600">Este mês</p>
                </CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Principais Despesas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { category: "Mão de obra", amount: "R$ 2.800,00", percentage: 53 },
                      { category: "Insumos", amount: "R$ 1.200,00", percentage: 23 },
                      { category: "Manutenção", amount: "R$ 800,00", percentage: 15 },
                      { category: "Combustível", amount: "R$ 480,00", percentage: 9 }
                    ].map((expense, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span>{expense.category}</span>
                        <div className="text-right">
                          <p className="font-semibold">{expense.amount}</p>
                          <p className="text-sm text-gray-600">{expense.percentage}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Fluxo de Caixa</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 rounded">
                      <p className="text-sm text-gray-600">Saldo atual</p>
                      <p className="text-xl font-bold text-green-600">R$ 15.320,00</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded">
                      <p className="text-sm text-gray-600">Contas a receber</p>
                      <p className="text-lg font-semibold text-blue-600">R$ 2.850,00</p>
                    </div>
                    <div className="p-3 bg-red-50 rounded">
                      <p className="text-sm text-gray-600">Contas a pagar</p>
                      <p className="text-lg font-semibold text-red-600">R$ 1.400,00</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeModule === "alerts" && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-red-800">Alertas e Tarefas</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Alertas Críticos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { type: "Estoque", message: "Mandioca 2kg - apenas 45 unidades", priority: "high" },
                      { type: "Validade", message: "3 produtos vencem em 5 dias", priority: "medium" },
                      { type: "Colheita", message: "Setor A pronto para colheita", priority: "high" }
                    ].map((alert, index) => (
                      <div key={index} className={`p-3 rounded border-l-4 ${
                        alert.priority === "high" ? "bg-red-50 border-red-500" : "bg-yellow-50 border-yellow-500"
                      }`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{alert.type}</p>
                            <p className="text-sm text-gray-600">{alert.message}</p>
                          </div>
                          <Badge variant={alert.priority === "high" ? "destructive" : "secondary"}>
                            {alert.priority === "high" ? "Urgente" : "Médio"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Tarefas Pendentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { task: "Preparar terreno Setor G", date: "25/05/2024", status: "pending" },
                      { task: "Comprar mudas variedade amarela", date: "27/05/2024", status: "pending" },
                      { task: "Manutenção equipamento processamento", date: "30/05/2024", status: "scheduled" },
                      { task: "Entrega Mercado Central", date: "23/05/2024", status: "completed" }
                    ].map((task, index) => (
                      <div key={index} className="p-3 border rounded">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{task.task}</p>
                            <p className="text-sm text-gray-600">Prazo: {task.date}</p>
                          </div>
                          <Badge variant={
                            task.status === "completed" ? "default" :
                            task.status === "pending" ? "destructive" : "secondary"
                          }>
                            {task.status === "completed" ? "Concluída" :
                             task.status === "pending" ? "Pendente" : "Agendada"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
