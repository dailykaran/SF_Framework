import { type Page, BrowserContext, test } from '@playwright/test';
import type winston from 'winston';

import { PlaywrightWrapper } from '../../base/base.page';
import { SmartWait } from '../../utils/waits/smart-wait';
import { Inputs } from '../../test_data/constants/inputs';
import { Selectors } from '../../locators/selectors';

export class MyProjectsPage extends PlaywrightWrapper {
  private readonly smartWait: SmartWait;

  constructor(page: Page, context: BrowserContext, logger: winston.Logger) {
    super(page, context, logger);
    this.smartWait = new SmartWait(this.page);
  }

  async openProjects(): Promise<void> {
    await test.step('Open My Projects page', async () => {
      this.logger.info('Opening My Projects page');
      await this.loadPage(`${process.env.BASE_URL}${Inputs.NAV.MY_PROJECTS}`);
      await this.smartWait.waitForNetworkIdle();
    });
  }

  async selectProject(projectName: string): Promise<void> {
    await test.step(`Select project: ${projectName}`, async () => {
      this.logger.info('Selecting project', { projectName });
      await this.interactWithRole('button', projectName, 'click');
      await this.smartWait.waitForNetworkIdle();
    });
  }

  async locateProjectByFilter(projectName: string, locator: string, buttonName: string): Promise<void> {
    await test.step(`locate Project By Filter: ${projectName}`, async () => {
      this.logger.info('locate Project By Filter', { projectName, locator, buttonName });
      const projectLocator = this.page.locator(locator)
                                 .filter({ hasText: projectName });
      const linkOrButton = projectLocator.getByRole('link', { name: buttonName })
                                          .or(projectLocator.getByRole('button', { name: buttonName }));
      await linkOrButton.click();
      await this.smartWait.waitForNetworkIdle();
    });
  }

  async handleConnectProjectProgress(projectName: string): Promise<void> {
    await test.step(`Handle connect project progress: ${projectName}`, async () => {
      this.logger.info('Handling connect project progress ', { projectName });
      await this.validateElementVisibility(Selectors.MY_PROJECTS.CONNECT_PROGRESS, 'Connect Progress');
      await this.waitForElementHidden(Selectors.MY_PROJECTS.CONNECT_PROGRESS, 'CONNECT_PROGRESS');
      await this.smartWait.waitForNetworkIdle();
    });
  }
  async adminConnectProjects(projectName: string): Promise<void> {
    await test.step(`SF admin connect project: ${projectName}`, async () => {
      this.logger.info('SF admin connect project', { projectName });
      if (process.env.ADMIN) {
        await this.loadLocalStorageFromFile(`${process.env.ADMIN}`);
      }
      await this.openProjects();
      await this.locateProjectByFilter(projectName, `${Selectors.MY_PROJECTS.UNCONNECTED_PROJECT}`, Inputs.BUTTONS.CONNECT);
           
      await console.log('Navigating to connect project page ' + `${Inputs.NAV.CONNECT_PROJECT}`);
      await this.smartWait.waitForUrl(new RegExp(`/${Inputs.NAV.CONNECT_PROJECT}(/|$)`));
      await this.smartWait.waitForVisible(Selectors.MY_PROJECTS.CONNECT_SUBMIT_BUTTON);
      
      await this.interactWithRole('button', Inputs.BUTTONS.CONNECT, 'click');
      await this.handleConnectProjectProgress(projectName);
      
      await this.smartWait.waitForUrl(new RegExp(`/${Inputs.EDIT_REVIEW.NAVIGATION_URL}(/|$)`));
      await this.smartWait.waitForNetworkIdle();
      await this.logger.info('A project has been connected.');
    });
  }

  async adminDeleteProject(projectName: string): Promise<void> {
    await test.step(`SF admin delete project: ${projectName}`, async () => {
      this.logger.info('SF admin delete project', { projectName });
      if (process.env.ADMIN) {
        await this.loadLocalStorageFromFile(`${process.env.ADMIN}`);
      }
      await this.openProjects();
      await this.selectProject(projectName);
              
      await this.interactWithRole('link', Inputs.LINK.EDIT_REVIEW, 'click');
      await this.smartWait.waitForNetworkIdle();
      await this.interactWithRole('link', Inputs.SETTINGS.PAGE, 'click');
      await this.smartWait.waitForUrl(new RegExp(`/${Inputs.SETTINGS.NAVIGATION_URL}(/|$)`));
      await this.smartWait.waitForNetworkIdle();
    });
  }

  async joinProject(projectName: string): Promise<void> {
    await test.step(`A PT user join project: ${projectName}`, async () => {
      this.logger.info('A PT user join project', { projectName });
      if (process.env.TRANSLATOR) {
        await this.loadLocalStorageFromFile(`${process.env.TRANSLATOR}`);
      }
      await this.openProjects();
      await this.locateProjectByFilter(projectName, `${Selectors.MY_PROJECTS.UNCONNECTED_PROJECT}`, Inputs.BUTTONS.JOIN);
      await this.smartWait.waitForUrl(new RegExp(`/${Inputs.EDIT_REVIEW.NAVIGATION_URL}(/|$)`));
      await this.smartWait.waitForNetworkIdle();
      await this.interactWithRole('link', Inputs.LINK.EDIT_REVIEW, 'click');
      await this.smartWait.waitForNetworkIdle();

      //await this.handleConnectProjectProgress(projectName);
      
    });
  }

 async joinProjectTemp(projectName: string): Promise<void> {
    await test.step(`A PT user join project: ${projectName}`, async () => {
      this.logger.info('A PT user join project', { projectName });
      if (process.env.TRANSLATOR) {
        await this.loadLocalStorageFromFile(`${process.env.TRANSLATOR}`);
      }
    });
  }

}