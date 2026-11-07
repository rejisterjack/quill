import { test, expect } from "@playwright/test";

test("seeded admin can upload text and open chat", async ({ page, request }) => {
  const login = await request.post("/api/auth/login", {
    data: { email: "admin@quill.dev", password: "Admin1234!" },
  });
  expect(login.ok()).toBeTruthy();

  const upload = await request.post("/api/documents/upload", {
    multipart: {
      file: {
        name: "note.txt",
        mimeType: "text/plain",
        buffer: Buffer.from("Quill stores retrieved chunks in document_chunks and cites them in chat."),
      },
      title: "Note",
    },
  });
  expect(upload.status()).toBe(202);
  const created = await upload.json();
  const documentId = created.document?.id || created.id;
  expect(documentId).toBeTruthy();

  await expect.poll(async () => {
    const docs = await request.get("/api/documents");
    const body = await docs.json();
    const row = (body.documents || []).find((doc: { id: string }) => doc.id === documentId);
    return row?.status;
  }).toBe("COMPLETED");

  await page.goto("/chat");
  await page.getByPlaceholder("Ask anything about your knowledge base...").fill("Where are chunks stored?");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByText(/Verified Citations|document_chunks|Note/)).toBeVisible({ timeout: 30_000 });
});

test("embed without a key is unauthorized", async ({ request }) => {
  const response = await request.post("/api/embed/chat", {
    data: { message: "hello" },
  });
  expect(response.status()).toBe(401);
});

test("billing status exposes stripe flag and plan limits", async ({ request }) => {
  const response = await request.get("/api/billing/status");
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(typeof body.stripeEnabled).toBe("boolean");
  expect(body.limits.free.seats).toBe(3);
  expect(body.limits.pro.seats).toBe(10);
  expect(body.limits.pro.monthlyQueries).toBe(100000);
});

test("pricing page shows Pro waitlist or Stripe checkout path", async ({ page }) => {
  await page.goto("/pricing");
  await expect(page.getByRole("heading", { name: /Free Today/i })).toBeVisible();
  const stripeCta = page.getByRole("button", { name: /Upgrade with Stripe/i });
  const waitlistCta = page.getByRole("button", { name: /Join Pro Waitlist/i });
  await expect(stripeCta.or(waitlistCta)).toBeVisible();
});
