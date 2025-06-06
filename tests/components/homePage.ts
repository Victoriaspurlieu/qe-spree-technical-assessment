import { Page, Locator, expect } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly heading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Welcome to our shop!' });
  }

  async visit() {
    await this.page.goto('/');
  }

  async isWelcomeHeadingVisible() {
    await expect(this.heading).toBeVisible();
  }
}
