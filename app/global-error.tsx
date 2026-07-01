"use client";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: Props) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          padding: "0 1.5rem",
          textAlign: "center",
          backgroundColor: "#1a1a1a",
          color: "#fffbf5",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "3.5rem",
            fontWeight: 800,
            color: "#de3845",
          }}
        >
          500
        </h1>
        <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700 }}>
          Something went wrong
        </h2>
        <p
          style={{ maxWidth: "28rem", fontSize: "0.875rem", color: "#9ca3af" }}
        >
          An unexpected error occurred. Please try again.
        </p>
        <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.75rem" }}>
          <button
            type="button"
            onClick={reset}
            style={{
              border: "none",
              borderRadius: "0.5rem",
              backgroundColor: "#de3845",
              color: "#fff",
              padding: "0.625rem 1.25rem",
              fontSize: "0.875rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- global-error renders outside the router; a full-reload anchor is the resilient choice */}
          <a
            href="/"
            style={{
              borderRadius: "0.5rem",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#fffbf5",
              padding: "0.625rem 1.25rem",
              fontSize: "0.875rem",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Go home
          </a>
        </div>
        {error.digest && (
          <p
            style={{
              marginTop: "0.5rem",
              fontSize: "0.75rem",
              color: "#6b7280",
            }}
          >
            Ref: {error.digest}
          </p>
        )}
      </body>
    </html>
  );
}
