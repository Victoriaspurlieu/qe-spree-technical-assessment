import { Page } from '@playwright/test';
import testData from '../config/testData';

export class HomePage {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async goto() {
        await this.page.goto(testData.paths.home);
    }
} 