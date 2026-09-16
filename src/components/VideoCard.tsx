import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, Gauge, ZoomIn, RotateCcw } from "lucide-react";

const SPEEDS = [1, 0.5, 0.25] as const;

type Props = {
  src: string;
  name: string;
  active: boolean;
};

export function VideoCard({ src, name, active }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [flash, setFlash] = useState<"play" | "pause" | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTap = useRef(0);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (active) {
      v.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      v.pause();
      v.currentTime = 0;
      setPlaying(false);
    }
  }, [active]);

  useEffect(() => {
    const v = videoRef.current;
    if (v) v.playbackRate = SPEEDS[speedIdx];
  }, [speedIdx, active]);

  const showFlash = (kind: "play" | "pause") => {
    setFlash(kind);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(null), 650);
  };

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      setPlaying(true);
      showFlash("play");
    } else {
      v.pause();
      setPlaying(false);
      showFlash("pause");
    }
  }, []);

  const handleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 280) {
      lastTap.current = 0;
      setZoom((z) => {
        if (z > 1) {
          setOffset({ x: 0, y: 0 });
          return 1;
        }
        return 2;
      });
      return;
    }
    lastTap.current = now;
    setTimeout(() => {
      if (lastTap.current && Date.now() - lastTap.current >= 280) {
        lastTap.current = 0;
        togglePlay();
      }
    }, 290);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (zoom <= 1) return;
    drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    setOffset({ x: d.ox + (e.clientX - d.x), y: d.oy + (e.clientY - d.y) });
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  const resetZoom = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <section className="relative h-[100dvh] w-full snap-start snap-always overflow-hidden bg-background">
      <div
        className="absolute inset-0 touch-none"
        style={{
          transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${zoom})`,
          transition: drag.current ? "none" : "transform 220ms ease-out",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={handleTap}
      >
        <video
          ref={videoRef}
          src={src}
          loop
          playsInline
          preload="metadata"
          className="h-full w-full object-contain"
        />
      </div>

      {/* play/pause flash */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        {flash && (
          <div className="animate-flash rounded-full bg-overlay p-6 backdrop-blur-sm">
            {flash === "play" ? (
              <Play className="size-10 text-overlay-foreground" fill="currentColor" />
            ) : (
              <Pause className="size-10 text-overlay-foreground" fill="currentColor" />
            )}
          </div>
        )}
      </div>

      {/* title */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pb-8">
        <p className="truncate text-sm font-medium text-overlay-foreground drop-shadow">{name}</p>
        {!playing && !flash && (
          <p className="text-xs text-overlay-foreground/70">paused</p>
        )}
      </div>

      {/* side controls */}
      <div className="absolute bottom-24 right-3 flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={() => setSpeedIdx((i) => (i + 1) % SPEEDS.length)}
          className="flex size-12 flex-col items-center justify-center rounded-full bg-overlay text-overlay-foreground backdrop-blur-md ring-1 ring-overlay-ring transition active:scale-95"
          aria-label="Toggle playback speed"
        >
          <Gauge className="size-4" />
          <span className="text-[10px] font-semibold">{SPEEDS[speedIdx]}x</span>
        </button>

        <div className="flex flex-col items-center gap-2 rounded-full bg-overlay px-2 py-3 backdrop-blur-md ring-1 ring-overlay-ring">
          <ZoomIn className="size-4 text-overlay-foreground" />
          <input
            type="range"
            min={1}
            max={4}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            aria-label="Zoom"
            className="zoom-slider h-24"
          />
          <span className="text-[10px] font-semibold text-overlay-foreground">
            {zoom.toFixed(1)}x
          </span>
        </div>

        {zoom > 1 && (
          <button
            type="button"
            onClick={resetZoom}
            className="flex size-10 items-center justify-center rounded-full bg-overlay text-overlay-foreground backdrop-blur-md ring-1 ring-overlay-ring transition active:scale-95"
            aria-label="Reset zoom"
          >
            <RotateCcw className="size-4" />
          </button>
        )}
      </div>
    </section>
  );
}
