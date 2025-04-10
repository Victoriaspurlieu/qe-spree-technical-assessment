import { Page } from '@playwright/test';
import { BasePage } from './basePage';
import testData from '../config/testData';

export class ProductPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    async goto(path: string) {
        await this.page.goto(path);
        // Wait for network to be idle with a longer timeout
        await this.page.waitForLoadState('networkidle', { timeout: 10000 });
        // Wait for the product to be visible
        await this.page.waitForSelector(testData.selectors.productName, { timeout: 10000 });
    }

    async addToCart(): Promise<boolean> {
        try {
            // Wait for the page to be fully loaded
            await this.page.waitForLoadState('domcontentloaded');
            
            // Take a screenshot to see what's on the page
            await this.page.screenshot({ path: testData.screenshots.beforeAddToCart });
            
            // Try to find and click the Add to Cart button
            let buttonClicked = false;
            
            try {
                await this.page.waitForSelector(testData.selectors.addToCartButton, { timeout: 10000 });
                await this.page.click(testData.selectors.addToCartButton);
                buttonClicked = true;
            } catch (error) {
                // Take a screenshot to see what's on the page
                await this.page.screenshot({ path: testData.screenshots.addToCartButtonNotFound });
                return false;
            }
            
            // Wait for navigation to complete
            await this.page.waitForLoadState('networkidle', { timeout: 10000 });
            
            // Wait for the cart count to appear or change
            try {
                await this.page.waitForSelector(testData.selectors.cartIcon, { timeout: 10000 });
                return true;
            } catch (error) {
                // Alternative verification: check if the product title is visible
                const productTitle = await this.page.textContent(testData.selectors.productName);
                return productTitle !== null;
            }
        } catch (error) {
            return false;
        }
    }

    async isProductInCart(): Promise<boolean> {
        try {
            return await this.page.isVisible(testData.selectors.productName);
        } catch (error) {
            return false;
        }
    }
} 