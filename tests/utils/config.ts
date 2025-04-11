export interface Selectors {
  [key: string]: string;
}

export interface URLs {
  [key: string]: string | string[];
}

export interface APIEndpoints {
  [key: string]: string;
}

export interface TestData {
  [key: string]: string | number;
}

export interface Config {
  baseUrl: string;
  selectors: Selectors;
  urls: URLs;
  api: {
    base: string;
    endpoints: APIEndpoints;
  };
  testData: TestData;
}

export const config: Config = {
  baseUrl: 'http://localhost:3000',
  
  // Common selectors
  selectors: {
    // Navigation
    header: 'header, .header, #header',
    footer: 'footer, .footer, #footer',
    mainContent: 'main, .main-content, #main-content',
    
    // Search
    searchInput: 'input[type="search"], input[type="text"][name*="search"], input[type="text"][placeholder*="search" i], .search-input, #search-input',
    searchForm: 'form[action*="search"], form[role="search"]',
    
    // Products
    productCard: '.product-card, .product-item, [data-hook="product_item"]',
    productLink: 'a[href*="/products/"]',
    productImage: 'img[alt*="product"], .product-image',
    productTitle: '.product-title, .product-name, [data-hook="product_name"]',
    productPrice: '.product-price, .price, [data-hook="product_price"]',
    
    // Cart
    cartButton: 'button[type="submit"], .add-to-cart, #add-to-cart',
    cartIcon: '.cart-icon, #cart-icon',
    cartQuantity: 'input[name="quantity"], .quantity-input, #quantity-input',
    
    // Authentication
    loginForm: 'form[action*="login"], form[action*="sign_in"]',
    registerForm: 'form[action*="register"], form[action*="sign_up"]',
    emailInput: 'input[type="email"], input[name*="email"], input[name*="login"]',
    passwordInput: 'input[type="password"]',
    submitButton: 'button[type="submit"]',
    
    // Reviews
    reviewForm: 'form[action*="reviews"], .review-form, #review-form',
    reviewText: 'textarea, .review-text, #review-text',
    reviewRating: 'input[type="radio"][name*="rating"], input[type="number"][name*="rating"]',
    
    // Error messages
    errorMessage: '.error-message, .alert, .flash-error',
    successMessage: '.success-message, .notice, .flash-success'
  },
  
  // Common URLs
  urls: {
    home: '/',
    products: '/products',
    cart: '/cart',
    checkout: '/checkout',
    login: ['/login', '/sign_in', '/users/sign_in'],
    register: ['/signup', '/register', '/users/sign_up'],
    account: '/account'
  },
  
  // API endpoints
  api: {
    base: '/api/v2/storefront',
    endpoints: {
      products: '/products',
      cart: '/cart',
      account: '/account',
      orders: '/orders'
    }
  },
  
  // Test data
  testData: {
    validEmail: 'test@example.com',
    validPassword: 'SecurePassword123!',
    searchTerm: 'test product',
    reviewText: 'This is a test review',
    reviewRating: 5
  }
}; 