const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');
const chrome = require('selenium-webdriver/chrome');

describe('SauceDemo Automation Tests', function () {
    this.timeout(30000);
    
    let driver;
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
        timeouts: {
            implicit: 10000,
            explicit: 10000,
            sleep: 1000
        }
    };

    const SELECTORS = {
        login: {
            username: '[data-test="username"]',
            password: '[data-test="password"]',
            loginButton: '[data-test="login-button"]'
        },
        inventory: {
            container: '.inventory_container',
            appLogo: '.app_logo',
            cartIcon: '[data-test="shopping-cart-link"]',
            sortDropdown: '[data-test="product-sort-container"]',
            productName: '.inventory_item_name',
            productPrice: '.inventory_item_price'
        },
        sortOptions: {
            nameAZ: 'option[value="az"]',
            nameZA: 'option[value="za"]',
            priceLowHigh: 'option[value="lohi"]',
            priceHighLow: 'option[value="hilo"]'
        }
    };

    before(function () {
        console.log('\n╔════════════════════════════════════════════════════════════╗');
        console.log('║       SauceDemo Automation Test Suite Starting...            ║');
        console.log('╚══════════════════════════════════════════════════════════════╝');
        console.log(`Test Environment: ${TEST_CONFIG.baseUrl}`);
        console.log(`Browser: Chrome (Headless Mode)`);
        console.log(`Start Time: ${new Date().toLocaleString()}\n`);
    });

    beforeEach(async function () {
        const testName = this.currentTest.title;
        console.log(`\n▶ Starting: ${testName}`);
        
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
        
        await driver.manage().setTimeouts({ implicit: TEST_CONFIG.timeouts.implicit });
        
        testResults.total++;
    });

    afterEach(async function () {
        const testName = this.currentTest.title;
        const testState = this.currentTest.state;
        
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
        console.log('╚══════════════════════════════════════════════════════════════╝');
        console.log(`Total Tests:  ${testResults.total}`);
        console.log(`✓ Passed:     ${testResults.passed}`);
        console.log(`✗ Failed:     ${testResults.failed}`);
        console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(2)}%`);
        console.log(`End Time:     ${new Date().toLocaleString()}`);
        console.log('════════════════════════════════════════════════════════════\n');
    });
    async function performLogin() {
        await driver.get(TEST_CONFIG.baseUrl);
        
        const usernameField = await driver.findElement(By.css(SELECTORS.login.username));
        const passwordField = await driver.findElement(By.css(SELECTORS.login.password));
        const loginButton = await driver.findElement(By.css(SELECTORS.login.loginButton));
        
        await usernameField.sendKeys(TEST_CONFIG.credentials.username);
        await passwordField.sendKeys(TEST_CONFIG.credentials.password);
        await loginButton.click();
        
        await driver.wait(
            until.elementLocated(By.css(SELECTORS.inventory.container)),
            TEST_CONFIG.timeouts.explicit,
            'Inventory page failed to load after login'
        );
    }

    async function getProductNames() {
        const productElements = await driver.findElements(By.css(SELECTORS.inventory.productName));
        const productNames = [];
        
        for (const element of productElements) {
            productNames.push(await element.getText());
        }
        
        return productNames;
    }

    async function getProductPrices() {
        const priceElements = await driver.findElements(By.css(SELECTORS.inventory.productPrice));
        const prices = [];
        
        for (const element of priceElements) {
            const priceText = await element.getText();
            prices.push(parseFloat(priceText.replace('$', '')));
        }
        
        return prices;
    }

    async function selectSortOption(selector) {
        const sortDropdown = await driver.findElement(By.css(SELECTORS.inventory.sortDropdown));
        await sortDropdown.click();
        
        const option = await driver.findElement(By.css(selector));
        await option.click();
        
        await driver.sleep(TEST_CONFIG.timeouts.sleep);
    }

    describe('Authentication Tests', function () {
        
        it('TC-001: Should successfully login with valid credentials', async function () {
            await driver.get(TEST_CONFIG.baseUrl);
            
            const pageTitle = await driver.getTitle();
            assert.strictEqual(pageTitle, 'Swag Labs', 'Page title should be "Swag Labs"');

            const usernameField = await driver.findElement(By.css(SELECTORS.login.username));
            const passwordField = await driver.findElement(By.css(SELECTORS.login.password));
            const loginButton = await driver.findElement(By.css(SELECTORS.login.loginButton));

            await usernameField.sendKeys(TEST_CONFIG.credentials.username);
            await passwordField.sendKeys(TEST_CONFIG.credentials.password);
            await loginButton.click();

            const inventoryContainer = await driver.wait(
                until.elementLocated(By.css(SELECTORS.inventory.container)),
                TEST_CONFIG.timeouts.explicit,
                'Inventory page should be displayed after successful login'
            );

            const isInventoryDisplayed = await inventoryContainer.isDisplayed();
            assert.strictEqual(isInventoryDisplayed, true, 'Inventory container should be visible');

            const appLogo = await driver.findElement(By.css(SELECTORS.inventory.appLogo));
            const logoText = await appLogo.getText();
            assert.strictEqual(logoText, 'Swag Labs', 'App logo should display "Swag Labs"');

            const cartIcon = await driver.findElement(By.css(SELECTORS.inventory.cartIcon));
            const isCartDisplayed = await cartIcon.isDisplayed();
            assert.strictEqual(isCartDisplayed, true, 'Shopping cart icon should be visible');

            console.log('✓ Login successful with user:', TEST_CONFIG.credentials.username);
        });

        it('TC-002: Should fail to login with invalid username', async function () {
            await driver.get(TEST_CONFIG.baseUrl);

            const usernameField = await driver.findElement(By.css(SELECTORS.login.username));
            const passwordField = await driver.findElement(By.css(SELECTORS.login.password));
            const loginButton = await driver.findElement(By.css(SELECTORS.login.loginButton));

            await usernameField.sendKeys('invalid_user');
            await passwordField.sendKeys(TEST_CONFIG.credentials.password);
            await loginButton.click();

            const errorMessage = await driver.wait(
                until.elementLocated(By.css('[data-test="error"]')),
                TEST_CONFIG.timeouts.explicit,
                'Error message should be displayed'
            );

            const isErrorDisplayed = await errorMessage.isDisplayed();
            assert.strictEqual(isErrorDisplayed, true, 'Error message should be visible');

            const errorText = await errorMessage.getText();
            assert.ok(
                errorText.includes('Username and password do not match'),
                'Error message should indicate invalid credentials'
            );

            const loginFormExists = await driver.findElements(By.css(SELECTORS.login.username));
            assert.strictEqual(
                loginFormExists.length > 0,
                true,
                'User should remain on login page'
            );

            console.log('✓ Login failed as expected with invalid username');
            console.log('  Error message:', errorText);
        });

        it('TC-003: Should fail to login with invalid password', async function () {
            await driver.get(TEST_CONFIG.baseUrl);

            const usernameField = await driver.findElement(By.css(SELECTORS.login.username));
            const passwordField = await driver.findElement(By.css(SELECTORS.login.password));
            const loginButton = await driver.findElement(By.css(SELECTORS.login.loginButton));

            await usernameField.sendKeys(TEST_CONFIG.credentials.username);
            await passwordField.sendKeys('wrong_password');
            await loginButton.click();

            const errorMessage = await driver.wait(
                until.elementLocated(By.css('[data-test="error"]')),
                TEST_CONFIG.timeouts.explicit,
                'Error message should be displayed'
            );

            const isErrorDisplayed = await errorMessage.isDisplayed();
            assert.strictEqual(isErrorDisplayed, true, 'Error message should be visible');

            const errorText = await errorMessage.getText();
            assert.ok(
                errorText.includes('Username and password do not match'),
                'Error message should indicate invalid credentials'
            );

            console.log('✓ Login failed as expected with invalid password');
            console.log('  Error message:', errorText);
        });

        it('TC-004: Should fail to login with empty credentials', async function () {
            await driver.get(TEST_CONFIG.baseUrl);

            const loginButton = await driver.findElement(By.css(SELECTORS.login.loginButton));
            await loginButton.click();

            const errorMessage = await driver.wait(
                until.elementLocated(By.css('[data-test="error"]')),
                TEST_CONFIG.timeouts.explicit,
                'Error message should be displayed'
            );

            const isErrorDisplayed = await errorMessage.isDisplayed();
            assert.strictEqual(isErrorDisplayed, true, 'Error message should be visible');

            const errorText = await errorMessage.getText();
            assert.ok(
                errorText.includes('Username is required'),
                'Error message should indicate username is required'
            );

            console.log('✓ Login failed as expected with empty credentials');
            console.log('  Error message:', errorText);
        });

        it('TC-005: Should fail to login with empty password', async function () {
            await driver.get(TEST_CONFIG.baseUrl);

            const usernameField = await driver.findElement(By.css(SELECTORS.login.username));
            const loginButton = await driver.findElement(By.css(SELECTORS.login.loginButton));

            await usernameField.sendKeys(TEST_CONFIG.credentials.username);
            await loginButton.click();

            const errorMessage = await driver.wait(
                until.elementLocated(By.css('[data-test="error"]')),
                TEST_CONFIG.timeouts.explicit,
                'Error message should be displayed'
            );

            const isErrorDisplayed = await errorMessage.isDisplayed();
            assert.strictEqual(isErrorDisplayed, true, 'Error message should be visible');

            const errorText = await errorMessage.getText();
            assert.ok(
                errorText.includes('Password is required'),
                'Error message should indicate password is required'
            );

            console.log('✓ Login failed as expected with empty password');
            console.log('  Error message:', errorText);
        });

        it('TC-006: Should fail to login with locked out user', async function () {
            await driver.get(TEST_CONFIG.baseUrl);

            const usernameField = await driver.findElement(By.css(SELECTORS.login.username));
            const passwordField = await driver.findElement(By.css(SELECTORS.login.password));
            const loginButton = await driver.findElement(By.css(SELECTORS.login.loginButton));

            await usernameField.sendKeys('locked_out_user');
            await passwordField.sendKeys(TEST_CONFIG.credentials.password);
            await loginButton.click();

            const errorMessage = await driver.wait(
                until.elementLocated(By.css('[data-test="error"]')),
                TEST_CONFIG.timeouts.explicit,
                'Error message should be displayed'
            );

            const isErrorDisplayed = await errorMessage.isDisplayed();
            assert.strictEqual(isErrorDisplayed, true, 'Error message should be visible');

            const errorText = await errorMessage.getText();
            assert.ok(
                errorText.includes('this user has been locked out'),
                'Error message should indicate user is locked out'
            );

            console.log('✓ Login failed as expected with locked out user');
            console.log('  Error message:', errorText);
        });
    });

    describe('Product Sorting Tests', function () {
        
        it('TC-007: Should sort products from A to Z', async function () {
            await performLogin();

            const productsBefore = await getProductNames();
            console.log('Products before sorting:', productsBefore);

            await selectSortOption(SELECTORS.sortOptions.nameAZ);

            const productsAfter = await getProductNames();
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
            await performLogin();

            await selectSortOption(SELECTORS.sortOptions.nameZA);

            const products = await getProductNames();
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
            await performLogin();

            await selectSortOption(SELECTORS.sortOptions.priceLowHigh);

            const prices = await getProductPrices();
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
            await performLogin();

            await selectSortOption(SELECTORS.sortOptions.priceHighLow);

            const prices = await getProductPrices();
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
});