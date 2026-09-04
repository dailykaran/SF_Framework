import { expect, test} from '../../src/fixtures/auth.fixtures';
import { Asserts } from '../../src/test_data/constants/asserts';
import { Inputs } from '../../src/test_data/constants/inputs';
 
const BASE_URL = process.env.BASE_URL ?? '';
 
test('Verify translator user with project page', async ({ translatorPage }) => {
    await translatorPage.goto(`${BASE_URL}projects`);
    // Admin-only nav item should not be visible for the editor role
    await translatorPage.getByRole('button', { name: Inputs.PROJECT_NAME.F03 }).click();
    await translatorPage.waitForLoadState('networkidle');
    await translatorPage.getByText('Edit & review').click();
    await translatorPage.waitForURL(new RegExp(`/${Asserts.EDIT_REVIEW.NAVIGATION_URL}/`));
    await expect(translatorPage).toHaveURL(new RegExp(`/${Asserts.EDIT_REVIEW.NAVIGATION_URL}/`));
    await expect(translatorPage.getByRole('link', { name: /admin settings/i })).not.toBeVisible();
});
 


