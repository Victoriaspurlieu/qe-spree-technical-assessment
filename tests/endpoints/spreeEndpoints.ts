export class SpreeEndpoints {
    private static instance: SpreeEndpoints;
    private baseUrl: string;

    private constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    public static getInstance(baseUrl: string): SpreeEndpoints {
        if (!SpreeEndpoints.instance) {
            SpreeEndpoints.instance = new SpreeEndpoints(baseUrl);
        }
        return SpreeEndpoints.instance;
    }

    get products() {
        return {
            list: `${this.baseUrl}/api/v2/storefront/products`,
            show: (id: string) => `${this.baseUrl}/api/v2/storefront/products/${id}`
        };
    }

    get account() {
        return {
            create: `${this.baseUrl}/api/v2/storefront/account`,
            show: `${this.baseUrl}/api/v2/storefront/account`,
            update: `${this.baseUrl}/api/v2/storefront/account`
        };
    }

    get cart() {
        return {
            create: `${this.baseUrl}/api/v2/storefront/cart`,
            show: `${this.baseUrl}/api/v2/storefront/cart`,
            addItem: `${this.baseUrl}/api/v2/storefront/cart/add_item`,
            removeItem: (lineItemId: string) => `${this.baseUrl}/api/v2/storefront/cart/remove_line_item/${lineItemId}`,
            empty: `${this.baseUrl}/api/v2/storefront/cart/empty`,
            setQuantity: `${this.baseUrl}/api/v2/storefront/cart/set_quantity`
        };
    }

    get checkout() {
        return {
            next: `${this.baseUrl}/api/v2/storefront/checkout/next`,
            advance: `${this.baseUrl}/api/v2/storefront/checkout/advance`,
            complete: `${this.baseUrl}/api/v2/storefront/checkout/complete`,
            update: `${this.baseUrl}/api/v2/storefront/checkout`,
            payments: `${this.baseUrl}/api/v2/storefront/checkout/payments`,
            address: `${this.baseUrl}/api/v2/storefront/checkout/address`
        };
    }

    get orders() {
        return {
            list: `${this.baseUrl}/api/v2/storefront/orders`,
            show: (number: string) => `${this.baseUrl}/api/v2/storefront/orders/${number}`,
            current: `${this.baseUrl}/api/v2/storefront/orders/current`
        };
    }

    get platform() {
        return {
            users: {
                current: `${this.baseUrl}/api/v2/platform/users/current`
            },
            orders: `${this.baseUrl}/api/v2/platform/orders`
        };
    }

    get oauth() {
        return {
            token: `${this.baseUrl}/spree_oauth/token`,
            revoke: `${this.baseUrl}/spree_oauth/revoke`
        };
    }

    get admin() {
        return {
            login: `${this.baseUrl}/api/v2/platform/users/sign_in`,
            logout: `${this.baseUrl}/api/v2/platform/users/sign_out`,
            currentUser: `${this.baseUrl}/api/v2/platform/users/current`,
            orders: `${this.baseUrl}/api/v2/platform/orders`
        };
    }
} 