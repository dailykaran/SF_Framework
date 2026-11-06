import {  type Page, BrowserContext, Locator, test } from '@playwright/test';
import type winston from 'winston';

import { PlaywrightWrapper } from '../base/base.page';
import {SmartWait} from '../utils/waits/smart-wait';
import { Asserts } from '../test_data/constants/asserts';
import { Selectors } from '../locators/selectors';

export class SF_Components extends PlaywrightWrapper {
  private readonly smartWait: SmartWait;

  constructor(page: Page, context: BrowserContext, logger: winston.Logger) {
    super(page, context, logger);
    this.smartWait = new SmartWait(this.page);
  }

    async getSnackBarMessage(): Promise<string> {
        return await test.step('Get Snack Bar message', async () => {
            this.logger.info('Getting Snack Bar message step');
            await this.smartWait.waitForNetworkIdle();
            await this.waitSelector(`${Selectors.SNACK_BAR.MESSAGE}`);
            const snackBarMessage = await this.getByClass(`${Selectors.SNACK_BAR.MESSAGE}`).textContent();
            return snackBarMessage ?? '';
        });
    }
    
    async getNoChapterPermission(): Promise<string> {
        return await test.step('Get No Chapter Permission message', async () => {
            this.logger.info('Getting No Chapter Permission message step');
            await this.smartWait.waitForNetworkIdle();
            await this.waitSelector(`${Selectors.BANNER.NO_CHAPTER_PERMISSION_MESSAGE}`);
            const noChapterPermissionMessage = await this.getByClass(`${Selectors.BANNER.NO_CHAPTER_PERMISSION_MESSAGE}`).textContent();
            return noChapterPermissionMessage ?? '';
        });
    }

    async openShareLinkToMaterial(): Promise<void> {
        await test.step('Get Share Link to Material message', async () => {
            this.logger.info('Getting Share Link to Material message step');
            await this.smartWait.waitForNetworkIdle();
            await this.getById(`${Selectors.SHARE_DIALOG.SHARE}`).click();
        });
    }

    async closeShareDialog(): Promise<void> {
        await test.step('Close Share Dialog', async () => {
            this.logger.info('Closing Share Dialog step');
            await this.smartWait.waitForNetworkIdle();
            await this.getByClass(`${Selectors.SHARE_DIALOG.CLOSE_BUTTON}`).click();
            await this.waitForElementHidden(`${Selectors.SHARE_DIALOG.SHARE_TITLE}`, 'Share Dialog title should be hidden after closing');
        });
    }
 
    async getShareDialogTitle(): Promise<string> {
        return await test.step('Get Share Dialog title', async () => {
            this.logger.info('Getting Share Dialog title step');
            await this.smartWait.waitForNetworkIdle();
            await this.waitSelector(`${Selectors.SHARE_DIALOG.SHARE_TITLE}`);
            const shareDialogTitle = await this.getByClass(`${Selectors.SHARE_DIALOG.SHARE_TITLE}`).first().textContent();
            return shareDialogTitle ?? '';
        });
    }

    async getProjectCopyOfInvitationLink(linkLocalization: string, invitationRole?: string, linkType?: string, linkExpires?: string): Promise<void> {
        await test.step('Get Project Copy of Invitation Link', async () => {
            this.logger.info('Getting Project Copy of Invitation Link step');
            await this.smartWait.waitForNetworkIdle();
            await this.waitSelector(`${Selectors.SHARE_DIALOG.SHARE_TITLE}`);

            // skips both undefined and null
            if (invitationRole != null) {
                await this.getByClass(`${Selectors.SHARE_DIALOG.INVITATION_ROLE}`).click();
                await this.page.locator(`${Selectors.SHARE_DIALOG.CHANGE_LINK_BUTTON}`, { hasText: invitationRole }).click();
            }
            if (linkType != null) {
                await this.getByClass(`${Selectors.SHARE_DIALOG.LINK_TYPE}`).click();
                await this.page.locator(`${Selectors.SHARE_DIALOG.CHANGE_LINK_BUTTON}`, { hasText: linkType }).click();
            }
            if (linkExpires != null) {
                await this.getByClass(`${Selectors.SHARE_DIALOG.LINK_EXPIRES}`).click();
                await this.page.locator(`${Selectors.SHARE_DIALOG.CHANGE_LINK_BUTTON}`, { hasText: linkExpires }).click();
            }
            
            await this.getByClass(`${Selectors.SHARE_DIALOG.LINK_LOCALIZATION}`).click();
            await this.page.locator(`${Selectors.SHARE_DIALOG.CHANGE_LINK_BUTTON}`, { hasText: linkLocalization }).click();            
            await this.getByClass(`${Selectors.SHARE_DIALOG.COPY_LINK_BUTTON}`).click();

        });
    }
}