import { test, expect } from '../../src/fixtures/auth.fixtures';
import { Selectors } from '../../src/locators/selectors';
import { Asserts } from '../../src/test_data/constants/asserts';
import { Inputs } from '../../src/test_data/constants/inputs';

// Global variable to store the invite URL
let inviteURL: string; 

test.use({
        permissions: ['clipboard-read', 'clipboard-write'],
}); 

test.beforeAll('DOK-48: SF admin setup for connecting a project', async ({ adminRolePages }) => {
    await adminRolePages.myProjects.adminConnectProjects(Inputs.PROJECT_NAME.TNN01);

});

test.afterAll('DOK-48: SF admin teardown for deleting a project', async ({ adminRolePages }) => {
    await adminRolePages.myProjects.adminNavigateSettings(Inputs.PROJECT_NAME.TNN01);
    await adminRolePages.settings.deleteProject(Inputs.PROJECT_NAME.TNN01);
});


test.describe.configure({ mode: 'serial' });
test('DOK-60: An error appears when adding a project to the user for the first time by checker URL', 
    { 
        tag: ['@smoke'],
        annotation: { type: 'Issue', description: 'https://jira.example.com/SF-1822' },
    },
    async ({ adminRolePages, guestRolePages }) => {

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
    inviteURL = await adminRolePages.sfComponents.copyClipboardInviteURL();
    await adminRolePages.sfComponents.closeShareDialog();
    await adminRolePages.sfComponents.waitForSnackBarToDisappear(); 
    await adminRolePages.sfComponents.page.waitForLoadState('networkidle');
    await adminRolePages.myProjects.logoutFromProject();
    //await adminRolePages.sfComponents.page.context().close();

    const page = await guestRolePages.page.context().newPage();
        
    await page.goto(inviteURL);
    await expect(page.url()).toContain("join");
    //await guestRolePages.page.context().close();
    await page.waitForTimeout(4000);
});

test.skip('DOK-60: Guest user accesses the invite URL', async ({ guestRolePages }) => {
    
    const page = await guestRolePages.page.context().newPage();
        
    await page.goto(inviteURL);
    await expect(page.url()).toContain("join");
    //await guestRolePages.page.context().close();
    await page.waitForTimeout(4000);
    
});