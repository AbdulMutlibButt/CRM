"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, LockKeyhole, UserRound } from "lucide-react";

export default function LoginScreen({ company, onLogin }: { company: string; onLogin: (username: string, password: string) => Promise<boolean> }) {
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  return (
    <main className="login-shell">
      <div className="login-grid" aria-hidden="true" />
      <div className="login-glow login-glow-one" aria-hidden="true" />
      <div className="login-glow login-glow-two" aria-hidden="true" />

      <svg className="login-network login-network-one" viewBox="0 0 560 560" aria-hidden="true">
        <g className="login-lines">
          <path d="M82 118 194 72l92 80 108-46 82 95-54 112 66 93-124 72-92-81-112 45-79-96 55-111Z" />
          <path d="m194 72-58 163 150-83-14 245 150-84-286-78 228 243 58-165-340 33 312-240" />
        </g>
        <g className="login-nodes">
          <circle cx="82" cy="118" r="10" /><circle cx="194" cy="72" r="16" /><circle cx="286" cy="152" r="10" />
          <circle cx="394" cy="106" r="19" /><circle cx="476" cy="201" r="10" /><circle cx="422" cy="313" r="15" />
          <circle cx="488" cy="406" r="9" /><circle cx="364" cy="478" r="18" /><circle cx="272" cy="397" r="11" />
          <circle cx="160" cy="442" r="18" /><circle cx="81" cy="346" r="10" /><circle cx="136" cy="235" r="20" />
        </g>
      </svg>

      <svg className="login-network login-network-two" viewBox="0 0 320 320" aria-hidden="true">
        <g className="login-lines"><path d="M43 68 142 39l88 61 47 93-70 82-114-5-52-89 101-142 65 236 70-82-234-12 187-81" /></g>
        <g className="login-nodes"><circle cx="43" cy="68" r="8" /><circle cx="142" cy="39" r="13" /><circle cx="230" cy="100" r="9" /><circle cx="277" cy="193" r="13" /><circle cx="207" cy="275" r="10" /><circle cx="93" cy="270" r="14" /><circle cx="41" cy="181" r="8" /></g>
      </svg>

      <section className="login-card" aria-labelledby="login-title">
        <div className="login-brand">
          <span className="login-logo-wrap"><Image src="/speed-vision-logo.jpg" alt="Speed vision logo" width={118} height={82} priority /></span>
          <span><strong>{company}</strong><small>FTTH Broadband Service Provider</small></span>
        </div>

        <div className="login-copy">
          <span className="login-kicker">CRM + ERP WORKSPACE</span>
          <h1 id="login-title">Connect your business.<br /><em>Control every detail.</em></h1>
          <p>Customers, billing, support and network operations—working together in one focused workspace.</p>
        </div>

        <form className="login-form" onSubmit={async event => {
          event.preventDefault();
          if (submitting) return;
          setSubmitting(true);
          const values = new FormData(event.currentTarget);
          const username = String(values.get("username") || "");
          const password = String(values.get("password") || "");
          try {
            if (await onLogin(username, password)) {
              setError("");
              return;
            }
            setError("Incorrect username or password.");
          } catch {
            setError("Login could not be checked. Please refresh and try again.");
          } finally {
            setSubmitting(false);
          }
        }}>
          <label className="login-field"><span>Username</span><span className="login-input-wrap"><UserRound size={18} aria-hidden="true" /><input name="username" autoComplete="username" autoCapitalize="none" spellCheck="false" required placeholder="Enter username" /></span></label>
          <label className="login-field"><span>Password</span><span className="login-input-wrap"><LockKeyhole size={18} aria-hidden="true" /><input name="password" type="password" autoComplete="current-password" required placeholder="Enter password" /></span></label>
          {error && <p className="login-error" role="alert">{error}</p>}
          <button className="login-submit" type="submit" disabled={submitting}>Login <ArrowRight size={18} aria-hidden="true" /></button>
        </form>

        <p className="login-foot">Secure operations workspace <span /> Speed vision</p>
      </section>
    </main>
  );
}
