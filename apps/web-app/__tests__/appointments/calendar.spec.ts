import { test, expect, type Page } from "@playwright/test";

const LINK_ID = "fdb940e2-1387-474f-a483-e23d0e97e1ef";
const CLIENT_ID = "4231411e-efa4-4a1c-8e05-bf16f93c542d";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

// ─── Date helpers ─────────────────────────────────────────────────────────────

function todayAt(hour: number): string {
  const d = new Date();
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

function daysFromNow(days: number, hour: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

function getDayName(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return DAY_NAMES[d.getDay()]!;
}

function getDateNum(daysAhead: number): number {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.getDate();
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const BASE_SLOT = {
  template_id: null,
  user_id: "user-001",
  task_status_id: "NOT_STARTED",
  is_override: false,
  created_date: new Date().toISOString(),
  modified_date: new Date().toISOString(),
};

function makeCalendarResponse(overrides?: {
  slotWindows?: unknown[];
  clientReservedSlotWindowIds?: string[];
  clientReservedAppointments?: Record<string, string>;
}) {
  return {
    success: true,
    data: {
      link_id: LINK_ID,
      user_id: "user-001",
      visible_days_ahead: 7,
      user: { first_name: "Sarah", last_name: "Johnson" },
      slotWindows: overrides?.slotWindows ?? [
        // Today – available (3 of 5 slots free)
        {
          ...BASE_SLOT,
          slot_window_id: "sw-001",
          start_date: todayAt(10),
          end_date: todayAt(11),
          total_slots: 5,
          slots_filled: 2,
          location: "City Health Clinic",
          note: "123 Main Street, Colombo",
        },
        // Today – fully booked
        {
          ...BASE_SLOT,
          slot_window_id: "sw-002",
          start_date: todayAt(14),
          end_date: todayAt(15),
          total_slots: 3,
          slots_filled: 3,
          location: "Wellness Center",
          note: "456 Park Avenue, Colombo",
        },
        // Tomorrow – available
        {
          ...BASE_SLOT,
          slot_window_id: "sw-003",
          start_date: daysFromNow(1, 9),
          end_date: daysFromNow(1, 10),
          total_slots: 4,
          slots_filled: 1,
          location: "Sunrise Clinic",
          note: "789 Lake Road, Colombo",
        },
      ],
      clientReservedSlotWindowIds: overrides?.clientReservedSlotWindowIds ?? [],
      clientReservedAppointments: overrides?.clientReservedAppointments ?? {},
    },
  };
}

// ─── Route helpers ────────────────────────────────────────────────────────────

async function mockCalendar(
  page: Page,
  body = makeCalendarResponse(),
  status = 200
) {
  await page.route("**/api/shareable-calendar-links/**", async (route) => {
    await route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(body),
    });
  });
}

async function mockReserve(page: Page, status = 200, responseBody?: object) {
  await page.route("**/api/tasks/appointments/reserve", async (route) => {
    await route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(responseBody ?? { success: true }),
    });
  });
}

async function mockCancel(page: Page, status = 200) {
  await page.route("**/api/tasks/appointments/cancel", async (route) => {
    await route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify({ success: true }),
    });
  });
}

