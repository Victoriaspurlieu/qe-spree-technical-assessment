import { test, expect } from '@playwright/test';
import testData from '../../config/testData';

test.describe('Basic Site Navigation', () => {
  test('should load homepage and product page', async ({ page }) => {
    // Homepage check
    await page.goto('http://localhost:3000/');
    await expect(page.getByRole('heading', { name: 'Welcome to our shop!' })).toBeVisible();

    // Product page check
    await page.goto('http://localhost:3000/products/printed-pants');
    await expect(page.getByRole('heading', { name: 'Printed Pants' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add To Cart' })).toBeVisible();
  });
});
