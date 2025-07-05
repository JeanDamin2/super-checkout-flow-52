import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckoutConfig, Order } from '@/api/mockDatabase';
import { OrderCalculationResult } from '@/core/checkoutEngine';
import { CustomerFormData, CreditCardData } from '@/types/checkout';
import { PAYMENT_METHODS, FORM_FIELDS } from '@/constants';
import { useOrderContext } from '@/context/OrderContext';
import { useCheckoutContext } from '@/context/CheckoutContext';
import { useProductContext } from '@/context/ProductContext';

interface UseCheckoutSubmissionProps {
  checkout: CheckoutConfig | null;
  orderCalculation: OrderCalculationResult | null;
  getGatewayById: (id: string) => any;
}

export const useCheckoutSubmission = ({
  checkout,
  orderCalculation,
  getGatewayById
}: UseCheckoutSubmissionProps) => {
  const navigate = useNavigate();
  const { addOrder } = useOrderContext();
  const { getProductById } = useProductContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const validateFormData = useCallback((formData: CustomerFormData, requiredFields: string[]) => {
    const missingFields = requiredFields.filter(field => {
      const fieldMap: Record<string, keyof CustomerFormData> = {
        [FORM_FIELDS.NAME]: 'nome',
        [FORM_FIELDS.EMAIL]: 'email', 
        [FORM_FIELDS.PHONE]: 'telefone',
        [FORM_FIELDS.CPF]: 'cpf'
      };
      return !formData[fieldMap[field]];
    });
    
    if (missingFields.length > 0) {
      throw new Error(`Preencha os seguintes campos obrigatórios: ${missingFields.join(', ')}`);
    }
  }, []);

  const validateCreditCardData = useCallback((creditCardData: CreditCardData) => {
    const requiredFields = ['numero', 'nome', 'cpf', 'validade', 'cvv'] as const;
    const missingFields = requiredFields.filter(field => !creditCardData[field]);
    
    if (missingFields.length > 0) {
      throw new Error('Preencha todos os campos do cartão de crédito');
    }
  }, []);

  const handleSubmit = useCallback(async (
    formData: CustomerFormData,
    creditCardData: CreditCardData,
    selectedPaymentMethod: string,
    selectedOrderBumps: string[]
  ) => {
    if (!checkout || !orderCalculation) {
      throw new Error('Dados do checkout não carregados');
    }

    if (!selectedPaymentMethod) {
      throw new Error('Selecione um método de pagamento');
    }

    setIsSubmitting(true);
    setPaymentError(null);

    try {
      // Validações específicas do cartão de crédito
      if (selectedPaymentMethod === PAYMENT_METHODS.CREDIT_CARD) {
        validateCreditCardData(creditCardData);
      }

      // Validar campos obrigatórios dinamicamente
      validateFormData(formData, checkout.requiredFormFields);

      // Simular processamento baseado no gateway
      const gateway = checkout.gatewayId ? getGatewayById(checkout.gatewayId) : null;
      
      console.log('🔄 Processando pagamento...');
      console.log('Gateway selecionado:', gateway ? gateway.name : 'Simulação');
      console.log('Método de pagamento:', selectedPaymentMethod);
      console.log('Total:', orderCalculation.totalFinal);

      // Simular delay de processamento
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simular erro aleatório para cartão de crédito (10% de chance)
      if (selectedPaymentMethod === PAYMENT_METHODS.CREDIT_CARD && Math.random() < 0.1) {
        throw new Error('Cartão recusado. Verifique os dados ou tente outro cartão.');
      }

      // Buscar dados dos produtos
      const mainProduct = getProductById(checkout.mainProductId);
      if (!mainProduct) {
        throw new Error('Produto principal não encontrado');
      }

      const orderBumpsProducts = selectedOrderBumps
        .map(id => getProductById(id))
        .filter(Boolean) as any[];

      // Criar o pedido
      const newOrder = addOrder({
        checkoutId: checkout.id,
        mainProduct,
        orderBumps: orderBumpsProducts,
        upsellProduct: null,
        totalAmount: orderCalculation.totalFinal,
        status: 'paid',
        customerData: {
          nome: formData.nome,
          email: formData.email,
          telefone: formData.telefone,
          cpf: formData.cpf
        }
      });

      console.log('✅ Pedido criado:', newOrder.id);

      // Verificar redirecionamento baseado no método de pagamento
      if (selectedPaymentMethod === PAYMENT_METHODS.PIX) {
        navigate(`/pix/${newOrder.id}`, {
          state: {
            orderData: {
              total: orderCalculation.totalFinal,
              items: orderCalculation.items,
              subtotal: orderCalculation.subtotal,
              totalBumps: orderCalculation.totalBumps,
              discounts: orderCalculation.discounts
            }
          }
        });
      } else if (selectedPaymentMethod === PAYMENT_METHODS.CREDIT_CARD) {
        // Para cartão, verificar se há upsell configurado
        if (checkout.upsellProductId) {
          console.log('🎯 Redirecionando para upsell:', checkout.upsellProductId);
          navigate(`/oferta-especial/${newOrder.id}`);
        } else {
          console.log('📄 Sem upsell, indo para página de obrigado');
          navigate(`/obrigado/${newOrder.id}`);
        }
      } else {
        // Boleto vai direto para obrigado
        navigate(`/obrigado/${newOrder.id}`);
      }
    } catch (error) {
      console.error('❌ Erro no processamento:', error);
      if (error instanceof Error) {
        setPaymentError(error.message);
      } else {
        setPaymentError('Erro inesperado ao processar pagamento');
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [checkout, orderCalculation, getGatewayById, navigate, validateCreditCardData, validateFormData, addOrder, getProductById]);

  return {
    isSubmitting,
    paymentError,
    handleSubmit,
    clearPaymentError: () => setPaymentError(null)
  };
};