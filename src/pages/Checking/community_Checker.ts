import { type Page, BrowserContext, test, expect } from '@playwright/test';
import type winston from 'winston';

import { PlaywrightWrapper } from '../../base/base.page';
import { SmartWait } from '../../utils/waits/smart-wait';
import { Inputs } from '../../test_data/constants/inputs';
import { Asserts } from '../../test_data/constants/asserts';

export class CommunityCheckerPage extends PlaywrightWrapper {
  private readonly smartWait: SmartWait;

  constructor(page: Page, context: BrowserContext, logger: winston.Logger) {
    super(page, context, logger);
    this.smartWait = new SmartWait(this.page);
  }

    async openProject(projectName: string): Promise<void> {
      await test.step(`Open project: ${projectName}`, async () => {
        this.logger.info('Opening project step', { projectName });
        await this.loadPage(`${process.env.BASE_URL}projects`);
        await this.interactWithRole('button', projectName, 'click');
        await this.smartWait.waitForUrl(`**/${Asserts.CHECKING.NAVIGATION_URL}/**`);
      });
    }
  
    async navigateToQuestionsAnswers(): Promise<void> {
       await test.step('Navigate to Questions & Answers', async () => {
        this.logger.info('Navigating to Questions & Answers step');
        await this.smartWait.waitForNetworkIdle();
        await this.interactWithElement('TEXT', 'Questions & Answers', 'click');      
        await this.smartWait.waitForUrl(new RegExp(`[?&]${Asserts.CHECKING.CHAPTER}`));
       
      });
    }

}