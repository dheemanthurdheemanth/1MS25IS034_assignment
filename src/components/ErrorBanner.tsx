import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorBannerProps {
  error: string | null;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ error, onRetry, onDismiss }) => {
  if (!error) return null;

  return (
    <div className="p-4 my-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
      <div className="flex-1 text-sm">
        <p className="font-semibold text-red-900">Research Assistant Notice</p>
        <p className="mt-0.5 text-red-700">{error}</p>
        {error.includes('GEMINI_API_KEY') && (
          <p className="mt-2 text-xs text-red-600 bg-red-100/60 p-2 rounded border border-red-200">
            Ensure the <strong>GEMINI_API_KEY</strong> secret is set in the AI Studio Secrets panel.
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-xs text-red-600 hover:text-red-900 px-2 py-1"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
};
