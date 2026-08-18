import { Page, expect } from '@playwright/test';
import process from 'process';


export class LoginUsers {
    private page: Page;
    private baseUrl: string;

    constructor(page: Page, baseUrl: string) {
        this.page = page;
        this.baseUrl = baseUrl;
    }

    /**
     * Core login workflow containing your automated steps.
     * We reuse this so we don't have to duplicate the 40+ lines of code for every user.
     */
    private async performParatextLogin(email: string, password: string) {
        await this.page.setDefaultNavigationTimeout(90000); 
        await this.page.goto(this.baseUrl);
        
        // Verify page loads successfully
        await expect(this.page).toHaveTitle('Scripture Forge QA');  
       
        // Click Log In button
        const logInButton2 = this.page.getByRole('link', { name: 'Log In' });
        await logInButton2.click();
        
        await this.page.waitForLoadState('networkidle');
        
        // Click "Log in with Paratext" button
        const paratextButton = this.page.locator('a').filter({ hasText: 'Log in with Paratext' });
        await expect(paratextButton).toBeVisible({ timeout: 5000 });
        await paratextButton.click();
        
        // Wait for Paratext authorization page
        await this.page.waitForURL('**https://registry.paratext.org/auth?**', { timeout: 20000 });
        
        // Verify redirect to Authorise Application page
        const authHeading = this.page.getByRole('heading', { name: 'Authorise Application' });
        await expect(authHeading).toBeVisible(); 
        
        // Fill email
        const emailInput = this.page.getByPlaceholder('Email address');
        await emailInput.fill(email);
        
        // Submit form by pressing Enter
        await emailInput.press('Enter');
        
        // Google email verification
        await this.page.waitForURL('**/accounts.google.com/v3/signin/identifier**', { timeout: 25000 });
        const nextButton = this.page.getByRole('button', { name: 'Next' }).first();
        await expect(nextButton).toBeVisible();
        await nextButton.click();
        
        // Enter Google password
        await this.page.waitForURL('**/accounts.google.com/v3/signin/challenge/pwd**', { timeout: 25000 });
        const googlePasswordInput = this.page.locator('input[type="password"]');
        await googlePasswordInput.fill(password);
        
        const nextPasswordButton = this.page.getByRole('button', { name: 'Next' });
        await nextPasswordButton.click();

        // Wait for Scripture Forge projects page
        await this.page.waitForURL('**/qa.scriptureforge.org/projects', { timeout: 35000, waitUntil: 'networkidle' });
        await this.page.waitForSelector('h2:has-text("Connected")', { timeout: 10000 });

        // Wait for APIs and elements to load (Fixed syntax: changed commas to semicolons)
        await this.page.waitForResponse(response => response.url().includes('/paratext-api/projects'), { timeout: 15000 });
        await this.page.locator('.project-name').first().waitFor({state: 'visible', timeout: 15000});
        
        await expect(this.page).toHaveURL(/.*projects/);
        await expect(this.page.locator('.content h1')).toContainText('My projects');
    }

    private async performCCLogin(email: string, password: string) {
        await this.page.setDefaultNavigationTimeout(90000); 
        await this.page.goto(this.baseUrl);
        await expect(this.page).toHaveTitle('Scripture Forge QA');  
       
        const logInButton = this.page.getByRole('link', { name: 'Log In' });
        await logInButton.click();
        
        await this.page.waitForLoadState('networkidle');
        await this.page.locator('input[type="email"]').fill(email);
        await this.page.locator('input[type="password"]').fill(password);
               
        // Submit form by pressing Enter
        await this.page.getByRole('button', { name: 'Log In' }).click();
        await this.page.waitForURL('**/qa.scriptureforge.org/projects', { timeout: 35000, waitUntil: 'networkidle' });
        await this.page.waitForSelector('h2:has-text("Connected")', { timeout: 10000 });
        
        await expect(this.page).toHaveURL(/.*projects/);
        await expect(this.page.locator('.content h1')).toContainText('My projects');
    }

    async paratextLogin(userEmail: string, userPassword: string) {
        console.log('Logging in User 1...');
        await this.performParatextLogin(userEmail, userPassword);
    }

    async CCLogin() {
        console.log('Logging in User 2...');
        await this.performCCLogin(`${process.env.SF_CC_CHECKER_EMAIL}`, `${process.env.SF_CC_CHECKER_PASSWORD}`);
    }

    
}

