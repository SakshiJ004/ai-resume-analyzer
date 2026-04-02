import { Component } from 'react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error('ErrorBoundary caught:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white text-center px-6">
                    <div>
                        <p className="text-5xl mb-4">⚠️</p>
                        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
                        <p className="text-gray-400 text-sm mb-6">{this.state.error?.message}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-indigo-600 hover:bg-indigo-700 px-6 py-2.5 rounded-lg font-semibold transition"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;