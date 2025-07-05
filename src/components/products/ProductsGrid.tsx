import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from './ProductCard';
import { Product, CheckoutConfig } from '@/api/mockDatabase';

interface ProductFunction {
  isPrincipal: boolean;
  isOrderbump: boolean;
  isUpsell: boolean;
}

interface ProductsGridProps {
  products: Product[];
  checkouts: CheckoutConfig[];
  searchTerm: string;
  onDelete: (id: string) => void;
}

export const ProductsGrid = ({ products, checkouts, searchTerm, onDelete }: ProductsGridProps) => {
  const getProductFunctions = (productId: string): ProductFunction => {
    const functions = {
      isPrincipal: false,
      isOrderbump: false,
      isUpsell: false
    };

    checkouts.forEach(checkout => {
      if (checkout.mainProductId === productId) {
        functions.isPrincipal = true;
      }
      if (checkout.allowedOrderBumps.includes(productId)) {
        functions.isOrderbump = true;
      }
      if (checkout.upsellProductId === productId) {
        functions.isUpsell = true;
      }
    });

    return functions;
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filteredProducts.length === 0 && searchTerm) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          Nenhum produto encontrado
        </div>
        <Link to="/products/new">
          <Button className="bg-violet-600 hover:bg-violet-700">
            <Plus className="w-4 h-4 mr-2" />
            Criar Primeiro Produto
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredProducts.map((product) => {
        const functions = getProductFunctions(product.id);
        
        return (
          <ProductCard 
            key={product.id}
            product={product}
            functions={functions}
            onDelete={onDelete}
          />
        );
      })}
    </div>
  );
};