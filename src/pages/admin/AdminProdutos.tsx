
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Produto {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  url_imagem: string;
  is_principal: boolean;
  is_orderbump: boolean;
  is_upsell: boolean;
  created_at: string;
}

const AdminProdutos = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco: '',
    url_imagem: '',
    is_principal: false,
    is_orderbump: false,
    is_upsell: false,
  });

  useEffect(() => {
    fetchProdutos();
  }, []);

  const fetchProdutos = async () => {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProdutos(data || []);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar produtos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const produtoData = {
        nome: formData.nome,
        descricao: formData.descricao,
        preco: parseFloat(formData.preco),
        url_imagem: formData.url_imagem,
        is_principal: formData.is_principal,
        is_orderbump: formData.is_orderbump,
        is_upsell: formData.is_upsell,
      };

      if (editingProduto) {
        const { error } = await supabase
          .from('produtos')
          .update(produtoData)
          .eq('id', editingProduto.id);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Produto atualizado com sucesso!"
        });
      } else {
        const { error } = await supabase
          .from('produtos')
          .insert([produtoData]);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Produto criado com sucesso!"
        });
      }

      setFormData({
        nome: '',
        descricao: '',
        preco: '',
        url_imagem: '',
        is_principal: false,
        is_orderbump: false,
        is_upsell: false,
      });
      setShowForm(false);
      setEditingProduto(null);
      fetchProdutos();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar produto",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (produto: Produto) => {
    setEditingProduto(produto);
    setFormData({
      nome: produto.nome,
      descricao: produto.descricao || '',
      preco: produto.preco.toString(),
      url_imagem: produto.url_imagem || '',
      is_principal: produto.is_principal,
      is_orderbump: produto.is_orderbump,
      is_upsell: produto.is_upsell,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({
        title: "Sucesso",
        description: "Produto excluído com sucesso!"
      });
      fetchProdutos();
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir produto",
        variant: "destructive"
      });
    }
  };

  if (loading && produtos.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
          <p className="text-gray-600">Gerencie seu catálogo de produtos</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Produto
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingProduto ? 'Editar Produto' : 'Novo Produto'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome do Produto</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="preco">Preço (R$)</Label>
                  <Input
                    id="preco"
                    type="number"
                    step="0.01"
                    value={formData.preco}
                    onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="url_imagem">URL da Imagem</Label>
                <Input
                  id="url_imagem"
                  value={formData.url_imagem}
                  onChange={(e) => setFormData({ ...formData, url_imagem: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_principal"
                    checked={formData.is_principal}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_principal: checked })}
                  />
                  <Label htmlFor="is_principal">Produto Principal</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_orderbump"
                    checked={formData.is_orderbump}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_orderbump: checked })}
                  />
                  <Label htmlFor="is_orderbump">Order Bump</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_upsell"
                    checked={formData.is_upsell}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_upsell: checked })}
                  />
                  <Label htmlFor="is_upsell">Upsell</Label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {editingProduto ? 'Atualizar' : 'Criar'} Produto
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingProduto(null);
                    setFormData({
                      nome: '',
                      descricao: '',
                      preco: '',
                      url_imagem: '',
                      is_principal: false,
                      is_orderbump: false,
                      is_upsell: false,
                    });
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {produtos.map((produto) => (
          <Card key={produto.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{produto.nome}</CardTitle>
                  <CardDescription>R$ {produto.preco.toFixed(2)}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(produto)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(produto.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {produto.url_imagem && (
                <img
                  src={produto.url_imagem}
                  alt={produto.nome}
                  className="w-full h-32 object-cover rounded mb-4"
                />
              )}
              <p className="text-sm text-gray-600 mb-4">{produto.descricao}</p>
              <div className="flex flex-wrap gap-2">
                {produto.is_principal && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Principal</span>
                )}
                {produto.is_orderbump && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Order Bump</span>
                )}
                {produto.is_upsell && (
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">Upsell</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {produtos.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto cadastrado</h3>
            <p className="text-gray-600 mb-4">Comece criando seu primeiro produto.</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Produto
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminProdutos;
