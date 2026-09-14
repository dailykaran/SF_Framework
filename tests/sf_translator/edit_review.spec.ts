import { test, expect } from '../../src/fixtures/auth.fixtures';
import { Asserts } from '../../src/test_data/constants/asserts';
import { Inputs } from '../../src/test_data/constants/inputs';

test('translator can open edit and review page', async ({
  translatorPages
}) => {
  await translatorPages.editReview.open(Inputs.PROJECT_NAME.F03);
  await translatorPages.editReview.navigateToEditReview();
  await expect(translatorPages.editReview.page).toHaveURL(new RegExp(`/${Asserts.EDIT_REVIEW.NAVIGATION_URL}/`));
  expect(await translatorPages.editReview.configureTranslatorSettings()).toBeVisible();
});
