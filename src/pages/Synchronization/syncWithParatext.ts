import { type Page, BrowserContext, test } from '@playwright/test';
import type winston from 'winston';

import { PlaywrightWrapper } from '../../base/base.page';
import { SmartWait } from '../../utils/waits/smart-wait';
import { Inputs } from '../../test_data/constants/inputs';
import { Selectors } from '../../locators/selectors';
import { Asserts } from '../../test_data/constants/asserts';

export class SynchronizationPage extends PlaywrightWrapper {
    private readonly smartWait: SmartWait;

    constructor(page: Page, context: BrowserContext, logger: winston.Logger) {
        super(page, context, logger);
        this.smartWait = new SmartWait(this.page);
    }

    async navigateToSyncWithParatext(): Promise<void> {
        await test.step('Navigate to Sync with Paratext', async () => {
        this.logger.info('Navigating to Sync with Paratext step');
        await this.smartWait.waitForNetworkIdle();
        await this.interactWithRole('link', 'Sync with Paratext', 'click');
        await this.smartWait.waitForUrl(RegExp(`/${Inputs.SYNC_WITH_PARATEXT.NAVIGATION_URL}(/|$)`));
        });
    }
    
    async clickSyncButton(): Promise<void> {
        await test.step('Click Sync button', async () => {
            this.logger.info('Clicking Sync button step');
            await this.smartWait.waitForNetworkIdle();
            await this.interactWithRole('button', 'Sync with Paratext', 'click');
        });
    }

    async cancelSyncButton(): Promise<void> {
        await test.step('Find Sync Cancel button', async () => {
            this.logger.info('Finding Sync Cancel button step');
            await this.smartWait.waitForNetworkIdle();
            await this.wait('minWait');
            await this.getById(`${Selectors.SYNCHRONIZATION.CANCEL_BUTTON}`).click();
        });
    }

    async visibleSyncProgress(projectName: string): Promise<void> {
        await test.step(`Handle visible sync progress: ${projectName}`, async () => {
            this.logger.info('Handling visible sync progress ', { projectName });
            await this.validateElementVisibility(Selectors.MY_PROJECTS.CONNECT_PROGRESS, 'Connect Progress');
        });
    }

    async hideSyncProgress(projectName: string): Promise<void> {
        await test.step(`Handle hidden sync progress: ${projectName}`, async () => {
            this.logger.info('Handling hidden sync progress ', { projectName });
            await this.waitForElementHidden(Selectors.MY_PROJECTS.CONNECT_PROGRESS, 'Connect Progress');
        });
    }

    async getCancelMessage(): Promise<string> {
        return await test.step('Get Cancel message', async () => {
            this.logger.info('Getting Cancel message step');
            await this.smartWait.waitForNetworkIdle();
            const cancelMessage = await this.getById(`${Selectors.SYNCHRONIZATION.CANCEL_MESSAGE}`).textContent();
            return cancelMessage ?? '';
        });
    }
    async waitForCancelMessageHidden(projectName: string): Promise<void> {
        await test.step(`Wait for Cancel message hidden: ${projectName}`, async () => {
            this.logger.info(`Waiting for cancel message hidden ${projectName}`);
            await this.smartWait.waitForNetworkIdle();
            await this.waitForElementHidden(Selectors.SYNCHRONIZATION.CANCEL_MESSAGE, 'Sync Progress');

        });
    }

    async getSnackBarMessage(): Promise<string> {
        return await test.step('Get Snack Bar message', async () => {
            this.logger.info('Getting Snack Bar message step');
            await this.smartWait.waitForNetworkIdle();
            const snackBarMessage = await this.getByClass(`${Selectors.SYNCHRONIZATION.SNACK_BAR_MESSAGE}`).textContent();
            return snackBarMessage ?? '';
        });
    }


}