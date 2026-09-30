import { Loading } from "@/components/ui/skeleton";

export default function DiscoverLoading() {
  return (
    <Loading label="Entering Discover" className="grid h-svh place-items-center bg-[#070d1d] text-center">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#a3b0cc]">Discover · Scene 01</p>
        <p className="display mt-4 text-[clamp(44px,7vw,96px)] text-[#f4f6fa]">The Ayiin Evening</p>
        <div className="shimmer shimmer-dark mx-auto mt-8 h-1 w-40 rounded-full" />
      </div>
    </Loading>
  );
}
