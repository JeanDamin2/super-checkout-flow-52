
import { supabase } from '@/integrations/supabase/client';

export const criarProdutosExemplo = async () => {
  try {
    const produtosExemplo = [
      {
        nome: 'Curso Completo de Marketing Digital',
        descricao: 'Aprenda todas as estratégias de marketing digital para alavancar seu negócio online.',
        preco: 297.00,
        url_imagem: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
        is_principal: true,
        is_orderbump: false,
        is_upsell: false,
      },
      {
        nome: 'E-book: 50 Dicas de Vendas',
        descricao: 'Um guia prático com as melhores técnicas de vendas para aumentar sua conversão.',
        preco: 47.00,
        url_imagem: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
        is_principal: false,
        is_orderbump: true,
        is_upsell: false,
      },
      {
        nome: 'Consultoria Personalizada - 1 Hora',
        descricao: 'Sessão individual de consultoria para acelerar seus resultados no marketing digital.',
        preco: 197.00,
        url_imagem: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
        is_principal: false,
        is_orderbump: false,
        is_upsell: true,
      },
      {
        nome: 'Templates de Landing Pages',
        descricao: 'Pacote com 10 templates profissionais de landing pages prontas para usar.',
        preco: 67.00,
        url_imagem: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=400&h=300&fit=crop',
        is_principal: false,
        is_orderbump: true,
        is_upsell: false,
      },
    ];

    const { data, error } = await supabase
      .from('produtos')
      .insert(produtosExemplo)
      .select();

    if (error) {
      console.error('Erro ao criar produtos exemplo:', error);
      throw error;
    }

    console.log('Produtos exemplo criados com sucesso:', data);
    return data;
  } catch (error) {
    console.error('Erro na função criarProdutosExemplo:', error);
    throw error;
  }
};

export const criarVendaExemplo = async () => {
  try {
    // Primeiro, vamos buscar alguns produtos
    const { data: produtos } = await supabase
      .from('produtos')
      .select('id, nome, preco')
      .limit(2);

    if (!produtos || produtos.length === 0) {
      throw new Error('Nenhum produto encontrado para criar venda exemplo');
    }

    const produtosPraVenda = produtos.map(produto => ({
      id_produto: produto.id,
      preco_unitario: produto.preco,
      quantidade: 1,
    }));

    const valorTotal = produtos.reduce((sum, produto) => sum + produto.preco, 0);

    // Usar a função SQL para processar a venda
    const { data: vendaId, error } = await supabase.rpc('processar_venda', {
      cliente_nome: 'João Silva',
      cliente_email: 'joao.silva@email.com',
      cliente_cpf: '123.456.789-00',
      produtos: produtosPraVenda,
      metodo_pagamento: 'pix',
      valor_total: valorTotal,
    });

    if (error) {
      console.error('Erro ao criar venda exemplo:', error);
      throw error;
    }

    console.log('Venda exemplo criada com sucesso:', vendaId);
    return vendaId;
  } catch (error) {
    console.error('Erro na função criarVendaExemplo:', error);
    throw error;
  }
};
