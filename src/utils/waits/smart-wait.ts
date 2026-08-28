import { Page } from '@playwright/test';

export class SmartWait {
  private page: Page;
  private defaultTimeout = 30000;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Wait for element to be visible
   */
  async waitForVisible(selector: string, timeout = this.defaultTimeout): Promise<void> {
    try {
      await this.page.locator(selector).waitFor({ state: 'visible', timeout });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Wait for element to be hidden
   */
  async waitForHidden(selector: string, timeout = this.defaultTimeout): Promise<void> {
    try {
      await this.page.locator(selector).waitFor({ state: 'hidden', timeout });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Wait for text to appear
   */
  async waitForText(selector: string, text: string, timeout = this.defaultTimeout): Promise<void> {
    try {
      await this.page.locator(selector).waitFor({ timeout });
      const content = await this.page.locator(selector).textContent();
      if (!content?.includes(text)) {
        throw new Error(`Text "${text}" not found in element`);
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Wait for URL to match
   */
  async waitForUrl(urlPattern: string | RegExp, timeout = this.defaultTimeout): Promise<void> {
    try {
      await this.page.waitForURL(urlPattern, { timeout: timeout });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Wait for specific time
   */
  async wait(milliseconds: number): Promise<void> {
    await this.page.waitForTimeout(milliseconds);
  }

  /**
   * Wait for network to be idle
   */
  async waitForNetworkIdle(timeout = this.defaultTimeout): Promise<void> {
    try {
      await this.page.waitForLoadState('networkidle', { timeout });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Wait for DOM to be ready
   */
  async waitForDomReady(timeout = this.defaultTimeout): Promise<void> {
    try {
      await this.page.waitForLoadState('domcontentloaded', { timeout });
    } catch (error) {
      throw error;
    }
  }
}
