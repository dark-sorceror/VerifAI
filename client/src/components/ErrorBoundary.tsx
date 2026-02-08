import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface Props {
    children: ReactNode;
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
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="p-10 text-red-500 bg-black h-screen w-screen overflow-auto">
                    <h1 className="text-2xl font-bold mb-4">
                        Something went wrong.
                    </h1>
                    <pre className="text-sm bg-gray-900 p-4 rounded border border-red-900">
                        {this.state.error?.toString()}
                    </pre>
                    <button
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        onClick={() => window.location.reload()}
                    >
                        Reload App
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
