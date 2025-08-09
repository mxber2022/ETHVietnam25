"use client";

import Link from "next/link";

function Icon({ name, className = "w-6 h-6" }: { name: "heart" | "comment" | "share" | "profile" | "copy"; className?: string }) {
  switch (name) {
    case "heart":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      );
    case "comment":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
          <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
        </svg>
      );
    case "share":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
          <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
          <path d="M16 6l-4-4-4 4" />
          <path d="M12 2v14" />
        </svg>
      );
    case "copy":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
          <circle cx="12" cy="7" r="4" />
          <path d="M6 21v-2a6 6 0 0 1 12 0v2" />
        </svg>
      );
  }
}

export default function ActionBar({
  strategyId,
  likeCount = 0,
  commentCount = 0,
  shareHref = "#",
  onCopy,
}: {
  strategyId: string;
  likeCount?: number;
  commentCount?: number;
  shareHref?: string;
  onCopy?: () => void;
}) {
  return (
    <div className="absolute right-3 bottom-28 flex flex-col items-center gap-4 text-white">
      <button type="button" className="flex flex-col items-center">
        <span className="grid place-items-center rounded-full w-12 h-12 backdrop-blur-md bg-white/10 border border-white/20 ring-1 ring-white/10 shadow-md">
          <Icon name="heart" />
        </span>
        <span className="text-xs mt-1 opacity-90">{likeCount}</span>
      </button>
      <Link href={`/strategies/${strategyId}`} className="flex flex-col items-center">
        <span className="grid place-items-center rounded-full w-12 h-12 backdrop-blur-md bg-white/10 border border-white/20 ring-1 ring-white/10 shadow-md">
          <Icon name="comment" />
        </span>
        <span className="text-xs mt-1 opacity-90">{commentCount}</span>
      </Link>
      <a href={shareHref} className="flex flex-col items-center">
        <span className="grid place-items-center rounded-full w-12 h-12 backdrop-blur-md bg-white/10 border border-white/20 ring-1 ring-white/10 shadow-md">
          <Icon name="share" />
        </span>
        <span className="text-xs mt-1 opacity-90">Share</span>
      </a>
      <Link href={`/strategies/${strategyId}`} className="flex flex-col items-center">
        <span className="grid place-items-center rounded-full w-12 h-12 backdrop-blur-md bg-white/10 border border-white/20 ring-1 ring-white/10 shadow-md overflow-hidden">
          <Icon name="profile" />
        </span>
      </Link>
      <button type="button" onClick={onCopy} className="flex flex-col items-center">
        <span className="grid place-items-center rounded-full w-12 h-12 backdrop-blur-md bg-white/10 border border-white/20 ring-1 ring-white/10 shadow-md">
          <Icon name="copy" />
        </span>
        <span className="text-xs mt-1 opacity-90">Copy</span>
      </button>
    </div>
  );
}


