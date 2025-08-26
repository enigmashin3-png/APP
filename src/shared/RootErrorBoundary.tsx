import { Component, ReactNode } from "react";

export default class RootErrorBoundary extends Component<{ children: ReactNode }, { error?: any }> {
  state = { error: undefined as any };

  static getDerivedStateFromError(error: any) {
    return { error };
  }

  componentDidCatch(error: any, info: any) {
    // eslint-disable-next-line no-console
    console.error("App crashed:", error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ padding: 16 }}>
        <h1>Something went wrong.</h1>
        <p>Check the console for details. Here’s a short message:</p>
        <pre style={{ whiteSpace: "pre-wrap", background: "#111", color: "#eee", padding: 12, borderRadius: 8 }}>
          {String(this.state.error?.message || this.state.error)}
        </pre>
      </div>
    );
  }
}
