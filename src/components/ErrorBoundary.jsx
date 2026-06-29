/**
 * REACT ERROR BOUNDARY
 *
 * Catches JavaScript errors anywhere in the component tree below it,
 * logs the error, and renders a fallback UI instead of crashing the whole app.
 *
 * Without this, a single runtime error anywhere in a page component will
 * produce a blank screen with no feedback for the user.
 *
 * Error boundaries are class components — hooks cannot implement
 * componentDidCatch / getDerivedStateFromError yet.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <SomeComponent />
 *   </ErrorBoundary>
 */

import { Component } from 'react';
import { MdWarning } from 'react-icons/md';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In production, send to an error-monitoring service (e.g., Sentry, Datadog).
    // For now, only log in non-production environments.
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary] Caught error:', error, info);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // Render the custom fallback prop if provided, otherwise the default UI.
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-neutral-200 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <MdWarning className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-neutral-600 text-sm mb-6">
              An unexpected error occurred. Please try refreshing the page.
              {import.meta.env.DEV && this.state.error && (
                <span className="block mt-2 font-mono text-xs text-red-600 text-left bg-red-50 p-2 rounded">
                  {this.state.error.message}
                </span>
              )}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
