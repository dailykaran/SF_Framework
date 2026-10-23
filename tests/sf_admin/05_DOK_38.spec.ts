import { test, expect } from '../../src/fixtures/auth.fixtures';
import { Selectors } from '../../src/locators/selectors';
import { Asserts } from '../../src/test_data/constants/asserts';
import { Inputs } from '../../src/test_data/constants/inputs';

test.beforeEach('DOK-38: SF admin setup for connecting a project', async ({ adminRolePages }) => {
    await adminRolePages.myProjects.adminConnectProjects(Inputs.PROJECT_NAME.DSS); 
});

test.afterEach('DOK-38: SF admin teardown for deleting a project', async ({ adminRolePages }) => {
    await adminRolePages.myProjects.adminNavigateSettings(Inputs.PROJECT_NAME.DSS);
    await adminRolePages.settings.deleteProject(Inputs.PROJECT_NAME.DSS);
});

test('DOK-38: SF-1674 - Inform user when lacking permission to edit text', 
    { 
        tag: ['@smoke'],
        annotation: { type: 'Issue', description: 'https://jira.example.com/SF-1674' },
    },
    async ({
  adminRolePages
}) => {
    await adminRolePages.myProjects.openProjects();
    await adminRolePages.myProjects.selectProject(Inputs.PROJECT_NAME.DSS);
    
    await adminRolePages.editReview.navigateToEditReview();
    const book = Inputs.BOOKS.LUKE;
    const chapter1 = '1'
    const chapter24 = "24";
  
    await adminRolePages.editReview.selectBook(book);   
    await adminRolePages.editReview.selectChapter(chapter24);
    await adminRolePages.editReview.wait('minWait');
    
    const noChapterPermissionMessage = await adminRolePages.sfComponents.getNoChapterPermission();
    expect(noChapterPermissionMessage).toBe(Asserts.BANNER.NO_CHAPTER_PERMISSION_MESSAGE);

    expect(await adminRolePages.editReview.page.locator(Selectors.EDIT_REVIEW.VERSE_NOT_EDITABLE)).toHaveAttribute('contenteditable', 'false');

    await adminRolePages.editReview.selectBook(Inputs.BOOKS.MARK);   
    await adminRolePages.editReview.selectChapter(chapter1);
    expect(await adminRolePages.editReview.page.locator(Selectors.EDIT_REVIEW.VERSE_NOT_EDITABLE)).toHaveAttribute('contenteditable', 'true');
    
    expect(async () => {
        await adminRolePages.editReview.getVerseEditableLocator();
    }).toPass();
    

});
