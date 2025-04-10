import { APIRequestContext, APIResponse } from '@playwright/test';
import { SpreeEndpoints } from '../endpoints/spreeEndpoints';
import { z } from 'zod';
import testData from '../config/testData';
import { CartResponse, UserResponse, TokenResponse, OrderResponse } from '../schemas/spreeSchema';
import { BaseApiClient } from '../framework/api/baseApiClient';

type SpreeResponse = UserResponse;
type SpreeCartResponse = CartResponse;
type SpreeProductResponse = {
    data: Array<{
        id: string;
        attributes: {
            name: string;
            price: string;
        };
    }>;
};

interface OAuthResponse {
    accessToken: string;
    tokenType: string;
    expiresIn: number;
    refreshToken: string;
    createdAt: number;
}

const cartResponseSchema = z.object({
    data: z.object({
        id: z.string(),
        type: z.literal('cart'),
        attributes: z.object({
            number: z.string(),
            itemTotal: z.string(),
            total: z.string(),
            shipTotal: z.string(),
            adjustmentTotal: z.string(),
            createdAt: z.string(),
            updatedAt: z.string(),
            completedAt: z.string().nullable(),
            includedTaxTotal: z.string(),
            additionalTaxTotal: z.string(),
            displayAdditionalTaxTotal: z.string(),
            displayIncludedTaxTotal: z.string(),
            taxTotal: z.string(),
            currency: z.string(),
            state: z.string(),
            token: z.string(),
            email: z.string().nullable(),
            displayItemTotal: z.string(),
            displayShipTotal: z.string(),
            displayAdjustmentTotal: z.string(),
            displayTaxTotal: z.string(),
            promoTotal: z.string(),
            displayPromoTotal: z.string(),
            itemCount: z.number(),
            specialInstructions: z.string().nullable(),
            displayTotal: z.string(),
            preTaxItemAmount: z.string(),
            displayPreTaxItemAmount: z.string(),
            preTaxTotal: z.string(),
            items: z.array(z.object({
                id: z.number(),
                quantity: z.number(),
                price: z.string(),
                variantId: z.number(),
                productId: z.string(),
                total: z.string(),
                displayPrice: z.string(),
                displayTotal: z.string(),
                name: z.string(),
                optionsText: z.string()
            }))
        })
    })
});

const productResponseSchema = z.object({
    data: z.array(z.object({
        id: z.string(),
        attributes: z.object({
            name: z.string(),
            price: z.string()
        })
    }))
});

const spreeEndpoints = SpreeEndpoints.getInstance(testData.api.baseUrl);

export class ApiUtils extends BaseApiClient {
    private cartToken: string | undefined;
    private authToken: string | undefined;

    constructor(request: APIRequestContext, baseUrl: string) {
        super(baseUrl, request);
    }

    setCartToken(cartToken: string) {
        this.cartToken = cartToken;
        this.headers['X-Spree-Order-Token'] = cartToken;
    }

    setAuthToken(token: string) {
        this.authToken = token;
        this.headers['Authorization'] = `Bearer ${token}`;
    }

    async handleResponse<T>(response: APIResponse): Promise<T> {
        return super.handleResponse<T>(response);
    }

    async getCart(): Promise<APIResponse> {
        await this.ensureCart();
        return await this.getRaw(this.endpoints.cart.show);
    }

    async addToCart(variantId: string, quantity: number = 1): Promise<APIResponse> {
        await this.ensureCart();
        return await this.postRaw(this.endpoints.cart.addItem, {
            variant_id: variantId,
            quantity: quantity
        });
    }

    async updateCartQuantity(lineItemId: string, quantity: number): Promise<APIResponse> {
        return await super.putRaw(this.endpoints.cart.setQuantity, {
            line_item: {
                id: lineItemId,
                quantity: quantity
            }
        });
    }

    async removeFromCart(lineItemId: string): Promise<APIResponse> {
        await this.ensureCart();
        return await this.deleteRaw(this.endpoints.cart.removeItem(lineItemId));
    }

    async clearCart(): Promise<APIResponse> {
        await this.ensureCart();
        return await this.patchRaw(this.endpoints.cart.empty, {});
    }

