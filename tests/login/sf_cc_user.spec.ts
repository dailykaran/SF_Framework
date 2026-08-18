import { test, expect } from '../../src/fixtures/auth.fixtures';  

test('TC021: verify CC Checker login with project home page', async ({ ccCheckerPage }) => {
      await ccCheckerPage.goto(`${process.env.BASE_URL}/projects`);
      // CC Checker — edit button should not exist
      await ccCheckerPage.getByRole('button', { name: '- 03F' }).click();
      await ccCheckerPage.waitForURL('**/checking/**');
      await expect(ccCheckerPage.getByRole('button', { name: /edit/i })).not.toBeVisible();

});

