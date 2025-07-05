import { useState } from 'react';
import { CustomerFormData, CreditCardData } from '@/types/checkout';
import { OrderCalculationResult } from '@/core/checkoutEngine';

export const usePublicCheckoutState = () => {
  // Estados do formulário
  const [formData, setFormData] = useState<CustomerFormData>({
    nome: '',
    email: '',
    telefone: '',
    cpf: ''
  });

  // Estados dos métodos de pagamento
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [selectedOrderBumps, setSelectedOrderBumps] = useState<string[]>([]);
  const [selectedInstallments, setSelectedInstallments] = useState<number>(1);

  // Dados do cartão de crédito
  const [creditCardData, setCreditCardData] = useState<CreditCardData>({
    numero: '',
    nome: '',
    cpf: '',
    validade: '',
    cvv: ''
  });
  
  // Estado do cálculo
  const [orderCalculation, setOrderCalculation] = useState<OrderCalculationResult | null>(null);

  // Handlers para o componente UI
  const handleFormDataChange = (field: keyof CustomerFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreditCardDataChange = (field: keyof CreditCardData, value: string) => {
    setCreditCardData(prev => ({ ...prev, [field]: value }));
  };

  const handleOrderBumpToggle = (bumpId: string) => {
    console.log('🎯 Toggle order bump:', bumpId);
    
    setSelectedOrderBumps(prev => {
      const isSelected = prev.includes(bumpId);
      const newSelection = isSelected 
        ? prev.filter(id => id !== bumpId)
        : [...prev, bumpId];
      
      console.log('📋 Bumps selecionados:', newSelection);
      return newSelection;
    });
  };

  return {
    // States
    formData,
    selectedPaymentMethod,
    selectedOrderBumps,
    selectedInstallments,
    creditCardData,
    orderCalculation,
    
    // Setters
    setSelectedPaymentMethod,
    setSelectedInstallments,
    setOrderCalculation,
    
    // Handlers
    handleFormDataChange,
    handleCreditCardDataChange,
    handleOrderBumpToggle
  };
};