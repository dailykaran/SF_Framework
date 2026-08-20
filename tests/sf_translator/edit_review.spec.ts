import { test, expect } from '../../src/fixtures/auth.fixtures';

test('translator can open edit and review page', async ({
  translatorEditReviewPage
}) => {
  await translatorEditReviewPage.open('- 03F');
  await translatorEditReviewPage.navigateToEditReview();
  await translatorEditReviewPage.expectTranslatorSettingsVisible();
});
