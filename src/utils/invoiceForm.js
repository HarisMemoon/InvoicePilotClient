export function getInvoiceItemErrors(items) {
  return items.map((item) => ({
    description:
      typeof item.description === "string" && item.description.trim()
        ? ""
        : "Description required",
    quantity:
      Number.isFinite(Number(item.quantity)) && Number(item.quantity) > 0
        ? ""
        : "Quantity must be greater than 0",
    unit_price:
      item.unit_price !== "" &&
      item.unit_price != null &&
      Number.isFinite(Number(item.unit_price)) &&
      Number(item.unit_price) >= 0
        ? ""
        : "Enter a valid price",
  }));
}

export function toInvoiceItemsPayload(items) {
  return items.map((item) => ({
    description: item.description.trim(),
    quantity: Number(item.quantity),
    unit_price: Number(item.unit_price),
  }));
}
