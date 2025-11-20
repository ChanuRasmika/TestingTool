import { test, expect } from '@playwright/test';

test('CI Environment Demo - Shows webServer error', async ({ page }) => {
  // This test demonstrates the webServer configuration error in CI
  test.info().annotations.push({
    type: 'issue',
    description: 'webServer config error: Process from config.webServer was not able to start. Exit code: 1'
  });

  try {
    // Attempt to navigate to the app
    await page.goto('/');
    
    // This will fail in CI since no server is running
    await expect(page.locator('h1')).toContainText('QuickBank');
    
  } catch (error) {
    // Capture the error for the report
    test.info().annotations.push({
      type: 'error',
      description: `Navigation failed: ${error.message}`
    });
    
    // Create a custom error page to show in the report
    await page.setContent(`
      <html>
        <head><title>CI Test Error Demo</title></head>
        <body style="font-family: Arial; padding: 20px; background: #f5f5f5;">
          <h1 style="color: #d32f2f;">webServer Configuration Error</h1>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2>Error Details:</h2>
            <p><strong>Error:</strong> Process from config.webServer was not able to start. Exit code: 1</p>
            <p><strong>Cause:</strong> Frontend dev server cannot start in CI environment</p>
            <p><strong>Solution:</strong> Configure webServer to skip in CI or use static build</p>
          </div>
          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
            <h3>This is a demonstration of CI test failures</h3>
            <p>This test intentionally shows how configuration errors appear in the test report when deployed to GitHub Pages.</p>
          </div>
        </body>
      </html>
    `);
    
    // Take a screenshot for the report
    await page.screenshot({ fullPage: true });
    
    // Fail the test to show in report
    throw new Error('webServer configuration prevents tests from running in CI environment');
  }
});