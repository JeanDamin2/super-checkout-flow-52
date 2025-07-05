
import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PixPayment = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const location = useLocation();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  // Obter dados do pedido passados via state
  const orderData = location.state?.orderData;
  const valorTotal = orderData?.total || 197.00; // fallback para valor padrão
  
  // Código PIX simulado
  const pixCode = "00020126330014BR.GOV.BCB.PIX0111123456789015204000053039865802BR5925SUPER CHECKOUT LTDA ME6014SAO PAULO61089999999962070503***63048C5A";
  
  // QR Code simulado (placeholder)
  const qrCodeUrl = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2ZmZiIvPgogIDx0ZXh0IHg9IjEwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxNHB4Ij5RUiBDb2RlIFBJWDwvdGV4dD4KICA8cmVjdCB4PSI0MCIgeT0iNDAiIHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4=";

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      toast({
        title: "Código copiado!",
        description: "O código PIX foi copiado para a área de transferência."
      });
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o código.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-400 to-emerald-600 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white shadow-2xl rounded-3xl overflow-hidden">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-full mb-4">
                <Check className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Pix gerado com sucesso</h1>
              <p className="text-gray-600">Pague seu pix com os dados abaixo e a compensação será em alguns segundos.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                  <img src={qrCodeUrl} alt="QR Code Pix" className="w-48 h-48"/>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-gray-700 text-sm">Escaneie o QR Code ou aperte em Copiar Código Pix</p>
                    <p className="text-gray-500 text-xs mt-1">O código será automaticamente copiado em seu dispositivo.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-gray-700 text-sm">Abra o app do seu banco</p>
                    <p className="text-gray-500 text-xs mt-1">Selecione a opção Pix copia e cola e cole o código copiado.</p>
                  </div>
                </div>
                <Button 
                  onClick={handleCopyCode} 
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? 'Código copiado! ✅' : 'Clique aqui para copiar o código pix'}
                </Button>
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Aguardando pagamento...</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              {orderData?.items && (
                <div className="space-y-2 mb-4">
                  {orderData.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">{item.name}</span>
                      <span className="text-gray-700">R$ {item.price.toFixed(2).replace('.', ',')}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mt-2">
                  <span className="text-lg font-bold text-gray-700">Total:</span>
                  <span className="text-xl font-bold" style={{ color: '#10B981' }}>
                    R$ {valorTotal.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
              <div className="text-right mt-2">
                <Button variant="outline" size="sm" className="text-xs">Imprimir</Button>
              </div>
            </div>

            <div className="bg-gray-100 rounded-lg p-4 text-center">
              <h3 className="font-semibold text-gray-900 mb-2">Precisa de ajuda?</h3>
              <p className="text-sm text-gray-600 mb-1">Entre em contato com o produtor.</p>
              <div className="text-sm">
                <p className="font-medium text-gray-700">Nome: SUPER CHECKOUT LTDA ME</p>
                <p className="text-gray-700">E-mail: contato@supercheckout.com</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PixPayment;
