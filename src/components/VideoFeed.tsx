import { useEffect, useRef, useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { VideoCard } from "./VideoCard";

export type Clip = { id: string; url: string; name: string };

export function VideoFeed({ clips }: { clips: Clip[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            const idx = Number((entry.target as HTMLElement).dataset["index"]);
            setActiveIdx(idx);
          }
        }
      },
      { root, threshold: [0.61] },
    );
    root.querySelectorAll("[data-index]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [clips]);

  const goTo = (idx: number) => {
    const root = containerRef.current;
    if (!root) return;
    const next = Math.min(Math.max(idx, 0), clips.length - 1);
    root.scrollTo({ top: next * root.clientHeight, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="h-[100dvh] w-full snap-y snap-mandatory overflow-y-scroll overscroll-y-contain bg-background no-scrollbar"
      >
        {clips.map((clip, i) => (
          <div key={clip.id} data-index={i}>
            <VideoCard
              src={clip.url}
              name={clip.name}
              active={i === activeIdx}
              muted={muted}
              onToggleMute={() => setMuted((m) => !m)}
            />
          </div>
        ))}
      </div>

      {/* up / down navigation */}
      <div className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 flex-col gap-3">
        <button
          type="button"
          onClick={() => goTo(activeIdx - 1)}
          disabled={activeIdx === 0}
          className="pointer-events-auto flex size-11 items-center justify-center rounded-full bg-overlay text-overlay-foreground ring-1 ring-overlay-ring backdrop-blur-md transition active:scale-95 disabled:opacity-30"
          aria-label="Previous video"
        >
          <ChevronUp className="size-5" />
        </button>
        <button
          type="button"
          onClick={() => goTo(activeIdx + 1)}
          disabled={activeIdx >= clips.length - 1}
          className="pointer-events-auto flex size-11 items-center justify-center rounded-full bg-overlay text-overlay-foreground ring-1 ring-overlay-ring backdrop-blur-md transition active:scale-95 disabled:opacity-30"
          aria-label="Next video"
        >
          <ChevronDown className="size-5" />
        </button>
      </div>
    </div>
  );
}
