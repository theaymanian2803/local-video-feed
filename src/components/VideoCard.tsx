import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, Gauge, ZoomIn, RotateCcw, Volume2, VolumeX } from "lucide-react";

const SPEEDS = [1, 0.5, 0.25] as const;

type Props = {
  src: string;
  name: string;
  active: boolean;
  muted: boolean;
  onToggleMute: () => void;
};

function fmt(t: number) {
  if (!Number.isFinite(t)) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VideoCard({ src, name, active, muted, onToggleMute }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [flash, setFlash] = useState<"play" | "pause" | null>(null);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [scrubbing, setScrubbing] = useState(false);
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
    if (v) v.playbackRate = SPEEDS[speedIdx] ?? 1;
  }, [speedIdx, active]);

  useEffect(() => {
    const v = videoRef.current;
    if (v) v.muted = muted;
  }, [muted]);

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

  const seekBy = (delta: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.min(Math.max(v.currentTime + delta, 0), v.duration || 0);
    setTime(v.currentTime);
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
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onDurationChange={(e) => setDuration(e.currentTarget.duration)}
          onTimeUpdate={(e) => {
            if (!scrubbing) setTime(e.currentTarget.currentTime);
          }}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
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

      {/* bottom bar: title + transport + scrubber */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 pb-6 pt-10">
        <p className="truncate text-sm font-medium text-overlay-foreground drop-shadow">{name}</p>

        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={togglePlay}
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-overlay text-overlay-foreground ring-1 ring-overlay-ring backdrop-blur-md transition active:scale-95"
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? (
              <Pause className="size-4" fill="currentColor" />
            ) : (
              <Play className="size-4" fill="currentColor" />
            )}
          </button>

          <button
            type="button"
            onClick={() => seekBy(-5)}
            className="shrink-0 rounded-full bg-overlay px-2 py-1 text-[11px] font-semibold text-overlay-foreground ring-1 ring-overlay-ring backdrop-blur-md transition active:scale-95"
            aria-label="Back 5 seconds"
          >
            −5s
          </button>

          <span className="shrink-0 text-[11px] tabular-nums text-overlay-foreground/90">
            {fmt(time)}
          </span>

          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.01}
            value={Math.min(time, duration || 0)}
            onPointerDown={() => setScrubbing(true)}
            onPointerUp={() => setScrubbing(false)}
            onChange={(e) => {
              const t = Number(e.target.value);
              setTime(t);
              const v = videoRef.current;
              if (v) v.currentTime = t;
            }}
            aria-label="Seek"
            className="seek-slider h-1 w-full"
          />

          <span className="shrink-0 text-[11px] tabular-nums text-overlay-foreground/70">
            {fmt(duration)}
          </span>

          <button
            type="button"
            onClick={() => seekBy(5)}
            className="shrink-0 rounded-full bg-overlay px-2 py-1 text-[11px] font-semibold text-overlay-foreground ring-1 ring-overlay-ring backdrop-blur-md transition active:scale-95"
            aria-label="Forward 5 seconds"
          >
            +5s
          </button>
        </div>
      </div>

      {/* side controls */}
      <div className="absolute bottom-32 right-3 flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={onToggleMute}
          className="flex size-12 items-center justify-center rounded-full bg-overlay text-overlay-foreground backdrop-blur-md ring-1 ring-overlay-ring transition active:scale-95"
          aria-label={muted ? "Unmute" : "Mute"}
        >
          {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
        </button>

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
