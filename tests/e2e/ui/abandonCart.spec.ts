import { test, expect } from '@playwright/test';
import { CartPage } from '../../pages/cartPage';
import { ProductPage } from '../../pages/productPage';
import testData from '../../config/testData';
import { addProductToCart } from '../../utils/cartActions';

test.describe('Add to Cart', () => {

    test('should add product to cart', async ({ page }) => {
        const cartPage = await addProductToCart(page);
        expect(await cartPage.isProductPresent()).toBeTruthy();
      });
    });
  

test.describe('Abandon Cart', () => {
  test('should persist cart after browser close', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);

    // Add to cart and save storage state
    await productPage.goto(testData.paths.product);
    await productPage.addToCart();
    await cartPage.goto(testData.paths.cart);
    await cartPage.waitForCartLoad();
    expect(await cartPage.isProductPresent()).toBeTruthy();

    await context.storageState({ path: testData.paths.storageState });
    await context.close();

    // New context with restored state
    const newContext = await browser.newContext({ storageState: testData.paths.storageState });
    const newPage = await newContext.newPage();
    const newCartPage = new CartPage(newPage);

    await newCartPage.goto(testData.paths.cart);
    await newCartPage.waitForCartLoad();
    expect(await newCartPage.isProductPresent()).toBeTruthy();
    await newPage.screenshot({ path: testData.screenshots.newSessionCart });

    await newContext.close();
  });
});
