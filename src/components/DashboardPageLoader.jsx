import { LoaderCircle } from "lucide-react";

export default function DashboardPageLoader({
  message = "Loading your workspace...",
  className = "min-h-[48vh]",
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 text-center ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 shadow-inner dark:bg-blue-900/20">
        <span className="absolute inset-0 animate-ping rounded-2xl bg-blue-400/10" />
        <LoaderCircle className="relative h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
      <div>
        <p className="font-semibold text-gray-800 dark:text-gray-100">{message}</p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Please wait while we fetch the latest data.</p>
      </div>
    </div>
  );
}
