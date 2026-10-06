"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { Icon } from "@/components/ui/icon";
import { SignalDot, Eyebrow } from "@/components/ui/signal";
import type { CampaignConfig } from "@/lib/campaigns";

export function CampaignBanner({
  campaign,
  reverse = false,
  className,
}: {
  campaign: CampaignConfig;
  reverse?: boolean;
  className?: string;
}) {
  if (campaign.type === "full-bleed") {
    return (
      <section
        aria-label={campaign.title}
        className={clsx(
          "group relative overflow-hidden rounded-[24px] border border-line bg-ink text-white shadow-[var(--shadow-lift)]",
          className,
        )}
      >
        {/* Background Photograph */}
        {campaign.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={campaign.image}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1800ms] ease-[var(--ease-out-expo)] group-hover:scale-105"
            style={{ objectPosition: campaign.position || "center" }}
          />
        )}

        {/* Ambient Gradient Scrims */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(90deg,rgb(var(--rgb-ink)/0.94)_0%,rgb(var(--rgb-ink)/0.8)_40%,rgb(var(--rgb-ink)/0.4)_75%,transparent_95%)] sm:bg-[linear-gradient(90deg,rgb(var(--rgb-ink)/0.92)_0%,rgb(var(--rgb-ink)/0.75)_45%,rgb(var(--rgb-ink)/0.3)_75%,transparent_90%)]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,166,36,0.18),transparent_60%)]"
        />

        {/* Banner Content */}
        <div className="relative z-10 flex min-h-[380px] flex-col justify-center p-7 sm:min-h-[420px] sm:p-12 lg:min-h-[460px] lg:p-16">
          <div className="max-w-xl">
            {campaign.badge && (
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-meta font-medium text-white backdrop-blur-md">
                <SignalDot tone="brand" live />
                <span className="font-mono uppercase tracking-[0.14em] text-brand">
                  {campaign.kicker}
                </span>
                <span className="text-white/40">·</span>
                <span>{campaign.badge}</span>
              </div>
            )}

            <h2 className="display mt-4 text-balance text-display-sm leading-[0.95] tracking-[-0.03em] text-white sm:text-display-md lg:text-display-lg">
              {campaign.title}
            </h2>

            <p className="mt-4 max-w-lg text-balance text-body leading-relaxed text-white/85 sm:text-emphasis sm:leading-relaxed">
              {campaign.description}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <Link
                href={campaign.cta.href}
                className="btn btn-primary h-12 px-6 text-support font-semibold shadow-[0_4px_16px_rgba(255,166,36,0.3)] transition-transform hover:scale-[1.02]"
              >
                <span>{campaign.cta.label}</span>
                <Icon name="arrowRight" size={16} />
              </Link>

              {campaign.secondaryCta && (
                <Link
                  href={campaign.secondaryCta.href}
                  className="btn h-12 border border-white/30 bg-white/10 px-5 text-support font-medium text-white backdrop-blur-md transition-all hover:border-white hover:bg-white/20 hover:text-white"
                >
                  <span>{campaign.secondaryCta.label}</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Split Composition (Type B)
  return (
    <section
      aria-label={campaign.title}
      className={clsx(
        "group grid overflow-hidden rounded-[24px] border border-line bg-white shadow-[var(--shadow-hair)] transition-shadow duration-300 hover:shadow-[var(--shadow-soft)] lg:grid-cols-12",
        className,
      )}
    >
      {/* Visual Photography Column */}
      <div
        className={clsx(
          "relative min-h-[300px] overflow-hidden bg-mist sm:min-h-[380px] lg:col-span-6 lg:min-h-[460px]",
          reverse ? "lg:order-2" : "lg:order-1",
        )}
      >
        {campaign.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={campaign.image}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1600ms] ease-[var(--ease-out-expo)] group-hover:scale-105"
            style={{ objectPosition: campaign.position || "center" }}
          />
        )}
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.15))]"
        />
        {campaign.badge && (
          <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/90 px-3.5 py-1 text-meta font-medium text-ink shadow-[var(--shadow-hair)] backdrop-blur-md">
            <SignalDot tone="brand" live />
            {campaign.badge}
          </span>
        )}
      </div>

      {/* Editorial Content Column */}
      <div
        className={clsx(
          "flex flex-col justify-center p-7 sm:p-10 lg:col-span-6 lg:p-14 xl:p-16",
          reverse ? "lg:order-1" : "lg:order-2",
        )}
      >
        <div>
          <Eyebrow index={campaign.kicker}>Campaign</Eyebrow>

          <h2 className="display mt-3 text-balance text-heading leading-[0.98] tracking-[-0.03em] sm:text-display-sm lg:text-display-md">
            {campaign.title}
          </h2>

          <p className="mt-4 max-w-lg text-body leading-relaxed text-ink-2">
            {campaign.description}
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3.5 border-t border-line/80 pt-6">
          <Link
            href={campaign.cta.href}
            className="btn btn-primary h-12 px-6 text-support font-semibold shadow-[0_2px_8px_rgb(var(--rgb-brand)/0.3)] transition-transform hover:scale-[1.02]"
          >
            <span>{campaign.cta.label}</span>
            <Icon name="arrowRight" size={16} />
          </Link>

          {campaign.secondaryCta && (
            <Link
              href={campaign.secondaryCta.href}
              className="btn btn-secondary h-12 px-5 text-support font-medium text-ink hover:bg-mist"
            >
              <span>{campaign.secondaryCta.label}</span>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
