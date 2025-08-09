"use client";
import { mockStrategies } from "@/lib/mock";
import VideoSlide from "@/app/components/Video/VideoSlide";
import ActionBar from "@/app/components/Video/ActionBar";

export default function FeedPage() {
  return (
    <div className="fixed top-0 bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md no-scrollbar overflow-y-scroll snap-y snap-mandatory overflow-x-hidden">
      <div className="relative">
        {mockStrategies.map((s) => (
          <VideoSlide key={s.id} src={s.videoUrl ?? ""} className="snap-start bg-black">
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute left-3 right-16 bottom-24 text-white">
              <div className="text-[11px] opacity-90">{s.tokenSymbol} • {s.riskLevel}</div>
              <h3 className="text-[17px] font-semibold leading-tight drop-shadow">{s.title}</h3>
              {s.description && (
                <p className="text-[11px] opacity-90 line-clamp-2">{s.description}</p>
              )}
            </div>
            <ActionBar
              strategyId={s.id}
              likeCount={123}
              commentCount={18}
              shareHref={`/strategies/${s.id}`}
              onCopy={() => {
                window.location.href = `/strategies/${s.id}/copy`;
              }}
            />
            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/30 to-transparent" />
          </VideoSlide>
        ))}
      </div>
      <div className="h-[96px]" />
    </div>
  );
}


