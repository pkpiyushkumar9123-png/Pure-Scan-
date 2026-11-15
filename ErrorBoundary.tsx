import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("PureScan Error Boundary caught a rendering exception:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[360px] w-full flex flex-col items-center justify-center p-6 text-center space-y-4 bg-white dark:bg-dark-card rounded-3xl border border-red-200 dark:border-red-900/40 my-4 shadow-xl">
          <div className="w-14 h-14 bg-red-100 dark:bg-red-950/50 rounded-2xl flex items-center justify-center text-red-600 dark:text-red-400">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div className="space-y-1.5 max-w-sm">
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white">Scan Render Safeguard Active</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              An unexpected layout or data anomaly occurred while rendering the scan report.
            </p>
            {this.state.error?.message && (
              <p className="text-[10px] font-mono bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 p-2.5 rounded-xl text-left overflow-x-auto border border-red-100 dark:border-red-900/30">
                {this.state.error.message}
              </p>
            )}
          </div>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              if (this.props.onReset) {
                this.props.onReset();
              }
            }}
            className="px-5 py-2.5 bg-healthy-green hover:bg-[#2db34f] text-white text-xs font-bold rounded-2xl shadow-md flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>RETURN TO SCANNER</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
