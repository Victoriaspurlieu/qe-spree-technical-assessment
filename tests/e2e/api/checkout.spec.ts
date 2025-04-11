import { test, expect } from '@playwright/test';
import testData from '../../config/testData';
import { StatusCode } from '../../schemas/spreeSchema';
import { authenticateAdmin } from '../../utils/authUtils';
import * as fs from 'fs';
import * as path from 'path';

// Ensure artifacts directory exists
const artifactsDir = path.join(__dirname, '../../artifacts');
if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
}

test.describe('Checkout flow', () => {
    test('should complete a successful checkout', async ({ request }) => {
        // Authenticate as a regular user
        const apiUtils = await authenticateAdmin(request);

        // Add product to cart
        const addToCartResponse = await apiUtils.addToCart(testData.api.productId);
        expect(addToCartResponse.status()).toBe(StatusCode.Ok);
        const addToCartData = await addToCartResponse.json();
        fs.writeFileSync(path.join(artifactsDir, 'cart_state_1.json'), JSON.stringify(addToCartData, null, 2));

        // Verify cart contents
        const cartResponse = await apiUtils.getCart();
        expect(cartResponse.status()).toBe(StatusCode.Ok);
        const cartData = await cartResponse.json();
        fs.writeFileSync(path.join(artifactsDir, 'cart_state_2.json'), JSON.stringify(cartData, null, 2));
        expect(cartData.data.attributes.item_count).toBe(1);

        // Get the line item ID
        const lineItemId = cartData.data.relationships.line_items.data[0].id;

        // Update quantity
        const updateResponse = await apiUtils.updateCartQuantity(lineItemId, 2);
        expect(updateResponse.status()).toBe(StatusCode.Ok);
        const updateData = await updateResponse.json();
        fs.writeFileSync(path.join(artifactsDir, 'cart_state_3.json'), JSON.stringify(updateData, null, 2));

        // Proceed to checkout
        const checkoutResponse = await apiUtils.proceedToCheckout();
        expect(checkoutResponse.status()).toBe(StatusCode.Ok);
        const checkoutData = await checkoutResponse.json();
        fs.writeFileSync(path.join(artifactsDir, 'cart_state_4.json'), JSON.stringify(checkoutData, null, 2));

        // Add shipping address
        const addressResponse = await apiUtils.addShippingAddress({
            firstname: 'John',
            lastname: 'Doe',
            address1: '1600 Pennsylvania Avenue NW',
            city: 'Washington',
            zipcode: '20500',
            phone: '555-123-4567',
            state_name: 'DC',
            country_iso: 'US'
        });
        expect(addressResponse.status()).toBe(StatusCode.Ok);
        console.log('Address Response Status:', addressResponse.status());
        console.log('Address Response Headers:', await addressResponse.headers());
        console.log('Address Response Body:', await addressResponse.text());
        const addressData = await addressResponse.json();
        fs.writeFileSync(path.join(artifactsDir, 'cart_state_5.json'), JSON.stringify(addressData, null, 2));

        // Print cart state before proceeding
        const cartWithAddress = await apiUtils.getCart();
        const cartWithAddressData = await cartWithAddress.json();
        console.log('Cart State:', JSON.stringify(cartWithAddressData, null, 2));

       // Select shipping method
       const shippingResponse = await apiUtils.selectFirstShippingRate();
       expect(shippingResponse.status()).toBe(StatusCode.Ok);
       const shippingData = await shippingResponse.json();
       fs.writeFileSync(path.join(artifactsDir, 'shipping_data.json'), JSON.stringify(shippingData, null, 2));

       // Add payment method
       const paymentResponse = await apiUtils.addPaymentToOrder();
       expect(paymentResponse.status()).toBe(StatusCode.Ok);
       const paymentData = await paymentResponse.json();
       fs.writeFileSync(path.join(artifactsDir, 'payment_data.json'), JSON.stringify(paymentData, null, 2));

       // Complete the order
       const completeResponse = await apiUtils.completeOrder();
       expect(completeResponse.status()).toBe(StatusCode.Ok);
       const orderData = await completeResponse.json();
       fs.writeFileSync(path.join(artifactsDir, 'final_order.json'), JSON.stringify(orderData, null, 2));

       // Verify order completion
       expect(orderData.data.attributes.state).toBe('complete');
       expect(orderData.data.attributes.payment_state).toBe('paid');
       expect(orderData.data.attributes.shipment_state).toBe('ready');
    });

    test('should handle payment decline', async ({ request }) => {
        const apiUtils = await authenticateAdmin(request);
        await apiUtils.addToCart(testData.api.productId);
        await apiUtils.proceedToCheckout();
        await apiUtils.addShippingAddress({
            firstname: 'John',
            lastname: 'Doe',
            address1: '123 Main St',
            city: 'New York',
            zipcode: '10001',
            phone: '555-123-4567',
            state_name: 'NY',
            country_iso: 'US'
        });
        await apiUtils.selectFirstShippingRate();
        try {
            await apiUtils.addPaymentToOrder();
            throw new Error('Expected payment to be declined');
        } catch (error: any) {
            expect(error.message).toContain('Payment was declined');
        }

        const orderResponse = await apiUtils.getCurrentOrder();
        const orderData = await orderResponse.json();
        expect(orderData.data.attributes.payment_state).toBe('failed');
    });

    test('should handle invalid shipping address', async ({ request }) => {
        const apiUtils = await authenticateAdmin(request);
        await apiUtils.addToCart(testData.api.productId);
        await apiUtils.proceedToCheckout();

        try {
            await apiUtils.addShippingAddress({
                firstname: '',
                lastname: '',
                address1: '',
                city: '',
                zipcode: '',
                phone: '',
                state_name: '',
                country_iso: ''
            });
            throw new Error('Expected address validation to fail');
        } catch (error: any) {
            expect(error.message).toContain('Address validation failed');
        }
    });

    test('should handle out of stock items', async ({ request }) => {
        const apiUtils = await authenticateAdmin(request);

        try {
            await apiUtils.addToCart(testData.api.outOfStockProductId);
            throw new Error('Expected out of stock error');
        } catch (error: any) {
            expect(error.message).toContain('Out of stock');
        }
    });

    test('should handle session expiration during checkout', async ({ request }) => {
        const apiUtils = await authenticateAdmin(request);
        await apiUtils.addToCart(testData.api.productId);
        await apiUtils.proceedToCheckout();

        await apiUtils.clearAuthToken();

        try {
            await apiUtils.addShippingAddress({
                firstname: 'John',
                lastname: 'Doe',
                address1: '123 Main St',
                city: 'New York',
                zipcode: '10001',
                phone: '555-123-4567',
                state_name: 'NY',
                country_iso: 'US'
            });
            throw new Error('Expected authentication error');
        } catch (error: any) {
            expect(error.message).toContain('Unauthorized');
        }
    });
});

