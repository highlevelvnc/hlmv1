import FadeIn from "./FadeIn";

const metrics = [
  { value: "$42M+", label: "Revenue attributed to HLM systems" },
  { value: "4.8×", label: "Average return on ad spend" },
  { value: "300+", label: "Automated pipelines deployed" },
  { value: "97%", label: "Client retention over 12 months" },
];

const testimonials = [
  {
    quote:
      "HLM didn't pitch us a media plan. They mapped our entire revenue motion and rebuilt it from scratch. Three months in, our cost per acquisition dropped 40%.",
    author: "Founder",
    company: "B2B SaaS — Series A",
  },
  {
    quote:
      "The automation layer alone replaced two full-time SDR positions. The system qualifies, follows up, and books — around the clock.",
    author: "Head of Growth",
    company: "E-commerce",
  },
];

export default function Proof() {
  return (
    <section className="relative w-full overflow-hidden">
      {/* Soft gradient transition in */}
      <div className="h-20 bg-gradient-to-b from-white to-neutral-50/60" />

      <div className="relative bg-neutral-50/60 px-6 py-28 sm:py-40">
        {/* Breathing glow behind metrics area */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/4 -translate-x-1/2"
          style={{
            width: "900px",
            height: "500px",
            background:
              "radial-gradient(ellipse at center, rgba(255,255,255,0.9) 0%, transparent 65%)",
            animation: "breathe 8s ease-in-out infinite",
          }}
        />

        <div className="relative mx-auto max-w-5xl">
          <FadeIn>
            <div className="mb-20 flex items-center gap-6">
              <div className="h-px w-10 bg-neutral-300" />
              <span className="text-xs font-medium tracking-[0.35em] text-neutral-400">
                RESULTS
              </span>
            </div>
          </FadeIn>

          {/* Metrics */}
          <div className="relative mb-32">
            <div className="relative grid grid-cols-2 gap-x-6 gap-y-16 sm:grid-cols-4 sm:gap-x-12">
              {metrics.map((m, i) => (
                <FadeIn key={m.value} delay={i * 100}>
                  <div className="flex flex-col gap-4">
                    <span className="text-[3rem] font-[200] leading-none tracking-tight text-neutral-800 sm:text-[3.5rem]">
                      {m.value}
                    </span>
                    <div className="h-px w-8 bg-neutral-200" />
                    <span className="text-xs font-light leading-[1.7] text-neutral-400">
                      {m.label}
                    </span>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>

          {/* Testimonials */}
          <div className="grid grid-cols-1 gap-y-16 sm:grid-cols-2 sm:gap-x-20">
            {testimonials.map((t, i) => (
              <FadeIn key={i} delay={i * 140}>
                <div className="relative flex flex-col gap-6 pl-8 border-l border-neutral-200">
                  <span
                    className="absolute -left-2 -top-2 text-[3rem] font-extralight leading-none text-neutral-200 select-none"
                    aria-hidden="true"
                  >
                    &ldquo;
                  </span>
                  <p className="text-[15px] font-light leading-[1.9] text-neutral-600">
                    {t.quote}
                  </p>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-normal tracking-wide text-neutral-600">
                      {t.author}
                    </span>
                    <span className="text-[11px] font-light text-neutral-400">
                      {t.company}
                    </span>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>

      {/* Soft gradient transition out */}
      <div className="h-20 bg-gradient-to-b from-neutral-50/60 to-white" />
    </section>
  );
}
