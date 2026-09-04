
import { Page, test, expect, BrowserContext, Locator } from "@playwright/test";
import * as path from 'path';
import fs from 'fs';
import type winston from 'winston';


export abstract class PlaywrightWrapper {

    page: Page;
    readonly context: BrowserContext;
    public logger: winston.Logger;
    private newPage: Page | null = null;

    protected getNewPage(): Page {
        if (!this.newPage) {
            throw new Error('New tab is not initialized. Did you forget to call childTab()?');
        }
        return this.newPage;
    }
    constructor(page: Page, context: BrowserContext, logger: winston.Logger) {
        this.page = page;
        this.context = context;
        this.logger = logger;
    }


    /**
   * Types into the specified textbox after clearing any existing text.
   * 
   * @param {string} locator - The locator for the textbox element.
   * @param {string} name - The name of the textbox element.
   * @param {string} data - The data to be typed into the textbox.
   */
    async type(locator: string, name: string, data: string) {
        await test.step(`Textbox ${name} filled with data: ${data}`, async () => {
            await this.page.locator(locator).clear();
            await this.page.locator(locator).fill(data);
            })
    }


    /**
     * Types into the specified textbox, clears existing text, and presses <ENTER>.
     * @param {string} locator - The locator for the textbox element.
     * @param {string} name - The name of the textbox element.
     * @param {string} data - The data to be typed into the textbox.
     */
    async fillAndEnter(locator: string, name: string, data: string) {
        await test.step(`Textbox ${name} filled with data: ${data}`, async () => {
            await this.page.locator(locator).clear();
            await this.page.fill(locator, data, { force: true })
            await this.page.focus(locator)
            await this.page.keyboard.press("Enter");

        });
    }

    /**
    * Types the specified data into a textbox using keyboard input, after clearing existing text.
    * @param {string} locator - The locator for the textbox element.
    * @param {string} data - The data to be typed into the textbox.
  */
    async keyboardType(locator: string, data: string) {
        await test.step(`Textbox filled with data: ${data}`, async () => {
            await this.page.locator(locator).clear();
            await this.page.focus(locator);
            await this.page.keyboard.type(data, { delay: 100 });
        });
    }

    /**
    * Types the specified data into a textbox and presses <Enter> after clearing the existing text.
    * @param {string} locator - The locator for the textbox element.
    * @param {string} name - The name of the textbox element.
    * @param {string} data - The data to be typed into the textbox.
    */
    async typeAndEnter(locator: string, name: string, data: string) {
        await test.step(`Textbox ${name} filled with data: ${data}`, async () => {
            await this.page.locator(locator).clear();
            await this.page.keyboard.type(data, { delay: 400 });
            await this.page.keyboard.press("Enter");
        });
    }

    /**
     * Clicks on the specified textbox element.
     * @param {string} locator - The locator for the element.
     * @param {string} name - The name of the element.
     * @param {string} type - The type of the element
     */
    async click(locator: string, name: string, type: string) {
        await test.step(`The ${name} ${type} clicked`, async () => {
            await this.page.waitForSelector(locator, { state: 'visible' });
            await this.page.locator(locator).click();
        });
    }

    async forceClick(locator: string, name: string, type: string) {
        await test.step(`The ${name} ${type} clicked`, async () => {
            await this.page.waitForSelector(locator, { state: 'visible' });
            await this.page.locator(locator).click({ force: true });
        });
    }

    async storeState(path: string): Promise<void> {
        try {
            await this.context.storageState({ path });
            this.logger.info(`Storage state saved to: ${path}`);
        } catch (error) {
            this.logger.error(`Failed to save storage state to: ${path}`, error);
        }
    }

    /**
    * Loads the specified URL in the browser.
    * 
    * @param {string} url - The URL to navigate to.
    */
    public async loadApplication(url: string) {
        try {
            await this.page.goto(url); // Increased timeout for 60 seconds
            this.logger.info(`Successfully loaded the URL: ${url}`);
        } catch (error) {
            this.logger.error(`Error loading the page at ${url}:`);
            throw new Error(`Failed to load the page at ${url}`);
        }
    }

