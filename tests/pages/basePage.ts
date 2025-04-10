import { Page } from '@playwright/test';

export class BasePage {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async goto(path: string) {
        await this.page.goto(path, {
            waitUntil: 'networkidle',
            timeout: 30000
        });
    }

    async waitForSelector(selector: string, options = {}) {
        return await this.page.waitForSelector(selector, {
            state: 'visible',
            timeout: 10000,
            ...options
        });
    }

    async click(selector: string) {
        await this.waitForSelector(selector);
        await this.page.click(selector);
    }

    async isVisible(selector: string): Promise<boolean> {
        return await this.page.isVisible(selector);
    }
} 