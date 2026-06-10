import React from "react";
import { cn } from "@/lib/utils";

type BackgroundVariant = "grid" | "dot" | "grain" | "noise";

interface BackgroundEffectsProps {
  variant?: BackgroundVariant;
  className?: string;
  opacity?: number;
}

export function BackgroundEffects({
  variant = "grid",
  className,
  opacity,
}: BackgroundEffectsProps) {
  const getVariantStyle = (variant: BackgroundVariant): React.CSSProperties => {
    switch (variant) {
      case "grid":
        return {
          backgroundColor: "var(--foreground)",
          opacity: opacity ?? 0.02,
          maskImage: `linear-gradient(to right, black 1px, transparent 1px), linear-gradient(to bottom, black 1px, transparent 1px)`,
          WebkitMaskImage: `linear-gradient(to right, black 1px, transparent 1px), linear-gradient(to bottom, black 1px, transparent 1px)`,
          maskSize: "35px 35px",
          WebkitMaskSize: "35px 35px",
          maskRepeat: "repeat",
          WebkitMaskRepeat: "repeat",
        };

      case "dot":
        return {
          backgroundColor: "var(--foreground)",
          opacity: opacity ?? 0.1,
          maskImage: `radial-gradient(circle, black 1px, transparent 1px)`,
          WebkitMaskImage: `radial-gradient(circle, black 1px, transparent 1px)`,
          maskSize: "18px 18px",
          WebkitMaskSize: "18px 18px",
          maskRepeat: "repeat",
          WebkitMaskRepeat: "repeat",
        };

      case "grain":
        return {
          backgroundColor: "var(--foreground)",
          opacity: opacity ?? 0.05,
          maskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 4 4'%3E%3Cpath d='M1 3h1v1H1V3zm2-2h1v1H3V1z'/%3E%3C/svg%3E")`,
          WebkitMaskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 4 4'%3E%3Cpath d='M1 3h1v1H1V3zm2-2h1v1H3V1z'/%3E%3C/svg%3E")`,
          maskRepeat: "repeat",
          WebkitMaskRepeat: "repeat",
        };

      case "noise":
        return {
          backgroundColor: "var(--foreground)",
          opacity: opacity ?? 0.02,
          maskImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
          WebkitMaskImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
        };
      default:
        return {};
    }
  };

  return (
    <div
      className={cn(
        "absolute inset-0 z-0 pointer-events-none h-full w-full",
        className,
      )}
      style={getVariantStyle(variant)}
      aria-hidden="true"
    />
  );
}
