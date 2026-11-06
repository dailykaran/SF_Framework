import { test, expect } from '../../src/fixtures/auth.fixtures';
import { Selectors } from '../../src/locators/selectors';
import { Asserts } from '../../src/test_data/constants/asserts';
import { Inputs } from '../../src/test_data/constants/inputs';

test.beforeEach('DOK-48: SF admin setup for connecting a project', async ({ guestRole }) => {
    await guestRole.goto('https://qa.scriptureforge.org');
});

    let allowedPaths = [
        Asserts.LANDING.termsandconditions,
        Asserts.LANDING.privacypolicy,
        Asserts.LANDING.helplinks,
        Asserts.LANDING.community,
        Asserts.LANDING.global,
        Asserts.LANDING.payap,
        Asserts.LANDING.asia,
    ];
    // Creates a pattern like: /\/(termsandconditions|privacypolicy|helplinks)(\/|$)/
    let pattern = new RegExp(`\\/(${allowedPaths.join('||')})(\\/|$)`);

 
test('DOK-49[Scenario A: English UI]: SF-1771 Add help links to footer', 
    { 
        tag: ['@smoke'],
        annotation: { type: 'Issue', description: 'https://jira.example.com/SF-1771' },
    },
    async ({ guestRole: page, guestRolePages }) => {

    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(Inputs.LANDING.URL);
    await expect(page).toHaveTitle(new RegExp(Inputs.LANDING.TITLE));
    
    await page.locator(Selectors.LANDING.FOOTER).scrollIntoViewIfNeeded();
    await expect(page.locator(Selectors.LANDING.FOOTER)).toBeVisible();
    
    const footerLinks = await page.locator(`${Selectors.LANDING.FOOTER} a`).all();
    for(const link of footerLinks) {
        const linkUrl = await guestRolePages.landing.openLinkInNewTab(link);
        expect(linkUrl).toBeTruthy();
        expect(linkUrl).toMatch(pattern);    
        }
    })

  
    test('DOK-49[Scenario B: Arabic UI]: SF-1771 Add help links to footer', 
    { 
        tag: ['@smoke'],
        annotation: { type: 'Issue', description: 'https://jira.example.com/SF-1771' },
    },
    async ({ guestRolePages }) => {
    await guestRolePages.landing.page.waitForLoadState('domcontentloaded');
    await expect(guestRolePages.landing.page).toHaveURL(Inputs.LANDING.URL);
    await expect(guestRolePages.landing.page).toHaveTitle(new RegExp(Inputs.LANDING.TITLE));
    // Switch to Arabic UI
    await guestRolePages.landing.getById(Selectors.LANDING.LANGUAGE_SELECT).click();
    await guestRolePages.landing.getByClass(Selectors.LANDING.LANGUAGE_SELECT_CLASS).selectOption({ label: Selectors.LANDING.ARABIC_LANGUAGE_LABEL });
    
    await guestRolePages.landing.getByClass(Selectors.LANDING.FOOTER).scrollIntoViewIfNeeded();
    await expect(guestRolePages.landing.getByClass(Selectors.LANDING.FOOTER)).toBeVisible();
    
    const footerLinks = await guestRolePages.landing.getByClass(`${Selectors.LANDING.PROFILES}`).all();
    for (const linkName of footerLinks) {
        const linkUrl = await guestRolePages.landing.openNewTabOnChildTab(`${await linkName.textContent()}`);
        expect(linkUrl).toBeTruthy();
        // Creates a pattern like: /terms|privacy|help|community|global|payap|asia/
        expect(linkUrl.url).toMatch(pattern);
    }
})

