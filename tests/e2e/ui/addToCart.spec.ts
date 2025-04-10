import { test, expect } from '@playwright/test';
import { addProductToCart } from '../../support/cartActions';

test.describe('Add to Cart', () => {
    test('should add product to cart', async ({ page }) => {
        const cartPage = await addProductToCart(page);
        expect(await cartPage.isProductPresent()).toBeTruthy();
    });
}); 