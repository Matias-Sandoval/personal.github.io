/* ============================================
   APARICIO STORE - Firebase Data Layer
   ============================================ */

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyARejr6zs_PvG-NkmRGno3kO9Yfx9up0ZA",
  authDomain: "aparicio-store.firebaseapp.com",
  projectId: "aparicio-store",
  storageBucket: "aparicio-store.firebasestorage.app",
  messagingSenderId: "775876022622",
  appId: "1:775876022622:web:6bcba90d177442a3beffcf",
  measurementId: "G-VPQ7Y6ML52"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Collections
const productsCollection = db.collection('products');
const ordersCollection = db.collection('orders');

// Data Storage Keys (for local cart)
const STORAGE_KEYS = {
  CART: 'aparicio_cart',
  ADMIN_AUTH: 'aparicio_admin_auth'
};

// Admin Password
const ADMIN_PASSWORD = 'aparicio2024';

// Default Products (will be uploaded to Firebase on first run)
const DEFAULT_PRODUCTS = [
  {
    id: 1,
    name: 'Coca-Cola 3L',
    category: 'gaseosas',
    price: 20,
    stock: 50,
    image: '🥤',
    description: 'Bebida gaseosa clásica'
  },
  {
    id: 2,
    name: 'Coca-Cola 2L',
    category: 'gaseosas',
    price: 15,
    stock: 50,
    image: '🥤',
    description: 'Bebida gaseosa clásica'
  },
  {
    id: 3,
    name: 'Sprite 2L',
    category: 'gaseosas',
    price: 14,
    stock: 40,
    image: '🍋',
    description: 'Bebida gaseosa sabor lima-limón'
  },
  {
    id: 4,
    name: 'Fanta Naranja 2L',
    category: 'gaseosas',
    price: 14,
    stock: 35,
    image: '🍊',
    description: 'Bebida gaseosa sabor naranja'
  },
  {
    id: 5,
    name: 'Pepsi 2L',
    category: 'gaseosas',
    price: 13,
    stock: 45,
    image: '🥤',
    description: 'Bebida gaseosa cola'
  },
  {
    id: 6,
    name: 'Agua Mineral 2L',
    category: 'agua',
    price: 8,
    stock: 100,
    image: '💧',
    description: 'Agua mineral natural'
  },
  {
    id: 7,
    name: 'Agua Mineral 600ml',
    category: 'agua',
    price: 4,
    stock: 150,
    image: '💧',
    description: 'Agua mineral natural - formato personal'
  },
  {
    id: 8,
    name: 'Agua con Gas 2L',
    category: 'agua',
    price: 10,
    stock: 60,
    image: '🫧',
    description: 'Agua mineral gasificada'
  },
  {
    id: 9,
    name: 'Jugo de Naranja 1L',
    category: 'jugos',
    price: 12,
    stock: 30,
    image: '🍊',
    description: 'Jugo natural de naranja'
  },
  {
    id: 10,
    name: 'Jugo de Manzana 1L',
    category: 'jugos',
    price: 12,
    stock: 25,
    image: '🍎',
    description: 'Jugo natural de manzana'
  },
  {
    id: 11,
    name: 'Jugo de Durazno 1L',
    category: 'jugos',
    price: 12,
    stock: 28,
    image: '🍑',
    description: 'Jugo natural de durazno'
  },
  {
    id: 12,
    name: 'Energizante Speed 473ml',
    category: 'energizantes',
    price: 18,
    stock: 40,
    image: '⚡',
    description: 'Bebida energizante'
  },
  {
    id: 13,
    name: 'Red Bull 250ml',
    category: 'energizantes',
    price: 25,
    stock: 35,
    image: '⚡',
    description: 'Bebida energizante premium'
  },
  {
    id: 14,
    name: 'Monster Energy 473ml',
    category: 'energizantes',
    price: 22,
    stock: 30,
    image: '⚡',
    description: 'Bebida energizante'
  },
  {
    id: 15,
    name: 'Gatorade 500ml',
    category: 'deportivas',
    price: 15,
    stock: 45,
    image: '🏃',
    description: 'Bebida isotónica'
  },
  {
    id: 16,
    name: 'Powerade 500ml',
    category: 'deportivas',
    price: 14,
    stock: 50,
    image: '🏃',
    description: 'Bebida isotónica'
  }
];

// Categories
const CATEGORIES = [
  { id: 'all', name: 'Todos', icon: '🛒' },
  { id: 'gaseosas', name: 'Gaseosas', icon: '🥤' },
  { id: 'agua', name: 'Agua', icon: '💧' },
  { id: 'jugos', name: 'Jugos', icon: '🧃' },
  { id: 'energizantes', name: 'Energizantes', icon: '⚡' },
  { id: 'deportivas', name: 'Deportivas', icon: '🏃' }
];

// Order Statuses
const ORDER_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

