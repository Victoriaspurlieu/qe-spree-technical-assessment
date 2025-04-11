import { test, expect } from '@playwright/test';
import { TestHelper } from '@/tests/utils/helper';
import { config } from '@tests/utils/config';

test.describe('Security Tests', () => {
  let helper: TestHelper;

  test.beforeEach(async ({ page }) => {
    helper = new TestHelper(page);
    await helper.navigateTo(config.urls.home);
  });

  test('XSS prevention in search input', async ({ page }) => {
    const searchInput = await helper.findElement('searchInput');
    if (!searchInput) throw new Error('Search input not found');
    
    const xssPayload = '<script>alert("XSS")</script>';
    await searchInput.fill(xssPayload);
    await page.keyboard.press('Enter');
    
    // Verify the payload is escaped in the URL
    const url = page.url();
    expect(url).toContain(encodeURIComponent(xssPayload));
    
    // Verify no script execution
    const content = await page.content();
    expect(content).not.toContain(xssPayload);
    expect(content).toContain(encodeURIComponent(xssPayload));
  });

  test('XSS prevention in product reviews', async ({ page }) => {
    await helper.navigateTo(config.urls.products);
    const firstProduct = await helper.findElement('productLink');
    if (!firstProduct) throw new Error('Product link not found');
    await firstProduct.click();
    
    const reviewInput = await helper.findElement('reviewInput');
    if (!reviewInput) throw new Error('Review input not found');
    const xssPayload = '<img src="x" onerror="alert(\'XSS\')">';
    
    await reviewInput.fill(xssPayload);
    await helper.clickElement('submitReview');
    
    // Verify the review is properly escaped
    const reviewContent = await helper.findElement('reviewContent');
    if (!reviewContent) throw new Error('Review content not found');
    const reviewText = await reviewContent.textContent();
    expect(reviewText).not.toContain(xssPayload);
    expect(reviewText).toContain(encodeURIComponent(xssPayload));
  });

  test('SQL injection prevention in search', async ({ page }) => {
    const searchInput = await helper.findElement('searchInput');
    if (!searchInput) throw new Error('Search input not found');
    const sqlPayload = "' OR '1'='1";
    
    await searchInput.fill(sqlPayload);
    await page.keyboard.press('Enter');
    
    // Verify the search results are not affected by SQL injection
    const results = await helper.findElement('searchResults');
    if (!results) throw new Error('Search results not found');
    const resultCount = await page.locator('searchResults').count();
    expect(resultCount).toBeLessThan(10); // Should not return all products
  });

  test('SQL injection prevention in login', async ({ page }) => {
    await helper.navigateTo(config.urls.login);
    const usernameInput = await helper.findElement('usernameInput');
    if (!usernameInput) throw new Error('Username input not found');
    const passwordInput = await helper.findElement('passwordInput');
    if (!passwordInput) throw new Error('Password input not found');
    
    const sqlPayload = "' OR '1'='1";
    await usernameInput.fill(sqlPayload);
    await passwordInput.fill(sqlPayload);
    await helper.clickElement('loginButton');
    
    // Verify login failed
    const errorMessage = await helper.findElement('errorMessage');
    if (!errorMessage) throw new Error('Error message not found');
    expect(await errorMessage.isVisible()).toBeTruthy();
  });

  test('API security - sensitive data exposure', async ({ page }) => {
    // Test API endpoints for sensitive data exposure
    const endpoints = [
      '/api/users',
      '/api/orders',
      '/api/payments'
    ];
    
    for (const endpoint of endpoints) {
      const response = await page.request.get(`${config.baseUrl}${endpoint}`);
      expect(response.status()).toBe(401); // Should require authentication
    }
  });

  test('API security - rate limiting', async ({ page }) => {
    const endpoint = '/api/products';
    const requests = Array(100).fill(0).map(() => 
      page.request.get(`${config.baseUrl}${endpoint}`)
    );
    
    const responses = await Promise.all(requests);
    const statusCodes = responses.map(r => r.status());
    
    // Verify rate limiting is in place
    expect(statusCodes.filter(code => code === 429).length).toBeGreaterThan(0);
  });
}); 