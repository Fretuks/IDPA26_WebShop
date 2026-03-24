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
  const total = useMemo(() => Number(cart?.totalAmount || 0), [cart]);

  function applyCart(nextCart) {
    setCart(nextCart);
    setItems(nextCart?.items || []);
  }

  async function fetchCart() {
    if (!token) {
      applyCart(null);
      setCartError('');
      return null;
    }

    setIsCartLoading(true);
    setCartError('');

    try {
      const nextCart = await api.getCart();
      applyCart(nextCart);
      return nextCart;
    } catch (error) {
      if (error.status === 401) {
        logout();
      }
      setCartError(error.message);
      throw error;
    } finally {
      setIsCartLoading(false);
    }
  }

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
          applyCart(nextCart);
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
    applyCart(nextCart);
    setCartError('');
    return nextCart;
  }

  async function updateItem(itemId, quantity) {
    const nextCart = await api.updateCartItem(itemId, quantity);
    applyCart(nextCart);
    setCartError('');
    return nextCart;
  }

  async function removeItem(itemId) {
    const nextCart = await api.removeCartItem(itemId);
    applyCart(nextCart);
    setCartError('');
    return nextCart;
  }

  function clearCart() {
    applyCart(cart ? { ...cart, totalAmount: 0, items: [] } : null);
    setCartError('');
  }

  const value = {
    items,
    cart,
    count,
    total,
    addToCart,
    updateItem,
    removeItem,
    clearCart,
    fetchCart,
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
