"use client";

import { useEffect, useRef, useState } from "react";

type VideoSlideProps = {
  src: string;
  className?: string;
  children?: React.ReactNode;
};

export default function VideoSlide({ src, className = "", children }: VideoSlideProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [userPaused, setUserPaused] = useState(false);
  const [muted, setMuted] = useState(true);

  function parseYouTubeId(url: string): string | null {
    try {
      const u = new URL(url);
      const host = u.hostname.replace(/^www\./, "");
      // youtu.be/<id>
      if (host === "youtu.be") {
        const id = u.pathname.split("/").filter(Boolean)[0];
        return id || null;
      }
      if (host.endsWith("youtube.com")) {
        // /watch?v=<id>
        if (u.pathname === "/watch") {
          return u.searchParams.get("v");
        }
        // /shorts/<id>
        if (u.pathname.startsWith("/shorts/")) {
          const id = u.pathname.split("/").filter(Boolean)[1];
          return id || null;
        }
        // /embed/<id>
        if (u.pathname.startsWith("/embed/")) {
          const id = u.pathname.split("/").filter(Boolean)[1];
          return id || null;
        }
      }
    } catch (_) {
      // not a valid URL
    }
    return null;
  }

  const youTubeId = parseYouTubeId(src);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const onIntersect: IntersectionObserverCallback = (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          if (!userPaused) {
            el.play().catch(() => {});
            setIsPlaying(true);
          }
        } else {
          el.pause();
          setIsPlaying(false);
        }
      }
    };

    const observer = new IntersectionObserver(onIntersect, {
      threshold: 0.6,
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [userPaused]);

  const togglePlay = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest("a,button")) return;

    const el = videoRef.current;
    if (!el) return;

    if (isPlaying) {
      el.pause();
      setIsPlaying(false);
      setUserPaused(true);
    } else {
      el.play().catch(() => {});
      setIsPlaying(true);
      setUserPaused(false);
    }
  };

  return (
    <div className={`relative h-[100svh] ${className}`} onClick={togglePlay}>
      {youTubeId ? (
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube.com/embed/${youTubeId}?controls=0&modestbranding=1&rel=0&playsinline=1&autoplay=1&mute=1&loop=1&playlist=${youTubeId}`}
          title="strategy video"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          src={src}
          autoPlay
          muted={muted}
          loop
          playsInline
          preload="metadata"
        />
      )}

      {!youTubeId && !isPlaying && (
        <div className="absolute inset-0 grid place-items-center pointer-events-none">
          <div className="rounded-full bg-black/40 border border-white/30 p-3 backdrop-blur-md">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" className="text-white">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}
      {/* Mute control intentionally removed for now */}

      {children}
    </div>
  );
}


