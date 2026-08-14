import { test, expect, Page } from '@playwright/test';
declare const process: any;

// Configuration
const BASE_URL = 'https://qa.scriptureforge.org/';
const PARATEXT_EMAIL = 'dinakaran@ecgroup-intl.com';
const PARATEXT_PASSWORD = 'Dinakaran83+';
const GOOGLE_PASSWORD = process.env.GOOGLE_PASSWORD || ''; // Set via environment variable
const PROJECT_NAME = '- 03F';

test.describe('Scripture Forge Login and Sync Workflow', () => {
  let page: Page;
  const authFile = '.auth/sfadmin.json'; 

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    // Set up any necessary context or storage
    await page.context().newPage();
  

  });

  test('TC001: Navigate to Scripture Forge QA homepage', async () => {
    await page.setDefaultNavigationTimeout(20000); 
    await page.goto(BASE_URL);
    
    // Verify page loads successfully
    await expect(page).toHaveTitle('Scripture Forge QA');  
   
    // Click Log In button
    const logInButton2 = page.getByRole('link', { name: 'Log In' });
    await logInButton2.click();
    
    await page.waitForLoadState('networkidle');
    
    // Click "Log in with Paratext" button
    const paratextButton = page.locator('a').filter({ hasText: 'Log in with Paratext' });
    await expect(paratextButton).toBeVisible({ timeout: 5000 });
    await paratextButton.click();
    
    // Wait for Paratext authorization page
    await page.waitForURL('**https://registry.paratext.org/auth?**', { timeout: 20000 });
    
    // Verify redirect to Authorise Application page
    const authHeading = page.getByRole('heading', { name: 'Authorise Application' });
    await expect(authHeading).toBeVisible(); 
    
    // Fill email
    const emailInput = page.getByPlaceholder('Email address');
    await emailInput.fill(PARATEXT_EMAIL);
    
    // Submit form by pressing Enter
    await emailInput.press('Enter');
    
    // Google email verification
    await page.waitForURL('**/accounts.google.com/v3/signin/identifier**', { timeout: 15000 });
    const nextButton = page.getByRole('button', { name: 'Next' }).first();
    await expect(nextButton).toBeVisible();
    await nextButton.click();
    
    // Enter Google password
    await page.waitForURL('**/accounts.google.com/v3/signin/challenge/pwd**', { timeout: 15000 });
    const googlePasswordInput = page.locator('input[type="password"]');
    await googlePasswordInput.fill(PARATEXT_PASSWORD);
    
    const nextPasswordButton = page.getByRole('button', { name: 'Next' });
    await nextPasswordButton.click();

    await page.waitForURL('**/qa.scriptureforge.org/projects**', { timeout: 35000, waitUntil: 'networkidle' });
    await page.waitForSelector('h2:has-text("Connected")', { timeout: 10000 });

    // Click on the project "F03 - 03F"
         
    await page.waitForResponse('**/paratext-api/projects', { timeout: 15000 }), 
    await page.locator('.project-name').first().waitFor({state: 'visible', timeout: 15000}),
    await expect(page).toHaveURL(/.*projects/);
    await expect(page.locator('.content h1')).toContainText('My projects')
    //await page.getByRole('button', { name: PROJECT_NAME}).click({timeout: 15000 }),
    //aWait for project page to load
    //await page.waitForURL('**/translate/**', { timeout: 35000 });
    
    await page.context().storageState({ path: authFile });
    
  });

  
});
