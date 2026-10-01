import { test } from '../../src/fixtures/auth.fixtures';
import { Asserts } from '../../src/test_data/constants/asserts';
import { Inputs } from '../../src/test_data/constants/inputs';


test('Verify the SF admin login with project', async ({ adminRole }) => {
      // Admin perspective
      await adminRole.goto(`${process.env.BASE_URL}projects`);
      await adminRole.getByRole('button', { name: Inputs.PROJECT_NAME.F03 }).click();
      await adminRole.waitForURL(new RegExp(`/${Asserts.EDIT_REVIEW.NAVIGATION_URL}/`));
      
});


