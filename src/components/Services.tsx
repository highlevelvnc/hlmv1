import FadeIn from "./FadeIn";

const services = [
  {
    index: "01",
    name: "Paid Traffic",
    description:
      "Precision acquisition across Google, Meta, and emerging channels. Every euro tracked from impression to closed deal.",
  },
  {
    index: "02",
    name: "Automation",
    description:
      "End-to-end workflows that capture, qualify, nurture, and close — operating at scale without manual overhead.",
  },
  {
    index: "03",
    name: "AI Solutions",
    description:
      "Custom intelligence layers: lead scoring, predictive routing, dynamic personalization, and continuous optimization.",
  },
  {
    index: "04",
    name: "Landing Pages",
    description:
      "Conversion architecture built for performance. Every element serves the funnel. Nothing decorative.",
  },
  {
    index: "05",
    name: "Content Production",
    description:
      "Strategic content that compounds authority, fuels distribution, and accelerates every stage of the pipeline.",
  },
];

export default function Services() {
  return (
    <section className="relative w-full overflow-hidden">
      {/* Soft gradient transition in — white to neutral-50 */}
      <div className="h-20 bg-gradient-to-b from-white to-neutral-50/60" />

      <div className="bg-neutral-50/60 px-6 py-28 sm:py-40">
        <div className="mx-auto max-w-5xl">
          <FadeIn>
            <div className="mb-20 flex items-center gap-6">
              <div className="h-px w-10 bg-neutral-300" />
              <span className="text-xs font-medium tracking-[0.35em] text-neutral-400">
                CAPABILITIES
              </span>
            </div>
          </FadeIn>

          <div className="space-y-0">
            {services.map((s, i) => (
              <FadeIn key={s.index} delay={i * 70}>
                <div className="group relative grid grid-cols-1 gap-6 border-t border-neutral-200/70 py-12 sm:grid-cols-12 sm:items-baseline sm:gap-8">
                  {/* Index */}
                  <span className="text-[11px] font-light tracking-wider text-neutral-300 sm:col-span-1">
                    {s.index}
                  </span>

                  {/* Name — large, commanding */}
                  <h3 className="text-2xl font-extralight tracking-tight text-neutral-800 transition-colors duration-500 group-hover:text-neutral-500 sm:col-span-4 sm:text-[1.75rem]">
                    {s.name}
                  </h3>

                  {/* Description — offset right */}
                  <p className="text-sm font-light leading-[1.85] text-neutral-500 sm:col-span-6 sm:col-start-7">
                    {s.description}
                  </p>

                  {/* Hover accent line with glow */}
                  <div className="absolute bottom-0 left-0 h-px w-0 bg-neutral-300 transition-all duration-700 group-hover:w-24" />
                  <div className="absolute bottom-0 left-0 h-px w-0 bg-neutral-300/50 blur-sm transition-all duration-700 group-hover:w-32" />
                </div>
              </FadeIn>
            ))}
            {/* Closing border */}
            <div className="border-t border-neutral-200/70" />
          </div>
        </div>
      </div>

      {/* Soft gradient transition out — neutral-50 to white */}
      <div className="h-20 bg-gradient-to-b from-neutral-50/60 to-white" />
    </section>
  );
}
