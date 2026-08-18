import { expect, test} from '../../src/fixtures/auth.fixtures';
 
const BASE_URL = process.env.BASE_URL ?? '';
 
test('Verify translator user with project page', async ({ translatorPage }) => {
    await translatorPage.goto(`${BASE_URL}/projects`);
    // Admin-only nav item should not be visible for the editor role
    await translatorPage.getByRole('button', { name: '- 03F' }).click();
    await translatorPage.waitForLoadState('networkidle');
    await translatorPage.getByText('Edit & review').click();
    await translatorPage.waitForURL('**/translate/**');
    await expect(translatorPage).toHaveURL(/\/translate\//);
    await expect(translatorPage.getByRole('link', { name: /admin settings/i })).not.toBeVisible();
});
 


