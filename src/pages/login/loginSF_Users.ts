import { Page, expect } from '@playwright/test';
import process from 'process';
import { createLogger } from '../../utils/logger/logger';

const log = createLogger('LoginUsers');


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
        log.info('Starting Paratext login', { email });
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


    // A trusted persistent profile can silently re-auth and land straight on /projects, skipping the form below
    private isOnProjectsPage(): boolean {
        return /\/projects(?:[/?]|$)/.test(this.page.url());
    }

    async performParatextLoginPersistentProfile(email: string, password: string) {
        log.info('Starting Paratext login (persistent profile)', { email });
        await this.page.setDefaultNavigationTimeout(90000);
        await this.page.goto(this.baseUrl);
        await expect(this.page).toHaveTitle(/Scripture Forge/);

        if (!this.isOnProjectsPage()) {
            const logInButton = this.page.getByRole('link', { name: 'Log In' });
            await logInButton.click();
            await this.page.waitForLoadState('networkidle');

            if (!this.isOnProjectsPage()) {
                await this.page.waitForTimeout(20000);
                const paratextButton = this.page.locator('a').filter({ hasText: 'Log in with Paratext', visible: true });
                await expect(paratextButton).toBeVisible();
                await paratextButton.click();

                await Promise.race([
                    this.page.waitForURL('**https://registry.paratext.org/auth?**', { timeout: 20000 }),
                    this.page.waitForURL('**/projects', { timeout: 20000 }),
                ]);

                if (!this.isOnProjectsPage()) {
                    const authHeading = this.page.getByRole('heading', { name: 'Authorise Application' });
                    await expect(authHeading).toBeVisible();

                    const emailInput = this.page.getByPlaceholder('Email address');
                    await emailInput.fill(email);
                    await emailInput.press('Enter');

                    await Promise.race([
                        this.page.waitForURL('**/accounts.google.com/v3/signin/identifier**', { timeout: 25000 }),
                        this.page.waitForURL('**/projects', { timeout: 25000 }),
                    ]);

                    if (!this.isOnProjectsPage()) {
                        const nextButton = this.page.getByRole('button', { name: 'Next' }).first();
                        await expect(nextButton).toBeVisible();
                        await nextButton.click();

                        await Promise.race([
                            this.page.waitForURL('**/accounts.google.com/v3/signin/challenge/pwd**', { timeout: 25000 }),
                            this.page.waitForURL('**/projects', { timeout: 25000 }),
                        ]);

                        if (!this.isOnProjectsPage()) {
                            const googlePasswordInput = this.page.locator('input[type="password"]');
                            await googlePasswordInput.fill(password);
                            await this.page.getByRole('button', { name: 'Next' }).click();
                        }
                    }
                }
            }
        } else {
            log.info('Persistent profile already authenticated - skipping login form');
        }

        await this.page.waitForURL('**/qa.scriptureforge.org/projects', { timeout: 35000, waitUntil: 'networkidle' });
        await this.page.waitForSelector('h2:has-text("Connected")', { timeout: 10000 });
        // Already-authenticated persistent profiles can load the projects API before this listener attaches, so don't block on it
        await this.page.waitForResponse(response => response.url().includes('/paratext-api/projects'), { timeout: 15000 }).catch(() => {});
        await this.page.locator('.project-name').first().waitFor({ state: 'visible', timeout: 15000 });

        await expect(this.page).toHaveURL(/.*projects/);
        await expect(this.page.locator('.content h1')).toContainText('My projects');
    }

    async performCCLoginPersistentProfile(email: string, password: string) {
        log.info('Starting CC checker login (persistent profile)', { email });
        await this.page.setDefaultNavigationTimeout(90000);
        await this.page.goto(this.baseUrl);
        await expect(this.page).toHaveTitle(/Scripture Forge/);

        if (!this.isOnProjectsPage()) {
            const logInButton = this.page.getByRole('link', { name: 'Log In' });
            await logInButton.click();
            await this.page.waitForLoadState('networkidle');

            if (!this.isOnProjectsPage()) {
                await this.page.locator('input[type="email"]').fill(email);
                await this.page.locator('input[type="password"]').fill(password);
                await this.page.getByRole('button', { name: 'Log In' }).click();
            }
        } else {
            log.info('Persistent profile already authenticated - skipping login form');
        }

        await this.page.waitForURL('**/qa.scriptureforge.org/projects', { timeout: 35000, waitUntil: 'networkidle' });
        await this.page.waitForSelector('h2:has-text("Connected")', { timeout: 10000 });

        await expect(this.page).toHaveURL(/.*projects/);
        await expect(this.page.locator('.content h1')).toContainText('My projects');
    }

    // Persistent profile login methods for Paratext and CC checker
    async paratextLoginPersistentProfile(userEmail: string, userPassword: string) {
        log.info('Logging in Paratext user with persistent profile');
        await this.performParatextLoginPersistentProfile(userEmail, userPassword);
    }

    async CCLoginPersistentProfile() {
        log.info('Logging in CC checker with persistent profile');
        await this.performCCLoginPersistentProfile(`${process.env.SF_CC_CHECKER_EMAIL}`, `${process.env.SF_CC_CHECKER_PASSWORD}`);
    }

    // Regular login methods for Paratext and CC checker
    async paratextLogin(userEmail: string, userPassword: string) {
        log.info('Logging in Paratext user');
        await this.performParatextLogin(userEmail, userPassword);
    }

    async CCLogin() {
        log.info('Logging in CC checker');
        await this.performCCLogin(`${process.env.SF_CC_CHECKER_EMAIL}`, `${process.env.SF_CC_CHECKER_PASSWORD}`);
    }

    
}

