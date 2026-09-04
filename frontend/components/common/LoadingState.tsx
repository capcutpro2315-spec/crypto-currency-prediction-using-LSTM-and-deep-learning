import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = "Loading data...", className = "" }: LoadingStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center bg-gray-900/40 rounded-xl border border-gray-800/80 backdrop-blur-sm ${className}`}>
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
      <p className="text-sm font-medium text-gray-300 animate-pulse">{message}</p>
    </div>
  );
}
