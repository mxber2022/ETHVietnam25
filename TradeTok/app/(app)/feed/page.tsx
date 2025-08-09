"use client";

import Link from "next/link";
import { mockStrategies } from "@/lib/mock";
import VideoSlide from "@/app/components/Video/VideoSlide";

function SlideActions({ id }: { id: string }) {
  return (
    <div className="absolute right-3 bottom-28 flex flex-col items-center gap-4">
      <Link href={`/strategies/${id}`} className="rounded-full bg-[var(--app-card-bg)]/60 text-[var(--app-foreground)] border border-[var(--app-card-border)] px-3 py-2 text-xs font-medium backdrop-blur">
        View
      </Link>
      <Link href={`/strategies/${id}/copy`} className="rounded-full bg-[var(--app-accent)] text-[var(--app-background)] px-3 py-2 text-xs font-medium shadow">
        Copy
      </Link>
    </div>
  );
}

export default function FeedPage() {
  return (
    <div className="fixed inset-0 left-1/2 -translate-x-1/2 w-full max-w-md no-scrollbar overflow-y-scroll snap-y snap-mandatory">
      <div className="relative">
        {mockStrategies.map((s) => (
          <VideoSlide key={s.id} src={s.videoUrl ?? ""} className="snap-start bg-black">
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute left-3 right-20 bottom-24 text-white">
              <div className="text-xs opacity-90">{s.tokenSymbol} • {s.riskLevel}</div>
              <h3 className="text-lg font-semibold leading-tight">{s.title}</h3>
              {s.description && (
                <p className="text-xs opacity-90 line-clamp-2">{s.description}</p>
              )}
            </div>
            <SlideActions id={s.id} />
          </VideoSlide>
        ))}
      </div>
      <div className="h-[96px]" />
    </div>
  );
}


