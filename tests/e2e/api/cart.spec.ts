import { test, expect } from '@playwright/test';
import { ApiUtils } from '../../utils/apiUtils';
import testData from '../../config/testData';
import { StatusCode } from '../../schemas/spreeSchema';
import { SpreeEndpoints } from '../../endpoints/spreeEndpoints';

const spreeEndpoints = SpreeEndpoints.getInstance(testData.api.baseUrl);

test.describe('Cart API', () => {
    let apiUtils: ApiUtils;

    test.beforeEach(async ({ request }) => {
        apiUtils = new ApiUtils(request, testData.api.baseUrl);
        // Clear any existing cart before each test
        await apiUtils.clearCart();
    });

    test('should successfully log in as admin', async () => {
        const email = 'spree@example.com';
        const password = 'spree123';
        const response = await apiUtils.adminLogin(email, password);
        expect(response.status()).toBe(StatusCode.Ok);

        const responseData = await response.json();
        expect(responseData.access_token).toBeDefined();
        apiUtils.setAuthToken(responseData.access_token);

        const userResponse = await apiUtils.getCurrentUser();
        expect(userResponse.status()).toBe(StatusCode.Ok);
        const userData = await userResponse.json();
        expect(userData.data.attributes.email).toBe(email);
    });

    test('should add product to cart', async () => {
        // First ensure we have a valid cart
        const initialCart = await apiUtils.getCart();
        expect(initialCart.status()).toBe(StatusCode.Ok);
        const initialCartData = await initialCart.json();
        expect(initialCartData.data.attributes.item_count).toBe(0);

        // Add product to cart
        const response = await apiUtils.addToCart(testData.api.productId);
        expect(response.status()).toBe(StatusCode.Created);
        const responseData = await response.json();
        expect(responseData.data.type).toBe('cart');
        expect(responseData.data.attributes.item_count).toBe(1);
        expect(responseData.data.relationships.line_items.data).toHaveLength(1);
        const lineItemId = responseData.data.relationships.line_items.data[0].id;
        
        // Update quantity
        const updateResponse = await apiUtils.updateCartQuantity(lineItemId, 2);
        expect(updateResponse.status()).toBe(StatusCode.Ok);
        const updateResponseData = await updateResponse.json();
        expect(updateResponseData.data.type).toBe('cart');
        expect(updateResponseData.data.attributes.item_count).toBe(1);
        expect(updateResponseData.data.relationships.line_items.data).toHaveLength(1);
        
        // Verify the cart contents
        const cart = await apiUtils.getCart();
        expect(cart.status()).toBe(StatusCode.Ok);
        const cartData = await cart.json();
        expect(cartData.data.attributes.item_count).toBe(1);
        expect(cartData.data.relationships.line_items.data).toHaveLength(1);
        const lineItem = cartData.included?.find((item: { type: string }) => item.type === 'line_item');
        expect(lineItem).toBeDefined();
        expect(lineItem?.attributes.variant_id.toString()).toBe(testData.api.productId);
        expect(lineItem?.attributes.quantity).toBe(2);
    });

    test('should handle adding invalid product to cart', async () => {
        const response = await apiUtils.addToCart('999999');
        expect(response.status()).toBe(StatusCode.NotFound);
    });

    test('should fail with 400 when adding product with missing fields', async () => {
        const response = await apiUtils.addToCart('', 1);
        expect(response.status()).toBe(StatusCode.BadRequest);
    });

    test('should handle invalid quantity update', async () => {
        // Add product to cart first
        const addResponse = await apiUtils.addToCart(testData.api.productId);
        expect(addResponse.status()).toBe(StatusCode.Created);
        const addResponseData = await addResponse.json();
        const lineItemId = addResponseData.data.relationships.line_items.data[0].id;
        
        // Try to update with invalid quantity
        const response = await apiUtils.updateCartQuantity(lineItemId, -1);
        expect(response.status()).toBe(StatusCode.UnprocessableEntity);
    });

    test('should remove product from cart', async () => {
        // Add product to cart first
        const addResponse = await apiUtils.addToCart(testData.api.productId);
        expect(addResponse.status()).toBe(StatusCode.Created);
        const addResponseData = await addResponse.json();
        const lineItemId = addResponseData.data.relationships.line_items.data[0].id;
        
        // Remove the product
        const response = await apiUtils.removeFromCart(lineItemId);
        expect(response.status()).toBe(StatusCode.Ok);
        const responseData = await response.json();
        expect(responseData.data.type).toBe('cart');
        expect(responseData.data.attributes.item_count).toBe(0);
        expect(responseData.data.relationships.line_items.data).toHaveLength(0);
        
        // Verify the cart is empty
        const cart = await apiUtils.getCart();
        expect(cart.status()).toBe(StatusCode.Ok);
        const cartData = await cart.json();
        expect(cartData.data.attributes.item_count).toBe(0);
        expect(cartData.data.relationships.line_items.data).toHaveLength(0);
    });

    test('should clear cart', async () => {
        // Add product to cart first
        await apiUtils.addToCart(testData.api.productId);
        
        // Clear the cart
        const response = await apiUtils.clearCart();
        expect(response.status()).toBe(StatusCode.Ok);
        const responseData = await response.json();
        expect(responseData.data.type).toBe('cart');
        expect(responseData.data.attributes.item_count).toBe(0);
        expect(responseData.data.relationships.line_items.data).toHaveLength(0);
        
        // Verify the cart is empty
        const cart = await apiUtils.getCart();
        expect(cart.status()).toBe(StatusCode.Ok);
        const cartData = await cart.json();
        expect(cartData.data.attributes.item_count).toBe(0);
        expect(cartData.data.relationships.line_items.data).toHaveLength(0);
    });
});