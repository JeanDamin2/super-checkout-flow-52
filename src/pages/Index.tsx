
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Package, BarChart3, Settings } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Super Checkout
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Sistema completo de gestão de produtos e vendas online. 
            Gerencie seus produtos, processe vendas e acompanhe seus resultados.
          </p>
          
          <div className="space-x-4">
            <Link to="/admin">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Acessar Painel Admin
              </Button>
            </Link>
            <Link to="/admin/login">
              <Button variant="outline" size="lg">
                Fazer Login
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center">
            <CardHeader>
              <Package className="h-12 w-12 mx-auto text-blue-600 mb-4" />
              <CardTitle>Gestão de Produtos</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Cadastre e gerencie seus produtos com facilidade. 
                Defina preços, descrições e configurações especiais.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <ShoppingCart className="h-12 w-12 mx-auto text-green-600 mb-4" />
              <CardTitle>Processamento de Vendas</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Sistema completo de checkout com suporte a múltiplos 
                métodos de pagamento e order bumps.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <BarChart3 className="h-12 w-12 mx-auto text-purple-600 mb-4" />
              <CardTitle>Relatórios e Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Acompanhe suas vendas, receita e performance 
                com relatórios detalhados em tempo real.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Settings className="h-12 w-12 mx-auto text-orange-600 mb-4" />
              <CardTitle>Configurações Flexíveis</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Personalize seu checkout, configure termos legais 
                e adapte o sistema às suas necessidades.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Pronto para começar?
          </h2>
          <p className="text-gray-600 mb-6">
            Acesse o painel administrativo e comece a gerenciar suas vendas hoje mesmo.
          </p>
          <Link to="/admin/login">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Entrar no Sistema
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
