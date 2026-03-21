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
    const message =
      typeof payload === 'object' && payload !== null
        ? payload.error || payload.message || 'Request failed'
        : 'Request failed';
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

export const api = {
  baseUrl: API_BASE_URL,

  async getProducts() {
    const products = await request('/api/products');
    return products.map(mapProduct);
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
    return request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }
};
