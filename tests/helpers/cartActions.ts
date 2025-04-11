import { Page } from '@playwright/test';
import { ProductPage } from '../pages/productPage';
import { CartPage } from '../pages/CartPage';
import testData from '../config/testData';

export async function addProductToCart(page: Page) {
  const productPage = new ProductPage(page);
  const cartPage = new CartPage(page);

  await productPage.goto(testData.paths.product);
  await page.screenshot({ path: testData.screenshots.beforeAddToCart });

  const addedToCart = await productPage.addToCart();
  if (!addedToCart) throw new Error('Failed to add product to cart');

  await page.screenshot({ path: testData.screenshots.afterAddToCart });

  await cartPage.goto(testData.paths.cart);
  await cartPage.waitForCartLoad();
  const isPresent = await cartPage.isProductPresent();

  if (!isPresent) throw new Error('Product not found in cart');

  return cartPage;
} 