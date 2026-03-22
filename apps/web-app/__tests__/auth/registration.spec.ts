import { test, expect } from "@playwright/test";

test.describe("Client Registration", () => {
  test.beforeEach(async ({ page }) => {
    // Mock the registration API
    await page.route("**/api/clients", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            message: "Patient registered successfully!",
          }),
        });
      } else {
        await route.continue();
      }
    });
  });

  test("should register a new client successfully", async ({ page }) => {
    // Navigate to the registration page
    await page.goto("/register");

    // Fill in the registration form
    // Title Select - using more robust selection for Shadcn/Radix Select
    await page.getByLabel("Title").click();
    // Wait for the dropdown to appear and select "Mr."
    await page.getByRole("option", { name: "Mr." }).click();

    // First Name
    await page.getByLabel("First Name").fill("John");

    // Last Name
    await page.getByLabel("Last Name").fill("Doe");

    // Gender Radio Group - fixed casing 'male' vs 'Male'
    await page.getByLabel("male", { exact: true }).check();

    // Date of Birth
    await page.getByLabel("Date of Birth").fill("1990-01-01");

    // Submit the form
    await page.getByRole("button", { name: "Save" }).click();

    // Verify success message
    const successMessage = page.locator(".bg-green-100");
    await expect(successMessage).toBeVisible({ timeout: 10000 });
    await expect(successMessage).toContainText(
      /Patient registered successfully/i
    );
  });

  test("should show validation errors for empty fields", async ({ page }) => {
    await page.goto("/register");

    // Click Save without filling anything (Title and Gender have defaults)
    await page.getByRole("button", { name: "Save" }).click();

    // Check for validation messages for fields without defaults
    await expect(
      page.getByText("First name must be at least 2 characters")
    ).toBeVisible();
    await expect(
      page.getByText("Last name must be at least 2 characters")
    ).toBeVisible();
    await expect(page.getByText("Date of birth is required")).toBeVisible();
  });
});
