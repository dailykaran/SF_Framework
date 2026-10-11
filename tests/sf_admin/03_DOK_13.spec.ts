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
    const reference = await adminRolePages.editReview.getReferenceForBookChapterVerse(Inputs.BOOKS.MARK);
    const [book, chapter, verse] = reference.split(',');
  
    await adminRolePages.editReview.selectBook(book);   
    await adminRolePages.editReview.selectChapter(chapter);
    await adminRolePages.editReview.wait('mediumWait');
    await adminRolePages.editReview.goOffline();
    const verseData = await adminRolePages.editReview.enterTextInEditorForMultipleVerses(verse);
    
    await adminRolePages.editReview.goOnline();
    await adminRolePages.page.waitForLoadState('networkidle');
    await adminRolePages.page.reload({ waitUntil: 'networkidle' });

    await adminRolePages.logger.info(`Verse data after offline editing: verseLocator: ${[...verseData.verseLocator].join('\n')} | inputVerseText: ${[...verseData.inputVerseText].join('\n')}`);
    await expect(verseData.verseLocator).toEqual(verseData.inputVerseText);
  
});
