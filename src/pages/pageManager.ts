import { type Page, BrowserContext } from '@playwright/test';
import type winston from 'winston';
import { EditReviewPage } from './Translate/editReview';
import { MyProjectsPage } from './My_Projects/my_Projects';
import { ManageQuestionsPage } from './Community_Checker/manageQuestions';
import { QuestionsAndAnswersPage } from './Community_Checker/questions_Answers';
import { SettingsPage } from './Settings/settings';
import { SynchronizationPage } from './Synchronization/syncWithParatext';
import { SF_Components } from '../components/sf_components';

/**
 * PageManager provides lazy-instantiated access to all Page Objects
 * for a specific authenticated browser session and role context.
 */
export class PageManager {
  readonly page: Page;
  readonly context: BrowserContext;
  readonly logger: winston.Logger;

  private _editReviewPage?: EditReviewPage;
  private _myProjectsPage?: MyProjectsPage;
  private _questionsAndAnswersPage?: QuestionsAndAnswersPage;
  private _manageQuestionsPage?: ManageQuestionsPage;
  private _settingsPage?: SettingsPage;
  private _synchronizationPage?: SynchronizationPage;
  private _sfComponents?: SF_Components;

  constructor(page: Page, context: BrowserContext, logger: winston.Logger) {
    this.page = page;
    this.context = context;
    this.logger = logger;
  }

  /** Edit & Review page object */
  get editReview(): EditReviewPage {
    if (!this._editReviewPage) {
      this._editReviewPage = new EditReviewPage(this.page, this.context, this.logger);
    }
    return this._editReviewPage;
  }

  /** My Projects page object */
  get myProjects(): MyProjectsPage {
    if (!this._myProjectsPage) {
      this._myProjectsPage = new MyProjectsPage(this.page, this.context, this.logger);
    }
    return this._myProjectsPage;
  }

  /** Questions & Answers page object */
  get questionsAndAnswers(): QuestionsAndAnswersPage {
    if (!this._questionsAndAnswersPage) {
      this._questionsAndAnswersPage = new QuestionsAndAnswersPage(this.page, this.context, this.logger);
    }
    return this._questionsAndAnswersPage;
  }
  /** Manage Questions page object */
  get manageQuestions(): ManageQuestionsPage {
    if (!this._manageQuestionsPage) {
      this._manageQuestionsPage = new ManageQuestionsPage(this.page, this.context, this.logger);
    }
    return this._manageQuestionsPage;
  }
  /** Settings page object */
  get settings(): SettingsPage {
    if (!this._settingsPage) {
      this._settingsPage = new SettingsPage(this.page, this.context, this.logger);
    }
    return this._settingsPage;
  }
  /** Synchronization page object */
  get synchronization(): SynchronizationPage {
    if (!this._synchronizationPage) {
      this._synchronizationPage = new SynchronizationPage(this.page, this.context, this.logger);
    }
    return this._synchronizationPage;
  }

  /** SF Components page object */
  get sfComponents(): SF_Components {
    if (!this._sfComponents) {
      this._sfComponents = new SF_Components(this.page, this.context, this.logger);
    }
    return this._sfComponents;
  }
}
