const chromium = require("chrome-aws-lambda");
const lighthouse = require("lighthouse/core/index.cjs");

module.exports.get = async (event) => {
  const { pageId } = event.pathParameters;
  let browser;

  console.log({ pageId });

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
    console.log(`Audited ${url} in ${result.lhr.timing.total} ms!`);

    const report = JSON.parse(result.report);

    return {
      statusCode: 200,
      body: JSON.stringify(report),
    };
  } catch (error) {
    console.error(error);

    return {
      statusCode: 500,
      body: "error",
    };
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
};
