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
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Safari/537.36"
  );

  await page.goto("https://secure.indeed.com/auth?hl=en_IN&co=IN&continue=https%3A%2F%2Fin.indeed.com%2F%3Ffrom%3Dgnav-util-homepage%26from%3Dgnav-util-homepage&tmpl=desktop&service=my&from=gnav-util-homepage&jsContinue=https%3A%2F%2Fin.indeed.com%2F&empContinue=https%3A%2F%2Faccount.indeed.com%2Fmyaccess&_ga=2.119635464.101526412.1690265023-1945167342.1690265023", {
    waitUntil: "domcontentloaded",
  });

  await page.click("#ifl-InputFormField-3");
  await page.keyboard.type(USERNAME);
  await page.click(
    ".e8ju0x51[data-tn-element='auth-page-email-submit-button']"
  );

  await page.waitForSelector("#auth-page-google-password-fallback");
  await page.click("#auth-page-google-password-fallback");


  await page.waitForSelector("#ifl-InputFormField-26");
  await page.click("#ifl-InputFormField-26");
  await page.keyboard.type(PASSWORD);

  await page.waitForSelector(".e8ju0x51");

  await page.click(".e8ju0x51");
  await page.waitForNetworkIdle();
};

getJobs();
