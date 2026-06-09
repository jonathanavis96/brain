"use client";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 my-4">
      <div className="flex items-start gap-3">
        <span className="text-red-500 text-lg flex-shrink-0" aria-hidden="true">
          !!
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-red-800">Something went wrong</h3>
          <p className="mt-1 text-sm text-red-700">{message}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex-shrink-0 rounded-md bg-red-100 px-3 py-1.5 text-sm font-medium text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
