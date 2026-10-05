"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  if (done)
    return (
      <p className="mt-5 flex items-center gap-2 text-support text-porcelain" role="status">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-brand text-ink">
          <Icon name="check" size={14} strokeWidth={2.2} />
        </span>
        You&apos;re in. First Brief arrives Friday.
      </p>
    );
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (/\S+@\S+\.\S+/.test(email)) setDone(true);
      }}
      className="mt-5 flex max-w-sm items-center gap-2 rounded-full border border-graphite-line bg-graphite p-1.5 focus-within:border-mute-dark"
    >
      <label htmlFor="newsletter" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.com"
        className="h-10 min-w-0 flex-1 bg-transparent px-3 text-support text-porcelain outline-none placeholder:text-mute-dark"
      />
      <button type="submit" className="btn btn-primary">
        Subscribe
      </button>
    </form>
  );
}
