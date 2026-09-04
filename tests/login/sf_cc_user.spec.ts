import { test, expect } from '../../src/fixtures/auth.fixtures';
import { Asserts } from '../../src/test_data/constants/asserts';
import { Inputs } from '../../src/test_data/constants/inputs';  

test('TC021: verify CC Checker login with project home page', async ({ ccCheckerPage }) => {
      await ccCheckerPage.goto(`${process.env.BASE_URL}projects`);
      // CC Checker — edit button should not exist
      await ccCheckerPage.getByRole('button', { name: Inputs.PROJECT_NAME.F03 }).click();
      await ccCheckerPage.waitForURL(new RegExp(`/${Asserts.CHECKING.NAVIGATION_URL}/`));
      await expect(ccCheckerPage.getByRole('button', { name: /edit/i })).not.toBeVisible();

});

