import { type Page, BrowserContext, Locator } from '@playwright/test';
import { PlaywrightWrapper } from '../../base/base.page';
import {SmartWait} from '../../utils/waits/smart-wait';
import { Asserts } from '../../test_data/constants/asserts';
import { Selectors } from '../../locators/selectors';

export class EditReviewPage extends PlaywrightWrapper {
  private readonly smartWait: SmartWait;
  
  constructor(page: Page, context: BrowserContext) {
    super(page, context);
    this.smartWait = new SmartWait(this.page);
  }

  async open(projectName: string): Promise<void> {
    await this.loadApplication(`${process.env.BASE_URL}projects`);
    await this.interactWithRole('button', projectName, 'click');
    await this.smartWait.waitForUrl(`**/${Asserts.EDIT_REVIEW.NAVIGATION_URL}/**`);
  }

  async navigateToEditReview(): Promise<void> {
    await this.smartWait.waitForNetworkIdle();
    await this.interactWithElement('TEXT', 'Edit & review', 'click');
    await this.smartWait.waitForUrl(`**/${Asserts.EDIT_REVIEW.NAVIGATION_URL}/**`);
  }

  async configureTranslatorSettings(): Promise<Locator> {
    await this.smartWait.waitForNetworkIdle();
    await this.smartWait.waitForVisible(Selectors.EDIT_REVIEW.SETTINGS_BUTTON);
    return this.page.locator(Selectors.EDIT_REVIEW.SETTINGS_BUTTON);
  }

}
