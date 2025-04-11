interface TestDataType {
    screenshots: {
        beforeAddToCart: string;
        afterAddToCart: string;
        emptyCart: string;
        errorState: string;
        addToCartButtonNotFound: string;
        cartPage: string;
        afterDropdownClick: string;
        initialPage: string;
        newSessionCart: string;
        cartCheck: string;
    };
    paths: {
        home: string;
        products: string;
        product: string;
        cart: string;
        checkout: string;
        cartState: string;
        adminLogin: string;
    };
    selectors: {
        addToCartButton: string;
        sizeSelect: string;
        variantPicker: string;
        cartIcon: string;
        cartItem: string;
        cartQuantity: string;
        cartTotal: string;
        checkoutButton: string;
        continueShoppingButton: string;
        emptyCartMessage: string;
        productName: string;
        productPrice: string;
        quantityInput: string;
        removeItemButton: string;
        updateCartButton: string;
        cartSidePane: string;
        cartSidePaneProduct: string;
        cartSidePaneCheckout: string;
        welcomeText: string;
        flashMessage: string;
        adminEmailInput: string;
        adminPasswordInput: string;
        adminSubmitButton: string;
    };
    api: {
        baseUrl: string;
        productId: string;
        outOfStockProductId: string;
        admin: {
            email: string;
            password: string;
            clientId: string;
            clientSecret: string;
        };
        testAddress: {
            firstname: string;
            lastname: string;
            address1: string;
            city: string;
            phone: string;
            zipcode: string;
            country_iso: string;
            state_name: string;
        };
        invalidIds: {
            order: string;
            variant: string;
            payment: string;
            shipment: string;
        };
        endpoints: {
            oauth: {
                token: string;
                revoke: string;
            };
            cart: {
                create: string;
                addItem: string;
                updateItem: string;
                removeItem: string;
                clear: string;
                show: string;
            };
            orders: {
                list: string;
                show: string;
                current: string;
            };
            products: {
                list: string;
                show: string;
            };
            checkout: {
                next: string;
                advance: string;
                complete: string;
                update: string;
                payments: string;
            };
            admin: {
                orders: string;
                users: string;
            };
        };
    };
    ui: {
        spree: {
            email: string;
            password: string;
        };
        admin: {
            email: string;
            password: string;
        };
    };
    texts: {
        emptyCart: string;
        addToCart: string;
        updateCart: string;
        removeItem: string;
        continueShopping: string;
        checkout: string;
        welcomeText: string;
    };
}

const testData: TestDataType = {
    screenshots: {
        beforeAddToCart: 'test-results/screenshots/before-add-to-cart.png',
        afterAddToCart: 'test-results/screenshots/after-add-to-cart.png',
        emptyCart: 'test-results/screenshots/empty-cart.png',
        errorState: 'test-results/screenshots/error-state.png',
        addToCartButtonNotFound: 'test-results/screenshots/add-to-cart-button-not-found.png',
        cartPage: 'test-results/screenshots/cart-page.png',
        afterDropdownClick: 'test-results/screenshots/after-dropdown-click.png',
        initialPage: 'test-results/screenshots/initial-page.png',
        newSessionCart: 'test-results/screenshots/new-session-cart.png',
        cartCheck: 'test-results/screenshots/cart-check.png'
    },
    paths: {
        home: '/',
        products: '/products',
        product: '/products/printed-pants',
        cart: '/cart',
        checkout: '/checkout',
        cartState: 'test-results/cart-state.json',
        adminLogin: '/admin/login'
    },
    selectors: {
        addToCartButton: 'button.add-to-cart-button:not([disabled])',
        sizeSelect: 'input[type="radio"][name="Color"]',
        variantPicker: '#product-variant-picker',
        cartIcon: '[data-testid="cart-icon"]',
        cartItem: '[data-testid="cart-item"]',
        cartQuantity: '[data-testid="cart-quantity"]',
        cartTotal: '[data-testid="cart-total"]',
        checkoutButton: 'button:has-text("Checkout")',
        continueShoppingButton: 'button:has-text("Continue Shopping")',
        emptyCartMessage: 'text=Your cart is empty',
        productName: 'h1:has-text("PRINTED PANTS")',
        productPrice: '[data-testid="product-price"]',
        quantityInput: '[data-testid="quantity-input"]',
        removeItemButton: '[data-testid="remove-item"]',
        updateCartButton: '[data-testid="update-cart"]',
        cartSidePane: '[data-testid="cart-side-pane"]',
        cartSidePaneProduct: '[data-testid="cart-side-pane"] h1:has-text("PRINTED PANTS")',
        cartSidePaneCheckout: '[data-testid="cart-side-pane"] button:has-text("Checkout")',
        welcomeText: 'div.trix-content:has-text("Welcome to our shop!") >> nth=0',
        flashMessage: '.flash-message',
        adminEmailInput: '#admin_email',
        adminPasswordInput: '#admin_password',
        adminSubmitButton: 'button[type="submit"]'
    },
    api: {
        baseUrl: 'http://localhost:3000',
        productId: '114',
        outOfStockProductId: '999',
        admin: {
            email: 'spree@example.com',
            password: 'spree123',
            clientId: 'client_id',
            clientSecret: 'client_secret'
        },
        testAddress: {
            firstname: 'John',
            lastname: 'Doe',
            address1: '123 Main St',
            city: 'New York',
            phone: '555-123-4567',
            zipcode: '10001',
            country_iso: 'US',
            state_name: 'NY'
        },
        invalidIds: {
            order: '999999',
            variant: '999999',
            payment: '999999',
            shipment: '999999'
        },
        endpoints: {
            oauth: {
                token: '/spree_oauth/token',
                revoke: '/spree_oauth/revoke'
            },
            cart: {
                create: '/api/v2/storefront/cart',
                addItem: '/api/v2/storefront/cart/add_item',
                updateItem: '/api/v2/storefront/cart/update_item',
                removeItem: '/api/v2/storefront/cart/remove_item',
                clear: '/api/v2/storefront/cart/empty',
                show: '/api/v2/storefront/cart'
            },
            orders: {
                list: '/api/v2/storefront/orders',
                show: '/api/v2/storefront/orders/:number',
                current: '/api/v2/storefront/orders/current'
            },
            products: {
                list: '/api/v2/storefront/products',
                show: '/api/v2/storefront/products/:id'
            },
            checkout: {
                next: '/api/v2/storefront/checkout/next',
                advance: '/api/v2/storefront/checkout/advance',
                complete: '/api/v2/storefront/checkout/complete',
                update: '/api/v2/storefront/checkout',
                payments: '/api/v2/storefront/checkout/payments'
            },
            admin: {
                orders: '/api/v2/admin/orders',
                users: '/api/v2/admin/users'
            }
        }
    },
    ui: {
        spree: {
            email: 'spree@example.com',
            password: 'spree123'
        },
        admin: {
            email: 'admin@example.com',
            password: 'admin123'
        }
    },
    texts: {
        emptyCart: 'Your cart is empty',
        addToCart: 'Add To Cart',
        updateCart: 'Update Cart',
        removeItem: 'Remove',
        continueShopping: 'Continue Shopping',
        checkout: 'Checkout',
        welcomeText: 'Welcome to our shop'
    }
};

export default testData; 