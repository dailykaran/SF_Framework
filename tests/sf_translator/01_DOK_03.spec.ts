import { test, expect } from '../../src/fixtures/auth.fixtures';
import { Asserts } from '../../src/test_data/constants/asserts';
import { Inputs } from '../../src/test_data/constants/inputs';

test.beforeEach(async ({ translatorPages }) => {
    await console.log('Before each test for getting project connected');
    await translatorPages.myProjects.adminConnectProjects(Inputs.PROJECT_NAME.TNN01);
});

test.afterEach(async ({ translatorPages }) => {
    await console.log('After each test for deleting project');
    await translatorPages.myProjects.adminDeleteProject(Inputs.PROJECT_NAME.TNN01);
    await translatorPages.settings.deleteProject(Inputs.PROJECT_NAME.TNN01);
});

test('translator can open edit and review page', async ({
  translatorPages
}) => {
  //await translatorPages.myProjects.joinProject(Inputs.PROJECT_NAME.TNN01);
  await translatorPages.myProjects.joinProjectTemp(Inputs.PROJECT_NAME.TNN01);
  await translatorPages.editReview.open(Inputs.PROJECT_NAME.TNN01);
  await translatorPages.editReview.navigateToEditReview();

  await translatorPages.synchronization.navigateToSyncWithParatext();

  await translatorPages.synchronization.clickSyncButton();
  await translatorPages.synchronization.visibleSyncProgress(Inputs.PROJECT_NAME.TNN01);
  await translatorPages.synchronization.cancelSyncButton();

  const cancelMessage = await translatorPages.synchronization.getCancelMessage();
  console.log('Cancel message:', cancelMessage);
  expect(cancelMessage).toBeDefined();
  expect(cancelMessage).not.toBe('');

  await translatorPages.synchronization.wait('minWait');
  await translatorPages.synchronization.clickSyncButton();

  await translatorPages.synchronization.hideSyncProgress(Inputs.PROJECT_NAME.TNN01);
  await translatorPages.synchronization.waitForCancelMessageHidden(Inputs.PROJECT_NAME.TNN01);
  expect(cancelMessage).toContain('');

  await translatorPages.synchronization.clickSyncButton();
  const snackBarMessage = await translatorPages.synchronization.getSnackBarMessage();
  console.log('Snack Bar message:', snackBarMessage);
  expect(snackBarMessage).toContain(`${Inputs.SYNC_WITH_PARATEXT.SNACK_BAR_MESSAGE}`);
  
});
