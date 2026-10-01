import {  type Page, BrowserContext, Locator, test } from '@playwright/test';
import type winston from 'winston';

import { PlaywrightWrapper } from '../base/base.page';
import {SmartWait} from '../utils/waits/smart-wait';
import { Asserts } from '../test_data/constants/asserts';
import { Selectors } from '../locators/selectors';

export class SF_Components extends PlaywrightWrapper {
  private readonly smartWait: SmartWait;

  constructor(page: Page, context: BrowserContext, logger: winston.Logger) {
    super(page, context, logger);
    this.smartWait = new SmartWait(this.page);
  }

    async getSnackBarMessage(): Promise<string> {
        return await test.step('Get Snack Bar message', async () => {
            this.logger.info('Getting Snack Bar message step');
            await this.smartWait.waitForNetworkIdle();
            await this.waitSelector(`${Selectors.SYNCHRONIZATION.SNACK_BAR_MESSAGE}`);
            const snackBarMessage = await this.getByClass(`${Selectors.SYNCHRONIZATION.SNACK_BAR_MESSAGE}`).textContent();
            return snackBarMessage ?? '';
        });
    }  
}