jest.mock("electron", () => ({
  app: { getPath: () => "/nonexistent" },
  safeStorage: { isEncryptionAvailable: () => false },
}));
jest.mock("../utils/log", () => {
  const logger = { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() };
  return { dbLog: logger };
});
jest.mock("./vendors", () => ({
  getVendorDetail: () => ({
    vendor: { id: 1, root_domain: "example.test", account_email: "person@example.test" },
    company: { email: "privacy@example.test" },
    senders: [], receivedAddresses: [],
  }),
  updateVendor: jest.fn(),
}));
jest.mock("./email", () => ({ sendEmail: jest.fn() }));

import { getDb, initDb, reconnectDb } from "../db";
import { createGdprCase, getGdprCaseById } from "./cases";
import { sendEmail } from "./email";

beforeEach(() => {
  initDb(":memory:", "/nonexistent", "/nonexistent");
  reconnectDb(":memory:");
  getDb().prepare("INSERT INTO vendors (id, root_domain, name) VALUES (1, 'example.test', 'Synthetic company')").run();
  jest.clearAllMocks();
});

it("records a manually sent request without sending mail", () => {
  const created = createGdprCase({
    vendorId: 1, requestType: "deletion", recipientEmail: "privacy@example.test",
    subject: "Deletion request", body: "Synthetic manually sent request.",
  });
  expect(getGdprCaseById(created.id)?.events[0].body).toBe("Synthetic manually sent request.");
  expect(sendEmail).not.toHaveBeenCalled();
});
