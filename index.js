const puppeteer = require("puppeteer");
const cookies = require("./www.linkedin.com.cookies.json");

const getJobs = async () => {
  // Start a Puppeteer session with:
  // - a visible browser (`headless: false` - easier to debug because you'll see the browser in action)
  // - no default viewport (`defaultViewport: null` - website page will in full width and height)
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  // Open a new page
  const page = await browser.newPage();

  // On this new page:
  // - open the "http://quotes.toscrape.com/" website
  // - wait until the dom content is loaded (HTML is ready)
  await page.setCookie(...cookies);
  await page.goto(
    "https://www.linkedin.com/jobs/search/?currentJobId=3660494116&geoId=106204383&keywords=jobs%20&location=Dubai%2C%20United%20Arab%20Emirates&refresh=true",
    {
      waitUntil: "domcontentloaded",
    }
  );

  await page.waitForSelector('.job-card-list__title');

  const titles = await page.evaluate(() => {
    const jobTitle = document.querySelector(".job-card-list__title").innerText
    const jobLink = document.querySelector(".job-card-list__title").href
    console.log('====================================');
    console.log(jobTitle);
    console.log('====================================');
    return {jobTitle,jobLink};
  });

  console.log("====================================");
  console.log(titles);
  console.log("====================================");
};

// Start the scraping
getJobs();
