type ErrorContext = Record<string, unknown>;

export function logError(error: unknown, context?: ErrorContext) {
  const payload = {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    context: context ?? {},
  };

  if (process.env.NODE_ENV !== "production") {
    console.error("[hrtaj] error", payload);
    return;
  }

  // Hook for future monitoring integration (Sentry/Datadog/etc.)
  console.error("[hrtaj] error", payload);
}
