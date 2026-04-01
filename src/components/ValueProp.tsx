import FadeIn from "./FadeIn";

export default function ValueProp() {
  return (
    <section className="relative w-full overflow-hidden bg-white px-6 py-40 sm:py-52">
      {/* Ambient drift gradient — slow-moving light beneath content */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: "1100px",
          height: "700px",
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0.025) 0%, transparent 65%)",
          animation: "drift 25s ease-in-out infinite",
        }}
      />

      {/* Decorative floating ring — top right */}
      <div
        className="pointer-events-none absolute -right-20 top-24 opacity-[0.04]"
        style={{ animation: "float 18s ease-in-out infinite" }}
        aria-hidden="true"
      >
        <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="0.5" className="text-neutral-500" />
          <circle cx="100" cy="100" r="40" stroke="currentColor" strokeWidth="0.5" className="text-neutral-500" />
        </svg>
      </div>

      {/* Decorative dot cluster — bottom left */}
      <div className="pointer-events-none absolute bottom-20 left-12 opacity-[0.06]" aria-hidden="true">
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-1 w-1 rounded-full bg-neutral-400" />
          ))}
        </div>
      </div>

      <div className="relative mx-auto max-w-5xl">
        <FadeIn>
          <div className="mb-14 flex items-center gap-6">
            <div className="h-px w-10 bg-neutral-300" />
            <span className="text-xs font-medium tracking-[0.35em] text-neutral-400">
              WHAT WE BUILD
            </span>
          </div>
        </FadeIn>

        <FadeIn delay={120}>
          <h2 className="text-[2.75rem] font-extralight leading-[1.12] tracking-tight text-neutral-900 sm:text-[4.5rem]">
            We don&apos;t run campaigns.
          </h2>
        </FadeIn>

        <FadeIn delay={200}>
          <h2 className="mt-2 text-[2.75rem] font-extralight leading-[1.12] tracking-tight text-neutral-400 sm:text-[4.5rem]">
            We engineer revenue systems.
          </h2>
        </FadeIn>

        <FadeIn delay={320}>
          <div className="mt-20 grid grid-cols-1 gap-12 sm:grid-cols-2 sm:gap-x-20 max-w-4xl">
            <div className="relative pl-6 border-l border-neutral-150">
              <p className="text-[15px] font-light leading-[1.9] text-neutral-500">
                Most agencies optimize for activity — impressions, clicks, followers.
                HLM is built differently. Every system we deploy is designed to compound:
                traffic becomes leads, leads become pipeline, pipeline becomes revenue.
              </p>
            </div>
            <div className="relative pl-6 border-l border-neutral-150">
              <p className="text-[15px] font-light leading-[1.9] text-neutral-500">
                We combine paid distribution, intelligent automation, and AI-driven
                personalization into a single, unified engine. Built once.
                Running always. Improving continuously.
              </p>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
