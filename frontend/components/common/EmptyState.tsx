import { Search } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

export function EmptyState({
  title = "No Cryptocurrency Selected",
  description = "Select a cryptocurrency from the search selector to begin market analysis and AI price forecasting.",
  icon = <Search className="w-8 h-8 text-blue-400" />,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-gray-900/40 rounded-xl border border-gray-800 border-dashed">
      <div className="w-16 h-16 rounded-full bg-blue-950/50 border border-blue-800/40 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-200 mb-2">{title}</h3>
      <p className="text-sm text-gray-400 max-w-md leading-relaxed">{description}</p>
    </div>
  );
}
