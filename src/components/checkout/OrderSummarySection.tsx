
import { OrderCalculationResult } from '@/core/checkoutEngine';

interface OrderSummarySectionProps {
  orderCalculation: OrderCalculationResult;
  selectedPaymentMethod: string;
  selectedInstallments: number;
}

export const OrderSummarySection = ({
  orderCalculation,
  selectedPaymentMethod,
  selectedInstallments
}: OrderSummarySectionProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <div className="checkout-padrao-order-summary">
      <div className="checkout-padrao-summary-content">
        <span className="checkout-padrao-summary-label">Total</span>
        <div className="checkout-padrao-summary-values">
          <div className="checkout-padrao-summary-total">
            Valor total: <span className="checkout-padrao-value-amount">{formatPrice(orderCalculation.totalFinal)}</span>
          </div>
          {selectedPaymentMethod === 'cartao' && selectedInstallments > 1 && (
            <div className="checkout-padrao-summary-installments">
              <span className="checkout-padrao-installment-amount">{selectedInstallments}x de {formatPrice(orderCalculation.totalFinal / selectedInstallments)}</span>
            </div>
          )}
          {(selectedPaymentMethod === 'pix' || selectedPaymentMethod === 'boleto') && (
            <div className="checkout-padrao-summary-installments">
              <span className="checkout-padrao-installment-amount">à vista</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
