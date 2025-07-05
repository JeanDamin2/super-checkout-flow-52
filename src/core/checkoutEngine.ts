
// CAMADA DE LÓGICA DE NEGÓCIO (O Motor - A Fábrica)
// Esta camada NÃO PODE TER NENHUMA IMPORTAÇÃO DO REACT
// Função: Motor de cálculos que processa pedidos e aplica regras de negócio

export interface CartItem {
  id: string;
  name: string;
  price: number;
  type: 'main' | 'bump';
}

export interface OrderCalculationResult {
  subtotal: number;
  totalBumps: number;
  totalFinal: number;
  items: CartItem[];
  discounts?: number;
  taxes?: number;
}

/**
 * MOTOR DE CÁLCULO PRINCIPAL
 * Esta é a função central que processa um carrinho e retorna os totais calculados
 * REGRA DE OURO: Esta função não sabe nada sobre React ou componentes UI
 */
export const calculateOrder = (items: CartItem[]): OrderCalculationResult => {
  console.log('🏭 Motor de Cálculo: Processando pedido', items);
  
  // Separar produtos principais dos order bumps
  const mainProducts = items.filter(item => item.type === 'main');
  const orderBumps = items.filter(item => item.type === 'bump');
  
  // Calcular subtotal (produtos principais)
  const subtotal = mainProducts.reduce((total, item) => total + item.price, 0);
  
  // Calcular total dos order bumps
  const totalBumps = orderBumps.reduce((total, item) => total + item.price, 0);
  
  // Aplicar regras de negócio (exemplo: desconto para múltiplos order bumps)
  let discounts = 0;
  if (orderBumps.length >= 2) {
    discounts = totalBumps * 0.1; // 10% de desconto para 2+ order bumps
    console.log('🎯 Regra aplicada: Desconto de 10% para múltiplos order bumps');
  }
  
  // Calcular total final
  const totalFinal = subtotal + totalBumps - discounts;
  
  const result: OrderCalculationResult = {
    subtotal,
    totalBumps,
    totalFinal,
    items,
    discounts
  };
  
  console.log('💰 Resultado do cálculo:', result);
  return result;
};

/**
 * Função auxiliar para validar se um item pode ser adicionado ao carrinho
 */
export const validateCartItem = (item: CartItem): boolean => {
  return item.price > 0 && item.name.length > 0 && item.id.length > 0;
};

/**
 * Função para aplicar cupons de desconto (exemplo de extensibilidade)
 */
export const applyCoupon = (calculation: OrderCalculationResult, couponCode: string): OrderCalculationResult => {
  const validCoupons: Record<string, number> = {
    'DESCONTO10': 0.1,
    'PROMO20': 0.2,
    'BLACKFRIDAY': 0.3
  };
  
  const discountPercent = validCoupons[couponCode.toUpperCase()];
  if (!discountPercent) {
    return calculation;
  }
  
  const couponDiscount = calculation.totalFinal * discountPercent;
  const newDiscounts = (calculation.discounts || 0) + couponDiscount;
  
  return {
    ...calculation,
    discounts: newDiscounts,
    totalFinal: calculation.subtotal + calculation.totalBumps - newDiscounts
  };
};
