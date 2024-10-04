#!/usr/bin/env python3

import time, sys, os, re, json, datetime, ipaddress
import undetected_chromedriver as uc
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from pprint import pprint

itvCreds = os.path.expanduser("~/.itv_creds.json")

def writeJsonFile(ourData, ourFile):
    with open(ourFile, 'w') as ourJson:
        json.dump(ourData, ourJson)

def readJsonFile(ourFile):
    with open(ourFile) as ourJson:
        ourData = json.load(ourJson)
    return ourData

def writeFlatFile(ourText, ourFile):
    h = open(ourFile, 'w')
    h.write(ourText)
    h.close()

knobs = uc.ChromeOptions()
knobs.add_argument('--window-size=1400,1000')
knobs.add_argument('--enable-logging')
knobs.add_argument('--log-level=0')
knobs.set_capability('goog:loggingPrefs', {'performance': 'ALL'})

print('\n\n' + str(datetime.datetime.now()))
startTime = round(time.time())

creds = readJsonFile(itvCreds)

browser = uc.Chrome(headless=False,use_subprocess=False,options=knobs)
browser.implicitly_wait(10)

browser.get('https://www.itv.com')

time.sleep(5)
cookieButton = browser.find_element(By.ID, 'cassie_accept_all_pre_banner')
cookieButton.click()

time.sleep(2)
loginButton = browser.find_element(By.XPATH, '/html/body/div[2]/div/div/header/nav/div/div[5]/div[1]/a')
loginButton.click()

time.sleep(2)
emailField = browser.find_element(By.ID, 'email')
emailField.send_keys(creds['user'])

time.sleep(2)
buttons = browser.find_elements(By.TAG_NAME, 'button')
for b in buttons:
    if b.text == 'CONTINUE':
        b.click()

time.sleep(2)
passField = browser.find_element(By.TAG_NAME, 'input')
passField.send_keys(creds['password'])

time.sleep(2)
buttons = browser.find_elements(By.TAG_NAME, 'button')
for b in buttons:
    if b.text == 'SIGN IN':
        b.click()

time.sleep(5)
browser.get('https://www.itv.com/watch')

time.sleep(2)

itv1 = browser.find_element(By.ID, 'itv')
itv1.click()
time.sleep(2)
itv1Watch = browser.find_element(By.ID, 'watch-live-itv')
itv1Watch.click()
time.sleep(4)
browser.get_screenshot_as_png('itv1.png')

itv2 = browser.find_element(By.ID, 'itv2')
itv2.click()
time.sleep(2)
itv2Watch = browser.find_element(By.ID, 'watch-live-itv2')
itv2Watch.click()
time.sleep(4)
browser.get_screenshot_as_png('itv2.png')

stopTime = round(time.time())
print('run time: ' + str(stopTime - startTime) + ' seconds')

