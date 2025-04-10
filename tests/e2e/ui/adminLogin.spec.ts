import { test, expect } from '@playwright/test';
import testData from '../../config/testData';

test.describe('User Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(testData.api.baseUrl + '/users/sign_in');
    await page.waitForSelector('#user_email', { state: 'visible' });
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    test.setTimeout(60000);

    try {
      await page.fill('#user_email', testData.ui.spree.email);
      await page.fill('#user_password', testData.ui.spree.password);
      await page.screenshot({ path: 'test-results/before-login.png' });
      await page.click('input[type="submit"][name="commit"]');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/after-login.png' });
      await page.waitForSelector('.flash-message', { timeout: 10000 });
      const flashMessage = await page.locator('.flash-message').textContent();
      expect(flashMessage?.trim()).toBe('Signed in successfully.');
      await page.screenshot({ path: 'test-results/admin-login-success.png' });
    } catch (error) {
      console.error('Login failed:', error);
      await page.screenshot({ path: 'test-results/admin-login-error.png' });
      throw error;
    }
  });

  test('should show error with invalid credentials', async ({ page }) => {
    try {
      await page.fill('#user_email', 'invalid@example.com');
      await page.fill('#user_password', 'wrongpassword');
      await page.click('input[type="submit"][name="commit"]');
      await page.waitForSelector('.flash-message', { timeout: 10000 });
      const errorMessage = await page.locator('.flash-message').textContent();
      expect(errorMessage?.trim()).toBe('Invalid Email or password.');
      await page.screenshot({ path: 'test-results/admin-login-invalid.png' });
    } catch (error) {
      console.error('Invalid login test failed:', error);
      await page.screenshot({ path: 'test-results/admin-login-invalid-error.png' });
      throw error;
    }
  });
}); 