    async createAccount(email: string, password: string): Promise<APIResponse> {
        return await this.postRaw(this.endpoints.account.create, {
            user: {
                email,
                password,
                password_confirmation: password
            }
        });
    }

    async getOrder(orderNumber: string): Promise<APIResponse> {
        return await this.getRaw(this.endpoints.orders.show(orderNumber));
    }

    async addPayment(orderNumber: string, paymentMethodId: string): Promise<APIResponse> {
        return await super.postRaw(this.endpoints.checkout.payments, {
            payment: {
                payment_method_id: paymentMethodId
            }
        });
    }

    async createOrder(): Promise<APIResponse> {
        return await super.postRaw(this.endpoints.checkout.next, {});
    }

    async updateAddress(orderNumber: string, address: any): Promise<APIResponse> {
        return await super.putRaw(this.endpoints.checkout.address, {
            order: {
                bill_address_attributes: address,
                ship_address_attributes: address
            }
        });
    }

    async completeCheckout(orderNumber: string): Promise<APIResponse> {
        return await super.putRaw(this.endpoints.checkout.complete, {});
    }

    private async ensureCart(): Promise<void> {
        if (!this.cartToken) {
            const response = await this.postRaw(this.endpoints.cart.create, {});
            const data = await response.json();
            this.setCartToken(data.data.attributes.token);
        }
    }

    async adminLogin(email: string, password: string): Promise<APIResponse> {
        console.log('Starting admin login process...');
        console.log('Using credentials:', { email, password });
        console.log('Using client credentials:', { 
            client_id: testData.api.admin.clientId, 
            client_secret: testData.api.admin.clientSecret 
        });

        const formData = new URLSearchParams();
        formData.append('grant_type', 'password');
        formData.append('username', email);
        formData.append('password', password);
        formData.append('client_id', testData.api.admin.clientId);
        formData.append('client_secret', testData.api.admin.clientSecret);

        const response = await this.postRaw(this.endpoints.oauth.token, formData.toString(), {
            'Content-Type': 'application/x-www-form-urlencoded'
        });

        console.log('Admin login response status:', response.status());
        console.log('Admin login response headers:', response.headers());
        const rawBody = await response.text();
        console.log('Admin login response body:', rawBody);
        
        try {
            const parsedBody = JSON.parse(rawBody);
            console.log('Parsed response JSON:', parsedBody);
            if (response.ok() && parsedBody.access_token) {
                this.setAuthToken(parsedBody.access_token);
            }
        } catch (e) {
            console.error('Failed to parse response:', e);
        }

        console.log('Full response:', rawBody);
        return response;
    }

    async getCurrentUser(): Promise<APIResponse> {
        return await this.getRaw(this.endpoints.admin.currentUser);
    }

    async getAdminOrders(token: string): Promise<APIResponse> {
        return await this.getRaw(this.endpoints.admin.orders, {
            'Authorization': `Bearer ${token}`
        });
    }

    async adminLogout(): Promise<APIResponse> {
        return await this.postRaw(this.endpoints.admin.logout, {});
    }
}

export async function updateCartQuantity(request: APIRequestContext, cartToken: string, lineItemId: string, quantity: number): Promise<APIResponse> {
    const client = new ApiUtils(request, testData.api.baseUrl);
    return await client.updateCartQuantity(lineItemId, quantity);
}

export async function addPayment(request: APIRequestContext, cartToken: string, paymentMethodId: string): Promise<APIResponse> {
    const client = new ApiUtils(request, testData.api.baseUrl);
    return await client.addPayment(cartToken, paymentMethodId);
}

export async function createOrder(request: APIRequestContext, cartToken: string): Promise<APIResponse> {
    const client = new ApiUtils(request, testData.api.baseUrl);
    return await client.createOrder();
}

export async function updateAddress(request: APIRequestContext, cartToken: string, address: any): Promise<APIResponse> {
    const client = new ApiUtils(request, testData.api.baseUrl);
    return await client.updateAddress(cartToken, address);
}

export async function completeCheckout(request: APIRequestContext, cartToken: string): Promise<APIResponse> {
    const client = new ApiUtils(request, testData.api.baseUrl);
    return await client.completeCheckout(cartToken);
}
