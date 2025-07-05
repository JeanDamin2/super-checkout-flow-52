
/**
 * ProductContext - Context de Gerenciamento de Produtos
 * 
 * Gerencia o estado global dos produtos da aplicação, fornecendo operações CRUD
 * completas com isolamento por usuário (multi-tenant simulado).
 * 
 * @context ProductContext
 * @description Context responsável por gerenciar produtos por usuário.
 * Implementa padrão multi-tenant simulado onde cada usuário tem seus próprios produtos
 * isolados no localStorage.
 * 
 * TODO: BACKEND INTEGRATION - Este context precisa ser refatorado para trabalhar
 * com APIs RESTful em vez de localStorage.
 * 
 * Endpoints necessários:
 * - GET /api/products - Listar produtos do usuário
 * - POST /api/products - Criar novo produto
 * - PUT /api/products/:id - Atualizar produto existente
 * - DELETE /api/products/:id - Deletar produto
 * - GET /api/products/:id - Buscar produto por ID
 * 
 * @example
 * ```tsx
 * const { products, addProduct, updateProduct, deleteProduct } = useProductContext();
 * ```
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, getProducts } from '@/api/mockDatabase';
import { useProductStorage } from '@/hooks/useProductStorage';

interface ProductContextType {
  products: Product[];
  loading: boolean;
  addProduct: (productData: Omit<Product, 'id'>) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<Product | null>;
  deleteProduct: (id: string) => Promise<boolean>;
  getProductById: (id: string) => Product | null;
  refreshProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

/**
 * Hook para acessar o contexto de produtos
 * 
 * @returns {ProductContextType} Objeto com produtos e métodos CRUD
 * @throws {Error} Se usado fora do ProductProvider
 */
export const useProductContext = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProductContext deve ser usado dentro de um ProductProvider');
  }
  return context;
};

interface ProductProviderProps {
  children: ReactNode;
}

/**
 * ProductProvider Component
 * 
 * Provider do contexto de produtos que gerencia o estado global de produtos
 * com isolamento por usuário.
 * 
 * @param {ProductProviderProps} props - Props do provider
 * @param {ReactNode} props.children - Componentes filhos
 * 
 * @returns {JSX.Element} Provider com contexto de produtos
 */

export const ProductProvider: React.FC<ProductProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { getUserData, saveUserData } = useProductStorage();

  // Carregar produtos quando o usuário mudar
  useEffect(() => {
    const userEmail = localStorage.getItem('currentUserEmail');
    if (userEmail && userEmail !== currentUserEmail) {
      setCurrentUserEmail(userEmail);
      const userProducts = getUserData(userEmail);
      setProducts(userProducts);
      console.log('👤 Produtos carregados para usuário:', userEmail);
    }
  }, [currentUserEmail]);

  // Salvar produtos no localStorage sempre que houver mudanças
  useEffect(() => {
    if (currentUserEmail && products.length > 0) {
      saveUserData(currentUserEmail, products);
    }
  }, [products, currentUserEmail]);

  // Carregar produtos iniciais (não mais necessário pois já carregamos do localStorage)
  const loadProducts = async () => {
    try {
      setLoading(true);
      // Se não há produtos no localStorage, carrega do mockDatabase
      if (products.length === 0) {
        const productsData = await getProducts();
        setProducts(productsData);
        console.log('🔄 Produtos carregados do mockDatabase:', productsData.length);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Adicionar novo produto
   * 
   * TODO: BACKEND INTEGRATION - Esta função deve ser substituída por uma chamada de API
   * Exemplo: 
   * const response = await fetch('/api/products', {
   *   method: 'POST',
   *   headers: { 
   *     'Content-Type': 'application/json',
   *     Authorization: `Bearer ${token}`
   *   },
   *   body: JSON.stringify(productData)
   * });
   * 
   * @param {Omit<Product, 'id'>} productData - Dados do produto sem ID
   * @returns {Promise<Product>} Produto criado com ID
   */
  const addProduct = async (productData: Omit<Product, 'id'>): Promise<Product> => {
    try {
      console.log('📦 Adicionando novo produto:', productData);
      
      // Criar produto com ID único
      const newProduct: Product = {
        ...productData,
        id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
      
      // Adicionar ao estado (que automaticamente salvará no localStorage via useEffect)
      setProducts(prev => [...prev, newProduct]);
      console.log('✅ Produto adicionado com sucesso:', newProduct);
      return newProduct;
    } catch (error) {
      console.error('❌ Erro ao adicionar produto:', error);
      throw error;
    }
  };

  /**
   * Atualizar produto existente
   * 
   * TODO: BACKEND INTEGRATION - Esta função deve ser substituída por uma chamada de API
   * Exemplo:
   * await fetch(`/api/products/${id}`, {
   *   method: 'PUT',
   *   headers: { 
   *     'Content-Type': 'application/json',
   *     Authorization: `Bearer ${token}`
   *   },
   *   body: JSON.stringify(updates)
   * });
   * 
   * @param {string} id - ID do produto a ser atualizado
   * @param {Partial<Product>} updates - Atualizações parciais do produto
   * @returns {Promise<Product | null>} Produto atualizado ou null se não encontrado
   */
  const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product | null> => {
    try {
      console.log('🔄 Atualizando produto:', id, updates);
      
      let updatedProduct: Product | null = null;
      setProducts(prev => prev.map(product => {
        if (product.id === id) {
          updatedProduct = { ...product, ...updates };
          return updatedProduct;
        }
        return product;
      }));
      
      if (updatedProduct) {
        console.log('✅ Produto atualizado com sucesso:', updatedProduct);
      }
      return updatedProduct;
    } catch (error) {
      console.error('❌ Erro ao atualizar produto:', error);
      throw error;
    }
  };

  /**
   * Deletar produto
   * 
   * TODO: BACKEND INTEGRATION - Esta função deve ser substituída por uma chamada de API
   * Exemplo:
   * await fetch(`/api/products/${id}`, {
   *   method: 'DELETE',
   *   headers: { Authorization: `Bearer ${token}` }
   * });
   * 
   * @param {string} id - ID do produto a ser deletado
   * @returns {Promise<boolean>} true se deletado com sucesso
   */
  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
      console.log('🗑️ Deletando produto:', id);
      
      setProducts(prev => prev.filter(product => product.id !== id));
      console.log('✅ Produto deletado com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro ao deletar produto:', error);
      throw error;
    }
  };

  /**
   * Buscar produto por ID
   * 
   * @param {string} id - ID do produto
   * @returns {Product | null} Produto encontrado ou null
   */
  const getProductById = (id: string): Product | null => {
    return products.find(p => p.id === id) || null;
  };

  /**
   * Recarregar produtos
   * 
   * TODO: BACKEND INTEGRATION - Esta função deve fazer uma nova chamada para a API
   * para buscar dados atualizados do servidor
   * 
   * @returns {Promise<void>}
   */
  const refreshProducts = async (): Promise<void> => {
    await loadProducts();
  };

  const value: ProductContextType = {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    refreshProducts
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};
