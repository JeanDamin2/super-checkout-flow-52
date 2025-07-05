
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Users, Mail, Calendar, ShoppingBag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Cliente {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  created_at: string;
  total_vendas: number;
  valor_total_comprado: number;
}

const AdminClientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      // Buscar clientes com estatísticas de vendas
      const { data, error } = await supabase
        .from('clientes')
        .select(`
          *,
          vendas(valor_total, status)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const clientesComStats = data?.map(cliente => {
        const vendasConcluidas = cliente.vendas?.filter((v: any) => v.status === 'concluida') || [];
        const valorTotal = vendasConcluidas.reduce((sum: number, venda: any) => sum + Number(venda.valor_total), 0);

        return {
          id: cliente.id,
          nome: cliente.nome,
          email: cliente.email,
          cpf: cliente.cpf,
          created_at: cliente.created_at,
          total_vendas: vendasConcluidas.length,
          valor_total_comprado: valorTotal,
        };
      }) || [];

      setClientes(clientesComStats);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar clientes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
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
        <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
        <p className="text-gray-600">Gerencie seus clientes e visualize estatísticas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clientes.map((cliente) => (
          <Card key={cliente.id}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                {cliente.nome}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {cliente.email}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cliente.cpf && (
                  <div className="text-sm text-gray-600">
                    <strong>CPF:</strong> {cliente.cpf}
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  Cliente desde {new Date(cliente.created_at).toLocaleDateString('pt-BR')}
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <ShoppingBag className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {cliente.total_vendas}
                      </div>
                      <div className="text-xs text-gray-600">Compras</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        R$ {cliente.valor_total_comprado.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-600">Total Gasto</div>
                    </div>
                  </div>
                </div>

                {cliente.total_vendas > 0 && (
                  <div className="text-xs text-center text-gray-500">
                    Ticket médio: R$ {(cliente.valor_total_comprado / cliente.total_vendas).toFixed(2)}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {clientes.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum cliente cadastrado</h3>
            <p className="text-gray-600">Os clientes aparecerão aqui quando realizarem compras.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminClientes;
