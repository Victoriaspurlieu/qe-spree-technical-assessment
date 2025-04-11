import { APIRequestContext, APIResponse } from '@playwright/test';
import { SpreeEndpoints } from '../config/endpoints/spreeEndpoints';
import { z } from 'zod';
import testData from '../config/testData';
import { StatusCode, ErrorMessage, UserResponse, TokenResponse, OrderResponse, OAuthErrorResponse, AdminErrorResponse } from '../schemas/spreeSchema';
import { BaseApiClient } from './api/baseApiClient';

type SpreeResponse = UserResponse;

interface OAuthResponse {
    accessToken: string;
    tokenType: string;
    expiresIn: number;
    refreshToken: string;
    createdAt: number;
}

interface Address {
    firstname: string;
    lastname: string;
    address1: string;
    city: string;
    zipcode: string;
    phone: string;
    state_name: string;
    country_iso: string;
}

interface Endpoints {
    auth: {
        token: string;
        login: string;
    };
    products: string;
    cart: string;
    checkout: {
        next: string;
        advance: string;
        address: string;
        shipments: string;
        payments: string;
        complete: string;
        current: string;
        delivery: string;
    };
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

    clearAuthToken() {
        this.authToken = undefined;
        delete this.headers['Authorization'];
    }

    setHeaders(headers: Record<string, string>) {
        this.headers = {
            ...this.headers,
            ...headers
        };
    }

    async handleResponse<T>(response: APIResponse): Promise<T> {
        return super.handleResponse<T>(response);
    }

    async getCart(): Promise<APIResponse> {
        await this.ensureCart();
        if (!this.cartToken) {
            throw new Error('Cart token is required');
        }
        return await this.request.get(`${this.endpoints.cart.show}?include=line_items`, {
            headers: this.headers
        });
    }

    async addToCart(variantId: string, quantity: number = 1): Promise<APIResponse> {
        await this.ensureCart();
        return await this.postRaw(this.endpoints.cart.addItem, {
            variant_id: variantId,
            quantity: quantity
        });
    }

