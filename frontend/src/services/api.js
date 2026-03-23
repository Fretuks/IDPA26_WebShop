const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

const defaultHeaders = {
  'Content-Type': 'application/json'
};

function getToken() {
  return localStorage.getItem('webshop_token');
}

function toAuthHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      ...defaultHeaders,
      ...(options.auth ? toAuthHeaders() : {}),
      ...options.headers
    },
    method: options.method || 'GET',
    body: options.body
  });

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    let message = 'Request failed';

    if (Array.isArray(payload?.errors) && payload.errors.length) {
      message = payload.errors.map((item) => item.msg || item.message).filter(Boolean).join(', ');
    } else if (typeof payload === 'object' && payload !== null) {
      message = payload.error || payload.message || message;
    }

    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

function mapProduct(product) {
  return {
    id: product.id,
    name: product.name,
    description: product.description || '',
    price: Number(product.price),
    stock: Number(product.stock ?? 0),
    categoryId: product.category_id,
    categoryName: product.category_name || '',
    active: product.active,
    createdAt: product.created_at,
    imageUrl: product.image_url || null
  };
}

function mapCategory(category) {
  return {
    id: category.id,
    name: category.name,
    description: category.description || ''
  };
}

function mapCart(cart) {
  return {
    id: cart.id,
    userId: cart.user_id,
    createdAt: cart.created_at,
    totalAmount: Number(cart.totalAmount || 0),
    items: (cart.items || []).map((item) => ({
      id: item.id,
      cartId: item.cart_id,
      productId: item.product_id,
      quantity: Number(item.quantity),
      name: item.name,
      price: Number(item.price),
      stock: Number(item.stock ?? 0),
      active: item.active
    }))
  };
}

function mapUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
    phone: user.phone || '',
    role: user.role,
    createdAt: user.created_at,
    defaultShippingAddressId: user.default_shipping_address_id ?? null,
    defaultBillingAddressId: user.default_billing_address_id ?? null
  };
}

function mapAuthPayload(payload) {
  return {
    token: payload.token,
    user: mapUser(payload.user)
  };
}

export const api = {
  baseUrl: API_BASE_URL,

  async getProducts() {
    const products = await request('/api/products');
    return products.map(mapProduct);
  },

  async getProductById(productId) {
    const product = await request(`/api/products/${productId}`);
    return mapProduct(product);
  },

  async getCategories() {
    const categories = await request('/api/categories');
    return categories.map(mapCategory);
  },

  async getCart() {
    const cart = await request('/api/cart', { auth: true });
    return mapCart(cart);
  },

  async addToCart(productId, quantity = 1) {
    const cart = await request('/api/cart/items', {
      method: 'POST',
      auth: true,
      body: JSON.stringify({ productId, quantity })
    });
    return mapCart(cart);
  },

  async login(email, password) {
    const payload = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    return mapAuthPayload(payload);
  },

  async register(data) {
    const user = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        password: data.password,
        phone: data.phone || undefined
      })
    });

    return mapUser(user);
  },

  async createAddress(address) {
    return request('/api/users/me/addresses', {
      method: 'POST',
      auth: true,
      body: JSON.stringify(address)
    });
  }
};
