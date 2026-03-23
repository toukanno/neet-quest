import { Component } from "react";
import type { ReactNode, ErrorInfo } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo);
    // Sentry integration: uncomment when Sentry is configured
    // if (typeof window !== "undefined" && (window as any).Sentry) {
    //   (window as any).Sentry.captureException(error, { extra: errorInfo });
    // }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            background: "#0f172a",
            color: "#e2e8f0",
            fontFamily: "sans-serif",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
            {"\u26A0\uFE0F"}
          </div>
          <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
            エラーが発生しました
          </h1>
          <p
            style={{ color: "#94a3b8", marginBottom: "1.5rem", maxWidth: 400 }}
          >
            ゲームの実行中に問題が発生しました。
            ページを再読み込みしてください。
          </p>
          <p
            style={{
              fontSize: "0.75rem",
              color: "#64748b",
              background: "#1e293b",
              padding: "0.5rem 1rem",
              borderRadius: 6,
              maxWidth: 500,
              wordBreak: "break-all",
              marginBottom: "1.5rem",
            }}
          >
            {this.state.error?.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "0.7rem 2rem",
              border: "2px solid #38bdf8",
              background: "transparent",
              color: "#38bdf8",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            再読み込み
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
