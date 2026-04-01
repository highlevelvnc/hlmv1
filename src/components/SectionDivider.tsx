import FadeIn from "./FadeIn";

export default function SectionDivider() {
  return (
    <FadeIn className="relative flex flex-col items-center py-2">
      {/* Vertical flow line */}
      <div className="h-16 w-px bg-gradient-to-b from-transparent via-neutral-200 to-transparent" />

      {/* Pulse node */}
      <div className="relative flex items-center justify-center">
        <div className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
        <div
          className="absolute h-1.5 w-1.5 rounded-full bg-neutral-300"
          style={{ animation: "pulse-node 4s ease-in-out infinite" }}
        />
      </div>

      {/* Vertical flow line */}
      <div className="h-16 w-px bg-gradient-to-b from-transparent via-neutral-200 to-transparent" />
    </FadeIn>
  );
}
