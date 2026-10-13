import { test, expect } from '../../src/fixtures/auth.fixtures';
import { Asserts } from '../../src/test_data/constants/asserts';
import { Inputs } from '../../src/test_data/constants/inputs';
import * as allure from 'allure-js-commons';


test('translator can open edit and review page', 
  { 
      tag: ['@smoke'],
      annotation: { type: 'Non-Issue', description: 'Added as a test for canceling sync scenario' },
  },
  async ({
  translatorRolePages,
  ccCheckerRolePages
}) => {
    await allure.feature('Edit and Review Page');
    await allure.severity('trivial');
    await allure.tag('smoke');
    await allure.link('https://jira.example.com/BUG-123', 'BUG-123');
    await allure.description('Verifies that the translator can open the edit and review page successfully.');

  await allure.step('Open edit and review page', async () => {
    await translatorRolePages.editReview.open(Inputs.PROJECT_NAME.F03);
    await translatorRolePages.editReview.navigateToEditReview();
    await expect(translatorRolePages.editReview.page).toHaveURL(new RegExp(`/${Asserts.EDIT_REVIEW.NAVIGATION_URL}/`));
    expect(await translatorRolePages.editReview.configureTranslatorSettings()).toBeVisible();
  });

/*   await allure.step('Open questions and answers page as CC checker', async () => {
    await ccCheckerRolePages.questionsAndAnswers.openProject(Inputs.PROJECT_NAME.F03);
    await ccCheckerRolePages.questionsAndAnswers.navigateToQuestionsAnswers();
    await expect(ccCheckerRolePages.questionsAndAnswers.page).toHaveURL(new RegExp(`[?&]${Asserts.CHECKING.CHAPTER}`));
  });  */// End of allure step for CC checker
}); 
