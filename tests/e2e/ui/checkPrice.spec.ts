import { test, expect } from '@playwright/test';
import { ProductPage } from '../../pages/productPage';
import testData from '../../config/testData';

test.describe('Check Product Price', () => {
    test('should get current product price', async ({ page }) => {
        const productPage = new ProductPage(page);
        await productPage.goto(testData.paths.product);
        
        // Get and log the current price
        const price = await productPage.getProductPrice();
        console.log('Current price on website:', price);
    });
}); 