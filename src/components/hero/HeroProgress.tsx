import type { HeroItem } from "./hero-data";
import styles from "./hero.module.css";

type HeroProgressProps = {
  items: HeroItem[];
  active: number;
  playing: boolean;
  onSelect: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onTogglePlay: () => void;
};

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The hero's only navigation: counter, one segment per category (the active
 * segment doubles as the autoplay timer), prev/next and pause.
 */
export function HeroProgress({
  items,
  active,
  playing,
  onSelect,
  onPrev,
  onNext,
  onTogglePlay,
}: HeroProgressProps) {
  return (
    <div className={styles.progress} role="group" aria-label="Categories">
      <button
        type="button"
        className={styles.iconBtn}
        onClick={onPrev}
        aria-label="Previous category"
      >
        <svg viewBox="0 0 16 16" aria-hidden>
          <path d="M10 3 5 8l5 5" />
        </svg>
      </button>

      <span className={styles.count} aria-hidden>
        <span className={styles.countWindow}>
          <span data-count className={styles.countReel}>
            {items.map((item, i) => (
              <span key={item.id}>{pad(i + 1)}</span>
            ))}
          </span>
        </span>
      </span>

      <div className={styles.segments}>
        {items.map((item, i) => (
          <button
            key={item.id}
            type="button"
            className={styles.segment}
            onClick={() => onSelect(i)}
            aria-label={`${item.category}, ${i + 1} of ${items.length}`}
            aria-current={i === active ? "true" : undefined}
          >
            <span className={styles.segmentTrack}>
              <span data-fill className={styles.segmentFill} />
            </span>
          </button>
        ))}
      </div>

      <span className={styles.count} aria-hidden>
        {pad(items.length)}
      </span>

      <button
        type="button"
        className={styles.iconBtn}
        onClick={onNext}
        aria-label="Next category"
      >
        <svg viewBox="0 0 16 16" aria-hidden>
          <path d="m6 3 5 5-5 5" />
        </svg>
      </button>

      <button
        type="button"
        className={styles.iconBtn}
        onClick={onTogglePlay}
        aria-label={playing ? "Pause rotation" : "Play rotation"}
      >
        <svg viewBox="0 0 16 16" aria-hidden>
          {playing ? (
            <path d="M5.5 3.5v9M10.5 3.5v9" />
          ) : (
            <path d="M5.5 3.5v9l7-4.5z" />
          )}
        </svg>
      </button>
    </div>
  );
}
