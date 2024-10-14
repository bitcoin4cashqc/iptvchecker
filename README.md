ITV Checker with Puppeteer and Stealth

This project checks the availability of ITV live channels using Puppeteer with stealth mode to evade detection.
Requirements

Before starting, ensure you have Node.js installed on your system.
Installation

    Clone the repository or download the source code.

    Run the following command in the project directory to install the necessary dependencies:

    bash

    npm install

This will install Puppeteer and the necessary plugins to run the script.
Environment Variables

To provide your login credentials, you can either:

    Set environment variables ITV_USER and ITV_PASSWORD.
    Or modify the script directly by replacing the placeholder credentials in the code.

To set environment variables, use the following command in your terminal:
On Linux/MacOS:

bash

export ITV_USER="your_email@example.com"
export ITV_PASSWORD="your_password"

On Windows (CMD):

bash

set ITV_USER=your_email@example.com
set ITV_PASSWORD=your_password

Running the Script

You can run the script with the following command:


Command-Line Arguments

The script accepts two optional command-line arguments:

    --proxy: Specify a proxy server, e.g., --proxy=username:password@proxy.com:8080. If no proxy is provided, the script will run without a proxy.
    --headless: Set whether to run in headless mode or not (default is true). Example: --headless=false.

Example 1: Running Without Proxy

bash

node main.js --headless=true

Example 2: Running with Proxy and Visible Browser

bash

node main.js --proxy=username:password@proxy.com:8080 --headless=false

Proxy Format

    Without Auth: proxy.com:8080
    With Auth: username:password@proxy.com:8080

Script Overview

    Login: The script logs into the ITV website using the credentials provided via environment variables.
    Channel Availability: The script checks whether ITV1 and ITV2 live channels are available.
    Stealth Mode: The Puppeteer script uses the stealth plugin to avoid detection by the ITV website.

Output

The script will output either True or False, indicating whether both ITV1 and ITV2 channels are available.

    If a proxy is used, the output format will be: <proxy>: <True/False>
    If no proxy is used, the output will be: No Proxy: <True/False>

Issues

If you encounter any issues, ensure that your Node.js version is up to date and that all dependencies are properly installed. This might happen too : https://www.youtube.com/watch?v=6QxAaenyXMM