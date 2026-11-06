import { type Page, BrowserContext, Locator, test } from '@playwright/test';
import type winston from 'winston';

import { PlaywrightWrapper } from '../../base/base.page';
import { SmartWait } from '../../utils/waits/smart-wait';
import { Inputs } from '../../test_data/constants/inputs';
import { Selectors } from '../../locators/selectors';

export class LandingPage extends PlaywrightWrapper {
  private readonly smartWait: SmartWait;

  constructor(page: Page, context: BrowserContext, logger: winston.Logger) {
    super(page, context, logger);
    this.smartWait = new SmartWait(this.page);
  }

  /**
   * Clicks a link and returns the URL it lands on. Handles links that open a new tab
   * and links that navigate in the same tab.
   */
  async openLinkInNewTab(link: Locator): Promise<string> {
    return await test.step('Open landing page link', async () => {
      const popupPromise = this.context.waitForEvent('page', { timeout: 5_000 }).catch(() => undefined);
      this.logger.info('Clicking link in landing page', { link: await link.textContent() });
      await link.click();
      const popup = await popupPromise;

      if (popup) {
        await popup.waitForLoadState('domcontentloaded');
        const url = popup.url();
        await popup.close();
        this.logger.info('Opened link in new tab', { url });
        return url;
      }

      await this.page.waitForLoadState('domcontentloaded');
      const url = this.page.url();
      this.logger.info('Opened link in the same tab', { url });
      await this.page.goBack({ waitUntil: 'domcontentloaded' });
      return url;
    });
  }

  async openNewTabOnChildTab(inputLink: string): Promise<{ url: string}> {
  return await test.step(`Open a new ${inputLink} tab`, async () => {
    let childTabElement = `#profile a:has-text("${inputLink.trim()}")`
    let result = { url: '' };

    if(await this.page.locator(`#profile a[target]:has-text("${inputLink.trim()}")`).count() > 0){
      this.logger.info('Found link that opens in a child tab', { link: inputLink });
      await this.childTab(`${childTabElement}`);
      await this.page.waitForLoadState('load');

      result = { url: this.page.url() };
      this.logger.info('Captured URL from child tab', { url: result.url });
      await this.page.close();
      await this.switchToParentPage();
      return result;  
    }
  
    this.logger.info('Found link that opens in a parent tab', { link: inputLink });
    await this.page.locator(`${childTabElement}`).click();
    await this.page.waitForLoadState('networkidle');

    result = { url: this.page.url() };
    this.logger.info('Captured URL from parent tab', { url: result.url });
    await this.page.goBack({ waitUntil: 'networkidle' });
    return result;
  });
  }


}