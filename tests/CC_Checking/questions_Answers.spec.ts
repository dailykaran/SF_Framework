import { test, expect } from '../../src/fixtures/auth.fixtures';
import { Asserts } from '../../src/test_data/constants/asserts';
import { Inputs } from '../../src/test_data/constants/inputs';

test.beforeEach(async ({ ccCheckerRole }) => {
   await console.log('Before each test for CC Checking');
});

test.afterEach(async ({ ccCheckerRole }) => {
   await console.log('After each test for CC Checking');
});

test('CC Checker can open Questions & Answers page', async ({
  ccCheckerRolePages
}) => {
  await ccCheckerRolePages.communityChecker.openProject(Inputs.PROJECT_NAME.F03);
  await ccCheckerRolePages.communityChecker.navigateToQuestionsAnswers();
  await expect(ccCheckerRolePages.communityChecker.page).toHaveURL(new RegExp(`[?&]${Asserts.CHECKING.CHAPTER}`));
});

