import { test, expect, Page, Browser } from '@playwright/test';


// Configuration
const BASE_URL = 'https://qa.scriptureforge.org/projects';
const PROJECT_NAME = '- 03F';

test.describe('Scripture Forge Admin', () => {


    test('TC003: Navigate to Scripture Forge', async ({page}) => {
    await page.setDefaultNavigationTimeout(20000); 
    await page.goto(BASE_URL);
    
    await page.getByRole('button', { name: PROJECT_NAME}).click({timeout: 15000 }),
    await page.waitForURL('**/translate/**', { timeout: 35000 });

  })
  
});