    /**
    * Retrieves the inner text of the specified element.
    * 
    * @param {string} locator - The locator for the element.
    * @returns {Promise<string>} - The inner text of the element.
    */
    async getInnerText(locator: string): Promise<string> {
        return await this.page.locator(locator).innerText();
    }

    /**
    * Retrieves the text content of the specified element.
    * 
    * @param {string} locator - The locator for the element.
    * @returns {Promise<string | null | any>} - The text content of the element, or null if none is found.
    */
    async getTextContent(locator: string): Promise<string | null | any> {
        return await this.page.locator(locator).textContent();
    }

    /**
    * Retrieves the input value of the specified element (e.g., from an input field).
    * 
    * @param {string} locator - The locator for the input element.
    * @returns {Promise<string>} - The current value of the input element.
    */
    async getText(locator: string): Promise<string> {
        return await this.page.locator(locator).inputValue();
    }

    /**
    * Retrieves the title of the current page after it has fully loaded.
    * 
    * @returns {Promise<string>} - The title of the page.
    */
    async getTitle(): Promise<string> {
        await this.page.waitForLoadState('load');
        return await this.page.title();
    }

    /**
    * Waits for a specific element to be attached to the DOM.
    * 
    * @param {string} locator - The locator for the element to wait for.
    * @param {string} name - A descriptive name for the element (not used in this function but could be useful for logging).
    */
    async waitSelector(locator: string, name?: string | "Element") {
        await test.step(`Waiting for ${name} Visible`, async () => {
            await this.page.waitForSelector(locator, { timeout: 30000, state: "attached" });
        })
    }

    /**
    * Fetches the value of a specified attribute from an element.
    * 
    * @param {string} locator - The locator for the element.
    * @param {string} attName - The name of the attribute to retrieve.
    * @returns {Promise<string | null>} - The value of the attribute, or null if the attribute does not exist.
    */
    async fetchattribute(locator: string, attName: string) {
        const eleValue = await this.page.$(locator);
        if (!eleValue) {
            return null;
        }
        return await eleValue.evaluate((node, attributeName) => node.getAttribute(attributeName), attName);
    }

    /**
    * Retrieves the number of open browser windows (pages) in the current context.
    *  
    * @returns {Promise<number>} - The number of open browser windows.
    */
    async multipleWindowsCount(): Promise<number> {
        const windowslength = this.page.context().pages().length;
        return windowslength;
    }

    /**
    * Focuses on a new window that opens after clicking an element and retrieves its title.
    * 
     * @param {string} locator - The locator for the element to click that opens the new window.
     * @returns {Promise<any>} - The title of the newly opened window.
     */
    async focusWindow(locator: string): Promise<any> {
        const newPage = this.context.waitForEvent('page');
        await this.page.locator(locator).click()
        const newWindow = await newPage;
        await newWindow.waitForLoadState('load')
        return await newWindow.title();
    }

    /**
     * Switches to a new window that opens after clicking an element and brings it to the front.
     * 
     * @param {string} windowTitle - The title of the window to switch to.
     * @param {string} locator - The locator for the element to click that opens the new window.
     * @returns {Promise<Page | null>} - The new window with the specified title, or null if not found.
     */
    async switchToWindow(windowTitle: any, locator: string): Promise<Page | null> {
        const [newPage] = await Promise.all([
            this.context.waitForEvent('page'),
            this.page.locator(locator).click()
        ]);
        const pages = newPage.context().pages();
        for (const page of pages) {
            if (await page.title() === windowTitle) {
                await page.bringToFront();
                return page;
            }
        }
        this.logger.error(`No page found with title: ${windowTitle}`);
        return null;
    }

    async acceptAlert(Data: string) {
        this.page.on("dialog", async (dialog) => {
            dialog.message()
            await dialog.accept(Data);
            this.logger.info('Dialog Message:', dialog.message());
        });
    }