const STATUS_LABELS = {
  pending: 'Pendiente',
  processing: 'En Proceso',
  delivered: 'Entregado',
  cancelled: 'Cancelado'
};

/* ============================================
   LOCALSTORAGE HELPERS (for cart only)
   ============================================ */

function getData(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Error reading from localStorage:', e);
    return null;
  }
}

function setData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('Error writing to localStorage:', e);
    return false;
  }
}

/* ============================================
   PRODUCTS (Firebase)
   ============================================ */

// Cache for products
let productsCache = null;
let productsCacheTime = 0;
const CACHE_DURATION = 30000; // 30 seconds

// Initialize products in Firebase (run once)
async function initializeProducts() {
  try {
    const snapshot = await productsCollection.limit(1).get();
    if (snapshot.empty) {
      console.log('Initializing products in Firebase...');
      const batch = db.batch();
      DEFAULT_PRODUCTS.forEach(product => {
        const docRef = productsCollection.doc(product.id.toString());
        batch.set(docRef, product);
      });
      await batch.commit();
      console.log('Products initialized successfully!');
    }
  } catch (e) {
    console.error('Error initializing products:', e);
  }
}

// Get all products
async function getProducts() {
  // Use cache if valid
  if (productsCache && (Date.now() - productsCacheTime < CACHE_DURATION)) {
    return productsCache;
  }

  try {
    const snapshot = await productsCollection.orderBy('id').get();
    const products = [];
    snapshot.forEach(doc => {
      products.push({ ...doc.data(), docId: doc.id });
    });

    // Update cache
    productsCache = products;
    productsCacheTime = Date.now();

    return products;
  } catch (e) {
    console.error('Error fetching products:', e);
    // Fallback to default products if Firebase fails
    return DEFAULT_PRODUCTS;
  }
}

// Get product by ID
async function getProductById(id) {
  try {
    const doc = await productsCollection.doc(id.toString()).get();
    if (doc.exists) {
      return { ...doc.data(), docId: doc.id };
    }
    return null;
  } catch (e) {
    console.error('Error fetching product:', e);
    return null;
  }
}

// Save product (create or update)
async function saveProduct(product) {
  try {
    if (product.id) {
      // Update existing
      await productsCollection.doc(product.id.toString()).update(product);
    } else {
      // Create new - get max ID
      const snapshot = await productsCollection.orderBy('id', 'desc').limit(1).get();
      let maxId = 0;
      snapshot.forEach(doc => {
        maxId = doc.data().id;
      });
      product.id = maxId + 1;
      await productsCollection.doc(product.id.toString()).set(product);
    }

    // Invalidate cache
    productsCache = null;

    return product;
  } catch (e) {
    console.error('Error saving product:', e);
    return null;
  }
}

// Delete product
async function deleteProduct(id) {
  try {
    await productsCollection.doc(id.toString()).delete();
    productsCache = null;
  } catch (e) {
    console.error('Error deleting product:', e);
  }
}

// Update product stock
async function updateProductStock(productId, quantitySold) {
  try {
    const docRef = productsCollection.doc(productId.toString());
    const doc = await docRef.get();
    if (doc.exists) {
      const currentStock = doc.data().stock;
      await docRef.update({
        stock: Math.max(0, currentStock - quantitySold)
      });
    }
    productsCache = null;
  } catch (e) {
    console.error('Error updating stock:', e);
  }
}

/* ============================================
   CART (localStorage - local to each user)
   ============================================ */

function getCart() {
  return getData(STORAGE_KEYS.CART) || [];
}

function saveCart(cart) {
  setData(STORAGE_KEYS.CART, cart);
}

async function addToCart(productId, quantity = 1) {
  const cart = getCart();
  const product = await getProductById(productId);

  if (!product) return null;

  const existingItem = cart.find(item => item.productId === parseInt(productId));

  if (existingItem) {
    existingItem.quantity = Math.min(existingItem.quantity + quantity, product.stock);
  } else {
    cart.push({
      productId: parseInt(productId),
      quantity: Math.min(quantity, product.stock)
    });
  }

  saveCart(cart);
  return cart;
}

async function updateCartItem(productId, quantity) {
  const cart = getCart();
  const product = await getProductById(productId);

  if (!product) return cart;

  const index = cart.findIndex(item => item.productId === parseInt(productId));

  if (index !== -1) {
    if (quantity <= 0) {
      cart.splice(index, 1);
    } else {
      cart[index].quantity = Math.min(quantity, product.stock);
    }
  }

  saveCart(cart);
  return cart;
}

function removeFromCart(productId) {
  const cart = getCart();
  const filtered = cart.filter(item => item.productId !== parseInt(productId));
  saveCart(filtered);
  return filtered;
}

function clearCart() {
  saveCart([]);
}

async function getCartWithProducts() {
  const cart = getCart();
  const products = await getProducts();

  return cart.map(item => {
    const product = products.find(p => p.id === item.productId);
    return {
      ...item,
      product
    };
  }).filter(item => item.product);
}

