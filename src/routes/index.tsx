import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { FolderOpen, Film, Plus, X } from "lucide-react";
import { VideoFeed, type Clip } from "@/components/VideoFeed";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Loop — Local Vertical Video Feed" },
      {
        name: "description",
        content:
          "Play your own local videos in a full-screen vertical snap feed with slow motion, zoom and pan controls.",
      },
      { property: "og:title", content: "Loop — Local Vertical Video Feed" },
      {
        property: "og:description",
        content:
          "A private, offline TikTok-style player for videos stored on your own machine.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const VIDEO_RE = /\.(mp4|webm|mov|m4v|ogv)$/i;

function Index() {
  const [clips, setClips] = useState<Clip[]>([]);
  const folderRef = useRef<HTMLInputElement>(null);
  const filesRef = useRef<HTMLInputElement>(null);
  const urlsRef = useRef<string[]>([]);

  useEffect(() => {
    const el = folderRef.current;
    if (el) {
      el.setAttribute("webkitdirectory", "");
      el.setAttribute("directory", "");
    }
  }, []);

  useEffect(
    () => () => {
      urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    },
    [],
  );

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const next: Clip[] = [];
    Array.from(list).forEach((file, i) => {
      if (!VIDEO_RE.test(file.name) && !file.type.startsWith("video/")) return;
      const url = URL.createObjectURL(file);
      urlsRef.current.push(url);
      next.push({ id: `${file.name}-${file.size}-${i}-${Date.now()}`, url, name: file.name });
    });
    next.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    setClips((prev) => [...prev, ...next]);
  };

  const closeFeed = () => {
    urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    urlsRef.current = [];
    setClips([]);
  };

  if (clips.length > 0) {
    return (
      <main className="relative">
        <VideoFeed clips={clips} />
        <button
          type="button"
          onClick={closeFeed}
          className="absolute left-3 top-4 z-10 flex size-10 items-center justify-center rounded-full bg-overlay text-overlay-foreground ring-1 ring-overlay-ring backdrop-blur-md transition active:scale-95"
          aria-label="Close feed and go home"
        >
          <X className="size-5" />
        </button>
        <button
          type="button"
          onClick={() => filesRef.current?.click()}
          className="absolute right-3 top-4 flex size-10 items-center justify-center rounded-full bg-overlay text-overlay-foreground ring-1 ring-overlay-ring backdrop-blur-md transition active:scale-95"
          aria-label="Add more videos"
        >
          <Plus className="size-5" />
        </button>
        <Inputs folderRef={folderRef} filesRef={filesRef} onChange={addFiles} />
      </main>
    );
  }

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-overlay ring-1 ring-overlay-ring">
        <Film className="size-7 text-foreground" />
      </div>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-foreground">
        Your videos, your feed
      </h1>
      <p className="mt-3 max-w-sm text-sm text-muted-foreground">
        Load videos straight from this machine. Nothing is uploaded — everything plays locally.
      </p>

      <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
        <button
          type="button"
          onClick={() => folderRef.current?.click()}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground transition active:scale-[0.98]"
        >
          <FolderOpen className="size-4" />
          Select folder
        </button>
        <button
          type="button"
          onClick={() => filesRef.current?.click()}
          className="flex items-center justify-center gap-2 rounded-xl bg-overlay px-5 py-3.5 text-sm font-semibold text-foreground ring-1 ring-overlay-ring transition active:scale-[0.98]"
        >
          <Film className="size-4" />
          Choose videos
        </button>
      </div>

      <p className="mt-6 text-xs text-muted-foreground">MP4 · WebM · MOV</p>
      <Inputs folderRef={folderRef} filesRef={filesRef} onChange={addFiles} />
    </main>
  );
}

function Inputs({
  folderRef,
  filesRef,
  onChange,
}: {
  folderRef: React.RefObject<HTMLInputElement | null>;
  filesRef: React.RefObject<HTMLInputElement | null>;
  onChange: (list: FileList | null) => void;
}) {
  return (
    <>
      <input
        ref={folderRef}
        type="file"
        multiple
        hidden
        onChange={(e) => {
          onChange(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={filesRef}
        type="file"
        multiple
        accept="video/*,.mp4,.webm,.mov,.m4v"
        hidden
        onChange={(e) => {
          onChange(e.target.files);
          e.target.value = "";
        }}
      />
    </>
  );
}
