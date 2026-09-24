import { test, expect } from '../../src/fixtures/auth.fixtures';
import { Asserts } from '../../src/test_data/constants/asserts';
import { Inputs } from '../../src/test_data/constants/inputs';

test.beforeEach('SF admin setup for connecting a project', async ({ adminRolePages }) => {
    await adminRolePages.myProjects.adminConnectProjects(Inputs.PROJECT_NAME.TNN01); 
});

test.afterEach('SF admin teardown for deleting a project', async ({ adminRolePages }) => {
    await adminRolePages.myProjects.adminDeleteProject(Inputs.PROJECT_NAME.TNN01);
    await adminRolePages.settings.deleteProject(Inputs.PROJECT_NAME.TNN01);
});

test('DOK-03: Add cancel for sync', async ({
  translatorRolePages
}) => {
  await translatorRolePages.myProjects.joinProject(Inputs.PROJECT_NAME.TNN01);

  await translatorRolePages.editReview.selectBook(Inputs.BOOKS.MARK);
  await translatorRolePages.editReview.enterTextInEditor(await translatorRolePages.editReview.getRandomVerseText());
  
  await translatorRolePages.synchronization.wait('minWait');
  await translatorRolePages.synchronization.navigateToSyncWithParatext();
  await translatorRolePages.synchronization.clickSyncButton();
  await translatorRolePages.synchronization.visibleSyncProgress(Inputs.PROJECT_NAME.TNN01);
  
  await translatorRolePages.synchronization.wait('minWait');
  await translatorRolePages.synchronization.cancelSyncButton();

  const cancelMessage = await translatorRolePages.synchronization.getCancelMessage();
  console.log('Cancel message:', cancelMessage);
  expect(cancelMessage).toBeDefined();
  expect(cancelMessage).not.toBe('');

  await translatorRolePages.synchronization.wait('mediumWait');
  await translatorRolePages.synchronization.clickSyncButton();
  
  await translatorRolePages.synchronization.hideSyncProgress(Inputs.PROJECT_NAME.TNN01);
  await translatorRolePages.synchronization.waitForCancelMessageHidden(Inputs.PROJECT_NAME.TNN01);
  expect(cancelMessage).toContain('');

  const snackBarMessage = await translatorRolePages.synchronization.getSnackBarMessage();
  console.log('Snack Bar message:', snackBarMessage);
  expect(snackBarMessage).toContain(`${Asserts.SNACK_BAR.SYNC_SUCCESS_MESSAGE}`);
  
});
