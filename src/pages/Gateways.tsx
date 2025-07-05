
import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Settings, Trash2 } from 'lucide-react';
import { useGatewayContext } from '@/context/GatewayContext';
import { useToast } from '@/hooks/use-toast';

const Gateways = () => {
  const { gateways, addGateway, deleteGateway } = useGatewayContext();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    publicKey: '',
    accessToken: ''
  });

  const handleConnect = () => {
    if (!formData.publicKey || !formData.accessToken) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const newGateway = addGateway({
      name: 'Mercado Pago',
      type: 'mercado_pago',
      status: 'conectado',
      credentials: {
        publicKey: formData.publicKey,
        accessToken: formData.accessToken
      }
    });

    toast({
      title: "Sucesso",
      description: "Mercado Pago conectado com sucesso!"
    });

    setFormData({ publicKey: '', accessToken: '' });
    setIsModalOpen(false);
  };

  const handleDisconnect = (gatewayId: string) => {
    const confirmed = window.confirm('Tem certeza que deseja desconectar este gateway?');
    if (confirmed) {
      deleteGateway(gatewayId);
      toast({
        title: "Gateway desconectado",
        description: "O gateway foi desconectado com sucesso."
      });
    }
  };

  const mercadoPagoGateway = gateways.find(g => g.type === 'mercado_pago');

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Gateways de Pagamento</h1>
          <p className="text-gray-400 mt-2">
            Configure os processadores de pagamento para seus checkouts
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Mercado Pago Card */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Mercado Pago</CardTitle>
                    <p className="text-gray-400 text-sm">Gateway de pagamento</p>
                  </div>
                </div>
                {mercadoPagoGateway && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    ✅ Conectado
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300 text-sm">
                Processe pagamentos via PIX, cartão de crédito e boleto usando a API do Mercado Pago.
              </p>
              
              {mercadoPagoGateway ? (
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Configurar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDisconnect(mercadoPagoGateway.id)}
                    className="border-red-600 text-red-400 hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      Conectar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-800 border-gray-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">Conectar Mercado Pago</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label className="text-gray-300">Public Key</Label>
                        <Input
                          type="text"
                          placeholder="APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                          value={formData.publicKey}
                          onChange={(e) => setFormData(prev => ({ ...prev, publicKey: e.target.value }))}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300">Access Token</Label>
                        <Input
                          type="password"
                          placeholder="APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                          value={formData.accessToken}
                          onChange={(e) => setFormData(prev => ({ ...prev, accessToken: e.target.value }))}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button 
                          variant="ghost" 
                          onClick={() => setIsModalOpen(false)}
                          className="text-gray-400 hover:text-white"
                        >
                          Cancelar
                        </Button>
                        <Button 
                          onClick={handleConnect}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Conectar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>

          {/* Placeholder para outros gateways */}
          <Card className="bg-gray-800 border-gray-700 opacity-50">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <CardTitle className="text-gray-400">PagSeguro</CardTitle>
                  <p className="text-gray-500 text-sm">Em breve</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button disabled className="w-full">
                Em breve
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700 opacity-50">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <CardTitle className="text-gray-400">Stripe</CardTitle>
                  <p className="text-gray-500 text-sm">Em breve</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button disabled className="w-full">
                Em breve
              </Button>
            </CardContent>
          </Card>
        </div>

        {mercadoPagoGateway && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Gateway Conectado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Gateway</Label>
                  <p className="text-white font-medium">{mercadoPagoGateway.name}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Status</Label>
                  <p className="text-green-400 font-medium">Conectado</p>
                </div>
                <div>
                  <Label className="text-gray-300">Public Key</Label>
                  <p className="text-gray-400 font-mono text-sm">
                    {mercadoPagoGateway.credentials.publicKey.substring(0, 20)}...
                  </p>
                </div>
                <div>
                  <Label className="text-gray-300">Conectado em</Label>
                  <p className="text-gray-400">{mercadoPagoGateway.createdAt}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Gateways;