    async clickinFrame(frameLocator: string, locator: string, name: string, type: string, index?: number) {
        await test.step(`The ${type} ${name} clicked`, async () => {
            const frameEle = this.page.frameLocator(frameLocator)
            const elementCount = await frameEle.locator(locator).count();
            if (elementCount > 0) {
                await this.page.frameLocator(frameLocator).locator(locator).nth(index ?? 0).click({ force: true });
            } else {
                await this.page.locator(locator).click();
            }
        })
    }


    async verifyEleinFrame(frameLocator: string, locator: string, name: string) {
        await test.step(`Verifying the ${name} is present in the frame`, async () => {
            try {
                await this.page.waitForSelector(frameLocator, { state: 'attached', timeout: 5000 });
            } catch (error) {
                return;
            }
            const frameEle = this.page.frameLocator(frameLocator)
            const elementCount = await frameEle.locator(locator).count();
            if (elementCount > 0) {
                try {
                    const frameVisible = await frameEle.locator('body').isVisible({ timeout: 5000 });
                    expect(frameVisible).toBeTruthy();
                    this.logger.info("Frame element is visible");

                } catch (error) {
                    this.logger.error(error)
                }
            }
        });
    }

    async verifyAndClickEleinFrame(frameLocator: string, locator: string, name: string) {
        await test.step(`The ${name} is verified`, async () => {
            const frameEle = this.page.frameLocator(frameLocator)
            const elementCount = await frameEle.locator(locator).count();
            if (elementCount > 0) {
                try {
                    expect(frameEle).toBeTruthy()
                    await this.wait('minWait')
                    const ele = frameEle.locator(locator);
                    await expect(ele).toBeVisible()
                    await this.wait('minWait')
                    await ele.hover();
                    await ele.click();
                    this.logger.info(`Ele visible`);
                } catch (error) {
                    this.logger.error("Frame not found" + error)
                }
            }
        })
    }


    async typeinFrame(flocator: string, locator: string, name: string, data: string) {
        await test.step(`Textbox ${name} filled with data: ${data}`, async () => {
            const frameLocator = this.page.frameLocator(flocator);
            const elementCount = await frameLocator.locator(locator).count();
            if (elementCount > 0) {
                await this.page.frameLocator(flocator).locator(locator).clear();
                await this.page.frameLocator(flocator).locator(locator).fill(data);
                await this.page.keyboard.press("Enter");
            } else {
                await this.page.locator(locator).clear();
                await this.page.locator(locator).fill(data);
                await this.page.keyboard.press("Enter");
            }
        });
    }

    async mouseHoverandClick(hoverLocator: string, clickLocator: string, Menu: string, name: string) {
        await test.step(`The ${Menu} ${name} clicked`, async () => {
            await this.page.hover(hoverLocator);
            await this.page.click(clickLocator);

        })
    }

    async selectDropdown(selector: string, options: { value?: string; index?: number; label?: string }) {
        await test.step(`Selecting from dropdown using ${JSON.stringify(options)}`, async () => {
            const dropdown = await this.page.locator(selector);

            if (options.value) {
                await dropdown.selectOption({ value: options.value });
                this.logger.info(`Selected by value: ${options.value}`);
            } else if (options.index !== undefined) {
                await dropdown.selectOption({ index: options.index });
                this.logger.info(`Selected by index: ${options.index}`);
            } else if (options.label) {
                await dropdown.selectOption({ label: options.label });
                this.logger.info(`Selected by label: ${options.label}`);
            } else {
                throw new Error('No valid option provided. Please specify value, index, or label.');
            }
        });
    }

    async mouseHover(hoverLocator: string, Menu: string) {
        await test.step(`The pointer hovers over the ${Menu} element.  `, async () => {
            await this.page.hover(hoverLocator);
        })
    }

    async draganddrop(sourceLocator: string, targetLocator: string) {
        await test.step(`The sourceElement dragged  to targetElement Succesfully`, async () => {
            const sourceElement = this.page.locator(sourceLocator);
            const targetElement = this.page.locator(targetLocator);
            await sourceElement.dragTo(targetElement);
        })
    }

