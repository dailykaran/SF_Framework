import {Page, test, expect, chromium, BrowserContext, Locator, Frame, FrameLocator} from '@playwright/test'

export abstract class playwright_Wrapper{
    readonly page: Page
    readonly context: BrowserContext
    protected newWindow: Page | null = null;

    constructor (page: Page, context: BrowserContext){
        this.page = page;
        this.context = context;

    }

    async loadApp(url: string): Promise<void>{
        try{
            await test.step(`the URL ${url} loaded`, async()=>{
                await this.page.goto(url);
            })
        }catch(error){
            console.error("Error loading the page", error);
        }
    }

    async click(locator: string, name?: string, type?: string): Promise<void>{
        test.step(`The ${name} ${type} is click`, async()=>{
            await this.page.waitForSelector(locator, {state: 'attached', timeout: 3000});
            await this.page.locator(locator).click();
        })
    }

    async forceClick(locator: string, name: string, type: string): Promise<void> {
        test.step(`the ${name} ${type} is forced click`, async()=>{
            await this.page.waitForSelector(locator, {state: 'visible'});
            await this.page.locator(locator).click({force: true});
        })
    }

    async typeEnter(locator: string, name: string, type: string):Promise<void> {
        test.step(`Textbox ${name} filled with ${type} application`, async()=>{
            await this.page.waitForSelector(locator, {state: 'attached'});
            await expect(this.page.locator(locator)).toBeEditable();
            await this.page.locator(locator).fill(type);
            await this.page.keyboard.press('Enter');
        })
    }

    async typeFill(Locator: string, name: string, type: string):Promise<void> {
        test.step(`TextBox ${name} filled with ${type} application`, async()=>{
            await this.page.waitForSelector(Locator, {state: 'attached'});
            await expect(this.page.locator(Locator)).toBeEditable();
            await this.page.locator(Locator).fill(type);
        })
    }

    async dynamicButtonClick(locator: string, name: string, type: string): Promise<void>{
        test.step(`the ${name} ${type} is dynamicElement clicked`, async()=>{
            try{
                await this.page.waitForSelector(locator, {state: 'attached', timeout: 60000});
                await this.page.locator(locator).click();
            }catch(error){
                console.error(`Failed to find or click on the selector ${locator}`, error);
                throw error;                
            }
        })
    }
    
    async assertElementVisible(locator: string, name: string) {
        await test.step(`Assert the element ${name} is visible`, async()=>{
            const element = this.page.locator(locator);
            await expect(element).toBeVisible();
        })
    }

    async assertContainText(locator: string, text: string, name: string){
        await test.step(`Assert the element ${name} contain text ${text}`, async()=>{
            const element = this.page.locator(locator);
            await expect(element).toContainText(text);
        })            
    }

    async assertElementCount(locator: string, expectedCount: number, name: string){
        await test.step(`Assert the element ${name} count is ${expectedCount}`, async()=>{
            const element = this.page.locator(locator);
            await expect(element).toHaveCount(expectedCount);
        })
    }

    async assertURLContent(name: string){
        await test.step(`Assert the url ${name}`, async()=>{
            const regx = new RegExp(String.raw`/.*${name}/`, 'g');
            await this.page.waitForURL(regx);
            expect(this.page.url()).toContain(name);
        })
    }

    async assertToastMessage(locator: string, assertText: string){
        await test.step(`Assert the toast message ${assertText}`, async()=>{
            await this.page.waitForLoadState('domcontentloaded');
            const toastMSG = this.page.locator(locator);
            await expect(toastMSG).toContainText(assertText);
            console.log(await toastMSG.innerText());
            //await this.page.waitForSelector(locator, { state: "detached" });
        })
    }

    async waitForElementVisible(locator: string, name: string, timeoutNumber: number ){
        await test.step(`${name} element needs to be visible`, async()=>{
            await this.page.locator(locator).waitFor({state: 'visible', timeout: timeoutNumber,});
        })
    }

    async waitForElementHidden(locator: string, name: string, timeoutNumber?: number){
        await test.step(`${name} element needs to be hide`, async()=>{
            const element = await this.page.locator(locator);
            await element.waitFor({state: 'hidden', timeout: timeoutNumber});
        })
    }

    async waitForElementTextAssert(locator: string, text: string, name: string, timeoutNumber: number){
        await test.step(`${name} element needs to be wait and assert the ${text}`, async()=>{
            const element = await this.page.locator(locator);
            await element.waitFor({state: 'attached', timeout: timeoutNumber});
            await expect(element).toContainText(text);
        })
    }

    async waitForDialogAssert(locator: string, text: string, timeoutNumber: number){
        await test.step(`${text} dialog is visible to appeared and assert the dialog`, async()=>{
            const element = await this.page.locator(locator).getByText(text, {exact: true});
            await element.waitFor({state: 'attached', timeout: timeoutNumber});
            await expect(element).toContainText(text);
        })

    }

