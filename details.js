const puppeteer = require("puppeteer");
const Excel = require("exceljs");

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: [
      "--start-maximized", // you can also use '--start-fullscreen'
    ],
  });
  const page = await browser.newPage();


  const workbook = new Excel.Workbook();
  const worksheet = workbook.addWorksheet("Job Listings");

  worksheet.columns = [
    { header: "Title", key: "title" },
    { header: "Link", key: "link" },
    { header: "Description", key: "description" },
    { header: "Location", key: "location" },
  ];

  const scrape = async () => {
    return page.evaluate(() => {
      const data = [];

      const jobList = document.querySelectorAll(".job-search-card");

      Array.from(jobList).map((job) => {
        const id = job.getAttribute("data-tracking-id");
        const titleElement = job.querySelector(".base-search-card__title");
        const title = titleElement && titleElement.innerText;

        const linkElement = job.querySelector(".base-card__full-link")?.href;

        const descriptionElement = job.querySelector(
          ".base-search-card__subtitle"
        );
        const description = descriptionElement && descriptionElement.innerText;

        const locationElement = job.querySelector(".job-search-card__location");
        const location = locationElement && locationElement.innerText;

        if (!title && !linkElement && !description && !location) {
          return;
        }
        data.push({ id, title, linkElement, description, location });
      });
      return data;
    });
  };

  const scrapeDetails = async () => {
    return page.evaluate(() => {
      const data = [];
      const title = document.querySelector(".top-card-layout__title").innerText;
      const description = document.querySelector(
        ".show-more-less-html__markup"
      ).innerText;

      const applyLink = document.querySelector(".top-card-layout__title").href
      const organisation = document.querySelector(".topcard__org-name-link").innerText
      const location = document.querySelector(".topcard__flavor.topcard__flavor--bullet").innerText
      

      data.push({ title, description });
      return data;
    });
  };

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
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        const distance = 100; // Adjust this value to control the scroll distance
        const delay = 100; // Adjust this value to control the delay between scrolls

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
  let results = [];

  for (let data of scrapedData) {
    await page.waitForSelector(
      `.job-search-card[data-tracking-id='${data.id}']`
    );
    await page.click(`.job-search-card[data-tracking-id='${data.id}']`);
    const result = await scrapeDetails();
    results.push(result);
  }

    console.log(scrapedData);
  console.log(results);

  //   worksheet.addRows(scrapedData);

  //   // Save the Excel workbook to a file
  //   const outputFilePath = "jobs.xlsx";
  //   workbook.xlsx
  //     .writeFile(outputFilePath)
  //     .then(() => {
  //       console.log(`Data has been written to ${outputFilePath}`);
  //     })
  //     .catch((error) => {
  //       console.error("Error while writing to Excel file:", error);
  //     });

  //   console.log(scrapedData);
  //   console.log("COMPLETED.");

  //   await browser.close();
})();
