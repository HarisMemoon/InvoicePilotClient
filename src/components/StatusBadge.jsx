export default function StatusBadge({ status }) {
  const colors = {
    draft: "bg-gray-100 text-gray-800",
    sent: "bg-blue-100 text-blue-800",
    paid: "bg-green-100 text-green-800",
    overdue: "bg-red-100 text-red-800",
    cancelled: "bg-yellow-100 text-yellow-800",
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${
        colors[status] || colors.draft
      }`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
