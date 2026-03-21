import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

const CartContext = createContext(null);

const TOKEN_KEY = 'webshop_token';
const USER_KEY = 'webshop_user';

function readStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function CartProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(readStoredUser);
  const [cart, setCart] = useState(null);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [cartError, setCartError] = useState('');

  const cartCount = useMemo(
    () => (cart?.items || []).reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  useEffect(() => {
    let ignore = false;

    async function loadCart() {
      if (!token) {
        setCart(null);
        setCartError('');
        return;
      }

      setIsCartLoading(true);
      setCartError('');

      try {
        const nextCart = await api.getCart();
        if (!ignore) {
          setCart(nextCart);
        }
      } catch (error) {
        if (!ignore) {
          if (error.status === 401) {
            clearAuthSession();
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
  }, [token]);

  function setAuthSession(payload) {
    localStorage.setItem(TOKEN_KEY, payload.token);
    localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
    setToken(payload.token);
    setUser(payload.user);
  }

  function clearAuthSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    setCart(null);
  }

  async function addToCart(productId, quantity = 1) {
    if (!token) {
      throw new Error('Bitte zuerst einloggen, um Produkte in den Warenkorb zu legen.');
    }

    const nextCart = await api.addToCart(productId, quantity);
    setCart(nextCart);
    return nextCart;
  }

  const value = {
    token,
    user,
    cart,
    cartCount,
    cartError,
    isCartLoading,
    addToCart,
    setAuthSession,
    clearAuthSession
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
