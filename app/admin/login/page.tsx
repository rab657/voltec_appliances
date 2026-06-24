"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setBusy(false);
    if (res.ok) {
      router.push(search.get("next") || "/admin");
      router.refresh();
    } else {
      setError("Incorrect password. Please try again.");
    }
  }

  return (
    <div style={{ maxWidth: 380, margin: "120px auto", padding: "0 24px" }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 40, letterSpacing: "-0.02em", marginBottom: 6 }}>
        Editor login
      </div>
      <p style={{ color: "var(--ink-3)", fontSize: 14, marginBottom: 24 }}>
        Enter the admin password to manage the Voltec journal.
      </p>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Admin password"
          style={{ padding: "12px 14px", border: "1px solid var(--rule-strong)", borderRadius: 4, background: "var(--paper)" }}
        />
        {error && (
          <div className="mono" style={{ fontSize: 12, color: "var(--warn)" }}>
            {error}
          </div>
        )}
        <button className="btn btn-primary" disabled={busy} style={{ justifyContent: "center" }}>
          {busy ? "Checking…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
