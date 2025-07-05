
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { ShoppingCart, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface Venda {
  id: string;
  valor_total: number;
  metodo_pagamento: string;
  status: string;
  data_da_venda: string;
  cliente: {
    nome: string;
    email: string;
  };
  itens: Array<{
    quantidade: number;
    preco_unitario: number;
    produto: {
      nome: string;
    };
  }>;
}

const AdminVendas = () => {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchVendas();
  }, []);

  const fetchVendas = async () => {
    try {
      const { data, error } = await supabase
        .from('vendas')
        .select(`
          *,
          clientes:id_cliente(nome, email),
          itens_da_venda(
            quantidade,
            preco_unitario,
            produtos:id_produto(nome)
          )
        `)
        .order('data_da_venda', { ascending: false });

      if (error) throw error;

      const vendasFormatadas = data?.map(venda => ({
        id: venda.id,
        valor_total: venda.valor_total,
        metodo_pagamento: venda.metodo_pagamento,
        status: venda.status,
        data_da_venda: venda.data_da_venda,
        cliente: {
          nome: venda.clientes?.nome || 'Cliente não encontrado',
          email: venda.clientes?.email || '',
        },
        itens: venda.itens_da_venda?.map((item: any) => ({
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario,
          produto: {
            nome: item.produtos?.nome || 'Produto não encontrado',
          },
        })) || [],
      })) || [];

      setVendas(vendasFormatadas);
    } catch (error) {
      console.error('Erro ao buscar vendas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar vendas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluida':
        return 'bg-green-100 text-green-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'pix':
        return 'PIX';
      case 'cartao_credito':
        return 'Cartão de Crédito';
      case 'boleto':
        return 'Boleto';
      default:
        return method;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Vendas</h1>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-200 rounded"></div>
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
        <h1 className="text-3xl font-bold text-gray-900">Vendas</h1>
        <p className="text-gray-600">Acompanhe todas as transações realizadas</p>
      </div>

      <div className="space-y-4">
        {vendas.map((venda) => (
          <Card key={venda.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    Venda #{venda.id.slice(0, 8)}
                  </CardTitle>
                  <CardDescription>
                    {new Date(venda.data_da_venda).toLocaleString('pt-BR')}
                  </CardDescription>
                </div>
                <div className="flex gap-2 items-center">
                  <Badge className={getStatusColor(venda.status)}>
                    {venda.status.charAt(0).toUpperCase() + venda.status.slice(1)}
                  </Badge>
                  <span className="text-lg font-bold text-green-600">
                    R$ {venda.valor_total.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Cliente</h4>
                  <p className="text-sm text-gray-600">{venda.cliente.nome}</p>
                  <p className="text-sm text-gray-500">{venda.cliente.email}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Pagamento</h4>
                  <p className="text-sm text-gray-600">
                    {getPaymentMethodLabel(venda.metodo_pagamento)}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Itens</h4>
                  <div className="space-y-1">
                    {venda.itens.map((item, index) => (
                      <div key={index} className="text-sm text-gray-600">
                        {item.quantidade}x {item.produto.nome} - R$ {item.preco_unitario.toFixed(2)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {vendas.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma venda realizada</h3>
            <p className="text-gray-600">As vendas aparecerão aqui quando forem processadas.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminVendas;
