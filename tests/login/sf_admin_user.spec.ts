import { test, expect } from '../../src/fixtures/auth.fixtures';  

test('Verify the SF admin login with project', async ({ adminPage }) => {
      // Admin perspective
      await adminPage.goto(`${process.env.BASE_URL}/projects`);
      await adminPage.getByRole('button', { name: '- 03F' }).click();
      await adminPage.waitForURL('**/translate/**');

      
});


