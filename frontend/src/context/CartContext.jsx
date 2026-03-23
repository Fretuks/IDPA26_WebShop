import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../services/api';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { token, logout } = useAuth();
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState(null);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [cartError, setCartError] = useState('');

  const count = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  useEffect(() => {
    let ignore = false;

    async function loadCart() {
      if (!token) {
        setCart(null);
        setItems([]);
        setCartError('');
        return;
      }

      setIsCartLoading(true);
      setCartError('');

      try {
        const nextCart = await api.getCart();
        if (!ignore) {
          setCart(nextCart);
          setItems(nextCart.items || []);
        }
      } catch (error) {
        if (!ignore) {
          if (error.status === 401) {
            logout();
          }
          setCartError(error.message);
        }
      } finally {
        if (!ignore) {
          setIsCartLoading(false);
        }
      }
    }

    loadCart();
    return () => {
      ignore = true;
    };
  }, [logout, token]);

  async function addToCart(productId, quantity = 1) {
    if (!token) {
      throw new Error('Bitte melde dich an, um Produkte in den Warenkorb zu legen.');
    }

    const nextCart = await api.addToCart(productId, quantity);
    setCart(nextCart);
    setItems(nextCart.items || []);
    setCartError('');
    return nextCart;
  }

  const value = {
    items,
    cart,
    count,
    addToCart,
    cartError,
    isCartLoading
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used inside CartProvider');
  }
  return context;
}
