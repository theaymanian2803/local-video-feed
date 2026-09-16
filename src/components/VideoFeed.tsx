import { useEffect, useRef, useState } from "react";
import { VideoCard } from "./VideoCard";

export type Clip = { id: string; url: string; name: string };

export function VideoFeed({ clips }: { clips: Clip[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

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

  return (
    <div
      ref={containerRef}
      className="h-[100dvh] w-full snap-y snap-mandatory overflow-y-scroll overscroll-y-contain bg-background no-scrollbar"
    >
      {clips.map((clip, i) => (
        <div key={clip.id} data-index={i}>
          <VideoCard src={clip.url} name={clip.name} active={i === activeIdx} />
        </div>
      ))}
    </div>
  );
}
