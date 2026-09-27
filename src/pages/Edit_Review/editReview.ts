import {  type Page, BrowserContext, Locator, test } from '@playwright/test';
import type winston from 'winston';

import { PlaywrightWrapper } from '../../base/base.page';
import {SmartWait} from '../../utils/waits/smart-wait';
import { Asserts } from '../../test_data/constants/asserts';
import { Selectors } from '../../locators/selectors';
import { BOOKS, getRandomReference, getRandomVerse, getReferenceForBook,} from '../../utils/data';

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
      await this.getByClass(Selectors.EDIT_REVIEW.AVATAR_QUILL).click();
      await this.getByClass(Selectors.EDIT_REVIEW.BOOK_SELECT).click({force: true});
      await this.getByClass(Selectors.EDIT_REVIEW.BOOK_LIST_BOX).filter({ hasText: bookName }).click({force: true});
      await this.smartWait.waitForNetworkIdle();
    });
  }

  async enterTextInEditor(chapter: string, verse: string, text: string): Promise<Locator> {
    return await test.step(`Enter text in editor: ${text}`, async () => {
      this.logger.info('Entering text in editor step', { chapter, verse, text });
      await this.smartWait.waitForNetworkIdle();
      await this.getByClass(Selectors.EDIT_REVIEW.CHAPTER_SELECT).click({force: true});     
      await this.page.locator(Selectors.EDIT_REVIEW.CHAPTER_LIST_BOX)
                .filter({ has: this.page.locator(Selectors.EDIT_REVIEW.CHAPTER_LIST_BOX_TEXT)}).getByText(`${chapter.trim()}`, {exact: true })
                .click({force: true});
                //{ hasText: `${chapter.trim()}`}

      const editor = this.page.locator(Selectors.EDIT_REVIEW.VERSE_SELECT).nth(Number(verse) - 1);
      await editor.clear();
      await editor.fill(text);
      await this.wait('minWait');
      await this.page.keyboard.press('Tab');
      await this.page.reload();
      await this.smartWait.waitForNetworkIdle();
      return editor;
    });
  }

  async getRandomVerseText(): Promise<string> {
    return await test.step('Get random verse text', async () => {
      this.logger.info('Getting random verse text step');
      const verse = getRandomVerse();
      return verse.text;
    });
  }

  async getReferenceForBookChapterVerse(bookName: string): Promise<string> {
    return await test.step('Get reference for book, chapter, and verse', async () => {
      this.logger.info('Getting reference for book, chapter, and verse step');
      const ref = getReferenceForBook(bookName);
      const data = {book: ref.book, chapter: ref.chapter, verse: ref.verse };
      return `${data.book}, ${data.chapter}, ${data.verse}`;
    });
  }
}
