import { test, expect, Page, Browser } from '@playwright/test';


// Configuration
const BASE_URL = 'https://qa.scriptureforge.org/projects';
const PROJECT_NAME = '- 03F';

test.describe('Scripture Forge Login', () => {
  let page: Page
  
  test.beforeEach(async ({ browser }) => {
    const context = await browser.newContext({
      storageState: 'D:\\Dinakaran_Files\\Playwright_Automation\\TestCasesFailed\\.auth\\sfadmin.json' 
    });
    page = await context.newPage();
  });

    test('TC002: Navigate to Scripture Forge QA homepage', async () => {
    await page.setDefaultNavigationTimeout(20000); 
    await page.goto(BASE_URL);
    
    await page.getByRole('button', { name: PROJECT_NAME}).click({timeout: 15000 }),
    await page.waitForURL('**/translate/**', { timeout: 35000 });

  })

    

});

