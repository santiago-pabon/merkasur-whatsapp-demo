// WhatsApp de MerkaSur Amarilo Express, en formato internacional y sin + ni espacios.
let WHATSAPP_NUMBER = '5731280619981';
const CART_STORAGE_KEY = 'la-canasta-cart-v1';
const FREE_DELIVERY_THRESHOLD = 10000;
const DELIVERY_FEE = 2000;

const CONTENT_STORAGE_KEY = 'merkasur-store-content-v1';
const ADMIN_PASSWORD_STORAGE_KEY = 'merkasur-admin-password-hash-v1';
const DEFAULT_ADMIN_PASSWORD_HASH = 'pbkdf2$150000$ce0a9fa0aac5c7bcf0ad2ce56d395f08$c573dde897d604d52f4c6a46ddeea841261d60a8a350d49f9332888028b209bd';
const defaultSettings = {
  name: 'MerkaSur Amarilo Express',
  phone: '5731280619981',
  logoUrl: '',
  tagline: 'EL MERCADO DE TU BARRIO',
  heroTitle: 'Todo lo que te gusta.|Directo a tu puerta.',
  heroSubtitle: 'Arma tu mercado con calma. Nosotros confirmamos disponibilidad y valor final por WhatsApp.',
  font: 'brand',
  colors: { primary: '#174d36', accent: '#86a840', background: '#f7f7ef', text: '#202a22' },
  greeting: '¡Hola! Quiero confirmar este pedido de MerkaSur Amarilo Express.',
  closing: 'Por favor, confirmen disponibilidad, total final y métodos de pago. ¡Gracias!'
};
let categories = loadContent('categories', defaultCategories);
let products = loadContent('products', defaultProducts);
let storeSettings = loadContent('settings', defaultSettings);
let adminPasswordHash = (() => {
  try { return localStorage.getItem(ADMIN_PASSWORD_STORAGE_KEY) || DEFAULT_ADMIN_PASSWORD_HASH; }
  catch { return DEFAULT_ADMIN_PASSWORD_HASH; }
})();
let adminAuthenticated = false;

const $ = (selector) => document.querySelector(selector);
const productGrid = $('#productGrid');
let selectedCategory = 'Todos';
let cart = loadCart();
let toastTimer;

function loadContent(section, fallback) {
  try {
    const stored = JSON.parse(localStorage.getItem(CONTENT_STORAGE_KEY) || '{}');
    if (Array.isArray(fallback)) return Array.isArray(stored[section]) ? stored[section] : JSON.parse(JSON.stringify(fallback));
    return stored[section] && typeof stored[section] === 'object' ? { ...fallback, ...stored[section] } : { ...fallback };
  } catch {
    return JSON.parse(JSON.stringify(fallback));
  }
}

function saveContent() {
  try {
    localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify({ categories, products, settings: storeSettings }));
  } catch {
    showToast('No se pudo guardar. Revisa el espacio disponible del navegador.');
  }
}

function loadCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '{}');
    if (!parsed || typeof parsed !== 'object') return {};
    if (parsed.huevos && !parsed['huevos-media'] && !parsed['huevos-unidad'] && !parsed['huevos-cubeta']) {
      parsed['huevos-media'] = parsed.huevos;
      delete parsed.huevos;
    }
    return parsed;
  } catch { return {}; }
}

function saveCart() {
  try { localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart)); } catch { /* Carrito temporal si el navegador bloquea el almacenamiento. */ }
}


