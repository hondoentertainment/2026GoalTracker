import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  section?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  override state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`ErrorBoundary [${this.props.section || 'unknown'}]:`, error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  override render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-8 text-center">
          <AlertTriangle size={32} className="text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-red-400 mb-2">
            {this.props.section ? `${this.props.section} Error` : 'Something went wrong'}
          </h3>
          <p className="text-sm text-slate-400 mb-4">
            This section encountered an error. Your data is safe.
          </p>
          {this.state.error && (
            <p className="text-xs text-slate-600 mb-4 font-mono">
              {this.state.error.message}
            </p>
          )}
          <button
            onClick={this.handleRetry}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-medium text-slate-300 transition-colors"
          >
            <RefreshCw size={14} />
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
