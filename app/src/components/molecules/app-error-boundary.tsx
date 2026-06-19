import { Component, type ErrorInfo, type ReactNode } from "react";
import { i18n } from "../i18n/config";

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type AppErrorBoundaryState = {
  hasError: boolean;
};

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("App error boundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="feedback-page">
          <section className="feedback-card">
            <p className="eyebrow">{i18n.t("common.status.error")}</p>
            <h1>{i18n.t("common.errorBoundary.title")}</h1>
            <p>{i18n.t("common.errorBoundary.description")}</p>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
