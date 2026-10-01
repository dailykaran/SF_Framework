import { test, expect } from '../../src/fixtures/auth.fixtures';
import { Asserts } from '../../src/test_data/constants/asserts';
import { Inputs } from '../../src/test_data/constants/inputs';

test.beforeEach('DOK-06: SF admin setup for connecting a project', async ({ adminRolePages }) => {
    await adminRolePages.myProjects.adminConnectProjects(Inputs.PROJECT_NAME.TNN01); 
});

test.afterEach('DOK-06: SF admin teardown for deleting a project', async ({ adminRolePages }) => {
    await adminRolePages.myProjects.adminNavigateSettings(Inputs.PROJECT_NAME.TNN01);
    await adminRolePages.settings.deleteProject(Inputs.PROJECT_NAME.TNN01);
});

test('DOK-06: Synchronization stalls on retry if connection lost during previous send/receive -SF-1367', async ({
  adminRolePages
}) => {
    await adminRolePages.editReview.navigateToEditReview();
    
    const reference = await adminRolePages.editReview.getReferenceForBookChapterVerse(Inputs.BOOKS.MARK);
    const [book, chapter, verse] = reference.split(',');
  
    await adminRolePages.editReview.selectBook(book);
    const editor = await adminRolePages.editReview.enterTextInEditorForMultipleVerses(chapter, verse);
    expect(editor).not.toBeEmpty();

    await adminRolePages.synchronization.wait('minWait');
    await adminRolePages.synchronization.navigateToSyncWithParatext();
    await adminRolePages.synchronization.clickSyncButton();
    await adminRolePages.synchronization.visibleSyncProgress(Inputs.PROJECT_NAME.TNN01);
  
    await adminRolePages.synchronization.goOffline();
    expect(await adminRolePages.synchronization.syncOfflineMessage(Inputs.OFFLINE.MESSAGE_APPEAR)).toHaveText(Asserts.SYNCHRONIZATION.SYNC_OFFLINE_MESSAGE);
    await adminRolePages.synchronization.wait('minWait');
    
    await adminRolePages.synchronization.goOnline();
    await adminRolePages.synchronization.wait('minWait');
    await expect(await adminRolePages.synchronization.syncOfflineMessage(Inputs.OFFLINE.MESSAGE_DISAPPEAR)).not.toBeVisible();
  
  
});
