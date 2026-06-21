import { test, expect } from "@playwright/test";

test.describe("Kanban Board E2E Tests", () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the frontend dev / preview server
    await page.goto("/");
    // Wait for initial sync to complete (loading indicator to disappear)
    await page.waitForSelector("[data-testid='loading-indicator']", { state: "detached" });
  });

  test("User can perform CRUD operations on a task", async ({ page }) => {
    // --- CREATE ---
    await page.getByTestId("add-task-button").click();
    await page.getByTestId("task-title-input").fill("E2E Test Task");
    await page.getByTestId("task-desc-input").fill("Testing description for E2E tests.");

    // Fill priority & category (react-select inputs)
    // We can click the container, then click the option text or type and press Enter
    await page.locator("#priority-select").click();
    await page.keyboard.type("High");
    await page.keyboard.press("Enter");

    await page.locator("#category-select").click();
    await page.keyboard.type("Bug");
    await page.keyboard.press("Enter");

    // Click Save
    await page.getByTestId("save-task-button").click();

    // Verify card exists in "To Do" column
    const card = page.locator("[data-testid^='task-card-']").first();
    await expect(card).toBeVisible();
    await expect(card.locator("h4")).toHaveText("E2E Test Task");
    await expect(card.locator("p")).toContainText("Testing description for E2E tests.");
    await expect(card).toContainText("High");
    await expect(card).toContainText("Bug");

    // --- UPDATE ---
    await card.locator("button[aria-label='Edit Task']").click();
    await page.getByTestId("task-title-input").fill("E2E Test Task - Updated");
    
    await page.locator("#priority-select").click();
    await page.keyboard.type("Medium");
    await page.keyboard.press("Enter");

    await page.getByTestId("save-task-button").click();

    // Verify card is updated
    await expect(card.locator("h4")).toHaveText("E2E Test Task - Updated");
    await expect(card).toContainText("Medium");

    // --- DELETE ---
    await card.locator("button[aria-label='Delete Task']").click();
    await expect(page.locator("[data-testid^='task-card-']")).toHaveCount(0);
  });

  test("User can drag and drop a task and see metrics update", async ({ page }) => {
    // 1. Create a task
    await page.getByTestId("add-task-button").click();
    await page.getByTestId("task-title-input").fill("Draggable Task");
    await page.getByTestId("save-task-button").click();

    const card = page.locator("[data-testid^='task-card-']").first();
    const todoColumn = page.getByTestId("column-todo");
    const inProgressColumn = page.getByTestId("column-in_progress");

    // Verify it starts in To Do
    await expect(todoColumn).toContainText("Draggable Task");
    
    // Check initial completion percentage is 0%
    await expect(page.getByTestId("completion-percentage")).toHaveText("0%");

    // Drag to In Progress
    await card.dragTo(inProgressColumn);

    // Verify task is now in In Progress
    await expect(inProgressColumn).toContainText("Draggable Task");
    await expect(todoColumn).not.toContainText("Draggable Task");

    // Drag to Done
    const doneColumn = page.getByTestId("column-done");
    await card.dragTo(doneColumn);

    // Verify task is in Done and completion percentage is now 100%
    await expect(doneColumn).toContainText("Draggable Task");
    await expect(page.getByTestId("completion-percentage")).toHaveText("100%");

    // Cleanup
    await card.locator("button[aria-label='Delete Task']").click();
  });

  test("File upload displays image preview for valid files and error for invalid formats", async ({ page }) => {
    await page.getByTestId("add-task-button").click();
    await page.getByTestId("task-title-input").fill("Attachment Task");

    const fileInput = page.getByTestId("file-upload-input");

    // 1. Upload invalid format (e.g. .txt)
    await fileInput.setInputFiles({
      name: "test.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("dummy text content")
    });

    // Check error banner is visible
    const errorBanner = page.getByTestId("error-message");
    await expect(errorBanner).toBeVisible();
    await expect(errorBanner).toContainText("Unsupported file format");

    // 2. Upload valid image
    await fileInput.setInputFiles({
      name: "preview.png",
      mimeType: "image/png",
      buffer: Buffer.from("fake-png-data")
    });

    // Verify error is gone and preview image is rendered in modal
    await expect(errorBanner).not.toBeVisible();
    await expect(page.getByTestId("attachments-preview-list").locator("img")).toBeVisible();

    // Save and verify card displays the attachment count/preview
    await page.getByTestId("save-task-button").click();
    
    const card = page.locator("[data-testid^='task-card-']").first();
    await expect(card.locator("img")).toBeVisible();
    await expect(card).toContainText("Attachments (1)");

    // Cleanup
    await card.locator("button[aria-label='Delete Task']").click();
  });

});
