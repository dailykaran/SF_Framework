import { expect, test, type Page } from '@playwright/test';
import { createLogger } from '../utils/logger/logger';
import type winston from 'winston';

export class EditReviewPage {
  constructor(
    private readonly page: Page,
    private readonly log: winston.Logger = createLogger('EditReviewPage'),
  ) {}

  async open(projectName: string): Promise<void> {
    await test.step(`Open project: ${projectName}`, async () => {
      this.log.info('Opening project step', { projectName });
      await this.page.goto(`${process.env.BASE_URL}/projects`);
      await this.page.getByRole('button', { name: projectName }).click();
      await this.page.waitForURL('**/translate/**');
    });
  }

  async navigateToEditReview(): Promise<void> {
    await test.step('Navigate to Edit & review', async () => {
      this.log.info('Navigating to edit and review step');
      await this.page.waitForLoadState('networkidle');
      await this.page.getByText('Edit & review').click();
      await this.page.waitForURL('**/translate/**');
      await expect(this.page).toHaveURL(/\/translate\//);
    });
  }

  async expectTranslatorSettingsVisible(): Promise<void> {
    await test.step('Verify translator settings are visible step', async () => {
      await expect(
        this.page.locator('#settings-btn')
      ).toBeVisible();
    });
  }

}
