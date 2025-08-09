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

      {!isPlaying && (
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


