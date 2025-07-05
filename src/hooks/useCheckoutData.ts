
import { useState, useEffect } from 'react';
import { CheckoutConfig, Product } from '@/api/mockDatabase';
import { ERROR_MESSAGES } from '@/constants';

interface UseCheckoutDataProps {
  checkoutId: string | undefined;
  getCheckoutById: (id: string) => CheckoutConfig | null;
  getProductById: (id: string) => Product | null;
  contextLoading: boolean;
}

export const useCheckoutData = ({
  checkoutId,
  getCheckoutById,
  getProductById,
  contextLoading
}: UseCheckoutDataProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkout, setCheckout] = useState<CheckoutConfig | null>(null);
  const [mainProduct, setMainProduct] = useState<Product | null>(null);
  const [orderBumps, setOrderBumps] = useState<Product[]>([]);

  useEffect(() => {
    const loadCheckoutData = async () => {
      // Aguardar o contexto carregar primeiro
      if (contextLoading) {
        return;
      }

      if (!checkoutId) {
        console.error('❌ ID do checkout não fornecido');
        setError('ID do checkout não fornecido');
        setLoading(false);
        return;
      }

      try {
        console.log('🔄 Carregando dados do checkout ID:', checkoutId);
        console.log('🔍 Função getCheckoutById recebida:', typeof getCheckoutById);
        
        const checkoutData = getCheckoutById(checkoutId);
        console.log('🔍 Resultado da busca:', checkoutData);
        console.log('🔍 Tipo do resultado:', typeof checkoutData);
        
        if (!checkoutData) {
          console.error('❌ Checkout não encontrado para ID:', checkoutId);
          setError(ERROR_MESSAGES.CHECKOUT_NOT_FOUND);
          return;
        }

        console.log('✅ Checkout encontrado:', checkoutData.name);
        console.log('🔍 mainProductId:', checkoutData.mainProductId);
        setCheckout(checkoutData);

        // Carregar produto principal
        if (!checkoutData.mainProductId) {
          console.error('❌ mainProductId está vazio no checkout');
          setError('Produto principal não definido no checkout');
          return;
        }

        const product = getProductById(checkoutData.mainProductId);
        console.log('🔍 Buscando produto ID:', checkoutData.mainProductId);
        console.log('🎯 Produto encontrado:', product);
        
        if (!product) {
          console.error('❌ Produto principal não encontrado para ID:', checkoutData.mainProductId);
          setError('Produto principal não encontrado');
          return;
        }
        setMainProduct(product);

        // Carregar order bumps
        const bumpsData = checkoutData.allowedOrderBumps
          .map(bumpId => {
            const bump = getProductById(bumpId);
            console.log(`🔍 Order bump ${bumpId}:`, bump);
            return bump;
          })
          .filter(Boolean) as Product[];
        setOrderBumps(bumpsData);

        console.log('✅ Dados carregados com sucesso');
        console.log('📦 Produto principal:', product.name);
        console.log('🎁 Order bumps:', bumpsData.map(b => b.name));
      } catch (error) {
        console.error('❌ Erro ao carregar checkout:', error);
        setError(ERROR_MESSAGES.CHECKOUT_LOAD_ERROR);
      } finally {
        setLoading(false);
      }
    };

    loadCheckoutData();
  }, [checkoutId, getCheckoutById, getProductById, contextLoading]);

  return {
    loading,
    error,
    checkout,
    mainProduct,
    orderBumps
  };
};
