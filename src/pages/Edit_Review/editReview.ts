import {  type Page, BrowserContext, Locator, test } from '@playwright/test';
import type winston from 'winston';

import { PlaywrightWrapper } from '../../base/base.page';
import {SmartWait} from '../../utils/waits/smart-wait';
import { Asserts } from '../../test_data/constants/asserts';
import { Selectors } from '../../locators/selectors';
import { BOOKS, getRandomReference, getRandomVerse,} from '../../utils/data';

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

  async selectBook(bookName: string): Promise<void> {
    await test.step(`Select book: ${bookName}`, async () => {
      this.logger.info('Selecting book step', { bookName });
      await this.smartWait.waitForNetworkIdle();
      await this.getByClass('.app-avatar-container app-avatar').click();
      await this.getByClass('#book-select').click({force: true});
      await this.getByClass('.mat-mdc-select-panel mat-option').filter({ hasText: bookName }).click({force: true});
      await this.smartWait.waitForNetworkIdle();
    });
  }

  async enterTextInEditor(text: string): Promise<void> {
    await test.step(`Enter text in editor: ${text}`, async () => {
      this.logger.info('Entering text in editor step', { text });
      await this.smartWait.waitForNetworkIdle();
      const editor = this.page.locator('usx-para-contents usx-segment').nth(6);
      await editor.clear();
      await editor.fill(text);
      await this.smartWait.waitForNetworkIdle();
    });
  }

  async getRandomBook(): Promise<string> {
    return await test.step('Get random book', async () => {
      this.logger.info('Getting random book step');
      const ref = getRandomReference();
      const book = BOOKS.find((b) => b.name === ref.book);
      return book?.name ?? ref.book;
    });
  }

  async getRandomVerseText(): Promise<string> {
    return await test.step('Get random verse text', async () => {
      this.logger.info('Getting random verse text step');
      const verse = getRandomVerse();
      return verse.text;
    });
  }

}
