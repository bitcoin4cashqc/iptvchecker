const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// Use stealth plugin to evade detection
puppeteer.use(StealthPlugin());

class ITVChecker {
    constructor(creds, proxy = null, headless = true) {
        this.proxy = proxy;
        this.headless = headless;
        this.creds = creds;
    }

    async checkAvailability() {
        const browserArgs = [
            '--disable-blink-features=AutomationControlled',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process'
        ];

        // Use proxy if provided
        if (this.proxy) {
            if (this.proxy.includes('@')) {
                const [auth, proxyServer] = this.proxy.split('@');
                const [username, password] = auth.split(':');
                browserArgs.push(`--proxy-server=${proxyServer}`);
                this.proxyAuth = { username, password };
            } else {
                browserArgs.push(`--proxy-server=${this.proxy}`);
            }
        }

        // Launch Puppeteer browser
        const browser = await puppeteer.launch({
            headless: this.headless,
            args: browserArgs,
            defaultViewport: { width: 1280, height: 800 }  // Standard screen size
        });

        const page = await browser.newPage();

        // Set User-Agent and remove navigator.webdriver to evade detection
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        );
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined,
            });
        });

        if (this.proxyAuth) {
            // Set proxy authentication if needed
            await page.authenticate(this.proxyAuth);
        }

        try {
            // Go to ITV website
            await page.goto('https://www.itv.com', { waitUntil: 'networkidle2' });

            // Accept cookies
            await page.waitForSelector('#cassie_accept_all_pre_banner',{ visible: true });
            await page.click('#cassie_accept_all_pre_banner');

            // Navigate to sign-in page
            await page.goto('https://www.itv.com/watch/user/signin', {
                waitUntil: 'networkidle2',
            });

            // Enter credentials
            await page.waitForSelector('#email',{ visible: true });
            await page.type('#email', this.creds.user);
            await page.click('button[data-testid="signInButton"]');

            // Wait for password field and enter the password
            await page.waitForSelector('input[type="password"]',{ visible: true });
            await page.type('input[type="password"]', this.creds.password);
            await page.click('button[data-testid="signInButton"]');

            // Wait for login to complete
            await page.waitForNavigation({ waitUntil: 'networkidle2' });

            // Navigate to Watch Live ITV page
            await page.goto('https://www.itv.com/watch', { waitUntil: 'networkidle2' });

            // Check ITV1 availability
            const itv1Available = await this.checkChannelAvailability(page, 'itv', 'watch-live-itv');
            // Wait for a moment to check availability
            await new Promise(r => setTimeout(r, 10000));
            // Check ITV2 availability
            const itv2Available = await this.checkChannelAvailability(page, 'itv2', 'watch-live-itv2');

            await browser.close();

            // Return availability status
            return itv1Available && itv2Available;
        } catch (error) {
            await browser.close();
            return false;
        }
    }

    async checkChannelAvailability(page, channelId, watchId) {
        try {
            // Wait for and click the ITV channel
            await page.waitForSelector(`#${channelId}`,{ visible: true });
            await page.click(`#${channelId}`);

            // Wait for the watch live button
            await page.waitForSelector(`#${watchId}`,{ visible: true });
            await page.click(`#${watchId}`);

            // Wait for a moment to check availability
            await new Promise(r => setTimeout(r, 10000));

            // Check for "not available" modal, no content image, or error code 01-01
            const notAvailable = await page.evaluate(() => document.body.textContent.includes("Sorry, this show isn't available"));
            const noContentImageVisible = await page.evaluate(() => !!document.querySelector('img[src="https://app.10ft.itv.com/itvstatic/assets/images/hades/itvx-no-content.png"]'));
            const errorCodeVisible = await page.evaluate(() => !!document.querySelector('p.cp_dialog-footer__message__text') && document.querySelector('p.cp_dialog-footer__message__text').textContent.includes('Error code: 10-06'));

            if (notAvailable || noContentImageVisible || errorCodeVisible) {
                return false;
            }


            return true;
        } catch (error) {
            console.log(error)
            return false;
        }
    }
}

// Parse command-line arguments
const args = process.argv.slice(2);
let proxy = null;
let headless = true;

// Parse arguments for --proxy= and --headless=
args.forEach(arg => {
    if (arg.startsWith('--proxy=')) {
        proxy = arg.split('=')[1]; // Get the proxy value
    }
    if (arg.startsWith('--headless=')) {
        headless = arg.split('=')[1] === 'true'; // Convert to boolean
    }
});

// Get credentials from environment variables or replace with real values
const creds = {
    user: process.env.ITV_USER || 'bitcoin4cashqc@hotmail.com',
    password: process.env.ITV_PASSWORD || 'Pikpik123!'
};

// Main function
(async () => {
    // Check availability with or without proxy
    const checker = new ITVChecker(creds, proxy, headless);
    const result = await checker.checkAvailability();

    // Output True or False based on availability
    if (proxy) {
        console.log(`${proxy}: ${result}`);
    } else {
        console.log(`No Proxy: ${result}`);
    }
})();
