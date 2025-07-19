import { test, expect } from "@playwright/test";
import * as fs from "fs";

const postPayload = {
  name: "morpheus",
  job: "leader",
};

const putPayload = {
  name: "morpheus",
  job: "zion resident",
};

const headerRequest = {
  "x-api-key": "reqres-free-v1",
  Authorization: "reqres-free-v1",
};

let userId;

test("UI tests", async ({ page }) => {
  //go to url
  await page.goto("https://demoqa.com/");

  //click on Book Store Application
  await page.getByText("Book Store Application").click();
  //click on login
  await page.locator("span").getByText("Login").click();
  //enter usename and password
  await page.locator("#userName").click();
  await page.locator("#userName").fill("johnwick");
  await page.locator("#password").click();
  await page.locator("#password").fill("John@1234");
  //click on login button
  await page.locator("#login").click();

  //wait for page to load
  await page
    .locator("#userName-value")
    .waitFor({ state: "visible", timeout: 30000 });

  //click on Book Store
  await page
    .locator(
      "//div[@class='element-list collapse show']//span[text()='Book Store']"
    )
    .click();

  // Validate username and logout button
  expect(page.locator("#userName-value")).toHaveText("johnwick");
  expect(page.locator("button#submit")).toBeVisible();

  //search book
  await page.locator("#searchBox").waitFor({ state: "visible", timeout: 2000 });
  await page.locator("#searchBox").click();
  await page.locator("#searchBox").fill("Learning JavaScript Design Patterns");

  //check first row if contains book
  const bookNameRow = await page
    .locator("div")
    .locator(".rt-tr-group")
    .first()
    .textContent();
  expect(bookNameRow).toContain("Learning JavaScript Design Patterns");

  //print in file
  const filePath = "./output/outputFile.txt";
  // Ensure the output directory exists
  fs.mkdirSync("./output", { recursive: true });

  //get book name
  const bookName = await page
    .locator("div")
    .locator(".rt-tr-group")
    .first()
    .locator(".rt-td")
    .nth(1)
    .textContent();
  fs.writeFileSync(filePath, "", "utf8");
  fs.writeFileSync(filePath, `Book Name: ${bookName!} \n`, "utf8");
  //get book author
  const bookAuthor = await page
    .locator("div")
    .locator(".rt-tr-group")
    .first()
    .locator(".rt-td")
    .nth(2)
    .textContent();
  fs.appendFileSync(filePath, `Book Author: ${bookAuthor!} \n`, "utf8");
  //get publisher
  const publisher = await page
    .locator("div")
    .locator(".rt-tr-group")
    .first()
    .locator(".rt-td")
    .nth(3)
    .textContent();
  fs.appendFileSync(filePath, `Publisher: ${publisher!} \n`, "utf8");

  //logout
  await page.locator("button#submit").click();
  console.log('UI test Completed');
});

test.describe.serial("API tests", () => {
  test("Create user", async ({ request }) => {
    const apiResponse = await request.post("https://reqres.in/api/users", {
      data: postPayload,
      headers: headerRequest,
    });

    const response = await apiResponse.json();
    expect(apiResponse.status()).toBe(201);
    console.log("User created successfully!");
    // Fetch and store userId
    userId = response.id;
    console.log("User id: " + userId);
  });

  test("Update user", async ({ request }) => {
    const apiResponse = await request.put(
      `https://reqres.in/api/users/${userId}`,
      {
        data: putPayload,
        headers: headerRequest,
      }
    );

    const response = await apiResponse.json();
    expect(apiResponse.status()).toBe(200);
    console.log("User updated successfully!");
    //verify updated job description
    expect(response.job).toBe(putPayload.job);
  });

  test("Get user details", async ({ request }) => {
    //unable to do get by Id using above created userId so using case from example with userId=2 and verifying
    userId = 2;
    const apiResponse = await request.get(
      `https://reqres.in/api/users/${userId}`,
      {
        headers: headerRequest,
      }
    );

    const response = await apiResponse.json();
    expect(apiResponse.status()).toBe(200);
    console.log("Get User successfully!");
    //verify first name
    expect(response.data.first_name).toBe("Janet");
    //verify last name
    expect(response.data.last_name).toBe("Weaver");
    //verify email
    expect(response.data.email).toBe("janet.weaver@reqres.in");
  });
});
