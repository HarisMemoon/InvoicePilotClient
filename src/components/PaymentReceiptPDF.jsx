import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 44, fontFamily: "Helvetica", color: "#172033" },
  title: { fontSize: 25, marginBottom: 6, color: "#047857" },
  subtitle: { fontSize: 11, color: "#64748b", marginBottom: 28 },
  section: { borderBottomWidth: 1, borderBottomColor: "#e2e8f0", paddingVertical: 11 },
  label: { fontSize: 9, color: "#64748b", marginBottom: 4 },
  value: { fontSize: 12 },
  total: { marginTop: 20, fontSize: 18, color: "#047857" },
  footer: { position: "absolute", bottom: 40, fontSize: 9, color: "#64748b" },
});

export default function PaymentReceiptPDF({ receipt }) {
  const { invoice, amount_paid, currency, paid_at, payment_reference } = receipt;
  const money = new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount_paid);
  return (
    <Document title={`Receipt ${invoice.invoice_number}`}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Payment receipt</Text>
        <Text style={styles.subtitle}>InvoicePilot · Payment confirmed</Text>
        <View style={styles.section}><Text style={styles.label}>RECEIPT FOR</Text><Text style={styles.value}>{invoice.clients?.name || "Client"}</Text></View>
        <View style={styles.section}><Text style={styles.label}>INVOICE</Text><Text style={styles.value}>{invoice.invoice_number}</Text></View>
        <View style={styles.section}><Text style={styles.label}>DATE PAID</Text><Text style={styles.value}>{new Date(paid_at).toLocaleString()}</Text></View>
        <View style={styles.section}><Text style={styles.label}>PAYMENT REFERENCE</Text><Text style={styles.value}>{payment_reference}</Text></View>
        <Text style={styles.total}>Amount paid: {money}</Text>
        <Text style={styles.footer}>This receipt confirms payment for invoice {invoice.invoice_number}.</Text>
      </Page>
    </Document>
  );
}
