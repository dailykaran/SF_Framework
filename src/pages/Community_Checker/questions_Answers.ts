import { type Page, type Locator, BrowserContext, test, expect } from '@playwright/test';
import type winston from 'winston';

import { PlaywrightWrapper } from '../../base/base.page';
import { SmartWait } from '../../utils/waits/smart-wait';
import { Inputs } from '../../test_data/constants/inputs';
import { Asserts } from '../../test_data/constants/asserts';
import { Selectors } from '../../locators/selectors';

export class QuestionsAndAnswersPage extends PlaywrightWrapper {
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

    async selectQuestionOnPane(questionText: string): Promise<string> {
        return await test.step('Select question on pane', async () => {
            this.logger.info('Selecting question on pane step');
            await this.smartWait.waitForNetworkIdle();
            const questionLists = await this.getByClass(`${Selectors.QUESTIONS_AND_ANSWERS.QUESTION_SELECT_WITH_TEXT}`).all();
            for (const question of questionLists) {
                const content = await question.textContent();
                if (content?.includes(questionText)) {
                    await question.click();
                    return content; // Return the content of the selected question
                }
            }
            // Return an empty string if the question is not found
            return '';
        });
    }

    async getQuestionIconColor(): Promise<string> {
      return await test.step(`Get icon for question: `, async () => {
        this.logger.info('Getting question icon step', );
        const questionElement = await this.getByClass(`${Selectors.QUESTIONS_AND_ANSWERS.QUESTION_HIGHLIGHT}`).filter({ visible: true });
        const questionIconColor = await questionElement.evaluate((el) =>
                        el.ownerDocument.defaultView?.getComputedStyle(el, '::before').color ?? ''
                      );
        this.logger.info('Question icon color visibility', { questionIconColor });
        return questionIconColor;
        });
    };
    
    async getQuestionIcon(): Promise<boolean> {
      return await test.step(`Get icon for question: `, async () => {
        this.logger.info('Getting question icon step', );
        const iconRendered = await this.getByClass(`${Selectors.QUESTIONS_AND_ANSWERS.QUESTION_HIGHLIGHT}`)
          .filter({ visible: true })
          .evaluate((el) => {
            const style = el.ownerDocument.defaultView?.getComputedStyle(el, '::before');
            return (
              style?.display !== 'none' &&
              style?.visibility !== 'hidden' &&
              parseFloat(style?.width ?? '0') > 0  // icon is 19.2×19.2px
            );
          });
        this.logger.info('Question icon visibility', { iconRendered });
        return iconRendered;
      });
    }

    async getQuestionHighlight(): Promise<Locator> {
      return await test.step('Get highlighted question', async () => {
        this.logger.info('Getting highlighted question step');
        const questionElement = await this.getByClass(Selectors.QUESTIONS_AND_ANSWERS.QUESTION_HIGHLIGHT);
        return questionElement ?? '';
      });
    }
}