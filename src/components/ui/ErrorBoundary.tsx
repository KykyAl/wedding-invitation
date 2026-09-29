import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  fallback: ReactNode;
  onError?: (error: Error) => void;
  children: ReactNode;
}

interface State {
  failed: boolean;
}

/** Swaps the WebGL layer for the 2D fallback instead of leaving guests with a blank page. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("3D scene failed, using fallback", error, info.componentStack);
    this.props.onError?.(error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