async function getCartTotal() {
  const cartItems = await getCartWithProducts();
  return cartItems.reduce((total, item) => {
    return total + (item.product.price * item.quantity);
  }, 0);
}

function getCartCount() {
  const cart = getCart();
  return cart.reduce((count, item) => count + item.quantity, 0);
}

/* ============================================
   ORDERS (Firebase)
   ============================================ */

// Get all orders
async function getOrders() {
  try {
    const snapshot = await ordersCollection.orderBy('createdAt', 'desc').get();
    const orders = [];
    snapshot.forEach(doc => {
      orders.push({ ...doc.data(), docId: doc.id });
    });
    return orders;
  } catch (e) {
    console.error('Error fetching orders:', e);
    return [];
  }
}

// Get order by ID
async function getOrderById(id) {
  try {
    const snapshot = await ordersCollection.where('id', '==', id).limit(1).get();
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { ...doc.data(), docId: doc.id };
    }
    return null;
  } catch (e) {
    console.error('Error fetching order:', e);
    return null;
  }
}

// Create order
async function createOrder(customerData) {
  const cartItems = await getCartWithProducts();
  const total = await getCartTotal();

  const orderId = generateOrderId();

  const order = {
    id: orderId,
    customer: customerData,
    items: cartItems.map(item => ({
      productId: item.productId,
      productName: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      subtotal: item.product.price * item.quantity
    })),
    total,
    status: ORDER_STATUSES.PENDING,
    createdAt: new Date().toISOString()
  };

  try {
    // Save order to Firebase
    await ordersCollection.add(order);

    // Update product stock
    for (const item of cartItems) {
      await updateProductStock(item.productId, item.quantity);
    }

    // Clear cart
    clearCart();

    return order;
  } catch (e) {
    console.error('Error creating order:', e);
    return null;
  }
}

// Update order status
async function updateOrderStatus(orderId, status) {
  try {
    const snapshot = await ordersCollection.where('id', '==', orderId).limit(1).get();
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      await ordersCollection.doc(doc.id).update({
        status: status,
        updatedAt: new Date().toISOString()
      });
      return { ...doc.data(), status };
    }
    return null;
  } catch (e) {
    console.error('Error updating order status:', e);
    return null;
  }
}

function generateOrderId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `AP-${timestamp}-${random}`;
}

/* ============================================
   ADMIN AUTH
   ============================================ */

function adminLogin(password) {
  if (password === ADMIN_PASSWORD) {
    setData(STORAGE_KEYS.ADMIN_AUTH, { authenticated: true, timestamp: Date.now() });
    return true;
  }
  return false;
}

function adminLogout() {
  localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
}

function isAdminAuthenticated() {
  const auth = getData(STORAGE_KEYS.ADMIN_AUTH);
  if (!auth || !auth.authenticated) return false;

  // Session expires after 24 hours
  const sessionDuration = 24 * 60 * 60 * 1000;
  if (Date.now() - auth.timestamp > sessionDuration) {
    adminLogout();
    return false;
  }

  return true;
}

/* ============================================
   STATS (Firebase)
   ============================================ */

async function getStats() {
  const orders = await getOrders();
  const products = await getProducts();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayOrders = orders.filter(o => new Date(o.createdAt) >= today);
  const pendingOrders = orders.filter(o => o.status === ORDER_STATUSES.PENDING);
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 10);
  const outOfStockProducts = products.filter(p => p.stock === 0);

  const todaySales = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const totalSales = orders
    .filter(o => o.status !== ORDER_STATUSES.CANCELLED)
    .reduce((sum, o) => sum + o.total, 0);

  // Sales by day (last 7 days)
  const salesByDay = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const dayOrders = orders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate >= date && orderDate < nextDate && o.status !== ORDER_STATUSES.CANCELLED;
    });

    const daySales = dayOrders.reduce((sum, o) => sum + o.total, 0);

    salesByDay.push({
      date: date.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric' }),
      sales: daySales,
      orders: dayOrders.length
    });
  }

  // Top products
  const productSales = {};
  orders.forEach(order => {
    if (order.status !== ORDER_STATUSES.CANCELLED) {
      order.items.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            name: item.productName,
            quantity: 0,
            revenue: 0
          };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += item.subtotal;
      });
    }
  });

  const topProducts = Object.entries(productSales)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  return {
    todaySales,
    todayOrderCount: todayOrders.length,
    pendingOrderCount: pendingOrders.length,
    lowStockCount: lowStockProducts.length,
    outOfStockCount: outOfStockProducts.length,
    totalSales,
    totalOrders: orders.length,
    salesByDay,
    topProducts,
    lowStockProducts,
    outOfStockProducts
  };
}

/* ============================================
   UTILITIES
   ============================================ */

function formatPrice(price) {
  return 'Bs ' + price.toFixed(0);
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Initialize products on first load
initializeProducts();
