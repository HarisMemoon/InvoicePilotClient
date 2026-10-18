import test from "node:test";
import assert from "node:assert/strict";
import { getInvoiceItemErrors, toInvoiceItemsPayload } from "../src/utils/invoiceForm.js";

test("invoice line item validation rejects blank and invalid values", () => {
  const [errors] = getInvoiceItemErrors([
    { description: "  ", quantity: "", unit_price: "" },
  ]);

  assert.equal(errors.description, "Description required");
  assert.equal(errors.quantity, "Quantity must be greater than 0");
  assert.equal(errors.unit_price, "Enter a valid price");
});

test("invoice line item validation accepts a positive quantity and zero price", () => {
  const [errors] = getInvoiceItemErrors([
    { description: "Consulting", quantity: "2", unit_price: "0" },
  ]);

  assert.deepEqual(errors, { description: "", quantity: "", unit_price: "" });
});

test("invoice payload converts numeric input strings and trims descriptions", () => {
  assert.deepEqual(
    toInvoiceItemsPayload([
      { description: "  Design work ", quantity: "3", unit_price: "12.50" },
    ]),
    [{ description: "Design work", quantity: 3, unit_price: 12.5 }],
  );
});