    async keyboardAction(locator: string, keyAction: string, Menu: string, name: string) {
        await test.step(`The ${Menu} ${name} Entered`, async () => {
            await this.page.focus(locator)
            await this.page.keyboard.press(keyAction)
        })
    }

    async doubleClick(locator: string, name: string) {
        await test.step(`The ${name} clicked`, async () => {
            await this.page.locator(locator).dblclick({ force: true })
        })
    }

    async verification(locator: string, expectedTextSubstring: string) {
        const element = this.page.locator(locator).nth(0);
        const text = await element.innerText();
        this.logger.info(text);
        const lowerCaseText = text.toLowerCase();
        const lowerCaseExpected = expectedTextSubstring.toLowerCase();
        expect(lowerCaseText).toContain(lowerCaseExpected);
    }


    async waitForElementHidden(locator: string, type: string) {
        try {
            await this.wait('minWait')
            await this.page.waitForSelector(locator, { state: 'hidden', timeout: 20000 });
            this.logger.info(`Element with XPath "${type}" is hidden as expected.`);
        } catch (error) {
            this.logger.error(`Element with XPath "${type}" is still visible.`);
        }
    }


    async validateElementVisibility(locator: any, elementName: string) {
        try {
            const element = this.page.locator(locator);
            await this.page.waitForSelector(locator, { state: 'attached', timeout: 30000, strict: true });
            if (await element.isVisible()) {
                this.logger.info(`${elementName} is visible as expected.`);
                await expect(element).toBeVisible();
            } else {
                this.logger.error(`${elementName} is not visible.`);
            }
        } catch (error) {
            this.logger.error(`Error validating visibility of ${elementName}: ${error}`);
        }
    }


    async uploadMultipleContent(fileName1: string, fileName2: string, locator: any) {
        const inputElementHandle = this.page.locator(locator)
        if (inputElementHandle) {
            await inputElementHandle.setInputFiles([path.resolve(__dirname, fileName1),
            path.resolve(__dirname, fileName2)])
        } else {
            this.logger.error('Input element not found');
        }
    }

    async samplefile(locator: string, Path: string,) {
        const filePath = path.resolve(__dirname, Path);
        const inputElementHandle = this.page.locator(locator);
        const binaryFormat = fs.readFileSync(filePath, { encoding: 'binary' });
        if (inputElementHandle) {
            await inputElementHandle.setInputFiles(binaryFormat);
        } else {
            this.logger.error('Input element not found');
        }
        await this.wait('maxWait');
    }

    async uploadFile(locator: string, Path: string,) {
        const filePath = path.resolve(__dirname, Path);
        const inputElementHandle = this.page.locator(locator);
        if (inputElementHandle) {
            await inputElementHandle.setInputFiles(filePath);
        } else {
            this.logger.error('Input element not found');
        }
        await this.wait('maxWait');
    }

    /**
    * Waits for a specified duration based on the wait type provided.
    * 
    * @param {'minWait' | 'mediumWait' | 'maxWait'} waitType - The type of wait duration ('minWait', 'mediumWait', or 'maxWait').
    */
    async wait(waitType: 'minWait' | 'mediumWait' | 'maxWait') {
        try {
            switch (waitType) {
                case 'minWait':
                    await this.page.waitForTimeout(3000);
                    break;
                case 'mediumWait':
                    await this.page.waitForTimeout(5000);
                    break;
                case 'maxWait':
                    await this.page.waitForTimeout(10000);
                    break;
                default:
                    this.logger.error("Invalid wait type provided.");
                    throw new Error(`Invalid wait type: ${waitType}`);
            }
        } catch (error) {
            this.logger.error("Error during wait:", error);
        }
    }


    async spinnerDisappear(element: string): Promise<void> {
        await this.wait('minWait');
        const spinner = this.page.locator(element);
        const spinnerCount = await spinner.count();

        if (spinnerCount === 0) {
            this.logger.info('No spinner found on this page. Continuing.');
            return;
        }

        try {
            await spinner.waitFor({ state: 'hidden', timeout: 15000 });
            this.logger.info('expected element is disabled');
        } catch {
            this.logger.error('Spinner did not disappear within timeout; continuing without failing the test.');
        }
    }

