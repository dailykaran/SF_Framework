import {  type Page, BrowserContext, Locator, test } from '@playwright/test';
import type winston from 'winston';

import { PlaywrightWrapper } from '../../base/base.page';
import {SmartWait} from '../../utils/waits/smart-wait';
import { Asserts } from '../../test_data/constants/asserts';
import { Selectors } from '../../locators/selectors';


export class EditReviewPage extends PlaywrightWrapper {
  private readonly smartWait: SmartWait;

  constructor(page: Page, context: BrowserContext, logger: winston.Logger) {
    super(page, context, logger);
    this.smartWait = new SmartWait(this.page);
  }

  async open(projectName: string): Promise<void> {
    await test.step(`Open project: ${projectName}`, async () => {
      this.logger.info('Opening project step', { projectName });
      await this.loadPage(`${process.env.BASE_URL}projects`);
      await this.interactWithRole('button', projectName, 'click');
      await this.smartWait.waitForUrl(`**/${Asserts.EDIT_REVIEW.NAVIGATION_URL}/**`);
    });
  }

  async navigateToEditReview(): Promise<void> {
     await test.step('Navigate to Edit & review', async () => {
      this.logger.info('Navigating to edit and review step');
      await this.smartWait.waitForNetworkIdle();
      await this.interactWithElement('TEXT', 'Edit & review', 'click');
      await this.smartWait.waitForUrl(`**/${Asserts.EDIT_REVIEW.NAVIGATION_URL}/**`);
    });
  }

  async configureTranslatorSettings(): Promise<Locator> {
    const settingsButton = this.page.locator(Selectors.EDIT_REVIEW.CONFIG_SETTINGS_BUTTON);
    await test.step('Configure translator settings', async () => {
      this.logger.info('Configuring translator settings step');
      await this.smartWait.waitForNetworkIdle();
      await this.smartWait.waitForVisible(Selectors.EDIT_REVIEW.CONFIG_SETTINGS_BUTTON);
    });
    return settingsButton;
  }

}
