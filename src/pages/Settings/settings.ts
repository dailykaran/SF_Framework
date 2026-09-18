import { type Page, BrowserContext, test } from '@playwright/test';
import type winston from 'winston';

import { PlaywrightWrapper } from '../../base/base.page';
import { SmartWait } from '../../utils/waits/smart-wait';
import { Inputs } from '../../test_data/constants/inputs';
import { Selectors } from '../../locators/selectors';

export class SettingsPage extends PlaywrightWrapper {
    private readonly smartWait: SmartWait;

    constructor(page: Page, context: BrowserContext, logger: winston.Logger) {
        super(page, context, logger);
        this.smartWait = new SmartWait(this.page);
    }

    private extractAfterHyphen(value: string): string {
        return value.match(/-+\s*(.+)/)?.[1].trim() ?? "";
    }

    async deleteProject(projectName: string): Promise<void> {
    await test.step(`delete a project: ${projectName}`, async () => {
      this.logger.info('delete a project', { projectName });
      await this.smartWait.waitForNetworkIdle();
      await this.page.locator(Selectors.SETTINGS.DANGER_ZONE).focus();
      await this.page.locator(Selectors.SETTINGS.DANGER_ZONE).scrollIntoViewIfNeeded();
      await this.getById(`${Selectors.SETTINGS.DELETE_THIS_PROJECT_BUTTON}`).click();
      await this.validateElementVisibility(Selectors.SETTINGS.DELETE_DIALOG, 'visible');
      await this.interactWithElement('LABEL', Inputs.LABELS.PROJECT_NAME, 'fill', this.extractAfterHyphen(projectName));
      await this.interactWithRole('button', Inputs.BUTTONS.DELETE_DIALOG_BUTTON, 'click');
      await this.smartWait.waitForNetworkIdle();
      await this.smartWait.waitForUrl(new RegExp(`/${Inputs.NAV.MY_PROJECTS}(/|$)`));
      await this.logger.info('A project has been deleted.');  
    });
  }

}