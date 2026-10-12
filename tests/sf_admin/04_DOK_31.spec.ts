import { test, expect } from '../../src/fixtures/auth.fixtures';
import { Asserts } from '../../src/test_data/constants/asserts';
import { Inputs } from '../../src/test_data/constants/inputs';


test.beforeEach('DOK-06: SF admin setup for connecting a project', async ({ adminRolePages }) => {
    await adminRolePages.myProjects.adminConnectProjects(Inputs.PROJECT_NAME.TNN01); 
});

test.afterEach('DOK-06: SF admin teardown for deleting a project', async ({ adminRolePages }) => {
    await adminRolePages.myProjects.adminNavigateSettings(Inputs.PROJECT_NAME.TNN01);
    await adminRolePages.settings.deleteProject(Inputs.PROJECT_NAME.TNN01);
});

test('DOK-06: Synchronization stalls on retry if connection lost during previous send/receive -SF-1367', async ({
  adminRolePages
}) => {
    await adminRolePages.myProjects.openProjects();
    await adminRolePages.myProjects.selectProject(Inputs.PROJECT_NAME.TNN01);
    
    await adminRolePages.editReview.navigateToEditReview();
    await adminRolePages.manageQuestions.navigateToManageQuestions();

    const book = Inputs.BOOKS.MARK;
    const chapter1 = 1;
    const chapter2 = 2;
    const verse = 1;

    const getQuestion = await adminRolePages.manageQuestions.getQuestionAnswerText(book, chapter1, verse);
    await adminRolePages.manageQuestions.createQuestion(book, chapter1, verse, getQuestion.question);
    
    await adminRolePages.manageQuestions.expandQuestionPane();
    const getAddedQuestion = await adminRolePages.manageQuestions.findQuestionContent(getQuestion.question);
    expect(getAddedQuestion).toContain(getQuestion.question);

    const getQuestion1 = await adminRolePages.manageQuestions.getQuestionAnswerText(book, chapter1, verse);
    const question1 = await adminRolePages.manageQuestions.createQuestion(book, chapter2, verse, getQuestion1.question);
    console.log(question1);
    
    const getQuestion2 = await adminRolePages.manageQuestions.getQuestionAnswerText(book, chapter1, verse);
    const question2 = await adminRolePages.manageQuestions.createQuestion(book, chapter2, verse, getQuestion2.question);
    console.log(question2);
 
    await adminRolePages.questionsAndAnswers.navigateToQuestionsAnswers();
    await adminRolePages.editReview.selectBook(book);   
    await adminRolePages.editReview.selectChapter(chapter1.toString());

    await adminRolePages.manageQuestions.wait('minWait');
    const selectQuestion = await adminRolePages.questionsAndAnswers.selectQuestionOnPane(getQuestion.question);
    expect(selectQuestion).toContain(getQuestion.question);

    await expect(await adminRolePages.questionsAndAnswers.getQuestionHighlight()).toHaveAttribute(`${Asserts.QUESTIONS_AND_ANSWERS.QUESTION_HIGHLIGHT_COLOR_ATTRIBUTE}`, `${Asserts.QUESTIONS_AND_ANSWERS.CHAPTER1_VERSE_ONE}`);
    await adminRolePages.manageQuestions.wait('minWait');
    expect(await adminRolePages.questionsAndAnswers.getQuestionIconColor()).toBe(`${Asserts.QUESTIONS_AND_ANSWERS.QUESTION_ICON_COLOR}`);
    expect(await adminRolePages.questionsAndAnswers.getQuestionIcon()).toBe(true);

    await adminRolePages.editReview.selectChapter(chapter2.toString());
    await adminRolePages.manageQuestions.wait('minWait');
    const selectQuestion1 = await adminRolePages.questionsAndAnswers.selectQuestionOnPane(getQuestion1.question);
    expect(selectQuestion1).toContain(getQuestion1.question);

    
    expect(await adminRolePages.questionsAndAnswers.getQuestionHighlight()).toHaveAttribute(`${Asserts.QUESTIONS_AND_ANSWERS.QUESTION_HIGHLIGHT_COLOR_ATTRIBUTE}`, `${Asserts.QUESTIONS_AND_ANSWERS.CHAPTER2_VERSE_ONE}`);
    await adminRolePages.manageQuestions.wait('minWait');
    expect(await adminRolePages.questionsAndAnswers.getQuestionIconColor()).toBe(`${Asserts.QUESTIONS_AND_ANSWERS.QUESTION_ICON_COLOR}`);
    
    expect(await adminRolePages.questionsAndAnswers.getQuestionIcon()).toBe(true);
    expect(await adminRolePages.questionsAndAnswers.getQuestionHighlight()).toHaveAttribute(`${Asserts.QUESTIONS_AND_ANSWERS.QUESTION_COUNT}`, '2');
  
});