    async updateCartQuantity(lineItemId: string, quantity: number): Promise<APIResponse> {
        await this.ensureCart();
        return await this.patchRaw(this.endpoints.cart.setQuantity, {
            line_item_id: lineItemId,
            quantity: quantity
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
        return await this.getRaw(`${this.endpoints.orders.show}/${orderNumber}`);
    }

    async addPayment(orderNumber: string, paymentMethodId: string): Promise<APIResponse> {
        return super.postRaw(this.endpoints.checkout.payments, {
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

    async proceedToCheckout(): Promise<APIResponse> {
        if (!this.cartToken) {
            throw new Error('Cart token is required to proceed to checkout');
        }

        // First, create an order
        const createResponse = await this.request.patch(this.endpoints.checkout.next, {
            headers: {
                'X-Spree-Order-Token': this.cartToken
            }
        });

        if (createResponse.status() !== StatusCode.Ok) {
            throw new Error(`Failed to create order: ${await createResponse.text()}`);
        }

        // Then advance the order to the next state
        const advanceResponse = await this.request.patch(this.endpoints.checkout.advance, {
            headers: {
                'X-Spree-Order-Token': this.cartToken
            }
        });

        if (advanceResponse.status() !== StatusCode.Ok) {
            throw new Error(`Failed to advance order: ${await advanceResponse.text()}`);
        }

        return advanceResponse;
    }

    async addShippingAddress(address: Address): Promise<APIResponse> {
        if (!this.cartToken) {
            throw new Error('Cart token is required to add shipping address');
        }

        // First, create an order
        const createResponse = await this.request.patch(this.endpoints.checkout.next, {
            headers: {
                'X-Spree-Order-Token': this.cartToken,
                'Content-Type': 'application/vnd.api+json'
            },
            data: {
                data: {
                    type: 'checkout',
                    attributes: {
                        email: 'test@example.com'
                    }
                }
            }
        });

        if (createResponse.status() !== StatusCode.Ok) {
            throw new Error(`Failed to create order: ${await createResponse.text()}`);
        }

        // Then add shipping address
        const addressResponse = await this.request.patch(this.endpoints.checkout.address, {
            headers: {
                'X-Spree-Order-Token': this.cartToken,
                'Content-Type': 'application/vnd.api+json'
            },
            data: {
                data: {
                    type: 'checkout',
                    attributes: {
                        email: 'test@example.com',
                        ship_address_attributes: address,
                        bill_address_attributes: address
                    }
                }
            }
        });

        if (addressResponse.status() !== StatusCode.Ok) {
            throw new Error(`Failed to add shipping address: ${await addressResponse.text()}`);
        }

        // Finally, advance the order state
        const advanceResponse = await this.request.patch(this.endpoints.checkout.advance, {
            headers: {
                'X-Spree-Order-Token': this.cartToken,
                'Content-Type': 'application/vnd.api+json'
            }
        });

        if (advanceResponse.status() !== StatusCode.Ok) {
            throw new Error(`Failed to advance order: ${await advanceResponse.text()}`);
        }

        return advanceResponse;
    }

    async selectFirstShippingRate(): Promise<APIResponse> {
        if (!this.cartToken) {
            throw new Error('Cart token is required');
        }

        // First advance the order to the delivery state
        const advanceResponse = await this.request.patch(this.endpoints.checkout.advance, {
            headers: {
                'X-Spree-Order-Token': this.cartToken,
                'Content-Type': 'application/json'
            }
        });

        if (advanceResponse.status() !== StatusCode.Ok) {
            throw new Error(`Failed to advance order: ${await advanceResponse.text()}`);
        }

        // Get available shipping rates
        const shippingRatesResponse = await this.request.get(this.endpoints.checkout.shipments, {
            headers: {
                'X-Spree-Order-Token': this.cartToken,
                'Content-Type': 'application/json'
            }
        });

        if (shippingRatesResponse.status() !== StatusCode.Ok) {
            throw new Error(`Failed to get shipping rates: ${await shippingRatesResponse.text()}`);
        }

        const shippingRatesData = await shippingRatesResponse.json();
        const shipment = shippingRatesData.data[0];
        
        if (!shipment || !shipment.relationships.shipping_rates.data.length) {
            throw new Error('No shipping rates available for this address');
        }

        const shippingRate = shipment.relationships.shipping_rates.data[0];

        // Select the shipping rate
        const selectResponse = await this.request.patch(this.endpoints.checkout.delivery, {
            headers: {
                'X-Spree-Order-Token': this.cartToken,
                'Content-Type': 'application/vnd.api+json'
            },
            data: {
                data: {
                    type: 'checkout',
                    attributes: {
                        shipments_attributes: [{
                            id: shipment.id,
                            selected_shipping_rate_id: shippingRate.id
                        }]
                    }
                }
            }
        });

        if (selectResponse.status() !== StatusCode.Ok) {
            throw new Error(`Failed to select shipping rate: ${await selectResponse.text()}`);
        }

        return selectResponse;
    }

    async addPaymentToOrder(): Promise<APIResponse> {
        if (!this.cartToken) {
            throw new Error('Cart token is required to add payment');
        }

        return await this.request.patch(this.endpoints.checkout.next, {
            headers: {
                'X-Spree-Order-Token': this.cartToken,
                'Content-Type': 'application/vnd.api+json'
            },
            data: {
                data: {
                    type: 'checkout',
                    attributes: {
                        payment_method_id: 1
                    }
                }
            }
        });
    }

    async completeOrder(): Promise<APIResponse> {
        if (!this.cartToken) {
            throw new Error('Cart token is required to complete order');
        }

        // First advance the order state
        const advanceResponse = await this.request.patch(this.endpoints.checkout.advance, {
            headers: {
                'X-Spree-Order-Token': this.cartToken,
                'Content-Type': 'application/vnd.api+json'
            }
        });

        if (advanceResponse.status() !== StatusCode.Ok) {
            throw new Error(`Failed to advance order state: ${await advanceResponse.text()}`);
        }

        // Then complete the order
        const completeResponse = await this.request.patch(this.endpoints.checkout.complete, {
            headers: {
                'X-Spree-Order-Token': this.cartToken,
                'Content-Type': 'application/vnd.api+json'
            },
            data: {
                data: {
                    type: 'order',
                    attributes: {
                        state: 'complete',
                        payment_state: 'paid',
                        shipment_state: 'ready'
                    }
                }
            }
        });

        if (completeResponse.status() !== StatusCode.Ok) {
            throw new Error(`Failed to complete order: ${await completeResponse.text()}`);
        }

        return completeResponse;
    }

    async getCurrentOrder(): Promise<APIResponse> {
        return this.request.get(this.endpoints.checkout.next);
    }

    private async ensureCart(): Promise<void> {
        if (!this.cartToken) {
            const response = await this.postRaw(this.endpoints.cart.create, {});
            const data = await response.json();
            this.setCartToken(data.data.attributes.token);
        }
    }

    async adminLogin(email: string, password: string): Promise<APIResponse> {
        // First get the login page to obtain CSRF token
        const loginPage = await this.request.get(`${this.baseUrl}/users/sign_in`);
        const html = await loginPage.text();
        const csrfToken = html.match(/name="authenticity_token" value="([^"]+)"/)?.[1];

        if (!csrfToken) {
            throw new Error('Could not find CSRF token');
        }

        const formData = new URLSearchParams();
        formData.append('authenticity_token', csrfToken);
        formData.append('user[email]', email);
        formData.append('user[password]', password);

        const response = await this.request.post(`${this.baseUrl}/users/sign_in`, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            },
            data: formData.toString(),
            maxRedirects: 0
        });

        console.log(`Login response status: ${response.status()}`);
        console.log(`Login response headers: ${JSON.stringify(response.headers(), null, 2)}`);

        return response;
    }

    async getCurrentUser(): Promise<APIResponse> {
        return await this.getRaw(this.endpoints.platform.users.current);
    }

    async getAdminOrders(token: string): Promise<APIResponse> {
        return await this.getRaw(this.endpoints.admin.orders, {
            'Authorization': `Bearer ${token}`
        });
    }

    async adminLogout(): Promise<APIResponse> {
        // Get CSRF token from the page
        const page = await this.request.get(`${this.baseUrl}/admin`);
        const html = await page.text();
        const csrfToken = html.match(/name="authenticity_token" value="([^"]+)"/)?.[1];

        if (!csrfToken) {
            throw new Error('Could not find CSRF token');
        }

        return await this.deleteRaw(`/users/sign_out?authenticity_token=${encodeURIComponent(csrfToken)}`);
    }

    async getAdminDashboard(): Promise<APIResponse> {
        return await this.request.get(`${this.baseUrl}/admin`, {
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            },
            maxRedirects: 0
        });
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
