import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "./Button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/** throw된 값을 Error로 정규화 (문자열 등도 처리) */
function normalizeError(thrown: unknown): Error {
  if (thrown instanceof Error) return thrown;
  if (typeof thrown === "string") return new Error(thrown);
  return new Error(String(thrown));
}

class ErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(thrown: unknown): Partial<State> {
    return { hasError: true, error: normalizeError(thrown) };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState((prev) => (prev.errorInfo ? null : { errorInfo }));
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleRetry = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onRetry={this.handleRetry}
        />
      );
    }
    return this.props.children;
  }
}

// 테마를 사용하려면 함수 컴포넌트로 fallback 렌더
function ErrorFallback({
  error,
  errorInfo,
  onRetry,
}: {
  error: Error;
  errorInfo: ErrorInfo | null;
  onRetry: () => void;
}) {
  const isDev = import.meta.env.DEV;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        backgroundColor: "var(--color-bg)",
        color: "var(--color-text-main)",
      }}
    >
      <div
        className="max-w-md w-full text-center rounded-2xl p-8 shadow-card border"
        style={{
          backgroundColor: "var(--color-bg-card)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="text-6xl mb-4" aria-hidden>
          ⚠️
        </div>
        <h1 className="text-2xl font-bold mb-2">문제가 발생했습니다</h1>
        <p className="text-text-sub mb-4">
          일시적인 오류가 발생했습니다. 새로고침 후 다시 시도해 주세요.
        </p>
        {isDev && (
          <div className="text-left mb-4 space-y-3">
            <pre className="text-sm text-text-muted bg-bg-muted p-4 rounded-lg overflow-auto max-h-24 border border-border">
              {error.message}
            </pre>
            {errorInfo?.componentStack && (
              <details className="text-xs text-text-muted">
                <summary className="cursor-pointer hover:text-text-sub">
                  컴포넌트 스택
                </summary>
                <pre className="mt-2 p-3 bg-bg-muted rounded-lg overflow-auto max-h-32 whitespace-pre-wrap">
                  {errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        )}
        <Button type="button" variant="primary" size="lg" onClick={onRetry}>
          새로고침
        </Button>
      </div>
    </div>
  );
}

export default ErrorBoundaryClass;
