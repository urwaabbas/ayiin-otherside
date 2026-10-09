"use client";

import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { useGSAP } from "@gsap/react";
import { heroItems, type HeroItem } from "./hero-data";
import { motionProfiles } from "./motion-profiles";
import { ProductStage } from "./ProductStage";
import { CategoryCopy } from "./CategoryCopy";
import { HeroProgress } from "./HeroProgress";
import styles from "./hero.module.css";

gsap.registerPlugin(useGSAP, MotionPathPlugin);

type Direction = 1 | -1;

type Controller = {
  select: (index: number) => void;
  step: (dir: Direction) => void;
  setPlaying: (playing: boolean) => void;
};

const NEUTRAL = { x: 0, y: 0, z: 0, rotationX: 0, rotationY: 0, rotationZ: 0, scale: 1 };

export function Hero({ items = heroItems }: { items?: HeroItem[] }) {
  const root = useRef<HTMLElement>(null);
  const controller = useRef<Controller | null>(null);

  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [announcement, setAnnouncement] = useState("");
  // Current + next product load up front; the rest follow once the page is idle.
  const [mounted, setMounted] = useState<ReadonlySet<number>>(() => new Set([0, 1]));

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      const q = gsap.utils.selector(el);
      const scenes = q("[data-scene]") as HTMLElement[];
      const idles = q("[data-idle]") as HTMLElement[];
      const copies = q("[data-copy]") as HTMLElement[];
      const headings = q("[data-heading]") as HTMLElement[];
      const descs = q("[data-desc]") as HTMLElement[];
      const fills = q("[data-fill]") as HTMLElement[];
      const [stage] = q("[data-stage]") as HTMLElement[];
      const [rig] = q("[data-rig]") as HTMLElement[];
      const [track] = q("[data-track]") as HTMLElement[];
      const [shadow] = q("[data-shadow]") as HTMLElement[];
      const [count] = q("[data-count]") as HTMLElement[];
      const bgs = q("[data-bg]") as HTMLElement[];
      const ghosts = q("[data-ghost]") as HTMLElement[];

      const total = items.length;
      const wrap = gsap.utils.wrap(0, total);
      const profileOf = (i: number) => motionProfiles[items[i].animationProfile];
      const visualOf = (i: number) =>
        scenes[i].querySelector<HTMLImageElement>("[data-visual]");

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
      const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
      const smallScreen = window.matchMedia("(max-width: 640px)");

      let current = 0;
      let isPlaying = !reduceMotion.matches;
      let timeline: gsap.core.Timeline | null = null;
      let pending: { target: number; dir: Direction } | null = null;
      let hold: gsap.core.Tween | null = null;
      let idle: gsap.core.Animation[] = [];
      let onScreen = true;
      let dragging = false;

      /* ------------------------------------------------------- playback */

      const syncPlayback = () => {
        const run = onScreen && !document.hidden && !dragging;
        hold?.paused(!run);
        idle.forEach((t) => t.paused(!run));
      };

      const startIdle = (i: number, delay = 0) => {
        idle.forEach((t) => t.kill());
        idle = [];
        if (reduceMotion.matches) return;
        const { float, sway, period } = profileOf(i).idle;
        const target = idles[i];
        idle = [
          gsap.to(target, {
            y: -float,
            duration: period / 2,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            delay,
          }),
          // the shadow tightens as the product lifts
          gsap.to(shadow, {
            scaleX: 0.93,
            duration: period / 2,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            delay,
          }),
          gsap
            .timeline({ delay })
            .to(target, { rotationY: sway, duration: period * 0.55, ease: "sine.out" })
            .to(target, {
              rotationY: -sway,
              duration: period * 1.1,
              ease: "sine.inOut",
              repeat: -1,
              yoyo: true,
            }),
          // a second, slower axis so the motion never reads as a loop
          gsap.fromTo(
            target,
            { rotationX: -sway * 0.45 },
            {
              rotationX: sway * 0.45,
              duration: period * 0.83,
              ease: "sine.inOut",
              repeat: -1,
              yoyo: true,
              delay,
              immediateRender: false,
            },
          ),
        ];
        syncPlayback();
      };

      const stopIdle = (i: number) => {
        idle.forEach((t) => t.kill());
        idle = [];
        gsap.to(idles[i], { y: 0, rotationY: 0, rotationX: 0, duration: 0.4, ease: "power2.out" });
        gsap.to(shadow, { scaleX: 1, duration: 0.4, ease: "power2.out" });
      };

      /** Runs `then` once the product image for `i` is decoded (or gives up waiting). */
      const whenReady = (i: number, then: () => void) => {
        const img = visualOf(i);
        if (!img || (img.complete && img.naturalWidth > 0)) return then();
        let done = false;
        const finish = () => {
          if (done) return;
          done = true;
          then();
        };
        img.decode().then(finish, finish);
        gsap.delayedCall(3, finish);
      };

      const startHold = (i: number) => {
        hold?.kill();
        hold = null;
        gsap.set(fills, { scaleX: 0 });
        if (!isPlaying) {
          gsap.set(fills[i], { scaleX: 1 });
          return;
        }
        hold = gsap.fromTo(
          fills[i],
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: profileOf(i).hold,
            ease: "none",
            onComplete: () => {
              const next = wrap(current + 1);
              whenReady(next, () => go(next, 1));
            },
          },
        );
        syncPlayback();
      };

      /* ----------------------------------------------------- transition */

      const go = (rawTarget: number, dir: Direction) => {
        const target = wrap(rawTarget);

        // Mid-transition: finish the current move quickly, then honour the request.
        if (timeline?.isActive()) {
          pending = { target, dir };
          timeline.timeScale(2.6);
          return;
        }
        if (target === current) return;

        if (!visualOf(target)) {
          flushSync(() => setMounted(new Set(items.map((_, i) => i))));
        }

        const from = current;
        current = target;
        el.dataset.started = "";
        setActive(target);

        hold?.kill();
        hold = null;
        gsap.set(fills, { scaleX: 0 });
        stopIdle(from);

        const outScene = scenes[from];
        const inScene = scenes[target];
        const outVisual = visualOf(from);
        const inVisual = visualOf(target);
        const outP = profileOf(from);
        const inP = profileOf(target);

        const done = () => {
          gsap.set(outScene, { visibility: "hidden", ...NEUTRAL });
          gsap.set(bgs[from], { opacity: 0 });
          gsap.set(copies[from], { visibility: "hidden" });
          timeline = null;
          startIdle(target);
          if (pending) {
            const next = pending;
            pending = null;
            go(next.target, next.dir);
          } else {
            startHold(target);
          }
        };

        const tl = gsap.timeline({ onComplete: done });
        timeline = tl;

        gsap.set(inScene, { visibility: "visible" });
        gsap.set(copies[target], { visibility: "visible" });

        tl.to(count, { yPercent: (-100 / total) * target, duration: 0.7, ease: "power3.inOut" }, 0.2);
        // Backdrop and ghost word cross-fade. Each colour is its own layer, so
        // this is opacity only and never repaints the hero.
        gsap.set(bgs[from], { zIndex: 0 });
        gsap.set(bgs[target], { zIndex: 1, opacity: 0 });
        tl.to(bgs[target], { opacity: 1, duration: 0.85, ease: "sine.inOut" }, 0)
          .to(ghosts[from], { opacity: 0, duration: 0.4, ease: "power1.in" }, 0)
          .fromTo(
            ghosts[target],
            { opacity: 0 },
            { opacity: 1, duration: 0.8, ease: "power1.out" },
            0.15,
          );

        /* Reduced motion: opacity and a breath of scale, nothing spatial. */
        if (reduceMotion.matches) {
          gsap.set(inScene, NEUTRAL);
          tl.to([outVisual, headings[from], descs[from]], { opacity: 0, duration: 0.3, ease: "power1.out" }, 0)
            .set(shadow, { "--w": items[target].shadow }, 0.3)
            .set(ghosts[target], { xPercent: 0 }, 0)
            .fromTo(
              inVisual,
              { opacity: 0, scale: 0.98 },
              { opacity: 1, scale: 1, duration: 0.45, ease: "power1.out" },
              0.3,
            )
            .fromTo(
              [headings[target], descs[target]],
              { opacity: 0, yPercent: 0, y: 0, visibility: "visible" },
              { opacity: 1, duration: 0.45, ease: "power1.out" },
              0.3,
            );
          return;
        }

        const small = smallScreen.matches;
        const W = stage.offsetWidth;
        const H = stage.offsetHeight;
        const o = outP.tempo;
        const n = inP.tempo;
        // The two products trace one U at the same moment: one up the far
        // arm, the other down the near arm. `reach` is how far out the arms
        // stand, `rise` how high they go (both clear the viewport).
        const reach = W * (small ? 0.86 : 0.6);
        const rise = H * 0.78;
        const dip = H * 0.07;
        const far = small ? 0.62 : 0.5;
        // One duration and one ease for both, so they move as if on the same
        // wheel: halfway through, one is halfway out and the other halfway in.
        const travel = 0.95 * ((o + n) / 2);
        const leave = travel;
        const land = travel;

        /* --- current product: out of the centre, up the far arm --- */
        tl.to(
          outScene,
          {
            motionPath: {
              path: [
                { x: -dir * reach * 0.34, y: dip },
                { x: -dir * reach * 0.88, y: -rise * 0.14 },
                { x: -dir * reach, y: -rise },
              ],
              curviness: 1.25,
            },
            scale: far,
            rotationY: -dir * outP.travelTurn * 1.3,
            rotationX: 9,
            rotationZ: -dir * 13,
            duration: leave,
            ease: "power2.inOut",
          },
          0,
        )
          .to(outVisual, { opacity: 0, duration: leave * 0.42, ease: "sine.in" }, leave * 0.36)
          .to(shadow, { opacity: 0, duration: 0.22, ease: "power1.in" }, 0)
          .to(ghosts[from], { xPercent: -dir * 6, duration: 0.45, ease: "power2.in" }, 0);

        /* --- next product: down the near arm, settling into the centre --- */
        gsap.set(inScene, {
          x: dir * reach,
          y: -rise,
          z: 0,
          scale: far,
          rotationY: dir * inP.travelTurn * 1.4,
          rotationX: 11,
          rotationZ: dir * 14,
        });
        gsap.set(inVisual, { opacity: 0 });

        tl.to(
          inScene,
          {
            motionPath: {
              path: [
                { x: dir * reach * 0.88, y: -rise * 0.14 },
                { x: dir * reach * 0.34, y: dip },
                { x: 0, y: 0 },
              ],
              curviness: 1.25,
            },
            scale: 1,
            duration: land,
            ease: "power2.inOut",
          },
          0,
        )
          // the turn carries a touch past true and comes back
          .to(
            inScene,
            { rotationY: 0, rotationX: 0, rotationZ: 0, duration: land * 0.9, ease: "back.out(1.4)" },
            land * 0.3,
          )
          .to(inVisual, { opacity: 1, duration: land * 0.35, ease: "sine.out" }, land * 0.12)
          .fromTo(
            ghosts[target],
            { xPercent: dir * 6 },
            { xPercent: 0, duration: 0.95, ease: "power3.out" },
            0.1,
          )
          .set(shadow, { "--w": items[target].shadow }, 0.3)
          .to(shadow, { opacity: 1, duration: 0.55, ease: "power2.out" }, land * 0.62);

        /* --- copy: masked exit up, masked reveal up, description trails --- */
        tl.to(headings[from], { yPercent: -130, duration: 0.38, ease: "power2.in" }, 0)
          .to(descs[from], { opacity: 0, y: -6, duration: 0.28, ease: "power1.in" }, 0)
          .fromTo(
            headings[target],
            { yPercent: 106, opacity: 1 },
            { yPercent: 0, duration: 0.8, ease: "expo.out" },
            0.3,
          )
          .fromTo(
            descs[target],
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
            0.42,
          );
      };

      /* ---------------------------------------------------- input: pointer */

      const tiltY = gsap.quickTo(rig, "rotationY", { duration: 0.9, ease: "power3.out" });
      const tiltX = gsap.quickTo(rig, "rotationX", { duration: 0.9, ease: "power3.out" });
      const shiftX = gsap.quickTo(rig, "x", { duration: 0.9, ease: "power3.out" });
      const shiftY = gsap.quickTo(rig, "y", { duration: 0.9, ease: "power3.out" });

      const shadowX = gsap.quickTo(shadow, "x", { duration: 0.9, ease: "power3.out" });

      const resetParallax = () => {
        tiltY(0);
        tiltX(0);
        shiftX(0);
        shiftY(0);
        shadowX(0);
      };

      let startX = 0;
      let startT = 0;
      let pointerId: number | null = null;

      const releaseTrack = () =>
        gsap.to(track, { x: 0, rotationY: 0, duration: 0.7, ease: "power3.out", overwrite: true });

      const onPointerDown = (e: PointerEvent) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        if ((e.target as Element).closest("a, button")) return;
        pointerId = e.pointerId;
        startX = e.clientX;
        startT = e.timeStamp;
      };

      const onPointerMove = (e: PointerEvent) => {
        if (pointerId === e.pointerId) {
          const dx = e.clientX - startX;
          if (!dragging && Math.abs(dx) > 8) {
            dragging = true;
            syncPlayback();
          }
          if (dragging && !reduceMotion.matches) {
            gsap.to(track, {
              x: dx * 0.16,
              rotationY: gsap.utils.clamp(-9, 9, dx * 0.028),
              duration: 0.35,
              ease: "power2.out",
              overwrite: true,
            });
          }
          return;
        }
        // parallax: mouse only, and never while reduced motion is on
        if (e.pointerType !== "mouse" || !finePointer.matches || reduceMotion.matches) return;
        const rect = el.getBoundingClientRect();
        const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
        tiltY(nx * 5);
        tiltX(-ny * 3);
        shiftX(nx * 12);
        shiftY(ny * 7);
        shadowX(nx * -9);
      };

      const onPointerUp = (e: PointerEvent) => {
        if (pointerId !== e.pointerId) return;
        pointerId = null;
        const dx = e.clientX - startX;
        const speed = Math.abs(dx) / Math.max(1, e.timeStamp - startT);
        const wasDragging = dragging;
        dragging = false;
        releaseTrack();
        if (wasDragging && e.type === "pointerup" && (Math.abs(dx) > 56 || speed > 0.5)) {
          const dir: Direction = dx < 0 ? 1 : -1;
          go(current + dir, dir);
        }
        syncPlayback();
      };

      /* --------------------------------------------------- input: keyboard */

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        if (e.altKey || e.ctrlKey || e.metaKey || !onScreen) return;
        const focused = document.activeElement;
        // only when focus is in the hero or nowhere in particular
        if (focused && focused !== document.body && !el.contains(focused)) return;
        e.preventDefault();
        controller.current?.step(e.key === "ArrowRight" ? 1 : -1);
      };

      /* ------------------------------------------------------------- wiring */

      const announce = (i: number) =>
        setAnnouncement(`${items[i].category}. ${items[i].description}`);

      controller.current = {
        select: (index) => {
          const base = pending?.target ?? current;
          if (index === base) return;
          go(index, index > base ? 1 : -1);
          announce(index);
        },
        step: (dir) => {
          const target = wrap((pending?.target ?? current) + dir);
          go(target, dir);
          announce(target);
        },
        setPlaying: (next) => {
          isPlaying = next;
          setPlaying(next);
          if (!timeline?.isActive()) startHold(current);
        },
      };

      const observer = new IntersectionObserver(
        ([entry]) => {
          onScreen = entry.isIntersecting;
          syncPlayback();
        },
        { threshold: 0.3 },
      );
      observer.observe(el);

      el.addEventListener("pointerdown", onPointerDown);
      el.addEventListener("pointermove", onPointerMove);
      el.addEventListener("pointerup", onPointerUp);
      el.addEventListener("pointercancel", onPointerUp);
      el.addEventListener("pointerleave", resetParallax);
      window.addEventListener("keydown", onKeyDown);
      document.addEventListener("visibilitychange", syncPlayback);

      // Remaining products load after the first one has had the network to itself.
      const mountRest = gsap.delayedCall(1.6, () =>
        setMounted(new Set(items.map((_, i) => i))),
      );

      gsap.set(shadow, { "--w": items[0].shadow });
      if (!isPlaying) setPlaying(false);
      // let the CSS first-paint arrival finish before the idle float takes over
      startIdle(0, reduceMotion.matches ? 0 : 1.5);
      startHold(0);

      return () => {
        observer.disconnect();
        mountRest.kill();
        el.removeEventListener("pointerdown", onPointerDown);
        el.removeEventListener("pointermove", onPointerMove);
        el.removeEventListener("pointerup", onPointerUp);
        el.removeEventListener("pointercancel", onPointerUp);
        el.removeEventListener("pointerleave", resetParallax);
        window.removeEventListener("keydown", onKeyDown);
        document.removeEventListener("visibilitychange", syncPlayback);
        controller.current = null;
      };
    },
    { scope: root, dependencies: [items] },
  );

  return (
    <section
      ref={root}
      className={styles.hero}
      aria-roledescription="carousel"
      aria-label="Featured categories"
    >
      <h1 className={styles.srOnly}>Shop every category on Ayiin</h1>

      <CategoryCopy items={items} active={active} />
      <ProductStage items={items} mounted={mounted} />
      <HeroProgress
        items={items}
        active={active}
        playing={playing}
        onSelect={(i) => controller.current?.select(i)}
        onPrev={() => controller.current?.step(-1)}
        onNext={() => controller.current?.step(1)}
        onTogglePlay={() => controller.current?.setPlaying(!playing)}
      />

      <p className={styles.srOnly} aria-live="polite">
        {announcement}
      </p>
    </section>
  );
}
