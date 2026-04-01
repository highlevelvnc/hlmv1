import FadeIn from "./FadeIn";

const pillars = [
  {
    index: "I",
    label: "SYSTEMS, NOT SERVICES",
    body: "We don't deliver reports. We install revenue infrastructure that runs autonomously, compounds over time, and integrates across your entire operation.",
  },
  {
    index: "II",
    label: "INTELLIGENCE AT EVERY LAYER",
    body: "AI isn't a feature we offer — it's the operating layer. From the first ad impression to the final conversion, every decision is data-driven and machine-assisted.",
  },
  {
    index: "III",
    label: "FULL-STACK EXECUTION",
    body: "Strategy, creative, tech, and distribution — all under one roof. No briefing agencies. No coordination overhead. Faster cycle times, tighter feedback loops.",
  },
  {
    index: "IV",
    label: "PERFORMANCE IS THE PRODUCT",
    body: "We are measured exclusively by outcomes. Pipeline generated, ROAS achieved, cost per acquisition reduced. Everything else is noise.",
  },
];

export default function Differentiation() {
  return (
    <section className="relative w-full overflow-hidden bg-white px-6 py-36 sm:py-48">
      {/* Ambient drift — offset to the right to avoid symmetry */}
      <div
        className="pointer-events-none absolute right-0 top-1/3"
        style={{
          width: "800px",
          height: "600px",
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0.02) 0%, transparent 65%)",
          animation: "drift 30s ease-in-out infinite reverse",
        }}
      />

      {/* Decorative cross-hair — top left */}
      <div
        className="pointer-events-none absolute left-16 top-28 opacity-[0.05]"
        style={{ animation: "float 22s ease-in-out infinite reverse" }}
        aria-hidden="true"
      >
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
          <line x1="30" y1="0" x2="30" y2="60" stroke="currentColor" strokeWidth="0.5" className="text-neutral-500" />
          <line x1="0" y1="30" x2="60" y2="30" stroke="currentColor" strokeWidth="0.5" className="text-neutral-500" />
          <circle cx="30" cy="30" r="12" stroke="currentColor" strokeWidth="0.5" className="text-neutral-500" />
        </svg>
      </div>

      <div className="mx-auto max-w-5xl">
        {/* Header — staggered composition */}
        <div className="mb-24 sm:mb-32">
          <FadeIn>
            <div className="flex items-center gap-6 mb-14">
              <div className="h-px w-10 bg-neutral-300" />
              <span className="text-xs font-medium tracking-[0.35em] text-neutral-400">
                WHY HLM
              </span>
            </div>
          </FadeIn>

          <FadeIn delay={120}>
            <h2 className="text-[2.5rem] font-extralight leading-[1.12] tracking-tight text-neutral-900 sm:text-[3.5rem] max-w-2xl">
              Built for the operators who refuse to settle.
            </h2>
          </FadeIn>
        </div>

        {/* Pillars — numbered, with vertical rule accent */}
        <div className="relative grid grid-cols-1 gap-0 sm:grid-cols-2">
          {/* Center vertical rule on desktop */}
          <div className="pointer-events-none absolute left-1/2 top-0 bottom-0 hidden w-px -translate-x-1/2 bg-neutral-100 sm:block" />

          {pillars.map((p, i) => (
            <FadeIn key={p.label} delay={i * 100}>
              <div
                className={`flex flex-col gap-5 py-12 ${
                  i % 2 === 0 ? "sm:pr-16" : "sm:pl-16"
                } ${i < 2 ? "" : "border-t border-neutral-100"} ${
                  i === 1 ? "sm:border-t-0" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-[11px] font-light tracking-widest text-neutral-300">
                    {p.index}
                  </span>
                  <span className="text-[10px] font-medium tracking-[0.3em] text-neutral-500">
                    {p.label}
                  </span>
                </div>
                <p className="text-[15px] font-light leading-[1.9] text-neutral-500">
                  {p.body}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
