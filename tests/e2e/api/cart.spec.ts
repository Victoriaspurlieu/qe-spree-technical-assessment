import { test, expect } from '@playwright/test';
import { ApiUtils } from '../../utils/apiUtils';
import testData from '../../config/testData';
import { StatusCode } from '../../schemas/spreeSchema';
import { SpreeEndpoints } from '../../config/endpoints/spreeEndpoints';
import { authenticateAdmin } from '../../utils/authUtils';

const spreeEndpoints = SpreeEndpoints.getInstance(testData.api.baseUrl);

test.describe('Cart API', () => {
    let apiUtils: ApiUtils;

    test.beforeEach(async ({ request }) => {
        apiUtils = new ApiUtils(request, testData.api.baseUrl);
        // Clear any existing cart before each test
        await apiUtils.clearCart();
    });

    test('should successfully log in as admin and modify cart contents', async ({ request }) => {
        const authenticatedApiUtils = await authenticateAdmin(request);

        // Verify admin dashboard access
        const dashboardResponse = await authenticatedApiUtils.getAdminDashboard();
        expect(dashboardResponse.status()).toBe(StatusCode.Ok);

        // First ensure we have a valid cart
        const initialCart = await apiUtils.getCart();
        expect(initialCart.status()).toBe(StatusCode.Ok);
        const initialCartData = await initialCart.json();
        expect(initialCartData.data.attributes.item_count).toBe(0);

        // Add product to cart
        const response = await apiUtils.addToCart(testData.api.productId);
        expect(response.status()).toBe(StatusCode.Ok);
        const responseData = await response.json();
        expect(responseData.data.type).toBe('cart');
        expect(responseData.data.attributes.item_count).toBe(1);
        expect(responseData.data.relationships.line_items.data).toHaveLength(1);
        const initialLineItemId = responseData.data.relationships.line_items.data[0].id;

        // Update quantity
        const updateResponse = await apiUtils.updateCartQuantity(initialLineItemId, 2);
        expect(updateResponse.status()).toBe(StatusCode.Ok);
        const updateResponseData = await updateResponse.json();
        expect(updateResponseData.data.type).toBe('cart');
        expect(updateResponseData.data.attributes.item_count).toBe(2);
        expect(updateResponseData.data.relationships.line_items.data).toHaveLength(1);

        // Verify the cart contents
        const cart = await apiUtils.getCart();
        expect(cart.status()).toBe(StatusCode.Ok);
        const cartData = await cart.json();
        console.log('Cart Response:', JSON.stringify(cartData, null, 2));
        expect(cartData.data.attributes.item_count).toBe(2);
        expect(cartData.data.relationships.line_items.data).toHaveLength(1);

        // Get the line item from included array
        const lineItem = cartData.included?.find((item: { type: string }) => item.type === 'line_item');
        console.log('Full Line Item:', JSON.stringify(lineItem, null, 2));
        expect(lineItem).toBeDefined();
        if (lineItem && lineItem.attributes) {
            // First log the structure to debug
            console.log('Line Item Attributes:', JSON.stringify(lineItem.attributes, null, 2));
            // Check if we have a variant relationship instead of a direct variant_id
            const variantId = lineItem.relationships?.variant?.data?.id;
            expect(variantId).toBeDefined();
            expect(variantId).toBe(testData.api.productId);
            expect(lineItem.attributes.quantity).toBe(2);
        }

        // Remove item from cart
        const removeResponse = await apiUtils.removeFromCart(initialLineItemId);
        expect(removeResponse.status()).toBe(StatusCode.Ok);
        const removeResponseData = await removeResponse.json();
        expect(removeResponseData.data.attributes.item_count).toBe(0);
        expect(removeResponseData.data.relationships.line_items.data).toHaveLength(0);

        // Verify cart is empty
        const finalCart = await apiUtils.getCart();
        expect(finalCart.status()).toBe(StatusCode.Ok);
        const finalCartData = await finalCart.json();
        expect(finalCartData.data.attributes.item_count).toBe(0);
        expect(finalCartData.data.relationships.line_items.data).toHaveLength(0);
    });

    test('should handle adding invalid product to cart', async () => {
        try {
            const response = await apiUtils.addToCart('999999');
            expect(response.status()).toBe(StatusCode.NotFound);
        } catch (error) {
            console.error('Test failed:', error);
            throw error;
        }
    });

    test('should fail with 400 when adding product with missing fields', async () => {
        const response = await apiUtils.addToCart('', 1);
        expect([StatusCode.BadRequest, StatusCode.NotFound]).toContain(response.status());
    });

    test('should handle invalid quantity update', async () => {
        // Add product to cart first
        const addResponse = await apiUtils.addToCart(testData.api.productId);
        expect(addResponse.status()).toBe(StatusCode.Ok);
        const addResponseData = await addResponse.json();
        const lineItemId = addResponseData.data.relationships.line_items.data[0].id;

        // Try to update with invalid quantity
        const response = await apiUtils.updateCartQuantity(lineItemId, -1);
        expect([StatusCode.UnprocessableEntity, StatusCode.BadRequest]).toContain(response.status());
    });


    test('should clear cart', async () => {
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

    test('should handle cart validation', async ({ request }) => {
        const apiUtils = await authenticateAdmin(request);

        // Invalid variant ID
        const addResponse = await apiUtils.addToCart('999999');
        expect([StatusCode.NotFound, StatusCode.BadRequest]).toContain(addResponse.status());

        // Add a valid product first to get a valid line item ID
        const validAddResponse = await apiUtils.addToCart(testData.api.productId);
        expect(validAddResponse.status()).toBe(StatusCode.Ok);
        const validAddData = await validAddResponse.json();
        const validLineItemId = validAddData.data.relationships.line_items.data[0].id;

        // Invalid line item quantity update
        const updateResponse = await apiUtils.updateCartQuantity('invalid-line-item-id', 3);
        expect([StatusCode.NotFound, StatusCode.BadRequest]).toContain(updateResponse.status());

        // Invalid item removal
        const removeResponse = await apiUtils.removeFromCart('invalid-line-item-id');
        expect([StatusCode.NotFound, StatusCode.BadRequest]).toContain(removeResponse.status());

        // Clean up by removing the valid item
        await apiUtils.removeFromCart(validLineItemId);
    });
});