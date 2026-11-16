import { type Page, BrowserContext, Locator, test } from '@playwright/test';
import type winston from 'winston';

import { PlaywrightWrapper } from '../../base/base.page';
import { SmartWait } from '../../utils/waits/smart-wait';
import { Inputs } from '../../test_data/constants/inputs';
import { Selectors } from '../../locators/selectors';

export class JoinPage extends PlaywrightWrapper {
  private readonly smartWait: SmartWait;

  constructor(page: Page, context: BrowserContext, logger: winston.Logger) {
    super(page, context, logger);
    this.smartWait = new SmartWait(this.page);
  }

  async enterUserName(userName: string) {
    await test.step(`enter user name and ${userName}`, async () => {
      await this.getByClass(Selectors.JOIN_PAGE.USER_NAME_INPUT).fill(userName);
    });
  }

  async joinProjectByURL(inviteURL: string) {
    await this.page.goto(inviteURL);
  }

  async getJoinButton(): Promise<void> {
    await this.interactWithRole('button', 'Join', 'click');
    await this.page.waitForLoadState('networkidle');
  }

  async getJoinedProjectName(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.getByClass(Selectors.JOIN_PAGE.JOINED_PROJECT_NAME);
  }
}