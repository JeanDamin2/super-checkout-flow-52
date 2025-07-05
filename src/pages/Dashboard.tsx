import { Layout } from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Eye, QrCode, CreditCard, Barcode } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { mockOrders, getTotalRevenue, getOrdersByStatus, getOrdersByPaymentMethod, getSalesDataByHour } from '../api/mockOrders';

const Dashboard = () => {
  const totalRevenue = getTotalRevenue();
  const paidOrders = getOrdersByStatus('paid');
  const abandonedOrders = getOrdersByStatus('abandoned');
  const refundedOrders = getOrdersByStatus('refunded');
  const paymentMethodsData = getOrdersByPaymentMethod();
  const hourlyData = getSalesDataByHour();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      'pix': 'Pix',
      'cartao_credito': 'Cartão de crédito',
      'boleto': 'Boleto'
    };
    return labels[method] || method;
  };

  const getPaymentMethodIcon = (method: string) => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      'pix': QrCode,
      'cartao_credito': CreditCard,
      'boleto': Barcode
    };
    return iconMap[method] || CreditCard;
  };

  // Filter to show only the main payment methods
  const mainPaymentMethods = ['pix', 'cartao_credito', 'boleto'];
  const filteredPaymentMethods = Array.from(paymentMethodsData.entries())
    .filter(([method]) => mainPaymentMethods.includes(method));

  const chartConfig = {
    value: {
      label: "Vendas",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <div className="flex items-center space-x-2">
              <span className="text-slate-600 dark:text-gray-400">Produtos</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-slate-600 dark:text-gray-400">Período</span>
            <Select defaultValue="hoje">
              <SelectTrigger className="w-32 bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hoje">Hoje</SelectItem>
                <SelectItem value="7dias">Últimos 7 dias</SelectItem>
                <SelectItem value="30dias">Últimos 30 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-lg bg-gradient-to-b from-purple-500/10 to-transparent">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-gray-400">
                Vendas realizadas
              </CardTitle>
              <Eye className="h-4 w-4 text-slate-600 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totalRevenue)}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-lg bg-gradient-to-b from-purple-500/10 to-transparent">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-gray-400">
                Quantidade de vendas
              </CardTitle>
              <Eye className="h-4 w-4 text-slate-600 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {paidOrders.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Methods and Additional Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Methods Card */}
          <Card className="lg:col-span-2 rounded-lg border border-white/10 bg-white/5 backdrop-blur-lg bg-gradient-to-b from-purple-500/10 to-transparent">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-gray-400">
                  Meios de Pagamento
                </CardTitle>
                <div className="flex space-x-4 text-xs text-slate-600 dark:text-gray-400">
                  <span>Conversão</span>
                  <span>Valor</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredPaymentMethods.map(([method, data]) => {
                const IconComponent = getPaymentMethodIcon(method);
                return (
                  <div key={method} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <IconComponent className="h-5 w-5 text-slate-600 dark:text-gray-400" />
                      <span className="text-gray-900 dark:text-white">{getPaymentMethodLabel(method)}</span>
                    </div>
                    <div className="flex items-center space-x-8">
                      <span className="text-slate-600 dark:text-gray-400">0%</span>
                      <span className="text-gray-900 dark:text-white">{formatCurrency(data.total)}</span>
                      <Eye className="h-4 w-4 text-slate-600 dark:text-gray-400" />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Additional Metrics Card */}
          <Card className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-lg bg-gradient-to-b from-purple-500/10 to-transparent">
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-gray-400">Abandono C.</span>
                  <Eye className="h-4 w-4 text-slate-600 dark:text-gray-400" />
                </div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">{abandonedOrders.length}</div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-gray-400">Reembolso</span>
                  <Eye className="h-4 w-4 text-slate-600 dark:text-gray-400" />
                </div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">{refundedOrders.length}%</div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-gray-400">Charge Back</span>
                  <Eye className="h-4 w-4 text-slate-600 dark:text-gray-400" />
                </div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">0%</div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-gray-400">MED</span>
                  <Eye className="h-4 w-4 text-slate-600 dark:text-gray-400" />
                </div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">0%</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sales Chart */}
        <Card className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-lg bg-gradient-to-b from-purple-500/10 to-transparent">
          <CardContent className="pt-6">
            <ChartContainer config={chartConfig} className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="hour" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    cursor={{ stroke: "hsl(var(--border))" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;