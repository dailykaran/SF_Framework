import { test, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export class beforeAfterEach {
    private page: Page;
    
    constructor(page: Page) {
      this.page = page;
    }
      
        async checkAuthentication(SESSION_FILEPATH: string) {
            const sessionFile = path.resolve(SESSION_FILEPATH);
            // Step 1: Check file exists on disk
            if (!fs.existsSync(sessionFile)) {
                test.skip(true, `session.json not found at: ${sessionFile}`);
            return;
            }else{
                console.log(`session.json found at: ${sessionFile}`);
            }
        } 
}