"use client";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
}

export function LoadingSpinner({ size = "md", label }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-3",
  }[size];

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div
        className={`animate-spin rounded-full border-gray-300 border-t-blue-600 ${sizeClasses}`}
        role="status"
        aria-label={label || "Loading"}
      />
      {label && <p className="text-sm text-gray-500">{label}</p>}
    </div>
  );
}
