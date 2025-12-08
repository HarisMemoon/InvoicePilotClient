// src/components/PaymentsPDF.jsx
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  pdf,
} from "@react-pdf/renderer";
import { format } from "date-fns";

Font.register({
  family: "Inter",
  src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.ttf",
});

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Inter" },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: "#10b981",
    fontWeight: "bold",
  },
  subtitle: { fontSize: 14, marginBottom: 10, color: "#6b7280" },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tableCol: { width: "16.66%", padding: 8, fontSize: 10 },
  tableHeader: { backgroundColor: "#f3f4f6", fontWeight: "bold" },
  total: { marginTop: 20, fontSize: 16, fontWeight: "bold", color: "#10b981" },
});

export default function PaymentsPDF({ data, total }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Payments Report</Text>
        <Text style={styles.subtitle}>
          Generated on {format(new Date(), "PPP")}
        </Text>
        <Text style={styles.subtitle}>Total Revenue: ${total}</Text>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            {["Date", "Invoice", "Client", "Email", "Amount", "Status"].map(
              (h) => (
                <Text key={h} style={styles.tableCol}>
                  {h}
                </Text>
              )
            )}
          </View>
          {data.map((p) => (
            <View key={p.id} style={styles.tableRow}>
              <Text style={styles.tableCol}>
                {format(new Date(p.paid_at), "MMM d, yyyy")}
              </Text>
              <Text style={styles.tableCol}>{p.invoice_number || "—"}</Text>
              <Text style={styles.tableCol}>{p.client_name || "—"}</Text>
              <Text style={styles.tableCol}>{p.user_email || "—"}</Text>
              <Text style={styles.tableCol}>${p.amount?.toFixed(2)}</Text>
              <Text style={styles.tableCol}>{p.status}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.total}>Grand Total: ${total}</Text>
      </Page>
    </Document>
  );
}
