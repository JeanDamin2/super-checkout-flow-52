
import { supabase } from '@/integrations/supabase/client';

export interface ProcessarVendaData {
  clienteNome: string;
  clienteEmail: string;
  clienteCpf?: string;
  produtos: Array<{
    id_produto: string;
    preco_unitario: number;
    quantidade?: number;
  }>;
  metodoPagamento: string;
  valorTotal: number;
}

export const processarVenda = async (dadosVenda: ProcessarVendaData) => {
  try {
    const { data, error } = await supabase.rpc('processar_venda', {
      cliente_nome: dadosVenda.clienteNome,
      cliente_email: dadosVenda.clienteEmail,
      cliente_cpf: dadosVenda.clienteCpf || null,
      produtos: dadosVenda.produtos,
      metodo_pagamento: dadosVenda.metodoPagamento,
      valor_total: dadosVenda.valorTotal,
    });

    if (error) {
      console.error('Erro ao processar venda:', error);
      throw new Error('Erro ao processar venda: ' + error.message);
    }

    return data; // Retorna o ID da venda criada
  } catch (error) {
    console.error('Erro na função processarVenda:', error);
    throw error;
  }
};

export const buscarProdutosPorTipo = async (tipo: 'principal' | 'orderbump' | 'upsell' | 'all' = 'all') => {
  try {
    const { data, error } = await supabase.rpc('buscar_produtos_por_tipo', {
      tipo,
    });

    if (error) {
      console.error('Erro ao buscar produtos:', error);
      throw new Error('Erro ao buscar produtos: ' + error.message);
    }

    return data || [];
  } catch (error) {
    console.error('Erro na função buscarProdutosPorTipo:', error);
    throw error;
  }
};
