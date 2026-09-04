import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Service Connection Error",
  message,
  onRetry,
  className = "",
}: ErrorStateProps) {
  return (
    <div className={`p-6 bg-red-950/30 border border-red-800/50 rounded-xl flex flex-col items-center text-center max-w-lg mx-auto ${className}`}>
      <div className="w-12 h-12 rounded-full bg-red-900/40 flex items-center justify-center mb-3 text-red-400">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold text-red-200 mb-1">{title}</h3>
      <p className="text-sm text-red-300/80 mb-4 leading-relaxed">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center space-x-2 px-4 py-2 bg-red-800/60 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors border border-red-600/40"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Connection</span>
        </button>
      )}
    </div>
  );
}
