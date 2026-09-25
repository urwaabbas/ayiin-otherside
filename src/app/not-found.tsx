import Link from "next/link";
import { AyiinSymbol } from "@/components/brand/logo";

export default function NotFound() {
  return (
    <div className="shell grid min-h-[60vh] place-items-center py-20 text-center">
      <div>
        <AyiinSymbol tone="ink" lens="ink" tight className="mx-auto h-16" />
        <p className="eyebrow mt-8">404</p>
        <h1 className="display mt-3 text-[48px] sm:text-[80px]">Nothing to see here.</h1>
        <p className="mx-auto mt-4 max-w-md text-[16px] text-mute">Which is rare for us. The page may have moved — try searching, or describe what you need.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-ink">Home</Link>
          <Link href="/search" className="btn btn-ghost">Browse everything</Link>
        </div>
      </div>
    </div>
  );
}
