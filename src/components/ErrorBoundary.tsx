"use client";

import React from "react";
import { logError } from "@/lib/logging";

type ErrorBoundaryProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logError(error, { componentStack: errorInfo.componentStack });
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="mx-auto flex min-h-[40vh] max-w-2xl flex-col items-center justify-center gap-3 px-6 py-12 text-center">
            <h2 className="text-lg font-semibold">حصل خطأ غير متوقع</h2>
            <p className="text-sm text-[var(--muted)]">
              من فضلك جرّب تحديث الصفحة أو المحاولة مرة أخرى.
            </p>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