// Navigate and wait for the calendar to fully render (past splash + loading state)
async function gotoCalendar(page: Page) {
  // Skip the 3.5s splash screen (3s timer + 0.5s fade) by pre-setting the
  // sessionStorage flag that App.tsx checks before mounting SplashScreen.
  await page.addInitScript(() => {
    sessionStorage.setItem("splashShown", "true");
  });
  await page.goto(`/schedules/${LINK_ID}`);
  await page.waitForSelector("text=Dr. Sarah Johnson", { timeout: 10000 });
  await page.waitForTimeout(300); // small buffer for CSS transitions
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe("Appointment Calendar", () => {
  test.beforeEach(async ({ page }) => {
    await mockCalendar(page);
    await mockReserve(page);
    await mockCancel(page);
  });

  // ── Page Load ──────────────────────────────────────────────────────────────

  test.describe("Page Load", () => {
    test("shows loading indicator while fetching data", async ({ page }) => {
      // Delay API response so the loading state is observable
      await page.route("**/api/shareable-calendar-links/**", async (route) => {
        await new Promise((r) => setTimeout(r, 400));
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(makeCalendarResponse()),
        });
      });

      await page.goto(`/schedules/${LINK_ID}`);
      await expect(
        page.getByText("Loading available appointments...")
      ).toBeVisible();
      // Loading state resolves
      await expect(page.getByText("Dr. Sarah Johnson")).toBeVisible();
    });

    test("displays Appointment heading and practitioner name", async ({
      page,
    }) => {
      await gotoCalendar(page);
      await expect(
        page.getByRole("heading", { name: "Appointment" })
      ).toBeVisible();
      await expect(page.getByText("Dr. Sarah Johnson")).toBeVisible();
    });

    test("shows error message when calendar API fails", async ({ page }) => {
      await page.route("**/api/shareable-calendar-links/**", async (route) => {
        await route.fulfill({ status: 500, body: "Internal Server Error" });
      });

      await page.goto(`/schedules/${LINK_ID}`);
      // React Query retries 3× with exponential backoff (~7s total) before showing the error
      await expect(
        page.getByText("Unable to load appointments. Please try again later.")
      ).toBeVisible({ timeout: 15000 });
    });
  });

  // ── Day Selector ───────────────────────────────────────────────────────────

  test.describe("Day Selector", () => {
    test("renders 'Today' label below the first day button", async ({
      page,
    }) => {
      await gotoCalendar(page);
      // "Dr. Sarah Johnson" comes from mock data — confirms the calendar rendered
      await expect(page.getByText("Dr. Sarah Johnson")).toBeVisible();
      await expect(page.getByText("Today")).toBeVisible();
    });

    test("today's slots are visible by default", async ({ page }) => {
      await gotoCalendar(page);
      await expect(page.getByText("City Health Clinic")).toBeVisible();
      await expect(page.getByText("Wellness Center")).toBeVisible();
      // Tomorrow's slot should not yet be visible
      await expect(page.getByText("Sunrise Clinic")).not.toBeVisible();
    });

    test("clicking a different day shows that day's slots", async ({
      page,
    }) => {
      await gotoCalendar(page);

      const tomorrowDayName = getDayName(1);
      const tomorrowDateNum = getDateNum(1);

      await page
        .getByRole("button", {
          name: new RegExp(`${tomorrowDayName}\\s*${tomorrowDateNum}`),
        })
        .click();

      // Tomorrow's slot now visible; today's are gone
      await expect(page.getByText("Sunrise Clinic")).toBeVisible();
      await expect(page.getByText("City Health Clinic")).not.toBeVisible();
      await expect(page.getByText("Wellness Center")).not.toBeVisible();
    });

    test("shows 'No appointments available' when selected day has no slots", async ({
      page,
    }) => {
      await gotoCalendar(page);

      // Day index 2 (two days from now) has no slots in the mock data
      const day2Name = getDayName(2);
      const day2Date = getDateNum(2);

      await page
        .getByRole("button", {
          name: new RegExp(`${day2Name}\\s*${day2Date}`),
        })
        .click();

      await expect(
        page.getByText("No appointments available for this day.")
      ).toBeVisible();
    });
  });

  // ── Viewing Slot Windows ───────────────────────────────────────────────────

  test.describe("Viewing Slot Windows", () => {
    test("displays time range, clinic name and address for each slot", async ({
      page,
    }) => {
      await gotoCalendar(page);

      // sw-001: 10AM-11AM
      await expect(page.getByText("10AM-11AM")).toBeVisible();
      await expect(page.getByText("City Health Clinic")).toBeVisible();
      await expect(page.getByText("123 Main Street, Colombo")).toBeVisible();

      // sw-002: 2PM-3PM
      await expect(page.getByText("2PM-3PM")).toBeVisible();
      await expect(page.getByText("Wellness Center")).toBeVisible();
      await expect(page.getByText("456 Park Avenue, Colombo")).toBeVisible();
    });

    test("displays available slot count as a zero-padded number", async ({
      page,
    }) => {
      await gotoCalendar(page);
      // sw-001: 5 total − 2 filled = 3 available → rendered as "03"
      await expect(page.getByText("03").first()).toBeVisible();
    });

    test("shows 'Slots Available' label for slots with remaining capacity", async ({
      page,
    }) => {
      await gotoCalendar(page);
      await expect(page.getByText("Slots Available").first()).toBeVisible();
    });

    test("shows 'Slots Unavailable' for fully booked slots", async ({
      page,
    }) => {
      await gotoCalendar(page);
      await expect(page.getByText("Slots Unavailable")).toBeVisible();
    });

    test("hides Reserve button for fully booked slots", async ({ page }) => {
      await gotoCalendar(page);
      // Wait for content to load
      await expect(page.getByText("City Health Clinic")).toBeVisible();

      // Only sw-001 has a Reserve trigger; sw-002 is fully booked so no button
      const reserveTriggers = page.getByRole("button", {
        name: /^Reserve$/,
      });
      await expect(reserveTriggers).toHaveCount(1);
    });
  });

  // ── Reserve Appointment ────────────────────────────────────────────────────

  test.describe("Reserve Appointment", () => {
    test("clicking Reserve opens confirmation dialog with slot details", async ({
      page,
    }) => {
      await gotoCalendar(page);
      await page.getByRole("button", { name: /^Reserve$/ }).click();

      const dialog = page.getByRole("alertdialog");
      await expect(dialog).toBeVisible();
      await expect(
        dialog.getByRole("heading", { name: "Reserve Appointment" })
      ).toBeVisible();
      await expect(
        dialog.getByText(
          "Are you sure you want to reserve this appointment slot?"
        )
      ).toBeVisible();
      // Slot details echoed inside dialog
      await expect(dialog.getByText("10AM-11AM")).toBeVisible();
      await expect(dialog.getByText("City Health Clinic")).toBeVisible();
      await expect(dialog.getByText("123 Main Street, Colombo")).toBeVisible();
    });

    test("confirming reservation calls the API with correct payload and shows success toast", async ({
      page,
    }) => {
      let capturedBody: unknown;
      await page.route("**/api/tasks/appointments/reserve", async (route) => {
        capturedBody = JSON.parse(route.request().postData() ?? "{}");
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true }),
        });
      });

      await gotoCalendar(page);
      await page.getByRole("button", { name: /^Reserve$/ }).click();
      await page
        .getByRole("alertdialog")
        .getByRole("button", { name: "Reserve" })
        .click();

      await expect(
        page.getByText("Your appointment has been booked successfully!")
      ).toBeVisible();
      expect(capturedBody).toMatchObject({
        slot_window_id: "sw-001",
        client_id: CLIENT_ID,
      });
    });

    test("dismissing the reservation dialog does not call the API", async ({
      page,
    }) => {
      let apiCalled = false;
      await page.route("**/api/tasks/appointments/reserve", async (route) => {
        apiCalled = true;
        await route.continue();
      });

      await gotoCalendar(page);
      await page.getByRole("button", { name: /^Reserve$/ }).click();
      await page
        .getByRole("alertdialog")
        .getByRole("button", { name: "Cancel" })
        .click();

      await expect(page.getByRole("alertdialog")).not.toBeVisible();
      expect(apiCalled).toBe(false);
    });

    test("button switches to 'Cancel Reservation' after a successful booking", async ({
      page,
    }) => {
      let callCount = 0;
      await page.route("**/api/shareable-calendar-links/**", async (route) => {
        callCount++;
        // First call: slot unreserved. Subsequent calls: slot reserved.
        const body =
          callCount > 1
            ? makeCalendarResponse({
                clientReservedSlotWindowIds: ["sw-001"],
                clientReservedAppointments: { "sw-001": "task-new" },
              })
            : makeCalendarResponse();
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(body),
        });
      });

      await gotoCalendar(page);
      await page.getByRole("button", { name: /^Reserve$/ }).click();
      await page
        .getByRole("alertdialog")
        .getByRole("button", { name: "Reserve" })
        .click();

      await expect(
        page.getByRole("button", { name: /Cancel Reservation/i })
      ).toBeVisible({ timeout: 5000 });
    });
  });

  // ── Cancel Appointment ─────────────────────────────────────────────────────

  test.describe("Cancel Appointment", () => {
    // Override the calendar mock so sw-001 is already reserved
    test.beforeEach(async ({ page }) => {
      await page.route("**/api/shareable-calendar-links/**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(
            makeCalendarResponse({
              clientReservedSlotWindowIds: ["sw-001"],
              clientReservedAppointments: { "sw-001": "task-001" },
            })
          ),
        });
      });
    });

    test("shows 'Cancel Reservation' button for a reserved slot", async ({
      page,
    }) => {
      await gotoCalendar(page);
      await expect(
        page.getByRole("button", { name: /Cancel Reservation/i })
      ).toBeVisible();
    });

    test("clicking Cancel Reservation opens confirmation dialog with slot details", async ({
      page,
    }) => {
      await gotoCalendar(page);
      await page.getByRole("button", { name: /Cancel Reservation/i }).click();

      const dialog = page.getByRole("alertdialog");
      await expect(dialog).toBeVisible();
      await expect(
        dialog.getByRole("heading", { name: "Cancel Reservation" })
      ).toBeVisible();
      await expect(
        dialog.getByText(
          "Are you sure you want to cancel this reservation? Please note that you will have to wait some time before making your next reservation."
        )
      ).toBeVisible();
      // Slot details echoed in dialog
      await expect(dialog.getByText("10AM-11AM")).toBeVisible();
      await expect(dialog.getByText("City Health Clinic")).toBeVisible();
    });

    test("confirming cancellation calls the cancel API with task_id and shows success toast", async ({
      page,
    }) => {
      let capturedBody: unknown;
      await page.route("**/api/tasks/appointments/cancel", async (route) => {
        capturedBody = JSON.parse(route.request().postData() ?? "{}");
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true }),
        });
      });

      await gotoCalendar(page);
      await page.getByRole("button", { name: /Cancel Reservation/i }).click();
      await page
        .getByRole("alertdialog")
        .getByRole("button", { name: "Yes, Cancel It" })
        .click();

      await expect(
        page.getByText("Your appointment has been cancelled successfully.")
      ).toBeVisible();
      expect(capturedBody).toMatchObject({ task_id: "task-001" });
    });

    test("clicking 'No, Keep It' dismisses dialog without cancelling", async ({
      page,
    }) => {
      let apiCalled = false;
      await page.route("**/api/tasks/appointments/cancel", async (route) => {
        apiCalled = true;
        await route.continue();
      });

      await gotoCalendar(page);
      await page.getByRole("button", { name: /Cancel Reservation/i }).click();
      await page
        .getByRole("alertdialog")
        .getByRole("button", { name: "No, Keep It" })
        .click();

      await expect(page.getByRole("alertdialog")).not.toBeVisible();
      // Reservation is still intact
      await expect(
        page.getByRole("button", { name: /Cancel Reservation/i })
      ).toBeVisible();
      expect(apiCalled).toBe(false);
    });
  });

  // ── Error Handling ─────────────────────────────────────────────────────────

  test.describe("Error Handling", () => {
    test("shows error toast when slot is no longer available (reserve 404)", async ({
      page,
    }) => {
      await page.route("**/api/tasks/appointments/reserve", async (route) => {
        await route.fulfill({
          status: 404,
          contentType: "application/json",
          body: JSON.stringify({ error: "Not found" }),
        });
      });

      await gotoCalendar(page);
      await page.getByRole("button", { name: /^Reserve$/ }).click();
      await page
        .getByRole("alertdialog")
        .getByRole("button", { name: "Reserve" })
        .click();

      await expect(
        page.getByText("This time slot is no longer available")
      ).toBeVisible();
    });

    test("shows error toast when appointment is already booked (reserve 409)", async ({
      page,
    }) => {
      await page.route("**/api/tasks/appointments/reserve", async (route) => {
        await route.fulfill({
          status: 409,
          contentType: "application/json",
          body: JSON.stringify({ error: "Conflict" }),
        });
      });

      await gotoCalendar(page);
      await page.getByRole("button", { name: /^Reserve$/ }).click();
      await page
        .getByRole("alertdialog")
        .getByRole("button", { name: "Reserve" })
        .click();

      await expect(
        page.getByText(
          "You already have an appointment booked for this time slot"
        )
      ).toBeVisible();
    });

    test("shows cooldown error toast when reserving too quickly (reserve 429)", async ({
      page,
    }) => {
      const cooldownMsg = "Please wait 30 minutes before reserving again";
      await page.route("**/api/tasks/appointments/reserve", async (route) => {
        await route.fulfill({
          status: 429,
          contentType: "application/json",
          body: JSON.stringify({ error: cooldownMsg }),
        });
      });

      await gotoCalendar(page);
      await page.getByRole("button", { name: /^Reserve$/ }).click();
      await page
        .getByRole("alertdialog")
        .getByRole("button", { name: "Reserve" })
        .click();

      await expect(page.getByText(cooldownMsg)).toBeVisible();
    });

    test("shows error toast when cancel appointment not found (cancel 404)", async ({
      page,
    }) => {
      // Load page with a pre-reserved slot
      await page.route("**/api/shareable-calendar-links/**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(
            makeCalendarResponse({
              clientReservedSlotWindowIds: ["sw-001"],
              clientReservedAppointments: { "sw-001": "task-001" },
            })
          ),
        });
      });
      await page.route("**/api/tasks/appointments/cancel", async (route) => {
        await route.fulfill({
          status: 404,
          contentType: "application/json",
          body: JSON.stringify({ error: "Not found" }),
        });
      });

      await gotoCalendar(page);
      await page.getByRole("button", { name: /Cancel Reservation/i }).click();
      await page
        .getByRole("alertdialog")
        .getByRole("button", { name: "Yes, Cancel It" })
        .click();

      await expect(
        page.getByText("This appointment could not be found")
      ).toBeVisible();
    });
  });
});
