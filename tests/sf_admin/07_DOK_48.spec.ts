import { test, expect } from '../../src/fixtures/auth.fixtures';
import { Selectors } from '../../src/locators/selectors';
import { Asserts } from '../../src/test_data/constants/asserts';
import { Inputs } from '../../src/test_data/constants/inputs';

test.beforeEach('DOK-48: SF admin setup for connecting a project', async ({ adminRolePages }) => {
    await adminRolePages.myProjects.adminConnectProjects(Inputs.PROJECT_NAME.TNN01); 
});

test.afterEach('DOK-48: SF admin teardown for deleting a project', async ({ adminRolePages }) => {
    await adminRolePages.myProjects.adminNavigateSettings(Inputs.PROJECT_NAME.TNN01);
    await adminRolePages.settings.deleteProject(Inputs.PROJECT_NAME.TNN01);
});

test('DOK-48: SF-1780 Update share link to Material', 
    { 
        tag: ['@smoke'],
        annotation: { type: 'Issue', description: 'https://jira.example.com/SF-1780' },
    },
    async ({
  adminRolePages
}) => {
    await adminRolePages.myProjects.openProjects();
    await adminRolePages.myProjects.selectProject(Inputs.PROJECT_NAME.TNN01);
    await adminRolePages.editReview.navigateToEditReview();
    
    await adminRolePages.questionsAndAnswers.navigateToQuestionsAnswers();

    await adminRolePages.sfComponents.openShareLinkToMaterial();   
    expect(await adminRolePages.sfComponents.getShareDialogTitle()).toContain(Asserts.DIALOG_TITLE.SHARE);
    
    await adminRolePages.sfComponents.getProjectCopyOfInvitationLink(
        Inputs.SHARE_DIALOG.LINK_LOCALIZATION.EnglishUS,
        Inputs.SHARE_DIALOG.INVITATION_ROLE.Commenter, 
        Inputs.SHARE_DIALOG.LINK_TYPE.OneRecipient, 
        Inputs.SHARE_DIALOG.LINK_EXPIRES.NinetyDays
    );

    await adminRolePages.page.locator(`${Selectors.SHARE_DIALOG.COPY_LINK_BUTTON}`).click();
    expect(await adminRolePages.sfComponents.getSnackBarMessage()).toContain(Asserts.SNACK_BAR.SHARE_DIALOG_COPY_LINK);
    await adminRolePages.sfComponents.closeShareDialog();
    await adminRolePages.questionsAndAnswers.goOffline();

    await adminRolePages.sfComponents.openShareLinkToMaterial();
    expect(await adminRolePages.sfComponents.getShareDialogTitle()).toContain(Asserts.DIALOG_TITLE.SHARE);
    expect(await adminRolePages.page.locator(`${Selectors.SHARE_DIALOG.COPY_LINK_BUTTON}`).isDisabled()).toBe(true);
    expect(await adminRolePages.page.locator(`${Selectors.BANNER.SHARE_DIALOG}`).textContent()).toContain(Asserts.BANNER.SHARE_DIALOG_OFFLINE_MESSAGE);
    await adminRolePages.questionsAndAnswers.wait('minWait');

    await adminRolePages.questionsAndAnswers.goOnline();
    await adminRolePages.sfComponents.closeShareDialog();
    
});