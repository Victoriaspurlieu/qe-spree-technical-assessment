import { test as base } from '@playwright/test';
import { CartPage } from '../pages/cartPage';
import { ProductPage } from '../pages/productPage';

type Fixtures = {
    cartPage: CartPage;
    productPage: ProductPage;
};

export const test = base.extend<Fixtures>({
    cartPage: async ({ page }, use) => {
        await use(new CartPage(page));
    },
    productPage: async ({ page }, use) => {
        await use(new ProductPage(page));
    }
});

export { expect } from '@playwright/test'; 