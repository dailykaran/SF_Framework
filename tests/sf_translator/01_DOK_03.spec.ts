import { test, expect } from '../../src/fixtures/auth.fixtures';
import { Asserts } from '../../src/test_data/constants/asserts';
import { Inputs } from '../../src/test_data/constants/inputs';

test.beforeEach(async ({ translatorEditReviewPage }) => {
   await console.log('Before each test for translatorEditReviewPage');
});

test.afterEach(async ({ translatorEditReviewPage }) => {
   await console.log('After each test for translatorEditReviewPage');
});

test('translator can open edit and review page', async ({
  translatorEditReviewPage
}) => {
  await translatorEditReviewPage.open(Inputs.PROJECT_NAME.F03);
  await translatorEditReviewPage.navigateToEditReview();
  await expect(translatorEditReviewPage.page).toHaveURL(new RegExp(`/${Asserts.EDIT_REVIEW.NAVIGATION_URL}/`));
  expect(await translatorEditReviewPage.configureTranslatorSettings()).toBeVisible();
});
