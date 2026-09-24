import { test, expect } from '../../src/fixtures/auth.fixtures';
import { Asserts } from '../../src/test_data/constants/asserts';
import { Inputs } from '../../src/test_data/constants/inputs';  

test('TC021: verify CC Checker login with project home page', async ({ ccCheckerRole }) => {
      await ccCheckerRole.goto(`${process.env.BASE_URL}projects`);
      // CC Checker — edit button should not exist
      await ccCheckerRole.getByRole('button', { name: Inputs.PROJECT_NAME.F03 }).click();
      await ccCheckerRole.waitForURL(new RegExp(`/${Asserts.CHECKING.NAVIGATION_URL}/`));
      await expect(ccCheckerRole.getByRole('button', { name: /edit/i })).not.toBeVisible();

});

