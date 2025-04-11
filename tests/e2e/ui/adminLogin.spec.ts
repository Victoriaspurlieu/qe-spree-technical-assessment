import { test, expect } from '@playwright/test';
import testData from '../../config/testData';

test.describe('User Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(testData.api.baseUrl + '/users/sign_in');
    await page.waitForSelector(testData.selectors.userEmail, { state: 'visible' });
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    test.setTimeout(60000);

    try {
      await page.fill(testData.selectors.userEmail, testData.ui.spree.email);
      await page.fill(testData.selectors.userPassword, testData.ui.spree.password);
      await page.screenshot({ path: testData.screenshots.beforeLogin });
      await page.click(testData.selectors.submitButton);
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: testData.screenshots.afterLogin });
      await page.waitForSelector(testData.selectors.flashMessage, { timeout: 10000 });
      const flashMessage = await page.locator(testData.selectors.flashMessage).textContent();
      expect(flashMessage?.trim()).toBe(testData.texts.loginSuccess);
      await page.screenshot({ path: testData.screenshots.adminLoginSuccess });
    } catch (error) {
      console.error('Login failed:', error);
      await page.screenshot({ path: testData.screenshots.adminLoginError });
      throw error;
    }
  });

  test('should show error with invalid credentials', async ({ page }) => {
    try {
      await page.fill(testData.selectors.userEmail, testData.ui.invalidCredentials.email);
      await page.fill(testData.selectors.userPassword, testData.ui.invalidCredentials.password);
      await page.click(testData.selectors.submitButton);
      await page.waitForSelector(testData.selectors.flashMessage, { timeout: 10000 });
      const errorMessage = await page.locator(testData.selectors.flashMessage).textContent();
      expect(errorMessage?.trim()).toBe(testData.texts.loginError);
      await page.screenshot({ path: testData.screenshots.adminLoginInvalid });
    } catch (error) {
      console.error('Invalid login test failed:', error);
      await page.screenshot({ path: testData.screenshots.adminLoginInvalidError });
      throw error;
    }
  });
}); 