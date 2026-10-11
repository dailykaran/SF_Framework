import { type Page, BrowserContext, test, expect, Locator } from '@playwright/test';
import type winston from 'winston';

import { PlaywrightWrapper } from '../../base/base.page';
import { SmartWait } from '../../utils/waits/smart-wait';
import { Inputs } from '../../test_data/constants/inputs';
import { Asserts } from '../../test_data/constants/asserts';
import { getQuestionAnswerForBookChapterVerse } from '../../utils/data';

export class ManageQuestionsPage extends PlaywrightWrapper {
    private readonly smartWait: SmartWait;

    constructor(page: Page, context: BrowserContext, logger: winston.Logger) {
        super(page, context, logger);
        this.smartWait = new SmartWait(this.page);
    }

    async navigateToManageQuestions(): Promise<void> {
       await test.step('Navigate to manage questions', async () => {
        this.logger.info('Navigating to manage questions step');
        await this.smartWait.waitForNetworkIdle();
        await this.interactWithElement('TEXT', 'Manage questions', 'click');      
        await this.smartWait.waitForUrl(`**/${Asserts.CHECKING.NAVIGATION_URL}`); 
      });
    }

    async addQuestion(): Promise<void> {
        await test.step('Add a new question', async () => {
            this.logger.info('Adding a new question step');
            await this.smartWait.waitForNetworkIdle();
            await this.interactWithRole('button', 'Add Question', 'click');
            await this.smartWait.waitForUrl(`**/${Asserts.CHECKING.NAVIGATION_URL}`);
        });
    }


    async chooseVerse(verseNumber: number): Promise<void> {
        await test.step('Choose a verse', async () => {
            this.logger.info('Choosing a verse step');
            await this.smartWait.waitForNetworkIdle();
            await this.validateElementVisibility('#versePane h1', 'Choose verse');
            await this.interactWithRole('button', verseNumber.toString(), 'click');
        });
    }

    async chooseChapter(chapterNumber: number, chapterVerse: number): Promise<void> {
        await test.step('Choose a chapter', async () => {
            this.logger.info('Choosing a chapter step');
            await this.smartWait.waitForNetworkIdle();
            await this.validateElementVisibility('#chapterPane h1', 'Choose chapter');
            await this.interactWithRole('button', chapterNumber.toString(), 'click');
            await this.chooseVerse(chapterVerse);
        });
    }

    async chooseBook(bookName: string, chapterNumber: number, chapterVerse: number): Promise<void> {
        await test.step('Choose a book', async () => {
            this.logger.info('Choosing a book step');
            await this.smartWait.waitForNetworkIdle();
            await this.validateElementVisibility('#bookPane h1', 'Choose book');
            await this.interactWithRole('button', bookName, 'click');
            await this.chooseChapter(chapterNumber, chapterVerse);
        });
    }

    async scriptureStartReference(bookName: string, chapterNumber: number, chapterVerse: number): Promise<void>  {
            await test.step('select a start reference', async () => {
            this.logger.info('Selecting a start reference step');
            await this.smartWait.waitForNetworkIdle();
            await this.getById('scripture-start').locator('.mat-mdc-form-field-icon-suffix button').click();
            await this.chooseBook(bookName, chapterNumber, chapterVerse);            
        });
    }

    async chooseEndReference(chapterNumber: number): Promise<void> {
        await test.step('select an end reference', async () => {
            this.logger.info('Selecting an end reference step');
            await this.smartWait.waitForNetworkIdle();
            await this.validateElementVisibility('#rangeEndPane div', 'Choose end verse');
            await this.interactWithRole('button', chapterNumber.toString(), 'click');
        });
    }

    async scriptureEndReference(chapterNumber: number): Promise<void>  {
        await test.step('select an end reference', async () => {
            this.logger.info('Selecting an end reference step');
            await this.smartWait.waitForNetworkIdle();
            await this.getById('scripture-end').locator('.mat-mdc-form-field-icon-suffix button').click();
            await this.chooseEndReference(chapterNumber);            
        });
    }

    async questionContent(questionText: string): Promise<void> {
        await test.step('Enter question content', async () => {
            this.logger.info('Entering question content step');
            await this.smartWait.waitForNetworkIdle();
            await this.getById('textarea').fill(questionText);
        });
    }

    async saveAnswer(): Promise<void> {
        await test.step('Save answer', async () => {
            this.logger.info('Saving answer step');
            await this.smartWait.waitForNetworkIdle();
            await this.getById('question-save-btn').click();
        });
    }

    async createQuestion(bookName: string, chapterNumber: number, chapterVerse: number, questionText: string): Promise<string> {
        return await test.step('Create a question', async () => {
            this.logger.info('Creating a question step');
            await this.smartWait.waitForNetworkIdle();
            await this.addQuestion();
            await this.scriptureStartReference(bookName, chapterNumber, chapterVerse);
            await this.questionContent(questionText);
            await this.saveAnswer();
            return questionText;
        });
    }

    async getQuestionAnswerText(book: string,chapter: number,verse: number,): Promise<ReturnType<typeof getQuestionAnswerForBookChapterVerse>> {
        return await test.step('Get question/answer for book, chapter, and verse', async () => {
            this.logger.info('Getting question/answer for book, chapter, and verse step');
            await this.smartWait.waitForNetworkIdle();
            return getQuestionAnswerForBookChapterVerse(book, chapter, verse);
        });
    }

    async expandQuestionPane(): Promise<void> {
        await test.step('Expand question pane', async () => {
            this.logger.info('Expanding question pane step');
            await this.smartWait.waitForNetworkIdle();
            const questionPane = await this.page.locator('#text-with-questions-list .mat-expansion-indicator svg').all();
            for (const question of questionPane) {
                await question.click();
            }
            const questionPaneWrapper = await this.page.locator('#text-with-questions-list .mat-expansion-panel-content-wrapper .mat-expansion-indicator svg').all();
            for (const question of questionPaneWrapper) {
                await question.click();
            }
        });
    }

    async findQuestionContent(questionText: string): Promise<string> {
        return await test.step('Find question content', async () => {
            this.logger.info('Finding question content step');
            await this.smartWait.waitForNetworkIdle();
            const questionElements = await this.getByClass('#text-with-questions-list span.overflow-ellipsis').all();
            for (const question of questionElements) {
                const content = await question.textContent();
                if (content?.includes(questionText)) {
                    return content;
                }
            }
            // Return an empty string if the question content is not found
            return '';
        });
    }

    

}

