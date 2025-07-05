
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useCheckoutContext } from '@/context/CheckoutContext';
import { useProductContext } from '@/context/ProductContext';
import { useGatewayContext } from '@/context/GatewayContext';
import { CheckoutPadraoUI } from '@/components/CheckoutPadraoUI';
import { CheckoutLoading, CheckoutNotFound, CheckoutUnavailable } from '@/components/checkout/CheckoutStates';
import { useCheckoutData } from '@/hooks/useCheckoutData';
import { useCheckoutCalculation } from '@/hooks/useCheckoutCalculation';
import { useCheckoutSubmission } from '@/hooks/useCheckoutSubmission';
import { usePublicCheckoutState } from '@/hooks/usePublicCheckoutState';
import { useGlobalSettings } from '@/hooks/useGlobalSettings';
import { useCheckoutFooterConfig } from '@/components/checkout/CheckoutFooterConfig';
import { CHECKOUT_STATUS } from '@/constants';

const PublicCheckout = () => {
  const { checkoutId } = useParams<{ checkoutId: string }>();
  console.log('🌐 PublicCheckout: checkoutId recebido:', checkoutId);
  
  const { getCheckoutById, loading: contextLoading } = useCheckoutContext();
  const { getProductById } = useProductContext();
  const { getGatewayById } = useGatewayContext();
  
  console.log('🔧 Funções do contexto carregadas:', {
    getCheckoutById: typeof getCheckoutById,
    getProductById: typeof getProductById,
    contextLoading
  });
  
  // Hook personalizado para estado do checkout
  const {
    formData,
    selectedPaymentMethod,
    selectedOrderBumps,
    selectedInstallments,
    creditCardData,
    orderCalculation,
    setSelectedPaymentMethod,
    setSelectedInstallments,
    setOrderCalculation,
    handleFormDataChange,
    handleCreditCardDataChange,
    handleOrderBumpToggle
  } = usePublicCheckoutState();

  // Hook para configurações globais
  const { globalSettings, loading: settingsLoading } = useGlobalSettings();
  
  // Log para debugging - mostrar quando as configurações são atualizadas
  useEffect(() => {
    if (globalSettings) {
      console.log('🔄 PublicCheckout: Configurações globais carregadas/atualizadas:', {
        exibirInformacoesLegais: globalSettings.footer.exibirInformacoesLegais,
        linkTermosCompra: globalSettings.footer.linkTermosCompra ? 'DEFINIDO' : 'VAZIO',
        linkPoliticaPrivacidade: globalSettings.footer.linkPoliticaPrivacidade ? 'DEFINIDO' : 'VAZIO',
        lastUpdated: globalSettings.lastUpdated
      });
    } else {
      console.log('⏳ PublicCheckout: Aguardando configurações globais...');
    }
  }, [globalSettings]);

  // Carregar dados usando hook customizado
  const { loading, error, checkout, mainProduct, orderBumps } = useCheckoutData({
    checkoutId,
    getCheckoutById,
    getProductById,
    contextLoading
  });

  // Calcular pedido usando hook customizado
  useCheckoutCalculation({
    mainProduct,
    orderBumps,
    selectedOrderBumps,
    onCalculationUpdate: setOrderCalculation
  });

  // Submissão usando hook customizado
  const { isSubmitting, paymentError, handleSubmit, clearPaymentError } = useCheckoutSubmission({
    checkout,
    orderCalculation,
    getGatewayById
  });

  // Configurações do footer - Reativo às mudanças
  const footerConfig = useCheckoutFooterConfig({ globalSettings });

  // Handler para submissão do formulário
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await handleSubmit(formData, creditCardData, selectedPaymentMethod, selectedOrderBumps);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('Erro inesperado ao processar pagamento');
      }
    }
  };

  // Estados de loading e erro
  if (contextLoading || loading || settingsLoading) {
    return <CheckoutLoading />;
  }

  if (error || !checkout || !mainProduct) {
    return <CheckoutNotFound message={error || "Checkout não encontrado"} />;
  }

  // Verificar se o checkout está ativo
  if (checkout.status !== CHECKOUT_STATUS.ACTIVE) {
    return <CheckoutUnavailable />;
  }

  // Log final antes de renderizar
  console.log('🎯 PublicCheckout: Renderizando com footer config:', {
    exibirInformacoesLegais: footerConfig.exibirInformacoesLegais,
    hasTermosLink: !!footerConfig.linkTermosCompra,
    hasPrivacidadeLink: !!footerConfig.linkPoliticaPrivacidade
  });

  // Usar o componente de UI personalizado
  return (
    <CheckoutPadraoUI
      // Dados do produto
      productName={mainProduct.name}
      productPrice={mainProduct.price}
      productImage={mainProduct.image || "/placeholder.svg"}
      
      // Order Bumps
      orderBumps={orderBumps.map(bump => ({
        id: bump.id,
        name: bump.name,
        description: bump.description || 'Produto adicional para complementar sua compra',
        price: bump.price,
        image: bump.image
      }))}
      selectedOrderBumps={selectedOrderBumps}
      onOrderBumpToggle={handleOrderBumpToggle}
      
      // Métodos de pagamento
      selectedPaymentMethod={selectedPaymentMethod}
      onPaymentMethodSelect={setSelectedPaymentMethod}
      allowedPaymentMethods={checkout.paymentMethods}
      
      // Configurações do formulário
      requiredFormFields={checkout.requiredFormFields}
      formData={formData}
      onFormDataChange={handleFormDataChange}
      
      // Dados do cartão
      creditCardData={creditCardData}
      onCreditCardDataChange={handleCreditCardDataChange}
      
      // Parcelamento
      selectedInstallments={selectedInstallments}
      onInstallmentsChange={setSelectedInstallments}
      
      // Cálculos
      orderCalculation={orderCalculation}
      
      // Estados de UI
      isSubmitting={isSubmitting}
      paymentError={paymentError}
      onClearPaymentError={clearPaymentError}
      
      // Configurações opcionais
      bannerUrl={undefined}
      headerImageUrl={checkout.headerImageUrl || undefined}
      timerConfig={checkout.timerConfig || undefined}
      footerConfig={footerConfig}
      
      // Callbacks
      onSubmit={handleFormSubmit}
    />
  );
};

export default PublicCheckout;
