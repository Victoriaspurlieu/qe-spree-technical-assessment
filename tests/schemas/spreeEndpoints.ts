export class SpreeEndpoints {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    // Storefront endpoints
    get cart() {
        return {
            create: `${this.baseUrl}/api/v2/storefront/cart`,
            show: `${this.baseUrl}/api/v2/storefront/cart`,
            addItem: `${this.baseUrl}/api/v2/storefront/cart/add_item`,
            setQuantity: `${this.baseUrl}/api/v2/storefront/cart/set_quantity`,
            removeItem: (lineItemId: string) => `${this.baseUrl}/api/v2/storefront/cart/remove_line_item/${lineItemId}`,
            empty: `${this.baseUrl}/api/v2/storefront/cart/empty`
        };
    }

    get products() {
        return {
            list: `${this.baseUrl}/api/v2/storefront/products`
        };
    }

    get account() {
        return {
            create: `${this.baseUrl}/api/v2/storefront/account`
        };
    }

    get oauth() {
        return {
            token: `${this.baseUrl}/spree_oauth/token`,
            revoke: `${this.baseUrl}/spree/oauth/revoke`
        };
    }

    get checkout() {
        return {
            create: `${this.baseUrl}/api/v2/storefront/checkout`,
            address: `${this.baseUrl}/api/v2/storefront/checkout/address`,
            complete: `${this.baseUrl}/api/v2/storefront/checkout/complete`,
            payments: `${this.baseUrl}/api/v2/storefront/checkout/payments`
        };
    }

    get paymentMethods() {
        return {
            list: `${this.baseUrl}/api/v2/storefront/payment_methods`
        };
    }

    get orders() {
        return {
            show: (orderNumber: string) => `${this.baseUrl}/api/v2/storefront/orders/${orderNumber}`
        };
    }

    get platform() {
        return {
            users: {
                current: `${this.baseUrl}/api/v2/platform/users/current`
            }
        };
    }
} 