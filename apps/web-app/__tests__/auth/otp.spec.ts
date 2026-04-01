import { type Page, test, expect } from "@playwright/test";

const PHONE_ENTRY_URL = "/";

async function mockAndSubmitPhone(page: Page, phoneNumber = "0771234567") {
  await page.route("**/api/clients/check-phone**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ exists: true }),
    })
  );

  await page.route("**/api/otp/send**", (route) => {
    if (route.request().method() === "POST") {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ contact_id: "contact-abc-123" }),
      });
    } else {
      route.continue();
    }
  });

  await page.goto(PHONE_ENTRY_URL);
  await page.fill("#phoneNumber", phoneNumber);
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText("Enter 5 digit verification code")).toBeVisible({
    timeout: 10000,
  });
}

async function fillOtp(page: Page, digits: string) {
  const inputs = page.locator('input[inputmode="numeric"]');
  for (let i = 0; i < 5; i++) {
    await inputs.nth(i).fill(digits[i] ?? "");
  }
}

function hasClass(
  locator: ReturnType<Page["locator"]>,
  cls: string
): Promise<string | null> {
  return locator
    .getAttribute("class")
    .then((c) => (c?.includes(cls) ? cls : null));
}

test.describe("OTP Phone Entry", () => {
  test("should render phone entry page with correct UI and button color", async ({
    page,
  }) => {
    await page.goto(PHONE_ENTRY_URL);

    await expect(page.getByText("Welcome to MediPraxis")).toBeVisible();
    await expect(
      page.getByText("Please enter your phone number to continue")
    ).toBeVisible();

    const phoneInput = page.locator("#phoneNumber");
    await expect(phoneInput).toBeVisible();
    await expect(phoneInput).toHaveAttribute("placeholder", "07XXXXXXXX");

    const continueBtn = page.getByRole("button", { name: "Continue" });
    await expect(continueBtn).toBeVisible();

    // Button must carry the brand-green Tailwind class
    const cls = await hasClass(continueBtn, "bg-[#90C67C]");
    expect(cls).not.toBeNull();
  });

  test("should show error for empty phone number submission", async ({
    page,
  }) => {
    await page.goto(PHONE_ENTRY_URL);
    await page.getByRole("button", { name: "Continue" }).click();

    const errorMsg = page.getByText("Phone number is required");
    await expect(errorMsg).toBeVisible();

    // Error paragraph must carry the red text class
    expect(await hasClass(errorMsg, "text-[#FF5757]")).not.toBeNull();

    // Phone input border must switch to red class
    expect(
      await hasClass(page.locator("#phoneNumber"), "border-[#FF5757]")
    ).not.toBeNull();
  });

  test("should show error for invalid (short) phone number", async ({
    page,
  }) => {
    await page.goto(PHONE_ENTRY_URL);
    await page.fill("#phoneNumber", "07712");
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByText("Invalid phone number")).toBeVisible();
  });

  test("should show error when phone number is not registered", async ({
    page,
  }) => {
    await page.route("**/api/clients/check-phone**", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ exists: false }),
      })
    );

    await page.goto(PHONE_ENTRY_URL);
    await page.fill("#phoneNumber", "0771234567");
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(
      page.getByText(
        "Phone number is not registered. Please contact your healthcare provider."
      )
    ).toBeVisible({ timeout: 10000 });
  });
});

test.describe("OTP Verification Form", () => {
  test("should transition to OTP form and show resend timer after valid phone", async ({
    page,
  }) => {
    await mockAndSubmitPhone(page);

    await expect(
      page.getByText("Enter 5 digit verification code")
    ).toBeVisible();
    await expect(
      page.getByText(/We sent an OTP verification code to/)
    ).toBeVisible();
    await expect(page.getByText("+94 0771234567")).toBeVisible();

    // All 5 OTP inputs should be present
    await expect(page.locator('input[inputmode="numeric"]')).toHaveCount(5);

    // Resend button should be disabled and show countdown
    const resendBtn = page.getByRole("button", {
      name: /Resend code \(\d+s\)/,
    });
    await expect(resendBtn).toBeVisible();
    await expect(resendBtn).toBeDisabled();

    // Disabled resend must carry the gray class
    expect(await hasClass(resendBtn, "text-gray-400")).not.toBeNull();
  });

  test("should show red error and red borders on incorrect OTP", async ({
    page,
  }) => {
    await mockAndSubmitPhone(page);

    await page.route("**/api/otp/verify**", (route) =>
      route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ error: "Invalid or expired OTP" }),
      })
    );

    await fillOtp(page, "99999");
    await page.getByRole("button", { name: "Verify" }).click();

    const errorMsg = page.getByText("Invalid or expired OTP");
    await expect(errorMsg).toBeVisible({ timeout: 10000 });

    // Error text must carry the red class
    expect(await hasClass(errorMsg, "text-[#FF5757]")).not.toBeNull();

    // All OTP inputs must switch to red border class
    const otpInputs = page.locator('input[inputmode="numeric"]');
    for (let i = 0; i < 5; i++) {
      expect(
        await hasClass(otpInputs.nth(i), "border-[#FF5757]")
      ).not.toBeNull();
    }
  });

  test("should show error when submitting incomplete OTP (fewer than 5 digits)", async ({
    page,
  }) => {
    await mockAndSubmitPhone(page);

    await fillOtp(page, "123");
    await page.getByRole("button", { name: "Verify" }).click();

    await expect(page.getByText("Please enter the 5-digit OTP")).toBeVisible();
  });

  test("should navigate to dashboard on correct OTP", async ({ page }) => {
    await mockAndSubmitPhone(page);

    await page.route("**/api/otp/verify**", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ contact_id: "contact-abc-123" }),
      })
    );

    await fillOtp(page, "12345");
    await page.getByRole("button", { name: "Verify" }).click();

    await page.waitForURL("**/dashboard**", { timeout: 10000 });
  });

  test("should reject non-numeric characters in OTP inputs", async ({
    page,
  }) => {
    await mockAndSubmitPhone(page);

    const firstInput = page.locator('input[inputmode="numeric"]').first();
    await firstInput.fill("a");
    await expect(firstInput).toHaveValue("");

    await firstInput.fill("5");
    await expect(firstInput).toHaveValue("5");
  });

  test("should reset to phone entry form when 'Change?' is clicked", async ({
    page,
  }) => {
    await mockAndSubmitPhone(page);

    await page.getByRole("button", { name: "Change?" }).click();

    await expect(page.getByText("Welcome to MediPraxis")).toBeVisible();
    await expect(page.locator("#phoneNumber")).toBeVisible();
    // Phone number is intentionally preserved so the user can re-submit or edit it
    await expect(page.locator("#phoneNumber")).toHaveValue("0771234567");
    await expect(
      page.getByText("Enter 5 digit verification code")
    ).not.toBeVisible();
  });
});
