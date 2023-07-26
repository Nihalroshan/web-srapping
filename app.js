const puppeteer = require("puppeteer");
const Excel = require("exceljs");

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  const workbook = new Excel.Workbook();
  const worksheet = workbook.addWorksheet("Job Listings");

  worksheet.columns = [
    { header: "Title", key: "title" },
    { header: "Link", key: "link" },
    { header: "Organisation", key: "organisation" },
    { header: "Location", key: "location" },
  ];

  const scrape = async () => {
    return page.evaluate(() => {
      const data = [];

      const jobList = document.querySelectorAll(".job-search-card");

      Array.from(jobList).map((job) => {
        const titleElement = job.querySelector(".base-search-card__title");
        const title = titleElement && titleElement.innerText;

        const linkElement = job.querySelector(".base-card__full-link")?.href;

        const descriptionElement = job.querySelector(
          ".base-search-card__subtitle"
        );
        const organisation = descriptionElement && descriptionElement.innerText;

        const locationElement = job.querySelector(".job-search-card__location");
        const location = locationElement && locationElement.innerText;

        if (!title && !linkElement && !organisation && !location) {
          return;
        }
        data.push({ title, linkElement, organisation, location });
      });
      return data;
    });
  };

  const page = await browser.newPage();
  //   await page.setCookie(...cookies);
  const keywords = "Home Health Care – RN";
  await page.goto(
    `https://www.linkedin.com/jobs/search/?currentJobId=3660494116&geoId=106204383&keywords=${keywords}&refresh=true`,
    {
      waitUntil: "domcontentloaded",
    }
  );

  // Function to scroll the page
  async function scrollPageToBottom(page) {
    console.log("SCRAPPING START....");
    console.time()
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        const distance = 100; // Adjust this value to control the scroll distance
        const delay = 500; // Adjust this value to control the delay between scrolls

        const scrollHeight = document.body.scrollHeight;
        let currentPosition = 0;

        const scrollToBottom = () => {
          currentPosition += distance;
          window.scroll(0, currentPosition);

          if (currentPosition >= scrollHeight) {
            resolve();
          } else {
            setTimeout(scrollToBottom, delay);
          }
        };

        scrollToBottom();
      });
    });
  }

  // Scroll the page to load all data
  await scrollPageToBottom(page);

  // Now, the page has loaded all data. You can start scraping here.
  const scrapedData = await scrape();

  worksheet.addRows(scrapedData);

  // Save the Excel workbook to a file
  const outputFilePath = "jobs.xlsx";
  workbook.xlsx
    .writeFile(outputFilePath)
    .then(() => {
      console.log(`Data has been written to ${outputFilePath}`);
    })
    .catch((error) => {
      console.error("Error while writing to Excel file:", error);
    });

  console.log(scrapedData);
  console.log("JOB COUNT::",scrapedData.length)
  console.log("COMPLETED.");
  console.timeEnd()

  await browser.close();
})();
