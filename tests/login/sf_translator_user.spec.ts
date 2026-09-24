import { expect, test} from '../../src/fixtures/auth.fixtures';
import { Asserts } from '../../src/test_data/constants/asserts';
import { Inputs } from '../../src/test_data/constants/inputs';
 
const BASE_URL = process.env.BASE_URL ?? '';
 
test('Verify translator user with project page', async ({ translatorRole }) => {
    await translatorRole.goto(`${BASE_URL}projects`);
    // Admin-only nav item should not be visible for the editor role
    await translatorRole.getByRole('button', { name: Inputs.PROJECT_NAME.F03 }).click();
    await translatorRole.waitForLoadState('networkidle');
    await translatorRole.getByText('Edit & review').click();
    await translatorRole.waitForURL(new RegExp(`/${Asserts.EDIT_REVIEW.NAVIGATION_URL}/`));
    await expect(translatorRole).toHaveURL(new RegExp(`/${Asserts.EDIT_REVIEW.NAVIGATION_URL}/`));
    await expect(translatorRole.getByRole('link', { name: /admin settings/i })).not.toBeVisible();
});
 


