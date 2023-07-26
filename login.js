const puppeteer = require("puppeteer");
const cookies = require("./www.linkedin.com.cookies.json");
const fs = require("fs");
const Excel = require("exceljs");
const solveCaptcha = require("nocaptchaai-puppeteer");

const workbook = new Excel.Workbook();
const worksheet = workbook.addWorksheet("Job Listings");

const USERNAME = "ashwin@anjamerica.com";
const PASSWORD = "Anj@1234";

worksheet.columns = [
  { header: "Title", key: "title" },
  { header: "Link", key: "link" },
  { header: "Description", key: "description" },
  { header: "Location", key: "location" },
];

const scrape = async (page) => {
  return page.evaluate(() => {
    const data = [];

    const jobList = document.querySelectorAll(
      ".artdeco-entity-lockup__content"
    );

    Array.from(jobList).map((job) => {
      const titleElement = job.querySelector(".job-card-list__title");
      const title = titleElement && titleElement.innerText;

      const linkElement = job.querySelector(".job-card-list__title");
      const link = linkElement && linkElement.href;

      const descriptionElement = job.querySelector(
        ".job-card-container__primary-description"
      );
      const description = descriptionElement && descriptionElement.innerText;

      const locationElement = job.querySelector(
        ".job-card-container__metadata-item"
      );
      const location = locationElement && locationElement.innerText;

      if (!title && !link && !description && !location) {
        return;
      }
      data.push({ title, link, description, location });
    });
    return data;
  });
};

const getJobs = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  const page = await browser.newPage();
  //   await page.setCookie(...cookies);

  await page.goto("https://www.linkedin.com/login", {
    waitUntil: "domcontentloaded",
  });

  await page.click("#username");
  await page.keyboard.type(USERNAME);

  await page.click("#password");
  await page.keyboard.type(PASSWORD);
  await page.click(".login__form_action_container");
  await page.waitForNetworkIdle();
  const API_KEY = "swaliht-b4b340b4-cc5c-fa90-1b03-0161483b75c7";
  await solveCaptcha(page, API_KEY, "free");
};

//   let results = [];
//   let lastpageNumber = 4;

//   async function scroll() {
//     await page.evaluate(async () => {
//       await new Promise((resolve, reject) => {
//         let totalHeight = 0;
//         let distance = 300;
//         let timer = setInterval(() => {
//           let scrollHeight = document.querySelector(
//             ".jobs-search-results-list"
//           );
//           scrollHeight.scrollBy(0, distance);
//           totalHeight += distance;
//           if (totalHeight >= scrollHeight.scrollHeight) {
//             clearInterval(timer);
//             resolve();
//           }
//         }, 300); // Scroll slowly with an interval of 300 milliseconds
//       });
//     });
//   }

//   for (let i = 0; i < lastpageNumber; i++) {
//     await page.waitForSelector(".artdeco-entity-lockup__content");

//     await scroll();

//     results = results.concat(await scrape(page));

//     if (i != lastpageNumber - 1) {
//       const paginationSelector = `.artdeco-pagination__indicator[data-test-pagination-page-btn="${
//         i + 2
//       }"]`;
//       const paginationElement = await page
//         .waitForSelector(paginationSelector, { timeout: 5000 })
//         .catch(() => null);

//       if (paginationElement) {
//         // Click on the next pagination element
//         await paginationElement.click();

//         // Wait for the navigation to complete before proceeding to the next page
//         await page.waitForNavigation({ waitUntil: "domcontentloaded" });
//       } else {
//         console.log("Pagination element not found or reached the last page.");
//         break; // Break the loop since there are no more pages to navigate
//       }
//     }
//   }

//   //   await browser.close();
//   return results;
// };
getJobs();
// // Start the scraping
// getJobs()
//   .then((value) => {
//     worksheet.addRows(value);

//     // Save the Excel workbook to a file
//     const outputFilePath = "jobs.xlsx";
//     workbook.xlsx
//       .writeFile(outputFilePath)
//       .then(() => {
//         console.log(`Data has been written to ${outputFilePath}`);
//       })
//       .catch((error) => {
//         console.error("Error while writing to Excel file:", error);
//       });

//     fs.writeFile("jobs.json", JSON.stringify(value), function (err) {
//       if (err) return console.log(err);
//       console.log("Completed writing jobs.json");
//     });
//     console.log(value);
//     console.log("Total job listings:", value.length);
//     console.log("First job listing:", value[0]);
//     console.log("Last job listing ", value[value.length - 1]);
//   })
//   .catch((err) => {
//     console.log("Error occurred:", err);
//   });
