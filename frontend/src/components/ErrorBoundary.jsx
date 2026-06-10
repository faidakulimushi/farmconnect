import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-8">
          <div className="text-center max-w-md">
            <p className="text-5xl mb-4">⚠️</p>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Something went wrong</h1>
            <p className="text-gray-500 mb-6">The page encountered an error. Please refresh to try again.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
