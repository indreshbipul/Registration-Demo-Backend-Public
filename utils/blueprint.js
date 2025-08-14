const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrapeFormBlueprint() {
    console.log('🚀 Starting the web scraping process...');
    let browser; // Define browser outside the try block so it can be accessed in finally
    let page;

    try {
        // Step 1: Launch the browser
        console.log('Launching browser...');
        browser = await puppeteer.launch({ headless: "new" });

        // Step 2: Open a new page and set a realistic user agent
        page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.setViewport({ width: 1280, height: 800 });

        // Step 3: Navigate to the target URL
        const url = 'https://udyamregistration.gov.in/UdyamRegistration.aspx';
        console.log(`Navigating to ${url}...`);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        console.log('✅ Page loaded successfully.');

        // Step 4: Wait for a key element to ensure the form is ready
        // **FIXED**: Using the correct, dynamic ID from the provided HTML.
        const aadhaarSelector = '#ctl00_ContentPlaceHolder1_txtadharno';
        console.log(`Waiting for form element (${aadhaarSelector}) to be available...`);
        await page.waitForSelector(aadhaarSelector, { timeout: 30000 });
        console.log('✅ Key form element found.');

        // Step 5: Extract the form data for Step 1
        console.log('Extracting form field information for Step 1...');
        const formSchema = await page.evaluate(() => {
            const schema = {
                steps: []
            };

            // --- Scraping Step 1: Aadhaar Verification ---
            const step1 = {
                step: 1,
                title: 'Aadhaar Verification',
                fields: []
            };

            // **FIXED**: Using the correct dynamic IDs for Aadhaar and Name fields.
            const aadhaarInput = document.querySelector('#ctl00_ContentPlaceHolder1_txtadharno');
            // The label is not directly linked with a 'for' attribute, so we find it based on its content.
            const aadhaarLabelElement = Array.from(document.querySelectorAll('label span')).find(el => el.innerText.includes('Aadhaar Number'));
            if (aadhaarInput && aadhaarLabelElement) {
                step1.fields.push({
                    id: 'aadhaarNumber', // Using a simpler ID for our React app
                    label: aadhaarLabelElement.innerText.replace('/', '').trim(),
                    type: aadhaarInput.type,
                    placeholder: aadhaarInput.placeholder,
                    validation: {
                        required: true,
                        maxLength: parseInt(aadhaarInput.getAttribute('maxlength'), 10),
                        pattern: '^\\d{12}$'
                    }
                });
            }

            const nameInput = document.querySelector('#ctl00_ContentPlaceHolder1_txtownername');
            const nameLabelElement = Array.from(document.querySelectorAll('label')).find(el => el.innerText.includes('Name of Entrepreneur'));
            if (nameInput && nameLabelElement) {
                 step1.fields.push({
                    id: 'nameAsPerAadhaar', // Using a simpler ID for our React app
                    label: nameLabelElement.innerText.replace('/', '').trim(),
                    type: nameInput.type,
                    placeholder: nameInput.placeholder,
                    validation: {
                        required: true,
                        minLength: 2
                    }
                });
            }
            
            if(step1.fields.length > 0) {
                 schema.steps.push(step1);
            }

            // Note: Step 2 (PAN Validation) fields are loaded dynamically after OTP verification.
            // They cannot be scraped from the initial page load.
            // For this blueprint, you can add them manually to the JSON file after inspecting the page at Step 2.
            
            return schema;
        });

        // Step 6: Log and validate the extracted schema
        console.log('✅ Form schema extracted. Here is the data:');
        console.log(JSON.stringify(formSchema, null, 2));

        if (!formSchema || formSchema.steps.length === 0) {
            console.warn('⚠️ Warning: Scraping completed, but no form fields were found. The website structure might have changed or there was an issue with the selectors.');
        } else {
            // Step 7: Save the extracted data to a JSON file
            const outputPath = 'form-schema.json';
            fs.writeFileSync(outputPath, JSON.stringify(formSchema, null, 2));
            console.log(`✅ Blueprint saved successfully to ${outputPath}`);
        }

    } catch (error) {
        console.error('❌ An error occurred during the scraping process:');
        console.error(error);

        if (page) {
            const screenshotPath = 'error_screenshot.png';
            console.log(`📸 Taking a screenshot of the page at the time of error. See ${screenshotPath}`);
            await page.screenshot({ path: screenshotPath, fullPage: true });
        }

        process.exit(1);
    } finally {
        // Step 8: Close the browser
        if (browser) {
            await browser.close();
            console.log('Browser closed.');
        }
    }
}

module.exports = scrapeFormBlueprint