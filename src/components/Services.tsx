"use client";

import FadeIn from "./FadeIn";
import { useT } from "@/i18n/context";

export default function Services() {
  const t = useT();
  const services = [
    { index: "01", name: t.svc1_name, description: t.svc1_desc },
    { index: "02", name: t.svc2_name, description: t.svc2_desc },
    { index: "03", name: t.svc3_name, description: t.svc3_desc },
    { index: "04", name: t.svc4_name, description: t.svc4_desc },
    { index: "05", name: t.svc5_name, description: t.svc5_desc },
  ];
  return (
    <section className="relative w-full overflow-hidden">
      {/* White → off-white */}
      <div className="h-20 bg-gradient-to-b from-white to-neutral-50/60" />

      <div className="relative bg-neutral-50/60 px-6 py-28 sm:py-40">
        <div className="mx-auto max-w-5xl">

          <FadeIn>
            <div className="mb-20 flex items-center gap-6">
              <div className="h-px w-10 bg-neutral-300" />
              <span className="text-xs font-medium tracking-[0.35em] text-neutral-400">
                {t.svc_tag}
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

                  {/* Name — darkens on hover (correct direction) */}
                  <h3 className="text-2xl font-extralight tracking-tight text-neutral-700 transition-colors duration-500 group-hover:text-neutral-950 sm:col-span-4 sm:text-[1.75rem]">
                    {s.name}
                  </h3>

                  {/* Description */}
                  <p className="text-sm font-light leading-[1.85] text-neutral-500 sm:col-span-6 sm:col-start-7">
                    {s.description}
                  </p>

                  {/* Hover accent line */}
                  <div className="absolute bottom-0 left-0 h-px w-0 bg-neutral-400 transition-all duration-700 group-hover:w-24" />
                </div>
              </FadeIn>
            ))}
            {/* Closing border */}
            <div className="border-t border-neutral-200/70" />
          </div>

        </div>
      </div>

      {/* Off-white → white */}
      <div className="h-20 bg-gradient-to-b from-neutral-50/60 to-white" />
    </section>
  );
}
