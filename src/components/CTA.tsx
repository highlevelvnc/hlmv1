"use client";

import { useState } from "react";
import FadeIn from "./FadeIn";
import Orb from "./Orb";

interface FormState  { name: string; email: string; message: string }
interface FormErrors { name?: string; email?: string; message?: string }

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({
  label,
  error,
  active,
  children,
}: {
  label:    string;
  error?:   string;
  active:   boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <label
        className="mb-2.5 text-[10px] font-light tracking-[0.25em] transition-colors duration-200"
        style={{ color: active ? "rgb(64,64,64)" : "rgb(163,163,163)" }}
      >
        {label.toUpperCase()}
      </label>

      {children}

      <div
        className="h-px transition-colors duration-300"
        style={{
          backgroundColor: error   ? "rgba(180,140,120,0.6)"
                         : active  ? "rgb(64,64,64)"
                         :           "rgb(229,229,229)",
        }}
      />

      {error && (
        <span className="mt-1.5 text-[11px] font-light text-neutral-400">{error}</span>
      )}
    </div>
  );
}

// ─── Success ──────────────────────────────────────────────────────────────────

function SuccessMessage() {
  return (
    <div className="flex flex-col items-center gap-5 py-10 text-center">
      <div className="h-px w-10 bg-neutral-300" />
      <p className="text-[15px] font-light leading-[1.85] text-neutral-600">
        Thank you — we&apos;ll be in touch within 24 hours.
      </p>
      <p className="text-[11px] font-light tracking-wide text-neutral-400">
        contato@highlevelmkt.com
      </p>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function CTA() {
  const [form, setForm]               = useState<FormState>({ name: "", email: "", message: "" });
  const [errors, setErrors]           = useState<FormErrors>({});
  const [focused, setFocused]         = useState<string | null>(null);
  const [submitting, setSubmitting]   = useState(false);
  const [submitted, setSubmitted]     = useState(false);
  const [serverError, setServerError] = useState(false);

  const change = (field: keyof FormState, value: string) => {
    setForm(p => ({ ...p, [field]: value }));
    if (errors[field]) setErrors(p => ({ ...p, [field]: undefined }));
  };

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!form.name.trim())                                      e.name    = "Required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email   = "Valid work email required";
    if (form.message.trim().length < 5)                         e.message = "Required";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    setServerError(false);

    try {
      const res = await fetch("/api/contact", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch {
      setServerError(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="relative w-full bg-white px-6">

      {/* ── Main area ── */}
      <div className="relative flex min-h-screen flex-col items-center justify-center py-40">
        {/* Interactive orb — behind all content */}
        <Orb />

        <div className="relative flex w-full flex-col items-center text-center">

          <FadeIn>
            <div className="mb-14 flex items-center gap-6">
              <div className="h-px w-10 bg-neutral-300" />
              <span className="text-xs font-medium tracking-[0.35em] text-neutral-400">START HERE</span>
              <div className="h-px w-10 bg-neutral-300" />
            </div>
          </FadeIn>

          <FadeIn delay={120}>
            <h2 className="max-w-3xl text-[2.75rem] font-extralight leading-[1.08] tracking-tight text-neutral-900 sm:text-[5rem]">
              Ready to build your
              <br />
              revenue system?
            </h2>
          </FadeIn>

          <FadeIn delay={240}>
            <p className="mt-10 max-w-md text-[15px] font-light leading-[1.85] text-neutral-500">
              We work with a select number of operators each quarter.
              If you&apos;re serious about growth, let&apos;s talk.
            </p>
          </FadeIn>

          <FadeIn delay={360}>
            <div className="mt-16 w-full max-w-[420px] text-left">

              {submitted ? (
                <SuccessMessage />
              ) : (
                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">

                  <Field label="Your name" error={errors.name} active={focused === "name"}>
                    <input
                      type="text"
                      value={form.name}
                      autoComplete="name"
                      className="w-full bg-transparent py-2 text-[15px] font-light text-neutral-900 outline-none"
                      onChange={e => change("name", e.target.value)}
                      onFocus={() => setFocused("name")}
                      onBlur={() => setFocused(null)}
                    />
                  </Field>

                  <Field label="Work email" error={errors.email} active={focused === "email"}>
                    <input
                      type="email"
                      value={form.email}
                      autoComplete="email"
                      className="w-full bg-transparent py-2 text-[15px] font-light text-neutral-900 outline-none"
                      onChange={e => change("email", e.target.value)}
                      onFocus={() => setFocused("email")}
                      onBlur={() => setFocused(null)}
                    />
                  </Field>

                  <Field label="What are you building?" error={errors.message} active={focused === "message"}>
                    <textarea
                      value={form.message}
                      rows={2}
                      className="w-full resize-none bg-transparent py-2 text-[15px] font-light leading-[1.7] text-neutral-900 outline-none"
                      onChange={e => change("message", e.target.value)}
                      onFocus={() => setFocused("message")}
                      onBlur={() => setFocused(null)}
                    />
                  </Field>

                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="group w-full py-[18px] text-[11px] font-light tracking-[0.28em] text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
                      style={{ backgroundColor: "rgb(23,23,23)", transition: "background-color 400ms ease" }}
                      onMouseEnter={e => { if (!submitting) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgb(40,40,40)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgb(23,23,23)"; }}
                    >
                      <span className="flex items-center justify-center gap-5">
                        {submitting ? (
                          <>
                            <span className="inline-block h-3 w-3 animate-spin rounded-full border border-white/30 border-t-white/80" />
                            <span>SENDING</span>
                          </>
                        ) : (
                          <>
                            <span>REQUEST A CONVERSATION</span>
                            <span className="h-px w-5 bg-white/50 transition-all duration-500 group-hover:w-8" />
                          </>
                        )}
                      </span>
                    </button>

                    {serverError && (
                      <p className="mt-4 text-center text-[11px] font-light text-neutral-400">
                        Something went wrong. Email us at{" "}
                        <a href="mailto:contato@highlevelmkt.com" className="text-neutral-500 underline underline-offset-2 hover:text-neutral-700">
                          contato@highlevelmkt.com
                        </a>
                      </p>
                    )}
                  </div>

                  <p className="text-center text-[11px] font-light text-neutral-400">
                    Or reach us at{" "}
                    <a href="mailto:contato@highlevelmkt.com" className="transition-colors duration-300 hover:text-neutral-600">
                      contato@highlevelmkt.com
                    </a>
                  </p>

                </form>
              )}
            </div>
          </FadeIn>

        </div>
      </div>

      {/* ── Footer ── */}
      <div className="mx-auto max-w-5xl border-t border-neutral-100 py-10">
        <FadeIn delay={100}>
          <div className="flex items-center justify-between">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="HLM" className="w-8 opacity-40 mix-blend-multiply" />
            <span className="text-[11px] font-light text-neutral-300">© {new Date().getFullYear()}</span>
          </div>
        </FadeIn>
      </div>

    </section>
  );
}