    async getText(locator: string): Promise<string> {
        return await test.step(`Getting text from the ${locator}`, async()=>{            
            await this.page.waitForSelector(locator, {state: 'attached'});
            return await this.page.locator(locator).innerText();
        })
    }

    async getTitle(locator: string): Promise<string>{
        return await test.step(`Getting the element ${locator} `, async()=>{
            await this.page.waitForLoadState('networkidle');
            return await this.page.title();
        })
    }

    async getInput(locator: string): Promise<string>{
        return await test.step(`Getting ${locator}, from text`, async()=>{
            await this.page.waitForSelector(locator, {state: 'attached'})
            return await this.page.locator(locator).inputValue();
        })
    }

    async waitForLoadState(state: 'load' | 'domcontentloaded' | 'networkidle'): Promise<void>{
        await test.step(`wait for an element`, async()=>{
            await this.page.waitForLoadState(state, {timeout: 6000});
        })
    }
    
    async getIframe(locator: string): Promise<FrameLocator>{
        return await test.step(`return iframe element`, async()=>{
            const iframe = this.page.frameLocator(locator);
            return iframe;
        })
    }

    async iframeFill(locator: string, fillText: string, fillTextBox: string): Promise<void>{
        await test.step(`getiframe and ${fillText} in the ${fillTextBox}`, async()=>{
            await this.page.frameLocator(locator).locator(fillTextBox).fill(fillText);
            //expect(await this.page.frameLocator(locator).locator(fillTextBox).getAttribute('value')).toContain(fillText);
            await expect(this.page.frameLocator(locator).locator(fillTextBox)).toHaveValue(fillText);
        })
    }

    async iframeClick(locator: string, fillbutton: string): Promise<void>{
        await test.step(`getiframe and click the ${fillbutton}`, async()=>{
            await this.page.waitForSelector(locator, {state: 'attached'});
            await this.page.frameLocator(locator).locator(fillbutton).click();
        })
    }

    async comboBoxList(locator: string, selectItem: string):Promise<void>{
        await test.step(`Select a item from combo box ${selectItem}`, async()=>{
            await this.page.waitForSelector(locator, {state: 'attached'});
            await this.page.locator(locator, {hasText: selectItem}).click();
        })
    }

    async waitSpinnerAndClose():Promise<void>{
        await test.step(`find the spinner and close the dialog`, async()=>{
            await this.page.addLocatorHandler(
                //this.page.getByRole('status').locator('visible=true'),
                await this.page.locator('.slds-spinner_container div.slds-spinner span'),
                async() => {
                    await this.page.getByRole('button', {name: 'Close this window'}).click();
                    await this.page.waitForLoadState('networkidle');
                }
            )
        })
    }

    async handleNewTab(newWindowTabLocator: string): Promise<Page>{
        return await test.step(`Window is opened`, async () => {
                const [newTab] = await Promise.all([
                this.context.waitForEvent("page"),
                this.page.locator(newWindowTabLocator).click()
                ]);
                return newTab
        });
    }

    async getbyrole(nametext: string, roletype?: any  ): Promise<void>{
        test.step(`The ${nametext} ${roletype} is click`, async()=>{
            //console.log('display the role type: ' + typeof(roletype));
            await this.page.getByRole(roletype, { name: nametext}).click();            
        })
    }

    async getbyroleFill(roletype: any, TextBoxName: string, TextBoxContent: string): Promise<void>{
        test.step(`The ${TextBoxName} ${roletype} is fill`, async()=>{
            //console.log('display the role type: ' + typeof(roletype));
            await this.page.getByRole(roletype , {name: TextBoxName}).fill(TextBoxContent);            
        })
    }

    async getbyroleClear(roletype: any, TextBoxName: string){
        test.step(`The ${TextBoxName} is clear`, async()=>{
            await this.page.getByRole(roletype , {name: TextBoxName}).clear();
        })
    }

    async getbyroleGroup(roletype1: any, roletype2: any, filterName: string, roletype1Text: string, roletype2Text: string): Promise<void>{
        test.step(`The ${roletype1} ${roletype2} is group`, async()=>{
            await this.page.getByRole(roletype1, {"name": roletype1Text}).filter({hasText: filterName}).getByRole(roletype2, {name: roletype2Text}).click();
        })
    }

    async getbyroleTitleText(nametext: string){
        test.step(`The ${nametext} is click`, async()=>{            
            await this.page.getByTitle(nametext, {exact: true}).click({force:true});  
        })
    }

    async getbyroleLocatorButton(Locator: string, nametext: string){
        test.step(`The ${nametext} is click`, async()=>{            
            await this.page.locator(Locator).getByRole('button', {name: nametext, exact: true}).click({force:true});
        })
    }

}