import FadeIn from "./FadeIn";

const pillars = [
  {
    index: "I",
    label: "SYSTEMS, NOT SERVICES",
    body:  "We don't deliver reports. We install revenue infrastructure that runs autonomously, compounds over time, and integrates across your entire operation.",
  },
  {
    index: "II",
    label: "INTELLIGENCE AT EVERY LAYER",
    body:  "AI isn't a feature we offer — it's the operating layer. From the first ad impression to the final conversion, every decision is data-driven and machine-assisted.",
  },
  {
    index: "III",
    label: "FULL-STACK EXECUTION",
    body:  "Strategy, creative, tech, and distribution — all under one roof. No briefing agencies. No coordination overhead. Faster cycle times, tighter feedback loops.",
  },
  {
    index: "IV",
    label: "PERFORMANCE IS THE PRODUCT",
    body:  "We are measured exclusively by outcomes. Pipeline generated, ROAS achieved, cost per acquisition reduced. Everything else is noise.",
  },
];

export default function Differentiation() {
  return (
    <section className="relative w-full bg-white px-6 py-36 sm:py-48">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-24 sm:mb-32">
          <FadeIn>
            <div className="mb-14 flex items-center gap-6">
              <div className="h-px w-10 bg-neutral-300" />
              <span className="text-xs font-medium tracking-[0.35em] text-neutral-400">
                WHY HLM
              </span>
            </div>
          </FadeIn>

          <FadeIn delay={120}>
            <h2 className="max-w-2xl text-[2.5rem] font-extralight leading-[1.12] tracking-tight text-neutral-900 sm:text-[3.5rem]">
              Built for the operators who refuse to settle.
            </h2>
          </FadeIn>
        </div>

        {/* Pillars */}
        <div className="relative grid grid-cols-1 gap-0 sm:grid-cols-2">
          {/* Center rule */}
          <div className="pointer-events-none absolute bottom-0 left-1/2 top-0 hidden w-px -translate-x-1/2 bg-neutral-100 sm:block" />

          {pillars.map((p, i) => (
            <FadeIn key={p.label} delay={i * 100}>
              <div
                className={[
                  "flex flex-col gap-5 py-12",
                  i % 2 === 0 ? "sm:pr-16" : "sm:pl-16",
                  i >= 2      ? "border-t border-neutral-100" : "",
                  i === 1     ? "sm:border-t-0" : "",
                ].join(" ")}
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
