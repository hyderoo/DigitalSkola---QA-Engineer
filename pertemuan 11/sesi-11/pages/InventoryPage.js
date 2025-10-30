const { By, until } = require('selenium-webdriver');

class InventoryPage {
    constructor(driver) {
        this.driver = driver;
        
        this.selectors = {
            container: '.inventory_container',
            appLogo: '.app_logo',
            cartIcon: '[data-test="shopping-cart-link"]',
            cartBadge: '.shopping_cart_badge',
            sortDropdown: '[data-test="product-sort-container"]',
            productName: '.inventory_item_name',
            productPrice: '.inventory_item_price',
            productDescription: '.inventory_item_desc',
            productImage: '.inventory_item_img',
            addToCartButton: '.btn_inventory',
            burgerMenu: '#react-burger-menu-btn',
            inventoryItem: '.inventory_item'
        };
        
        this.sortOptions = {
            nameAZ: 'option[value="az"]',
            nameZA: 'option[value="za"]',
            priceLowHigh: 'option[value="lohi"]',
            priceHighLow: 'option[value="hilo"]'
        };
    }

    async waitForPageLoad() {
        await this.driver.wait(
            until.elementLocated(By.css(this.selectors.container)),
            10000,
            'Inventory page failed to load'
        );
    }

    async isInventoryDisplayed() {
        const container = await this.driver.findElement(By.css(this.selectors.container));
        return await container.isDisplayed();
    }

    async getAppLogoText() {
        const appLogo = await this.driver.findElement(By.css(this.selectors.appLogo));
        return await appLogo.getText();
    }

    async isCartIconDisplayed() {
        const cartIcon = await this.driver.findElement(By.css(this.selectors.cartIcon));
        return await cartIcon.isDisplayed();
    }

    async getCartItemCount() {
        try {
            const badge = await this.driver.findElement(By.css(this.selectors.cartBadge));
            const count = await badge.getText();
            return parseInt(count);
        } catch (error) {
            return 0;
        }
    }

    async selectSortOption(sortType) {
        const sortDropdown = await this.driver.findElement(By.css(this.selectors.sortDropdown));
        await sortDropdown.click();
        
        let optionSelector;
        switch(sortType) {
            case 'az':
                optionSelector = this.sortOptions.nameAZ;
                break;
            case 'za':
                optionSelector = this.sortOptions.nameZA;
                break;
            case 'lohi':
                optionSelector = this.sortOptions.priceLowHigh;
                break;
            case 'hilo':
                optionSelector = this.sortOptions.priceHighLow;
                break;
            default:
                optionSelector = this.sortOptions.nameAZ;
        }
        
        const option = await this.driver.findElement(By.css(optionSelector));
        await option.click();
        
        await this.driver.sleep(1000);
    }

    async getProductNames() {
        const productElements = await this.driver.findElements(By.css(this.selectors.productName));
        const productNames = [];
        
        for (const element of productElements) {
            productNames.push(await element.getText());
        }
        
        return productNames;
    }

    async getProductPrices() {
        const priceElements = await this.driver.findElements(By.css(this.selectors.productPrice));
        const prices = [];
        
        for (const element of priceElements) {
            const priceText = await element.getText();
            prices.push(parseFloat(priceText.replace('$', '')));
        }
        
        return prices;
    }

    async addProductToCart(productName) {
        const productElements = await this.driver.findElements(By.css(this.selectors.inventoryItem));
        
        for (const product of productElements) {
            const nameElement = await product.findElement(By.css(this.selectors.productName));
            const name = await nameElement.getText();
            
            if (name === productName) {
                const addButton = await product.findElement(By.css(this.selectors.addToCartButton));
                await addButton.click();
                return true;
            }
        }
        return false;
    }

    async clickCart() {
        const cartIcon = await this.driver.findElement(By.css(this.selectors.cartIcon));
        await cartIcon.click();
    }

    async getProductCount() {
        const products = await this.driver.findElements(By.css(this.selectors.inventoryItem));
        return products.length;
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

    async getPageElementsForVisualTest() {
        return {
            appLogo: await this.isElementPresent(this.selectors.appLogo),
            cartIcon: await this.isElementPresent(this.selectors.cartIcon),
            sortDropdown: await this.isElementPresent(this.selectors.sortDropdown),
            burgerMenu: await this.isElementPresent(this.selectors.burgerMenu),
            productCount: await this.getProductCount()
        };
    }

    async isElementPresent(selector) {
        try {
            await this.driver.findElement(By.css(selector));
            return true;
        } catch (error) {
            return false;
        }
    }
}

module.exports = InventoryPage;