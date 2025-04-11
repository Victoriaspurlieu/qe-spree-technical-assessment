import { Page } from '@playwright/test';
import { config } from './config';

export class TestHelper {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigateTo(url: string | string[]): Promise<void> {
    if (Array.isArray(url)) {
      for (const u of url) {
        const response = await this.page.goto(`${config.baseUrl}${u}`);
        if (response && response.status() === 200) {
          break;
        }
      }
    } else {
      await this.page.goto(`${config.baseUrl}${url}`);
    }
    await this.page.waitForLoadState('networkidle');
  }

  async findElement(selector: string) {
    const selectors = config.selectors[selector] || selector;
    return await this.page.$(selectors);
  }

  async findElements(selector: string) {
    const selectors = config.selectors[selector] || selector;
    return await this.page.$$(selectors);
  }

  async waitForElement(selector: string, timeout = 5000) {
    const selectors = config.selectors[selector] || selector;
    await this.page.waitForSelector(selectors, { timeout });
  }

  async fillInput(selector: string, value: string) {
    const element = await this.findElement(selector);
    if (element) {
      await element.fill(value);
    }
  }

  async clickElement(selector: string) {
    const element = await this.findElement(selector);
    if (element) {
      await element.click();
    }
  }

  async getText(selector: string) {
    const element = await this.findElement(selector);
    return element ? await element.textContent() : null;
  }

  async isElementVisible(selector: string) {
    const element = await this.findElement(selector);
    return element ? await element.isVisible() : false;
  }

  async login(email = config.testData.validEmail, password = config.testData.validPassword) {
    for (const url of config.urls.login) {
      const response = await this.page.goto(`${config.baseUrl}${url}`);
      if (response && response.status() === 200) {
        await this.fillInput('emailInput', String(email));
        await this.fillInput('passwordInput', String(password));
        await this.clickElement('submitButton');
        await this.page.waitForLoadState('networkidle');
        return;
      }
    }
    throw new Error('Login page not found');
  }

  async addProductToCart(productIndex = 0) {
    await this.navigateTo(config.urls.products);
    const products = await this.findElements('productCard');
    if (products.length > productIndex) {
      await products[productIndex].click();
      await this.page.waitForLoadState('networkidle');
      await this.fillInput('cartQuantity', '1');
      await this.clickElement('cartButton');
      await this.page.waitForLoadState('networkidle');
    }
  }

  async getErrorMessage() {
    return await this.getText('errorMessage');
  }

  async getSuccessMessage() {
    return await this.getText('successMessage');
  }
} 