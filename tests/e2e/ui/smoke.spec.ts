import { test, expect } from '@playwright/test';
import testData from '../../config/testData';

test.describe('Basic Site Navigation', () => {
  test('should load homepage and product page', async ({ page }) => {
    // Homepage check
    const startTime = Date.now();
    await page.goto('http://localhost:3000/');
    console.log(`Homepage load time: ${Date.now() - startTime}ms`);
    await expect(page.getByRole('heading', { name: 'Welcome to our shop!' })).toBeVisible();

    // Product page check
    const productStartTime = Date.now();
    await page.goto('http://localhost:3000/products/printed-pants');
    console.log(`Product page load time: ${Date.now() - productStartTime}ms`);
    await expect(page.getByRole('heading', { name: 'Printed Pants' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add To Cart' })).toBeVisible();
  });
});
