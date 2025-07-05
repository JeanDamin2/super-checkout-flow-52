
/**
 * CheckoutContext - Context de Gerenciamento de Checkouts
 * 
 * TODO: BACKEND INTEGRATION - Substituir localStorage por APIs RESTful
 * Endpoints necessários: GET/POST/PUT/DELETE /api/checkouts
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CheckoutConfig, Product } from '@/api/mockDatabase';
import { useProductContext } from './ProductContext';
import { useCheckoutStorage } from '@/hooks/useCheckoutStorage';

interface CheckoutContextType {
  checkouts: CheckoutConfig[];
  products: Product[];
  addCheckout: (checkout: Omit<CheckoutConfig, 'id' | 'createdAt'>) => CheckoutConfig;
  updateCheckout: (id: string, updates: Partial<CheckoutConfig>) => CheckoutConfig | null;
  deleteCheckout: (id: string) => boolean;
  getCheckoutById: (id: string) => CheckoutConfig | null;
  getProductById: (id: string) => Product | null;
  loading: boolean;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export const useCheckoutContext = () => {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error('useCheckoutContext must be used within a CheckoutProvider');
  }
  return context;
};

interface CheckoutProviderProps {
  children: ReactNode;
}

export const CheckoutProvider: React.FC<CheckoutProviderProps> = ({ children }) => {
  const { products } = useProductContext();
  const [checkouts, setCheckouts] = useState<CheckoutConfig[]>([]);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { getUserData, getAllCheckouts, saveUserData } = useCheckoutStorage();

  // Inicializar checkouts na montagem do componente
  useEffect(() => {
    const initializeCheckouts = () => {
      const userEmail = localStorage.getItem('currentUserEmail');
      console.log('🔄 Inicializando checkouts, usuário:', userEmail);
      
      if (userEmail) {
        // Usuário logado - carregar seus checkouts
        setCurrentUserEmail(userEmail);
        const userCheckouts = getUserData(userEmail);
        setCheckouts(userCheckouts);
        console.log('👤 Checkouts carregados para usuário logado:', userEmail, userCheckouts.length);
      } else {
        // Página pública - carregar todos os checkouts
        setCurrentUserEmail('guest');
        const allCheckouts = getAllCheckouts();
        setCheckouts(allCheckouts);
        console.log('🌐 Checkouts carregados para páginas públicas:', allCheckouts.length);
      }
      
      setLoading(false);
    };

    initializeCheckouts();
  }, []);

  // Recarregar quando o usuário mudar
  useEffect(() => {
    const userEmail = localStorage.getItem('currentUserEmail');
    
    if (userEmail && userEmail !== currentUserEmail && currentUserEmail !== null) {
      console.log('🔄 Usuário mudou, recarregando checkouts:', userEmail);
      setCurrentUserEmail(userEmail);
      const userCheckouts = getUserData(userEmail);
      setCheckouts(userCheckouts);
    }
  }, [currentUserEmail]);

  // Salvar checkouts no localStorage sempre que houver mudanças
  useEffect(() => {
    if (currentUserEmail && currentUserEmail !== 'guest' && checkouts.length > 0 && !loading) {
      saveUserData(currentUserEmail, checkouts);
    }
  }, [checkouts, currentUserEmail, loading]);

  const addCheckout = (checkoutData: Omit<CheckoutConfig, 'id' | 'createdAt'>): CheckoutConfig => {
    console.log('🔧 Contexto: Recebendo dados para criar checkout:', checkoutData);
    
    // Validar se mainProductId está presente
    if (!checkoutData.mainProductId || checkoutData.mainProductId === '') {
      console.error('❌ Erro: mainProductId está vazio ou undefined:', checkoutData.mainProductId);
      throw new Error('ID do produto principal é obrigatório');
    }
    
    const newCheckout: CheckoutConfig = {
      ...checkoutData,
      gatewayId: checkoutData.gatewayId || null,
      id: `chk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    console.log('🆔 Contexto: Checkout criado com ID:', newCheckout.id);
    console.log('🔍 Produto principal ID:', newCheckout.mainProductId);
    console.log('🌐 Link público será:', `/checkout/${newCheckout.id}`);
    
    setCheckouts(prev => {
      const updatedList = [...prev, newCheckout];
      console.log('📋 Total de checkouts após adicionar:', updatedList.length);
      console.log('📋 IDs dos checkouts:', updatedList.map(c => c.id));
      return updatedList;
    });
    return newCheckout;
  };

  const updateCheckout = (id: string, updates: Partial<CheckoutConfig>): CheckoutConfig | null => {
    let updatedCheckout: CheckoutConfig | null = null;
    
    setCheckouts(prev => {
      const newCheckouts = prev.map(checkout => {
        if (checkout.id === id) {
          updatedCheckout = { ...checkout, ...updates };
          return updatedCheckout;
        }
        return checkout;
      });
      console.log('🔄 Checkout atualizado no contexto');
      return newCheckouts;
    });
    
    return updatedCheckout;
  };

  const deleteCheckout = (id: string): boolean => {
    let wasDeleted = false;
    
    setCheckouts(prev => {
      const index = prev.findIndex(c => c.id === id);
      if (index !== -1) {
        wasDeleted = true;
        const newCheckouts = prev.filter(c => c.id !== id);
        console.log('🗑️ Checkout removido do contexto');
        return newCheckouts;
      }
      return prev;
    });
    
    return wasDeleted;
  };

  const getCheckoutById = (id: string): CheckoutConfig | null => {
    console.log('🔍 Buscando checkout por ID:', id);
    console.log('📋 Lista atual de checkouts:', checkouts.map(c => ({ id: c.id, name: c.name, mainProductId: c.mainProductId })));
    const found = checkouts.find(c => c.id === id) || null;
    if (found) {
      console.log('🎯 Checkout encontrado:', `${found.id} - ${found.name} - Produto: ${found.mainProductId}`);
    } else {
      console.log('❌ Checkout não encontrado para ID:', id);
    }
    return found;
  };

  const getProductById = (id: string): Product | null => {
    return products.find(p => p.id === id) || null;
  };

  const value: CheckoutContextType = {
    checkouts,
    products,
    addCheckout,
    updateCheckout,
    deleteCheckout,
    getCheckoutById,
    getProductById,
    loading
  };

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
};
