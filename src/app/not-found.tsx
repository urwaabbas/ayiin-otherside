import Link from "next/link";
import { AyiinLogo } from "@/components/brand/ayiin-logo";

export default function NotFound() {
  return (
    <div className="shell grid min-h-[60vh] place-items-center py-20 text-center">
      <div>
        <AyiinLogo on="light" className="mx-auto h-16" />
        <p className="eyebrow mt-8">404</p>
        <h1 className="display mt-3 text-display-sm sm:text-display-lg">
          Nothing to see here.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-body text-mute">
          Which is rare for us. The page may have moved — try searching, or
          describe what you need.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-secondary">
            Home
          </Link>
          <Link href="/search" className="btn btn-primary">
            Browse everything
          </Link>
        </div>
      </div>
    </div>
  );
}
