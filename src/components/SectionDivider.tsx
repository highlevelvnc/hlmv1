import FadeIn from "./FadeIn";

export default function SectionDivider() {
  return (
    <FadeIn className="relative flex flex-col items-center py-2">
      {/* Line */}
      <div className="h-16 w-px bg-gradient-to-b from-transparent via-neutral-200 to-transparent" />
      {/* Static node — no pulse */}
      <div className="h-1.5 w-1.5 rounded-full bg-neutral-200" />
      {/* Line */}
      <div className="h-16 w-px bg-gradient-to-b from-transparent via-neutral-200 to-transparent" />
    </FadeIn>
  );
}
