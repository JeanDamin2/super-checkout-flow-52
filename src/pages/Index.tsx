
import { Layout } from '../components/Layout';

const Index = () => {
  const stats = [
    { label: 'Checkouts Ativos', value: '12', icon: '💳', color: 'text-green-400' },
    { label: 'Produtos Cadastrados', value: '8', icon: '📦', color: 'text-blue-400' },
    { label: 'Vendas Este Mês', value: 'R$ 24.300', icon: '💰', color: 'text-violet-400' },
    { label: 'Taxa de Conversão', value: '12.5%', icon: '📈', color: 'text-orange-400' },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-200 mb-4">
            Super Checkout Dashboard
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Crie páginas de checkout de alta conversão com design profissional
            e Order Bumps otimizados para maximizar suas vendas.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="sc-card p-6 text-center animate-fade-in">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                {stat.value}
              </div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="sc-card p-8">
          <h2 className="text-2xl font-bold text-gray-200 mb-6">🚀 Ações Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a
              href="/products"
              className="group p-6 bg-gray-700 rounded-lg border border-gray-600 hover:border-violet-500 transition-all duration-200 hover:bg-gray-600"
            >
              <div className="text-2xl mb-3 group-hover:scale-110 transition-transform">📦</div>
              <h3 className="text-lg font-semibold text-gray-200 mb-2">Gerenciar Produtos</h3>
              <p className="text-gray-400 text-sm">Adicione e configure seus produtos e order bumps</p>
            </a>

            <a
              href="/checkouts"
              className="group p-6 bg-gray-700 rounded-lg border border-gray-600 hover:border-violet-500 transition-all duration-200 hover:bg-gray-600"
            >
              <div className="text-2xl mb-3 group-hover:scale-110 transition-transform">💳</div>
              <h3 className="text-lg font-semibold text-gray-200 mb-2">Criar Checkout</h3>
              <p className="text-gray-400 text-sm">Configure suas páginas de venda com order bumps</p>
            </a>

            <a
              href="/checkout/chk_01"
              className="group p-6 bg-violet-900/30 rounded-lg border border-violet-700 hover:border-violet-500 transition-all duration-200 hover:bg-violet-900/50"
            >
              <div className="text-2xl mb-3 group-hover:scale-110 transition-transform">👀</div>
              <h3 className="text-lg font-semibold text-violet-300 mb-2">Ver Demo</h3>
              <p className="text-violet-400 text-sm">Teste uma página de checkout em funcionamento</p>
            </a>
          </div>
        </div>

        {/* Features Highlight */}
        <div className="sc-card p-8">
          <h2 className="text-2xl font-bold text-gray-200 mb-6">✨ Recursos Principais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="text-violet-400 text-xl">🎯</div>
                <div>
                  <h3 className="text-gray-200 font-semibold">Order Bumps Inteligentes</h3>
                  <p className="text-gray-400 text-sm">Aumente sua receita com ofertas complementares estratégicas</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="text-violet-400 text-xl">🎨</div>
                <div>
                  <h3 className="text-gray-200 font-semibold">Design Profissional</h3>
                  <p className="text-gray-400 text-sm">Templates otimizados para conversão com visual moderno</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="text-violet-400 text-xl">📊</div>
                <div>
                  <h3 className="text-gray-200 font-semibold">Analytics Avançado</h3>
                  <p className="text-gray-400 text-sm">Acompanhe suas métricas e otimize suas vendas</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="text-violet-400 text-xl">🔒</div>
                <div>
                  <h3 className="text-gray-200 font-semibold">Segurança Total</h3>
                  <p className="text-gray-400 text-sm">Processamento seguro com certificação SSL</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