    async typeText(locator: string, name: string, data: Promise<string | null>) {
        const resolvedData = await data;
        await test.step(`Textbox ${name} filled with data: ${resolvedData}`, async () => {
            if (resolvedData !== null) {
                await this.page.locator(locator).fill(resolvedData);
            } else {
                throw new Error(`Cannot fill textbox ${name} with null data`);
            }
        });
    }

    async isCheckboxClicked(locator: string, name: string) {
        await test.step(`Checkbox ${name} is selected`, async () => {
            await this.page.focus(locator);
            await this.page.check(locator, { force: true });
            let value = await this.page.isChecked(locator);
            if (value == false) {
                this.logger.info("The CheckBox is not Clicked");
            }

        })
    }

    async handleAxisCoordinateClick(x_axis: number, y_axis: number) {
        await test.step(`The X-axis at ${x_axis} and ${y_axis} at 234 were clicked successfully.`, async () => {
            await this.wait('minWait');
            await this.page.mouse.click(x_axis, y_axis, { delay: 300 });
            await this.wait('minWait');
        })

    }

    async radioButton(locator: string, name: string) {
        await test.step(`Checkbox ${name} is selected`, async () => {

            if (!await this.page.isChecked(locator)) {
                await this.page.focus(locator)
                await this.page.check(locator, { force: true });
            } else {
                this.logger.info("The button is already checked")
            }
        })
    }

    async childTab(locator: string): Promise<void> {

        [this.newPage] = await Promise.all([
            this.context.waitForEvent('page'),
            this.page.locator(locator).click()
        ]);

        this.page = (await this.context.pages())[this.context.pages().length - 1];
    }

    switchToParentPage(): void {
        const pages = this.context.pages();
        if (pages.length > 0) {
            this.page = pages[0];
            this.page.bringToFront();
        } else {
            throw new Error('Parent page is not available');
        }
    }

