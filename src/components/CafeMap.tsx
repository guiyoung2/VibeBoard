import type { RefObject } from "react";

interface CafeMapProps {
  mapContainerRef: RefObject<HTMLDivElement | null>;
  className?: string;
}

export function CafeMap({ mapContainerRef, className = "" }: CafeMapProps) {
  return (
    <div
      ref={mapContainerRef}
      className={`w-full h-[400px] rounded-xl border border-border overflow-hidden bg-bg-muted ${className}`.trim()}
    />
  );
}
