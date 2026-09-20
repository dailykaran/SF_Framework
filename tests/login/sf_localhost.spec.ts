

import { test, expect } from '@playwright/test';



test('Verify the SF admin login with project', async ({ page }) => {
        
            await page.setDefaultNavigationTimeout(90000); 
            await page.goto(process.env.BASE_URL || 'http://localhost:5000');
            
            // Verify page loads successfully
            await expect(page).toHaveTitle('Scripture Forge');  
           
            // Click Log In button
            const logInButton2 = page.getByRole('link', { name: 'Log In' });
            await logInButton2.click();
            
            await page.waitForLoadState('networkidle');
            
            // Click "Log in with Paratext" button
            const paratextButton = page.locator('a').filter({ hasText: 'Log in with Paratext' });
            await expect(paratextButton).toBeVisible({ timeout: 5000 });
            await paratextButton.click();
            
            // Wait for Paratext authorization page
            await page.waitForURL('**https://registry-dev.paratext.org/auth?**', { timeout: 20000 });
            
            // Verify redirect to Authorise Application page
            const authHeading = page.getByRole('heading', { name: 'Authorise Application' });
            await expect(authHeading).toBeVisible(); 
            
            // Fill email
            const emailInput = page.getByPlaceholder('Email address');
            await emailInput.fill('dinakaran@ecgroup-intl.com');
            
            // Submit form by pressing Enter
            await emailInput.press('Enter');
            
             // Fill password
            await page.waitForSelector('#password', { timeout: 5000 });
            const passwordInput = page.locator('#password-group #password');
            await passwordInput.fill('dinakaran83');
            
            // Submit form by pressing Enter
            await page.waitForTimeout(1500);
            await page.waitForSelector('button[class="login-button normal"]', { timeout: 25000 });
            await page.locator('#password-group').getByRole('button').click();
                            
            await page.waitForSelector('.btn-success', { timeout: 10000 });
            const authorizeAccept = page.locator('.btn-success');
            await expect(authorizeAccept).toBeVisible({ timeout: 10000 });
            await authorizeAccept.click();

            await page.waitForSelector('#allow', { timeout: 10000 });
            const authorizeButton = page.locator('#allow');
            await expect(authorizeButton).toBeVisible({ timeout: 10000 });
            await authorizeButton.click();
            
    
            // Wait for Scripture Forge projects page
            await page.waitForURL('http://localhost:5000/projects', { timeout: 35000, waitUntil: 'networkidle' });
            
            // Wait for the projects page to fully load - either show projects or empty state
            await Promise.race([
                page.locator('.content h1:has-text("My projects")').waitFor({ state: 'visible', timeout: 15000 }),
                page.locator('h2:has-text("Not connected")').waitFor({ state: 'visible', timeout: 15000 }),
            ]);
            
            await expect(page).toHaveURL(/.*projects/);
            await expect(page.locator('.content h1')).toContainText('My projects');
        }
      
);