    switchToChildPage(index: number): void {
        const pages = this.context.pages();
        if (pages.length > index) {
            this.page = pages[index];
            this.page.bringToFront();
        } else {
            throw new Error('Page at the specified index is not available');
        }
    }
    getById(locator: string): Locator {
        return this.page.locator(`#${locator}`)
    }
    getByClass(locator: string): Locator {
        return this.page.locator(`[class='${locator}']`)
    }

/**
* Interacts with a web element based on the given attribute and action.
*
* @param {string} attribute - The type of locator to use ("LABEL", "PLACEHOLDER", "TEXT", "TITLE", "ALTTEXT", "ID", "CLASS").
* @param {string} locator - The value of the locator to find the element.
* @param {string} action - The action to perform on the element ("click" or "fill").
* @param {string} [data] - The data to input if the action is "fill" (optional).
* @throws {Error} Throws an error if an unsupported attribute or action is used.
*/
    async interactWithElement(
        attribute: "LABEL" | "PLACEHOLDER" | "TEXT" | "TITLE" | "ALTTEXT" | "ID" | "CLASS",
        locator: string,
        action: "click" | "fill",
        data: string = ""
    ): Promise<void> {
        if (!locator) {
            throw new Error("Locator must be provided.");
        }

        if (action === "fill" && !data) {
            throw new Error("Data must be provided for the 'fill' action.");
        }

        switch (attribute) {
            case "LABEL":
                if (action === "click") {
                    await this.page.getByLabel(locator).click();
                } else {
                    await this.page.getByLabel(locator).fill(data);
                }
                break;

            case "PLACEHOLDER":
                if (action === "click") {
                    await this.page.getByPlaceholder(locator).click();
                } else {
                    await this.page.getByPlaceholder(locator).fill(data);
                }
                break;

            case "TEXT":
                if (action === "click") {
                    await this.page.getByText(locator).click();
                } else {
                    throw new Error("The 'fill' action is not supported for 'TEXT' attributes.");
                }
                break;

            case "TITLE":
                if (action === "click") {
                    await this.page.getByTitle(locator).click();
                } else {
                    throw new Error("The 'fill' action is not supported for 'TITLE' attributes.");
                }
                break;

            case "ALTTEXT":
                if (action === "click") {
                    await this.page.getByAltText(locator).click();
                } else {
                    throw new Error("The 'fill' action is not supported for 'ALTTEXT' attributes.");
                }
                break;

            case "ID":
                const idSelector = `#${locator}`;
                if (action === "click") {
                    await this.page.locator(idSelector).click();
                } else {
                    await this.page.locator(idSelector).fill(data);
                }
                break;

            case "CLASS":
                const classSelector = `.${locator}`;
                if (action === "click") {
                    await this.page.locator(classSelector).click();
                } else {
                    await this.page.locator(classSelector).fill(data);
                }
                break;

            default:
                throw new Error(`Unsupported attribute: ${attribute}`);
        }
    }

/**
* Interacts with a web element located via ARIA role and accessible name.
*
* @param {string} role - The ARIA role of the element ("button", "link", "textbox", "checkbox", "radio", "heading", "img", "banner", "list", "listitem", "navigation", "contentinfo", "main", "complementary").
* @param {string} accessibleName - The accessible name (visible text/label) used to match the element.
* @param {string} action - The action to perform ("click", "fill", "check", "uncheck", or "verify").
* @param {string} [data] - The data to input if the action is "fill" (optional).
* @param {number} [index] - The index to use when multiple elements match the role/name (defaults to 0).
* @throws {Error} Throws an error if an unsupported role/action combination is used.
*/
    async interactWithRole(
        role: "button" | "link" | "textbox" | "checkbox" | "radio" | "heading"
            | "img" | "banner" | "list" | "listitem" | "navigation" | "contentinfo" | "main" | "complementary",
        accessibleName: string,
        action: "click" | "fill" | "check" | "uncheck" | "verify",
        data: string = "",
        index: number = 0
    ): Promise<void> {
        if (!accessibleName) {
            throw new Error("Accessible name must be provided.");
        }

        if (action === "fill" && !data) {
            throw new Error("Data must be provided for the 'fill' action.");
        }

        const element = this.page.getByRole(role, { name: accessibleName }).nth(index);

        switch (role) {
            case "button":
            case "link":
                if (action !== "click") {
                    throw new Error(`The '${action}' action is not supported for role '${role}'.`);
                }
                await element.click();
                break;

            case "textbox":
                if (action === "click") {
                    await element.click();
                } else if (action === "fill") {
                    await element.clear();
                    await element.fill(data);
                } else {
                    throw new Error(`The '${action}' action is not supported for role '${role}'.`);
                }
                break;

            case "checkbox":
            case "radio":
                if (action === "check") {
                    await element.check({ force: true });
                } else if (action === "uncheck") {
                    await element.uncheck({ force: true });
                } else if (action === "click") {
                    await element.click();
                } else {
                    throw new Error(`The '${action}' action is not supported for role '${role}'.`);
                }
                break;

            case "heading":
                if (action !== "verify") {
                    throw new Error(`The '${action}' action is not supported for role '${role}'.`);
                }
                await expect(element).toBeVisible();
                break;

            case "img":
                if (action === "click") {
                    await element.click();
                } else if (action === "verify") {
                    await expect(element).toBeVisible();
                } else {
                    throw new Error(`The '${action}' action is not supported for role '${role}'.`);
                }
                break;

            case "listitem":
                if (action === "click") {
                    await element.click();
                } else if (action === "verify") {
                    await expect(element).toBeVisible();
                } else {
                    throw new Error(`The '${action}' action is not supported for role '${role}'.`);
                }
                break;

            case "list":
            case "navigation":
            case "banner":
            case "contentinfo":
            case "main":
            case "complementary":
                if (action !== "verify") {
                    throw new Error(`The '${action}' action is not supported for role '${role}'.`);
                }
                await expect(element).toBeVisible();
                break;

            default:
                throw new Error(`Unsupported role: ${role}`);
        }
    }


}



