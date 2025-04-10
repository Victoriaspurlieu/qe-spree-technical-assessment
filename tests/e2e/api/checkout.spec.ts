import { test, expect } from '@playwright/test';
import { ApiUtils } from '../../utils/apiUtils';
import testData from '../../config/testData';
import { StatusCode } from '../../schemas/spreeSchema';

test.describe('Checkout flow', () => {
    let apiUtils: ApiUtils;

    test.beforeEach(async ({ request }) => {
        apiUtils = new ApiUtils(request, testData.api.baseUrl);
    });

    test('should add Printed Pants to cart and verify cart contents', async () => {
        // Create an account first
        const email = `test${Date.now()}@example.com`;
        const password = 'password123';
        const accountResponse = await apiUtils.createAccount(email, password);
        expect(accountResponse.ok()).toBeTruthy();

        // Add Printed Pants to cart
        const addToCartResponse = await apiUtils.addToCart(testData.api.productId);
        const addToCartData = await addToCartResponse.json();
        expect(addToCartResponse.ok()).toBeTruthy();
        expect(addToCartData.data.type).toBe('cart');

        // Verify cart contents
        const cartResponse = await apiUtils.getCart();
        const cartData = await cartResponse.json();
        expect(cartData.data.type).toBe('cart');
        expect(cartData.data.attributes.item_count).toBe(1);

        // Get the line item ID from the relationships
        const lineItemId = cartData.data.relationships.line_items.data[0].id;
        expect(lineItemId).toBeTruthy();

        // Update quantity
        const updateResponse = await apiUtils.updateCartQuantity(lineItemId, 2);
        const updateData = await updateResponse.json();
        expect(updateData.data.type).toBe('cart');
        expect(updateData.data.attributes.item_count).toBe(1);

        // Remove item from cart
        const removeResponse = await apiUtils.removeFromCart(lineItemId);
        const removeData = await removeResponse.json();
        expect(removeData.data.type).toBe('cart');
        expect(removeData.data.attributes.item_count).toBe(0);

        // Verify cart is empty
        const emptyCartResponse = await apiUtils.getCart();
        const emptyCartData = await emptyCartResponse.json();
        expect(emptyCartData.data.type).toBe('cart');
        expect(emptyCartData.data.attributes.item_count).toBe(0);
    });

    test('should handle invalid order scenarios', async () => {
        // Try to get an invalid order
        const invalidOrderResponse = await apiUtils.getOrder('invalid-order-number').catch(error => error);
        expect(invalidOrderResponse.status()).toBe(StatusCode.NotFound);

        // Try to add payment to invalid order
        const invalidPaymentResponse = await apiUtils.addPayment('invalid-order-number', 'invalid-payment-method').catch(error => error);
        expect(invalidPaymentResponse.status()).toBe(StatusCode.NotFound);

        // Try to complete invalid order
        const invalidCompleteResponse = await apiUtils.completeCheckout('invalid-order-number').catch(error => error);
        expect(invalidCompleteResponse.status()).toBe(StatusCode.NotFound);
    });
});
