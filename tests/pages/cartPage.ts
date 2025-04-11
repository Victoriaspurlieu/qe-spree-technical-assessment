import { Page } from '@playwright/test';
import { BasePage } from './basePage';
import testData from '../config/testData';

export class CartPage extends BasePage {
    private readonly productSelector = testData.selectors.productName;

    constructor(page: Page) {
        super(page);
    }

    async goto(path: string = testData.paths.cart) {
        await super.goto(path);
    }

    async isProductPresent(): Promise<boolean> {
        try {
            await this.page.waitForSelector(this.productSelector, { timeout: 5000 });
            return true;
        } catch (error) {
            return false;
        }
    }

    async waitForCartLoad(): Promise<void> {
        await this.page.waitForSelector('text="Shopping Cart"', { timeout: 10000 });
    }
} 
