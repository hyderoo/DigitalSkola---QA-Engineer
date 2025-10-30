const { Builder } = require('selenium-webdriver');
const assert = require('assert');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const path = require('path');

const LoginPage = require('./pages/LoginPage');
const InventoryPage = require('./pages/InventoryPage');

describe('SauceDemo Automation Tests with POM', function () {
    this.timeout(30000);
    
    let driver;
    let loginPage;
    let inventoryPage;
    
    const testResults = {
        passed: 0,
        failed: 0,
        total: 0
    };
    
    const TEST_CONFIG = {
        baseUrl: 'https://www.saucedemo.com',
        credentials: {
            username: 'standard_user',
            password: 'secret_sauce'
        },
        screenshotDir: 'W:\\BELAJAR QA\\digitalskola\\DigitalSkola---QA-Engineer\\pertemuan 11\\sesi-11\\screenshot'
    };

    before(function () {
        console.log('\n╔════════════════════════════════════════════════════════════╗');
        console.log('║       SauceDemo Automation Test Suite (POM) Starting...     ║');
        console.log('╚════════════════════════════════════════════════════════════╝');
        console.log(`Test Environment: ${TEST_CONFIG.baseUrl}`);
        console.log(`Browser: Chrome (Headless Mode)`);
        console.log(`Screenshot Directory: ${TEST_CONFIG.screenshotDir}`);
        console.log(`Start Time: ${new Date().toLocaleString()}\n`);
        
        if (!fs.existsSync(TEST_CONFIG.screenshotDir)) {
            fs.mkdirSync(TEST_CONFIG.screenshotDir, { recursive: true });
            console.log('✓ Screenshot directory created\n');
        }
    });

    beforeEach(async function () {
    const testName = this.currentTest.title;
    console.log(`Starting: ${testName}`);

    const chromeDriverPath = require('chromedriver').path;
    process.env.PATH += path.delimiter + path.dirname(chromeDriverPath);

    const options = new chrome.Options();
    options.addArguments('--headless');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--disable-gpu');
    options.addArguments('--window-size=1920,1080');

    driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    await driver.manage().setTimeouts({ implicit: 10000 });
    
    loginPage = new LoginPage(driver);
    inventoryPage = new InventoryPage(driver);
    
    testResults.total++;
});

    afterEach(async function () {
        const testName = this.currentTest.title;
        const testState = this.currentTest.state;
        
        // Take screenshot on failure
        if (testState === 'failed' && driver) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `FAILED_${testName.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.png`;
            try {
                await loginPage.takeScreenshot(filename);
                console.log(`  📸 Failure screenshot captured`);
            } catch (error) {
                console.log(`  ⚠ Failed to capture screenshot: ${error.message}`);
            }
        }
        
        if (testState === 'passed') {
            testResults.passed++;
            console.log(`✓ PASSED: ${testName}`);
        } else if (testState === 'failed') {
            testResults.failed++;
            console.log(`✗ FAILED: ${testName}`);
            if (this.currentTest.err) {
                console.log(`  Error: ${this.currentTest.err.message}`);
            }
        }
        
        if (driver) {
            await driver.quit();
        }
    });

    after(function () {
        console.log('\n╔════════════════════════════════════════════════════════════╗');
        console.log('║              Test Execution Summary                          ║');
        console.log('╚════════════════════════════════════════════════════════════╝');
        console.log(`Total Tests:  ${testResults.total}`);
        console.log(`✓ Passed:     ${testResults.passed}`);
        console.log(`✗ Failed:     ${testResults.failed}`);
        console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(2)}%`);
        console.log(`End Time:     ${new Date().toLocaleString()}`);
        console.log('════════════════════════════════════════════════════════════\n');
    });

    describe('Authentication Tests', function () {
        
        it('TC-001: Should successfully login with valid credentials', async function () {
            await loginPage.navigate();
            
            const pageTitle = await loginPage.getPageTitle();
            assert.strictEqual(pageTitle, 'Swag Labs', 'Page title should be "Swag Labs"');

            await loginPage.login(TEST_CONFIG.credentials.username, TEST_CONFIG.credentials.password);

            await inventoryPage.waitForPageLoad();
            const isInventoryDisplayed = await inventoryPage.isInventoryDisplayed();
            assert.strictEqual(isInventoryDisplayed, true, 'Inventory container should be visible');

            const logoText = await inventoryPage.getAppLogoText();
            assert.strictEqual(logoText, 'Swag Labs', 'App logo should display "Swag Labs"');

            const isCartDisplayed = await inventoryPage.isCartIconDisplayed();
            assert.strictEqual(isCartDisplayed, true, 'Shopping cart icon should be visible');

            console.log('✓ Login successful with user:', TEST_CONFIG.credentials.username);
        });

        it('TC-002: Should fail to login with invalid username', async function () {
            await loginPage.navigate();
            await loginPage.login('invalid_user', TEST_CONFIG.credentials.password);

            const isErrorDisplayed = await loginPage.isErrorDisplayed();
            assert.strictEqual(isErrorDisplayed, true, 'Error message should be visible');

            const errorText = await loginPage.getErrorMessage();
            assert.ok(
                errorText.includes('Username and password do not match'),
                'Error message should indicate invalid credentials'
            );

            console.log('✓ Login failed as expected with invalid username');
            console.log('  Error message:', errorText);
        });

        it('TC-003: Should fail to login with invalid password', async function () {
            await loginPage.navigate();
            await loginPage.login(TEST_CONFIG.credentials.username, 'wrong_password');

            const isErrorDisplayed = await loginPage.isErrorDisplayed();
            assert.strictEqual(isErrorDisplayed, true, 'Error message should be visible');

            const errorText = await loginPage.getErrorMessage();
            assert.ok(
                errorText.includes('Username and password do not match'),
                'Error message should indicate invalid credentials'
            );

            console.log('✓ Login failed as expected with invalid password');
            console.log('  Error message:', errorText);
        });

        it('TC-004: Should fail to login with empty credentials', async function () {
            await loginPage.navigate();
            await loginPage.clickLoginButton();

            const isErrorDisplayed = await loginPage.isErrorDisplayed();
            assert.strictEqual(isErrorDisplayed, true, 'Error message should be visible');

            const errorText = await loginPage.getErrorMessage();
            assert.ok(
                errorText.includes('Username is required'),
                'Error message should indicate username is required'
            );

            console.log('✓ Login failed as expected with empty credentials');
            console.log('  Error message:', errorText);
        });

        it('TC-005: Should fail to login with empty password', async function () {
            await loginPage.navigate();
            await loginPage.enterUsername(TEST_CONFIG.credentials.username);
            await loginPage.clickLoginButton();

            const isErrorDisplayed = await loginPage.isErrorDisplayed();
            assert.strictEqual(isErrorDisplayed, true, 'Error message should be visible');

            const errorText = await loginPage.getErrorMessage();
            assert.ok(
                errorText.includes('Password is required'),
                'Error message should indicate password is required'
            );

            console.log('✓ Login failed as expected with empty password');
            console.log('  Error message:', errorText);
        });

        it('TC-006: Should fail to login with locked out user', async function () {
            await loginPage.navigate();
            await loginPage.login('locked_out_user', TEST_CONFIG.credentials.password);

            const isErrorDisplayed = await loginPage.isErrorDisplayed();
            assert.strictEqual(isErrorDisplayed, true, 'Error message should be visible');

            const errorText = await loginPage.getErrorMessage();
            assert.ok(
                errorText.includes('this user has been locked out'),
                'Error message should indicate user is locked out'
            );

            console.log('✓ Login failed as expected with locked out user');
            console.log('  Error message:', errorText);
        });
    });

    describe('Product Sorting Tests', function () {
        
        beforeEach(async function () {
            await loginPage.navigate();
            await loginPage.login(TEST_CONFIG.credentials.username, TEST_CONFIG.credentials.password);
            await inventoryPage.waitForPageLoad();
        });

        it('TC-007: Should sort products from A to Z', async function () {
            const productsBefore = await inventoryPage.getProductNames();
            console.log('Products before sorting:', productsBefore);

            await inventoryPage.selectSortOption('az');

            const productsAfter = await inventoryPage.getProductNames();
            console.log('Products after sorting (A-Z):', productsAfter);

            const expectedSortedProducts = [...productsAfter].sort();
            assert.deepStrictEqual(
                productsAfter,
                expectedSortedProducts,
                'Products should be sorted alphabetically from A to Z'
            );

            assert.strictEqual(
                productsAfter[0],
                'Sauce Labs Backpack',
                'First product should be "Sauce Labs Backpack"'
            );

            console.log('✓ Products successfully sorted from A to Z');
        });

        it('TC-008: Should sort products from Z to A', async function () {
            await inventoryPage.selectSortOption('za');

            const products = await inventoryPage.getProductNames();
            console.log('Products after sorting (Z-A):', products);

            const expectedSortedProducts = [...products].sort().reverse();
            assert.deepStrictEqual(
                products,
                expectedSortedProducts,
                'Products should be sorted alphabetically from Z to A'
            );

            console.log('✓ Products successfully sorted from Z to A');
        });

        it('TC-009: Should sort products by price (low to high)', async function () {
            await inventoryPage.selectSortOption('lohi');

            const prices = await inventoryPage.getProductPrices();
            console.log('Prices after sorting (low to high):', prices);

            const expectedSortedPrices = [...prices].sort((a, b) => a - b);
            assert.deepStrictEqual(
                prices,
                expectedSortedPrices,
                'Products should be sorted by price from low to high'
            );

            console.log('✓ Products successfully sorted by price (low to high)');
        });

        it('TC-010: Should sort products by price (high to low)', async function () {
            await inventoryPage.selectSortOption('hilo');

            const prices = await inventoryPage.getProductPrices();
            console.log('Prices after sorting (high to low):', prices);

            const expectedSortedPrices = [...prices].sort((a, b) => b - a);
            assert.deepStrictEqual(
                prices,
                expectedSortedPrices,
                'Products should be sorted by price from high to low'
            );

            console.log('✓ Products successfully sorted by price (high to low)');
        });
    });

    describe('Visual Testing', function () {
        
        it('TC-011: Should perform visual test on Login Page', async function () {
            await loginPage.navigate();
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `visual-test-login-page-${timestamp}.png`;
            
            await loginPage.takeScreenshot(filename);
            
            const pageTitle = await loginPage.getPageTitle();
            assert.strictEqual(pageTitle, 'Swag Labs', 'Page title should be "Swag Labs"');
            
            const isUsernameFieldPresent = await loginPage.driver.findElement(
                require('selenium-webdriver').By.css('[data-test="username"]')
            );
            const isPasswordFieldPresent = await loginPage.driver.findElement(
                require('selenium-webdriver').By.css('[data-test="password"]')
            );
            const isLoginButtonPresent = await loginPage.driver.findElement(
                require('selenium-webdriver').By.css('[data-test="login-button"]')
            );
            
            assert.ok(isUsernameFieldPresent, 'Username field should be present');
            assert.ok(isPasswordFieldPresent, 'Password field should be present');
            assert.ok(isLoginButtonPresent, 'Login button should be present');
            
            console.log('✓ Login page visual test completed');
            console.log(`  📸 Screenshot saved: ${filename}`);
        });

        it('TC-012: Should perform visual test on Inventory Page', async function () {
            await loginPage.navigate();
            await loginPage.login(TEST_CONFIG.credentials.username, TEST_CONFIG.credentials.password);
            await inventoryPage.waitForPageLoad();
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `visual-test-inventory-page-${timestamp}.png`;
            
            await inventoryPage.takeScreenshot(filename);
            
            const elements = await inventoryPage.getPageElementsForVisualTest();
            
            assert.strictEqual(elements.appLogo, true, 'App logo should be present');
            assert.strictEqual(elements.cartIcon, true, 'Cart icon should be present');
            assert.strictEqual(elements.sortDropdown, true, 'Sort dropdown should be present');
            assert.strictEqual(elements.burgerMenu, true, 'Burger menu should be present');
            assert.ok(elements.productCount > 0, 'Products should be displayed');
            
            console.log('✓ Inventory page visual test completed');
            console.log(`  📸 Screenshot saved: ${filename}`);
            console.log(`  Found ${elements.productCount} products on the page`);
        });

        it('TC-013: Should perform visual test on Inventory Page with Product Added', async function () {
            await loginPage.navigate();
            await loginPage.login(TEST_CONFIG.credentials.username, TEST_CONFIG.credentials.password);
            await inventoryPage.waitForPageLoad();

            const productAdded = await inventoryPage.addProductToCart('Sauce Labs Backpack');
            assert.strictEqual(productAdded, true, 'Product should be added to cart');
            
            await driver.sleep(500);
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `visual-test-inventory-with-cart-item-${timestamp}.png`;
            
            await inventoryPage.takeScreenshot(filename);
            
            const cartCount = await inventoryPage.getCartItemCount();
            assert.strictEqual(cartCount, 1, 'Cart should contain 1 item');
            
            console.log('✓ Inventory page with cart item visual test completed');
            console.log(`  📸 Screenshot saved: ${filename}`);
            console.log(`  Cart contains ${cartCount} item(s)`);
        });
    });
});