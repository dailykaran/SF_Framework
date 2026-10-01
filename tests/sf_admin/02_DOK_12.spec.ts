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
    await adminRolePages.myProjects.adminNavigateSettings(Inputs.PROJECT_NAME.TNN01);
       
    await adminRolePages.settings.goOffline();
    expect(await adminRolePages.settings.settingsOfflineMessage(Inputs.OFFLINE.MESSAGE_APPEAR)).toHaveText(Asserts.SETTINGS.OFFLINE_MESSAGE);
    await adminRolePages.settings.wait('minWait');
    
    await adminRolePages.settings.goOnline();
    await adminRolePages.settings.wait('minWait');
    await expect(await adminRolePages.settings.settingsOfflineMessage(Inputs.OFFLINE.MESSAGE_DISAPPEAR)).not.toBeVisible();

    await expect(adminRolePages.page).toHaveURL(new RegExp(`/${Asserts.SETTINGS.URL}(/|$)`));
    await adminRolePages.page.reload({ waitUntil: 'networkidle' });
    await expect(adminRolePages.page).toHaveURL(new RegExp(`/${Asserts.SETTINGS.URL}(/|$)`));
  
});
