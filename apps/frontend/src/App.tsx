import { useState, useEffect } from 'react';
import type { View, Product, CartItem } from './types';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import CartDrawer from './components/cart/CartDrawer';
import HomeView from './views/HomeView';
import ProductView from './views/ProductView';
import CheckoutView from './views/CheckoutView';
import SuccessView from './views/SuccessView';
import LoginView from './views/LoginView';
import RegisterView from './views/RegisterView';
import AddressView from './views/AddressView';
import { useAuth } from './context/AuthContext';
import SettingsView from './views/SettingsView';
import StoreView from './views/StoreView';
import Newsletter from './components/common/Newsletter';
import OrdersView from './views/OrdersView';
import WishlistView from './views/WishlistView';
import ModerationView from './views/admin/ModerationView';
import ReturnsView from './views/ReturnsView';
import PrivacyView from './views/PrivacyView';
import TermsView from './views/TermsView';

export default function App() {
  const { isAuthenticated } = useAuth();

  const [view, setView] = useState<View>(() => {
    const saved = localStorage.getItem('app_view');
    return (saved as View) || 'home';
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [lastOrder, setLastOrder] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('app_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('app_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('app_view', view);
  }, [view]);

  const addToCart = (product: Product, colorIdx: number, quantity: number = 1) => {
    const color = product.colors?.[colorIdx] || { name: 'Padrão', img: '', stockId: '', hex: '' };
    const cartId = `${product.id}-${color.name}`;

    setCart(prev => {
      const exists = prev.find(i => i.cartId === cartId);
      if (exists) {
        return prev.map(i => i.cartId === cartId ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, {
        cartId, id: product.id, name: product.name, price: product.price,
        quantity, selectedColor: color.name, img: color.img, stockId: color.stockId
      }];
    });
    setIsCartOpen(true);
  };

  const updateQty = (cartId: string, delta: number) => {
    setCart(prev => prev.map(item =>
      item.cartId === cartId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const removeFromCart = (cartId: string) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
  };

  const clearCart = () => setCart([]);

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shippingCost = subtotal > 0 ? 15.90 : 0;
  const total = subtotal + shippingCost;

  const navigateToProduct = (product: Product) => {
    setSelectedProduct(product);
    setView('product');
    window.scrollTo(0, 0);
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    if (!isAuthenticated) {
      setView('login');
    } else {
      setView('checkout');
    }
  };

  return (
    <div className="min-h-screen bg-white selection:bg-blue-100 selection:text-blue-900">
      <Header
        cart={cart}
        onViewChange={setView}
        onOpenCart={() => setIsCartOpen(true)}
        onSearch={setSearchQuery}
        onCategorySelect={setActiveCategory}
      />

      <main>
        {view === 'home' && (
          <HomeView
            onProductClick={navigateToProduct}
            onCategorySelect={(cat) => {
              setActiveCategory(cat);
              setView('store');
            }}
          />
        )}

        {view === 'store' && (
          <StoreView
            onProductClick={navigateToProduct}
            searchQuery={searchQuery}
            activeCategory={activeCategory}
          />
        )}

        {view === 'product' && selectedProduct && (
          <ProductView
            product={selectedProduct}
            onBack={() => setView('home')}
            onAddToCart={addToCart}
          />
        )}

        {view === 'login' && (
          <LoginView
            onNavigate={setView}
            onSuccess={() => setView('home')}
          />
        )}

        {view === 'register' && (
          <RegisterView
            onNavigate={setView}
            onSuccess={() => setView('login')}
          />
        )}

        {view === 'addresses' && (
          <AddressView />
        )}

        {view === 'orders' && (
          <OrdersView />
        )}

        {view === 'wishlist' && (
          <WishlistView onProductClick={navigateToProduct} />
        )}

        {view === 'checkout' && (
          <CheckoutView
            cart={cart}
            subtotal={subtotal}
            shippingCost={shippingCost}
            total={total}
            onClearCart={clearCart}
            onSuccess={(orderData) => {
              setLastOrder(orderData);
              setView('success');
            }}
            onNavigate={setView}
          />
        )}

        {view === 'success' && (
          <SuccessView
            order={lastOrder}
            onGoHome={() => setView('home')}
          />
        )}

        {(view === 'profile' || view === 'admin-dashboard') && (
          <SettingsView />
        )}

        {view === 'moderation' && (
          <ModerationView onBack={() => setView('admin-dashboard')} />
        )}

        {view === 'returns' && <ReturnsView />}
        {view === 'privacy' && <PrivacyView />}
        {view === 'terms' && <TermsView />}
      </main>

      <Newsletter />
      <Footer onViewChange={setView} />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQty={updateQty}
        onRemove={removeFromCart}
        onCheckout={handleCheckout}
        subtotal={subtotal}
      />
    </div>
  );
}