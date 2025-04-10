import { APIRequestContext, APIResponse } from '@playwright/test';
import { BaseApiClient } from './baseApiClient';

interface SpreeResponse {
  data: any;
  included?: any[];
}

export class SpreeApiClient extends BaseApiClient {
  private cartToken: string | undefined;
  private stockCache: Map<string, number> = new Map();

  constructor(baseUrl: string, request: APIRequestContext) {
    super(baseUrl, request);
  }

  private updateHeaders() {
    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    if (this.cartToken) {
      this.headers['X-Spree-Order-Token'] = this.cartToken;
    }
  }

  private async ensureCart() {
    if (!this.cartToken) {
      console.log('Creating new cart...');
      try {
        const response = await this.post<SpreeResponse>('/api/v2/storefront/cart', {});
        if (!response.data?.attributes?.token) {
          throw new Error('Failed to create cart: No token in response');
        }
        this.cartToken = response.data.attributes.token;
        this.updateHeaders();
        console.log('Cart created successfully with token:', this.cartToken);
      } catch (error) {
        console.error('Failed to create cart:', error);
        throw error;
      }
    }
  }

  async createAccount(email: string, password: string): Promise<SpreeResponse> {
    if (!email || !password) {
      throw new Error('Email and password are required to create an account');
    }

    console.log('Creating account with email:', email);
    try {
      const response = await this.post<SpreeResponse>('/api/v2/storefront/account', {
        user: {
          email: email,
          password: password,
          password_confirmation: password
        }
      });
      console.log('Account created successfully');
      return response;
    } catch (error) {
      console.error('Failed to create account:', error);
      throw error;
    }
  }

