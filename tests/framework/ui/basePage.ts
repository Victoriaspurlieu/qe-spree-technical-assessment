import { Page } from '@playwright/test';

export abstract class BasePage {
    protected page: Page;
    protected baseUrl: string;

    constructor(page: Page, baseUrl: string) {
        this.page = page;
        this.baseUrl = baseUrl;
    }

    protected async navigateTo(path: string): Promise<void> {
        await this.page.goto(`${this.baseUrl}${path}`);
    }

    protected async waitForPageLoad(): Promise<void> {
        await this.page.waitForLoadState('networkidle');
    }
} 