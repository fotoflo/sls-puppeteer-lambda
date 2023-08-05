const chromium = require("chrome-aws-lambda");
const lighthouse = require("lighthouse/core/index.cjs");

module.exports.get = async (event) => {
  let browser;
  let response;

  try {
    browser = await chromium.puppeteer.launch({
      args: [...chromium.args, "--remote-debugging-port=9222"],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const options = {
      output: "json",
      preset: "mobile",
      onlyCategories: ["performance", "seo", "accessibility", "best-practices"],
      port: 9222,
    };

    const url = "https://www.google.com";

    const result = await lighthouse(url, options);
    console.log(`Audited ${url} in ${result.lhr.timing.total} ms.`);

    const report = JSON.parse(result.report);

    response = {
      statusCode: 200,
      body: {
        Perfomance: report["categories"]["performance"]["score"],
        Accessibility: report["categories"]["accessibility"]["score"],
        SEO: report["categories"]["seo"]["score"],
        BestPractices: report["categories"]["best-practices"]["score"],
        ErrorMessage: report["audits"]["speed-index"]["errorMessage"],
      },
    };
  } catch (error) {
    console.error(error);

    response = {
      statusCode: 500,
      body: error,
    };
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }

  return response;
};
