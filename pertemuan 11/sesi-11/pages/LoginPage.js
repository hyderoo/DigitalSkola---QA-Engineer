const { By, until } = require('selenium-webdriver');

class LoginPage {
    constructor(driver) {
        this.driver = driver;
        this.url = 'https://www.saucedemo.com';
        
        this.selectors = {
            usernameField: '[data-test="username"]',
            passwordField: '[data-test="password"]',
            loginButton: '[data-test="login-button"]',
            errorMessage: '[data-test="error"]',
            errorButton: '[data-test="error-button"]'
        };
    }

    async navigate() {
        await this.driver.get(this.url);
    }

    async enterUsername(username) {
        const usernameField = await this.driver.findElement(By.css(this.selectors.usernameField));
        await usernameField.clear();
        await usernameField.sendKeys(username);
    }

    async enterPassword(password) {
        const passwordField = await this.driver.findElement(By.css(this.selectors.passwordField));
        await passwordField.clear();
        await passwordField.sendKeys(password);
    }

    async clickLoginButton() {
        const loginButton = await this.driver.findElement(By.css(this.selectors.loginButton));
        await loginButton.click();
    }

    async login(username, password) {
        await this.enterUsername(username);
        await this.enterPassword(password);
        await this.clickLoginButton();
    }

    async getErrorMessage() {
        const errorElement = await this.driver.wait(
            until.elementLocated(By.css(this.selectors.errorMessage)),
            10000,
            'Error message should be displayed'
        );
        return await errorElement.getText();
    }

    async isErrorDisplayed() {
        try {
            const errorElement = await this.driver.findElement(By.css(this.selectors.errorMessage));
            return await errorElement.isDisplayed();
        } catch (error) {
            return false;
        }
    }

    async getPageTitle() {
        return await this.driver.getTitle();
    }

    async takeScreenshot(filename) {
        const screenshot = await this.driver.takeScreenshot();
        const fs = require('fs');
        const path = require('path');
        
        const screenshotDir = 'W:\\BELAJAR QA\\digitalskola\\DigitalSkola---QA-Engineer\\pertemuan 11\\sesi-11\\screenshot';
        
        if (!fs.existsSync(screenshotDir)) {
            fs.mkdirSync(screenshotDir, { recursive: true });
        }
        
        const filepath = path.join(screenshotDir, filename);
        fs.writeFileSync(filepath, screenshot, 'base64');
        console.log(`  Screenshot saved: ${filepath}`);
        return filepath;
    }
}

module.exports = LoginPage;