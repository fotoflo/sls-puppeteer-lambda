const chromium = require("chrome-aws-lambda");

module.exports.get = async (event) => {
  const outlet = event.pathParameters.outlet;
  const outletInfo = getOutletInfo(outlet);

  try {
    const browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: "new",
      ignoreHTTPSErrors: true,
    });

    let page = await browser.newPage();

    await page.goto(outletInfo.url);
    const el = await page.$(outletInfo.tag);
    const headline = await (await el.getProperty("textContent")).jsonValue();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(headline),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 502,
      body: `error: ${JSON.stringify(error)}`,
    };
  }
};

function getOutletInfo(outlet) {
  switch (outlet) {
    case "nytimes":
      return {
        url: "https://www.nytimes.com/",
        tag: "h3",
      };
    case "wapo":
      return {
        url: "https://www.washingtonpost.com/",
        tag: ".font--headline span",
      };
    default:
      return {
        url: "https://www.nytimes.com/",
        tag: "",
      };
  }
}
