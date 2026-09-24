import { test, expect } from '../../src/fixtures/auth.fixtures';
import { Asserts } from '../../src/test_data/constants/asserts';
import { Inputs } from '../../src/test_data/constants/inputs';

test('translator can open edit and review page', async ({
  translatorRolePages
}) => {
  await translatorRolePages.editReview.open(Inputs.PROJECT_NAME.F03);
  await translatorRolePages.editReview.navigateToEditReview();
  await expect(translatorRolePages.editReview.page).toHaveURL(new RegExp(`/${Asserts.EDIT_REVIEW.NAVIGATION_URL}/`));
  expect(await translatorRolePages.editReview.configureTranslatorSettings()).not.toBeVisible();
});
