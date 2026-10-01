"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="shell grid min-h-[60vh] place-items-center py-20 text-center">
      <div>
        <p className="eyebrow">Something went wrong</p>
        <h1 className="display mt-3 text-[48px] sm:text-[72px]">That didn&apos;t load.</h1>
        <p className="mx-auto mt-4 max-w-md text-[16px] text-mute">Your cart and saved items are safe. Try again, or head back home.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="btn btn-ink">Try again</button>
          <Link href="/" className="btn btn-ghost">Home</Link>
        </div>
      </div>
    </div>
  );
}
