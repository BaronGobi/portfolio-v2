import { cn } from "@/lib/utils";

type HeroFallbackProps = {
  className?: string;
};

/**
 * Static stand-in for the 3D scene, drawn with CSS only: the same orange core
 * and rings, flattened.
 *
 * It is what the server sends, so it shows instantly. The 3D scene fades in on
 * top once it has loaded. It stays as the final artwork when 3D is skipped:
 * reduced motion, data saver, no WebGL, or a small low-power phone.
 */
export function HeroFallback({ className }: HeroFallbackProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 transition-opacity duration-1000 ease-out",
        className,
      )}
    >
      <div className="absolute top-[25%] left-[56%] size-[64vw] -translate-x-1/2 -translate-y-1/2 md:top-[41%] md:left-[72%] md:size-[60svh]">
        {/* Glow */}
        <div className="absolute -inset-[45%] rounded-full bg-[radial-gradient(closest-side,rgb(255_95_31/0.32),rgb(255_95_31/0.08)_55%,transparent)]" />
        {/* Rings */}
        <div className="absolute inset-0 scale-y-[0.36] rotate-[24deg] rounded-full border border-white/30" />
        <div className="absolute inset-[11%] scale-y-[0.5] -rotate-[38deg] rounded-full border-2 border-white/25" />
        <div className="absolute inset-[22%] scale-y-[0.62] rotate-[72deg] rounded-full border-[3px] border-white/20" />
        {/* Core */}
        <div className="absolute inset-[36%] rounded-full bg-[radial-gradient(circle_at_38%_32%,#ffbf99,#ff5f1f_48%,#c23a05)] shadow-[0_0_80px_rgb(255_95_31/0.55)]" />
        {/* Satellites */}
        <div className="absolute top-[12%] left-[6%] size-[7%] rounded-full border border-white/40 bg-white/10" />
        <div className="absolute right-[2%] bottom-[20%] size-[4.5%] rounded-full bg-[#ff5f1f]" />
        <div className="absolute top-[4%] right-[18%] size-[2.5%] rounded-full bg-[#ff5f1f]" />
      </div>
    </div>
  );
}
