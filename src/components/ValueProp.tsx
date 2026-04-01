import FadeIn from "./FadeIn";

export default function ValueProp() {
  return (
    <section className="relative w-full bg-white px-6 py-40 sm:py-52">
      <div className="mx-auto max-w-5xl">

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
            <div className="pl-6 border-l border-neutral-200">
              <p className="text-[15px] font-light leading-[1.9] text-neutral-500">
                Most agencies optimize for activity — impressions, clicks, followers.
                HLM is built differently. Every system we deploy is designed to compound:
                traffic becomes leads, leads become pipeline, pipeline becomes revenue.
              </p>
            </div>
            <div className="pl-6 border-l border-neutral-200">
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
