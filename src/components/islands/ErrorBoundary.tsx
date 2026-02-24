import { Component, type ComponentChildren } from 'preact';

interface Props {
  fallback?: ComponentChildren;
  children: ComponentChildren;
}

interface State {
  hasError: boolean;
}

/**
 * ErrorBoundary — Wraps Preact islands for graceful degradation.
 * A runtime JS error in one island won't crash the static page.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error): void {
    console.error('[Island Error]', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}
