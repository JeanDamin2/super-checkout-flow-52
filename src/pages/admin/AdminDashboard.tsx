
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { ShoppingCart, Package, Users, DollarSign } from 'lucide-react';

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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Buscar total de vendas usando rpc ou query direta
        const { data: vendasData, error: vendasError } = await supabase
          .rpc('count_vendas')
          .single();
        
        if (vendasError) {
          console.log('Usando fallback para vendas:', vendasError);
          // Fallback: usar query direta
          const { count: vendasCount } = await supabase
            .from('vendas')
            .select('*', { count: 'exact', head: true });
          
          const { count: produtosCount } = await supabase
            .from('produtos')
            .select('*', { count: 'exact', head: true });

          const { count: clientesCount } = await supabase
            .from('clientes')
            .select('*', { count: 'exact', head: true });

          // Buscar receita total
          const { data: receitaData } = await supabase
            .from('vendas')
            .select('valor_total')
            .eq('status', 'concluida');

          const receitaTotal = receitaData?.reduce((sum: number, venda: any) => sum + Number(venda.valor_total), 0) || 0;

          setStats({
            totalVendas: vendasCount || 0,
            totalProdutos: produtosCount || 0,
            totalClientes: clientesCount || 0,
            receitaTotal,
          });
        }
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        // Em caso de erro, definir valores padrão
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

    fetchStats();
  }, []);

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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Visão geral do seu Super Checkout</p>
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
            <CardTitle>Bem-vindo ao Super Checkout</CardTitle>
            <CardDescription>
              Sistema completo de gestão de produtos e vendas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Use o menu lateral para navegar entre as diferentes seções do sistema:
            </p>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li>• <strong>Produtos:</strong> Gerencie seu catálogo de produtos</li>
              <li>• <strong>Vendas:</strong> Acompanhe todas as transações</li>
              <li>• <strong>Clientes:</strong> Visualize dados dos seus clientes</li>
              <li>• <strong>Configurações:</strong> Personalize o sistema</li>
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
                <span className="text-sm text-green-600 font-medium">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">APIs</span>
                <span className="text-sm text-green-600 font-medium">Funcionando</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Autenticação</span>
                <span className="text-sm text-green-600 font-medium">Ativa</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