  async login(email: string, password: string): Promise<void> {
    console.log('Logging in with email:', email);
    try {
      const response = await this.postRaw('/spree_oauth/token', {
        grant_type: 'password',
        username: email,
        password: password
      }, undefined, true);

      const data = await response.json();
      if (!response.ok()) {
        let errorMessage = `Login failed with status ${response.status()}`;
        if (data) {
          errorMessage += `: ${JSON.stringify(data)}`;
        }
        throw new Error(errorMessage);
      }

      if (!data.access_token) {
        throw new Error('No access token received in login response');
      }
      
      console.log('Login successful, received access token');
      this.headers['Authorization'] = `Bearer ${data.access_token}`;
      this.updateHeaders();
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {}

  async addToCart(variantId: string, quantity: number = 1): Promise<SpreeResponse> {
    await this.ensureCart();
    try {
      // Check stock before adding to cart
      const stockCount = this.stockCache.get(variantId);
      if (stockCount !== undefined && stockCount < quantity) {
        throw new Error(`Not enough stock for variant ${variantId}. Available: ${stockCount}, Requested: ${quantity}`);
      }

      const response = await this.post<SpreeResponse>('/api/v2/storefront/cart/add_item', {
        variant_id: variantId,
        quantity
      });

      // Update stock cache after successful addition
      if (stockCount !== undefined) {
        this.stockCache.set(variantId, stockCount - quantity);
      }

      return response;
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      throw error;
    }
  }

  async getCart(): Promise<SpreeResponse> {
    await this.ensureCart();
    return this.get<SpreeResponse>('/api/v2/storefront/cart');
  }

  async updateCartQuantity(lineItemId: string, quantity: number): Promise<SpreeResponse> {
    await this.ensureCart();
    if (quantity === 0) {
      return this.delete<SpreeResponse>(`/api/v2/storefront/cart/line_items/${lineItemId}`, {});
    }
    return this.patch<SpreeResponse>('/api/v2/storefront/cart/set_quantity', {
      line_item_id: lineItemId,
      quantity
    });
  }

  async removeFromCart(lineItemId: string): Promise<SpreeResponse> {
    await this.ensureCart();
    return this.delete<SpreeResponse>(`/api/v2/storefront/cart/line_items/${lineItemId}`, {});
  }

  async clearCart(): Promise<SpreeResponse> {
    const cartResponse = await this.getCart();
    const lineItemIds = cartResponse.data.relationships.line_items.data.map((li: any) => li.id);
    for (const id of lineItemIds) {
      await this.updateCartQuantity(id, 0);
    }
    return cartResponse;
  }

  async getProducts(): Promise<SpreeResponse> {
    console.log('Fetching products...');
    try {
      const response = await this.get<SpreeResponse>('/api/v2/storefront/products?include=variants,stock_items');
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid products response: data is not an array');
      }
      
      // Cache stock items for each variant
      if (response.included) {
        const stockItems = response.included.filter(item => item.type === 'stock_item');
        for (const stockItem of stockItems) {
          const variantId = stockItem.relationships.variant.data.id;
          const count = stockItem.attributes.count_on_hand;
          this.stockCache.set(variantId, count);
        }
      }
      
      return response;
    } catch (error) {
      console.error('Failed to fetch products:', error);
      throw error;
    }
  }

  async updateOrderAddress(address: any): Promise<SpreeResponse> {
    await this.ensureCart();
    const response = await this.patch<SpreeResponse>('/api/v2/storefront/checkout', {
      order: {
        bill_address_attributes: address,
        ship_address_attributes: address
      }
    });

    if (!response.data || response.data.attributes.state === 'cart') {
      throw new Error('Address update failed or incomplete data returned');
    }

    return response;
  }

  async selectFirstShippingRate(): Promise<SpreeResponse> {
    try {
      // Get current order state
      const order = await this.getCart();
      console.log('Current order state:', order.data?.attributes?.state);
      
      if (!order.data?.attributes?.state) {
        throw new Error(`Invalid order state: ${JSON.stringify(order)}`);
      }
      
      // Advance to delivery state if needed
      if (order.data.attributes.state === 'address') {
        console.log('Advancing from address to delivery state...');
        await this.advanceCheckout();
      }

      // Get the shipping rates
      console.log('Fetching shipping rates...');
      const rates = await this.getShippingRates();
      console.log('Shipping rates response:', JSON.stringify(rates, null, 2));
      
      if (!rates.data) {
        throw new Error(`No data in shipping rates response: ${JSON.stringify(rates)}`);
      }

      // Find the first shipment and its shipping rates
      const shipments = Array.isArray(rates.data) ? rates.data : [rates.data];
      if (shipments.length === 0) {
        throw new Error(`No shipments found in response: ${JSON.stringify(rates)}`);
      }

      const shipment = shipments[0];
      if (!shipment.id) {
        throw new Error(`Shipment has no ID: ${JSON.stringify(shipment)}`);
      }

      // Get shipping rates from included array
      const shippingRates = rates.included?.filter((item: any) => 
        item.type === 'shipping_rate' && 
        item.relationships?.shipment?.data?.id === shipment.id
      );

      if (!shippingRates || shippingRates.length === 0) {
        throw new Error(`No shipping rates found for shipment: ${JSON.stringify(shipment)}`);
      }

      const firstRate = shippingRates[0];
      console.log('Selected shipping rate:', firstRate);

      // Select the shipping rate
      const response = await this.patch<SpreeResponse>(`/api/v2/storefront/checkout/select_shipping_rate`, {
        shipment_id: shipment.id,
        shipping_rate_id: firstRate.id
      });

      // Advance to payment state
      await this.advanceCheckout();

      return response;
    } catch (error) {
      console.error('Failed to select shipping rate:', error);
      throw error;
    }
  }

  async advanceCheckout(): Promise<SpreeResponse> {
    return this.patch<SpreeResponse>('/api/v2/storefront/checkout/next', {});
  }

  async getPaymentMethods(): Promise<SpreeResponse> {
    return this.get<SpreeResponse>('/api/v2/storefront/checkout/payment_methods');
  }

  async getShippingRates(): Promise<SpreeResponse> {
    return this.get<SpreeResponse>('/api/v2/storefront/checkout/shipping_rates');
  }

  async addPaymentToOrder(paymentMethodId: string): Promise<SpreeResponse> {
    await this.ensureCart();
    const response = await this.patch<SpreeResponse>('/api/v2/storefront/checkout', {
      order: {
        payments_attributes: [{
          payment_method_id: paymentMethodId
        }]
      }
    });
    return this.advanceCheckout();
  }

  async completeOrder(): Promise<SpreeResponse> {
    console.log('Completing order...');
    // Get the current order state
    const order = await this.getCart();
    console.log('Current order state:', order.data.attributes.state);
    
    // If the order is not in the confirm state, try to advance it
    if (order.data.attributes.state !== 'confirm') {
      console.log('Advancing order to confirm state...');
      const advanceResponse = await this.advanceCheckout();
      console.log('Advance response:', advanceResponse);
      if (advanceResponse.data.attributes.state !== 'confirm') {
        throw new Error(`Failed to advance order to confirm state. Current state: ${advanceResponse.data.attributes.state}`);
      }
    }
    
    const response = await this.patch<SpreeResponse>('/api/v2/storefront/checkout/complete', {});
    console.log('Order completion response:', response);
    return response;
  }

  async getOrder(orderNumber: string): Promise<SpreeResponse> {
    return this.get<SpreeResponse>(`/api/v2/storefront/orders/${orderNumber}`);
  }
}
