import { type Page, BrowserContext } from '@playwright/test';
import type winston from 'winston';
import { EditReviewPage } from './Edit_Review/editReview';
import { MyProjectsPage } from './My_Projects/my_Projects';
import { CommunityCheckerPage } from './Checking/community_Checker';
import { SettingsPage } from './Settings/settings';
import { SynchronizationPage } from './Synchronization/syncWithParatext';

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
  private _communityCheckerPage?: CommunityCheckerPage;
  private _settingsPage?: SettingsPage;
  private _synchronizationPage?: SynchronizationPage;

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

  /** Community Checker page object */
  get communityChecker(): CommunityCheckerPage {
    if (!this._communityCheckerPage) {
      this._communityCheckerPage = new CommunityCheckerPage(this.page, this.context, this.logger);
    }
    return this._communityCheckerPage;
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
}
