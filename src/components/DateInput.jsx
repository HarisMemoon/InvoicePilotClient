import { CalendarDays } from "lucide-react";

export default function DateInput({ className = "", ...props }) {
  return (
    <div className={`relative block w-full min-w-0 ${className}`}>
      <CalendarDays
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
      />
      <input
        type="date"
        {...props}
        className={`block w-full min-w-0 max-w-full box-border appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-2 text-base text-gray-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 sm:text-sm ${props.className || ""}`}
      />
    </div>
  );
}
