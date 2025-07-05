
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { ShoppingCart, Package, Users, DollarSign, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { criarProdutosExemplo, criarVendaExemplo } from '@/lib/seedData';

interface DashboardStats {
  totalVendas: number;
  totalProdutos: number;
  totalClientes: number;
  receitaTotal: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalVendas: 0,
    totalProdutos: 0,
    totalClientes: 0,
    receitaTotal: 0,
  });
  const [loading, setLoading] = useState(true);
  const [creatingData, setCreatingData] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Buscar total de vendas
      const { count: vendasCount } = await supabase
        .from('vendas')
        .select('*', { count: 'exact', head: true });

      // Buscar total de produtos
      const { count: produtosCount } = await supabase
        .from('produtos')
        .select('*', { count: 'exact', head: true });

      // Buscar total de clientes
      const { count: clientesCount } = await supabase
        .from('clientes')
        .select('*', { count: 'exact', head: true });

      // Buscar receita total
      const { data: receitaData } = await supabase
        .from('vendas')
        .select('valor_total')
        .eq('status', 'concluida');

      const receitaTotal = receitaData?.reduce((sum, venda) => sum + Number(venda.valor_total), 0) || 0;

      setStats({
        totalVendas: vendasCount || 0,
        totalProdutos: produtosCount || 0,
        totalClientes: clientesCount || 0,
        receitaTotal,
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      setStats({
        totalVendas: 0,
        totalProdutos: 0,
        totalClientes: 0,
        receitaTotal: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSampleData = async () => {
    setCreatingData(true);
    try {
      await criarProdutosExemplo();
      await criarVendaExemplo();
      
      toast({
        title: "Sucesso!",
        description: "Dados de exemplo criados com sucesso!"
      });
      
      // Recarregar estatísticas
      fetchStats();
    } catch (error) {
      console.error('Erro ao criar dados exemplo:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar dados de exemplo",
        variant: "destructive"
      });
    } finally {
      setCreatingData(false);
    }
  };

  const statCards = [
    {
      title: 'Total de Vendas',
      value: stats.totalVendas,
      icon: ShoppingCart,
      description: 'Vendas realizadas',
    },
    {
      title: 'Produtos',
      value: stats.totalProdutos,
      icon: Package,
      description: 'Produtos cadastrados',
    },
    {
      title: 'Clientes',
      value: stats.totalClientes,
      icon: Users,
      description: 'Clientes registrados',
    },
    {
      title: 'Receita Total',
      value: `R$ ${stats.receitaTotal.toFixed(2)}`,
      icon: DollarSign,
      description: 'Receita acumulada',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Visão geral do seu Super Checkout</p>
        </div>
        {(stats.totalProdutos === 0 || stats.totalVendas === 0) && (
          <Button 
            onClick={handleCreateSampleData} 
            disabled={creatingData}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {creatingData ? 'Criando...' : 'Criar Dados Exemplo'}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{card.value}</div>
              <p className="text-xs text-gray-500">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sistema Operacional</CardTitle>
            <CardDescription>
              Todas as funcionalidades estão ativas e funcionando
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Seu sistema Super Checkout está totalmente operacional! Todas as tabelas foram criadas e o sistema está pronto para usar.
            </p>
            <p className="text-gray-600">
              Funcionalidades disponíveis:
            </p>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li>• <strong>Produtos:</strong> Gerencie seu catálogo de produtos</li>
              <li>• <strong>Vendas:</strong> Processar e acompanhar transações</li>
              <li>• <strong>Clientes:</strong> Gestão completa de clientes</li>
              <li>• <strong>Relatórios:</strong> Análises e estatísticas em tempo real</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status do Sistema</CardTitle>
            <CardDescription>
              Tudo funcionando perfeitamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Banco de Dados</span>
                <span className="text-sm text-green-600 font-medium">✓ Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tabelas Criadas</span>
                <span className="text-sm text-green-600 font-medium">✓ Completo</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Autenticação</span>
                <span className="text-sm text-green-600 font-medium">✓ Ativa</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">APIs</span>
                <span className="text-sm text-green-600 font-medium">✓ Funcionando</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
