import { expect, type Page } from '@playwright/test';

export class EditReviewPage {
  constructor(private readonly page: Page) {}

  async open(projectName: string): Promise<void> {
    await this.page.goto(`${process.env.BASE_URL}/projects`);
    await this.page.getByRole('button', { name: projectName }).click();
    await this.page.waitForURL('**/translate/**');
  }

  async navigateToEditReview(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.page.getByText('Edit & review').click();
    await this.page.waitForURL('**/translate/**');
    await expect(this.page).toHaveURL(/\/translate\//);
  }

  async expectTranslatorSettingsVisible(): Promise<void> {
    await expect(
      this.page.locator('#settings-btn')
    ).toBeVisible();
  }

}
