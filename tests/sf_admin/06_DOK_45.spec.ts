import { test, expect } from '../../src/fixtures/auth.fixtures';
import { Asserts } from '../../src/test_data/constants/asserts';
import { Inputs } from '../../src/test_data/constants/inputs';
import { Selectors } from '../../src/locators/selectors';


test.beforeEach('DOK-45: SF admin setup for connecting a project', async ({ adminRolePages }) => {
    await adminRolePages.myProjects.adminConnectProjects(Inputs.PROJECT_NAME.TNN01); 
});

test.afterEach('DOK-45: SF admin teardown for deleting a project', async ({ adminRolePages }) => {
    await adminRolePages.myProjects.adminNavigateSettings(Inputs.PROJECT_NAME.TNN01);
    await adminRolePages.settings.deleteProject(Inputs.PROJECT_NAME.TNN01);
});

test('DOK-45: SF-1737 - Yellow highlight does not appear for reference passages in the question dialog.', 
    { 
        tag: ['@smoke'],
        annotation: { type: 'Issue', description: 'https://jira.example.com/SF-1737' },
    },
    async ({
  adminRolePages
}) => {
    await adminRolePages.myProjects.openProjects();
    await adminRolePages.myProjects.selectProject(Inputs.PROJECT_NAME.TNN01);
    
    await adminRolePages.editReview.navigateToEditReview();
    await adminRolePages.manageQuestions.navigateToManageQuestions();

    const book = Inputs.BOOKS.MATTHEW;
    const chapter1 = 24;
    const verse2 = 2;
    const verse50 = 50;
    const getQuestion = await adminRolePages.manageQuestions.getQuestionAnswerText(book, chapter1, verse2);

    await adminRolePages.manageQuestions.openAddQuestion();
    expect(await adminRolePages.manageQuestions.getTextContent(`${Selectors.MANAGE_QUESTIONS.NEW_QUESTION_HEADER}`)).toContain(Asserts.QUESTIONS_AND_ANSWERS.NEW_QUESTION_HEADER);
    await adminRolePages.manageQuestions.scriptureStartReference(book, chapter1, verse50);
    await adminRolePages.manageQuestions.wait('minWait');
    await adminRolePages.manageQuestions.questionContent(getQuestion.question);
    
    expect((await adminRolePages.manageQuestions.findQuestionQuillEditorContent(chapter1, verse50)).locator(`${Selectors.MANAGE_QUESTIONS.QUESTION_QUILL_EDITOR_VERSE_HIGHLIGHT}`)).toBeTruthy();
    expect(await adminRolePages.manageQuestions.page.locator(`.${Selectors.MANAGE_QUESTIONS.QUESTION_QUILL_EDITOR_VERSE_HIGHLIGHT}`)).toHaveAttribute(Asserts.MANAGE_QUESTIONS.QUESTION_QUILL_EDITOR_VERSE_DATA_SEGMENT, `verse_${chapter1}_${verse50}`);
    expect((await adminRolePages.manageQuestions.findQuestionHighlightContent())).toHaveAttribute(Asserts.MANAGE_QUESTIONS.QUESTION_QUILL_EDITOR_VERSE_DATA_SEGMENT, `verse_${chapter1}_${verse50}`);

    await adminRolePages.manageQuestions.scriptureStartReference(book, chapter1, verse2);
    await adminRolePages.manageQuestions.wait('minWait');
    
    expect((await adminRolePages.manageQuestions.findQuestionQuillEditorContent(chapter1, verse50)).locator(`${Selectors.MANAGE_QUESTIONS.QUESTION_QUILL_EDITOR_VERSE_HIGHLIGHT}`)).toBeTruthy();
    expect(await adminRolePages.manageQuestions.page.locator(`.${Selectors.MANAGE_QUESTIONS.QUESTION_QUILL_EDITOR_VERSE_HIGHLIGHT}`)).toHaveAttribute(Asserts.MANAGE_QUESTIONS.QUESTION_QUILL_EDITOR_VERSE_DATA_SEGMENT, `verse_${chapter1}_${verse2}`);
    expect((await adminRolePages.manageQuestions.findQuestionHighlightContent())).toHaveAttribute(Asserts.MANAGE_QUESTIONS.QUESTION_QUILL_EDITOR_VERSE_DATA_SEGMENT, `verse_${chapter1}_${verse2}`);
    
    await adminRolePages.manageQuestions.closeNewQuestionDialog();
})

