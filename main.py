import json
from datetime import datetime
import time
from playwright.sync_api import sync_playwright

# File paths
itvCreds = "./itv_creds.json"

# Utility functions
def readJsonFile(ourFile):
    with open(ourFile) as ourJson:
        ourData = json.load(ourJson)
    return ourData

# Start Playwright
with sync_playwright() as p:
    print('\n\n' + str(datetime.now()))
    startTime = round(time.time())

    # Load credentials
    creds = readJsonFile(itvCreds)

    # Launch browser with full-screen mode and stealth-like options
    browser = p.chromium.launch(headless=False, args=[
        '--disable-blink-features=AutomationControlled',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
    ])
    
    # Create a new context with full-screen size
    screen_width = 1920
    screen_height = 1080
    context = browser.new_context(
        viewport={'width': screen_width, 'height': screen_height},
        screen={'width': screen_width, 'height': screen_height},
        is_mobile=False,
    )

    # Page instance
    page = context.new_page()

    # Go to ITV website
    page.goto('https://www.itv.com')

    # Wait for the cookie banner and click 'Accept'
    page.wait_for_selector('#cassie_accept_all_pre_banner')
    page.click('#cassie_accept_all_pre_banner')

    # Navigate to the sign-in page
    page.goto('https://www.itv.com/watch/user/signin')

    # Wait for the email input field and enter credentials
    page.wait_for_selector('#email')
    page.fill('#email', creds['user'])
    page.click('text=CONTINUE')

    # Wait for the password field and enter the password
    page.wait_for_selector('input[type="password"]')
    page.fill('input[type="password"]', creds['password'])
    page.click('text=SIGN IN')

    # Wait for the sign-in process to complete
    page.wait_for_load_state('networkidle')  # Wait for the page to fully load

    # Navigate to Watch Live ITV page
    page.goto('https://www.itv.com/watch')

    # Click on ITV1 live stream
    page.wait_for_selector('#itv')
    page.click('#itv')
    page.wait_for_selector('#watch-live-itv')
    page.click('#watch-live-itv')

    # Take screenshot for ITV1
    page.screenshot(path='itv1.png')

    # Click on ITV2 live stream
    page.wait_for_selector('#itv2')
    page.click('#itv2')
    page.wait_for_selector('#watch-live-itv2')
    page.click('#watch-live-itv2')

    # Take screenshot for ITV2
    page.screenshot(path='itv2.png')

    stopTime = round(time.time())
    print('run time: ' + str(stopTime - startTime) + ' seconds')

    # Close browser
    browser.close()
