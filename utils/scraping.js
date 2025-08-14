const puppeteer = require('puppeteer')

const fun = async ()=>{

    const browser = await puppeteer.launch({headless : false});
    const page = await browser.newPage();
    await page.goto('https://in.linkedin.com/')
    const title = await page.title()
    console.log(title)
    const subtitle = await page.$eval('p', (ele)=> ele.innerHTML)
    console.log("subtitle",subtitle)
    await page.screenshot({path : "rock.png"}) 
    await page.pdf({path:  "pdf.pdf", formate: "A4" })
    await browser.close()
}

module.exports = fun