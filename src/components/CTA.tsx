import FadeIn from "./FadeIn";

export default function CTA() {
  return (
    <section className="relative w-full overflow-hidden bg-white px-6">
      {/* Main CTA area — full viewport height for gravity */}
      <div className="relative flex min-h-screen flex-col items-center justify-center py-40">
        {/* Atmospheric layer 1 — large slow drift */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: "1200px",
            height: "900px",
            background:
              "radial-gradient(ellipse at center, rgba(0,0,0,0.022) 0%, transparent 55%)",
            animation: "drift 30s ease-in-out infinite",
          }}
        />

        {/* Atmospheric layer 2 — smaller, offset, counter-direction */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: "600px",
            height: "400px",
            background:
              "radial-gradient(ellipse at center, rgba(0,0,0,0.015) 0%, transparent 65%)",
            animation: "drift 20s ease-in-out infinite reverse",
          }}
        />

        {/* Convergence lines — suggesting system conclusion */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <svg
            width="400"
            height="400"
            viewBox="0 0 400 400"
            fill="none"
            className="opacity-[0.04]"
          >
            {/* Concentric rings suggesting convergence */}
            <circle cx="200" cy="200" r="180" stroke="currentColor" strokeWidth="0.5" className="text-neutral-500" />
            <circle cx="200" cy="200" r="120" stroke="currentColor" strokeWidth="0.5" className="text-neutral-500" />
            <circle cx="200" cy="200" r="60" stroke="currentColor" strokeWidth="0.5" className="text-neutral-500" />
          </svg>
        </div>

        <div className="relative flex flex-col items-center text-center">
          <FadeIn>
            <div className="mb-14 flex items-center gap-6">
              <div className="h-px w-10 bg-neutral-300" />
              <span className="text-xs font-medium tracking-[0.35em] text-neutral-400">
                START HERE
              </span>
              <div className="h-px w-10 bg-neutral-300" />
            </div>
          </FadeIn>

          <FadeIn delay={120}>
            <h2 className="text-[2.75rem] font-extralight leading-[1.08] tracking-tight text-neutral-900 sm:text-[5rem] max-w-3xl">
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
            <a
              href="mailto:hello@hlm.com"
              className="group relative mt-16 inline-flex items-center gap-4 overflow-hidden rounded-full border border-neutral-200 px-10 py-4 text-sm font-light tracking-widest text-neutral-800 transition-all duration-700 hover:border-neutral-400 hover:tracking-[0.2em]"
            >
              {/* Hover fill */}
              <span className="absolute inset-0 bg-neutral-50 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <span className="relative">START A CONVERSATION</span>
              <span className="relative h-px w-6 bg-neutral-400 transition-all duration-500 group-hover:w-10" />
            </a>
          </FadeIn>

          <FadeIn delay={440}>
            <span className="mt-8 text-xs font-light tracking-wide text-neutral-400">
              hello@hlm.com
            </span>
          </FadeIn>
        </div>
      </div>

      {/* Footer */}
      <div className="mx-auto max-w-5xl border-t border-neutral-100 px-0 py-10">
        <FadeIn delay={100}>
          <div className="flex items-center justify-between">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="HLM"
              className="w-8 opacity-40 mix-blend-multiply"
            />
            <span className="text-[11px] font-light text-neutral-300">
              © {new Date().getFullYear()}
            </span>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
