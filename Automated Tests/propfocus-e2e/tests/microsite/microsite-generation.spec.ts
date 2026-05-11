// import { test, expect } from "../../fixtures/testFixtures";
// import { MicrositePage } from "../../pageObjects/MicrositePage";
// import { openInNewTab } from "../../utils/helpers";
// import { createMicrositeLeadData } from "../../utils/testData";

// test.describe("Microsite Generation", () => {
//   test("Microsite should generate successfully from dashboard @smoke", async ({
//     page,
//     loginPage,
//     dashboardPage,
//     micrositePage
//   }) => {
//     const email = process.env.LOGIN_EMAIL;
//     const password = process.env.LOGIN_PASSWORD;

//     expect(email, "LOGIN_EMAIL is required in environment").toBeTruthy();
//     expect(password, "LOGIN_PASSWORD is required in environment").toBeTruthy();

//     const leadData = createMicrositeLeadData();

//     await test.step("Open login page and authenticate", async () => {
//       await loginPage.goto();
//       await loginPage.login(email as string, password as string);
//     });

//     await test.step("Navigate to microsite generator", async () => {
//       await dashboardPage.ensureLoaded();
//       await dashboardPage.goToMicrositeGenerator();
//       await micrositePage.ensureLoaded();
//     });

//     let generatedMicrositeUrl = "";
//     await test.step("Generate microsite and validate response", async () => {
//       await micrositePage.fillBuyerLeadDetails(leadData);
//       generatedMicrositeUrl = await micrositePage.generateMicrositeAndGetUrl();
//       expect(generatedMicrositeUrl).toContain("http");
//     });

//     await test.step("Open generated microsite and validate buyer details", async () => {
//       const micrositeTab = await openInNewTab(page, generatedMicrositeUrl);
//       const liveMicrositePage = new MicrositePage(micrositeTab);
//       await liveMicrositePage.expectBuyerNameOnMicrosite(leadData.buyerName);
//       await micrositeTab.close();
//     });
//   });
// });
