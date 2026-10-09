import type { CSSProperties } from "react";
import type { HeroItem } from "./hero-data";
import { ProductScene } from "./ProductScene";
import styles from "./hero.module.css";

type ProductStageProps = {
  items: HeroItem[];
  mounted: ReadonlySet<number>;
};

/**
 * The studio: spotlight, floor, contact shadow and the perspective camera
 * every product travels through. It fills the hero, backdrop colour
 * layers included.
 */
export function ProductStage({ items, mounted }: ProductStageProps) {
  return (
    <div data-stage className={styles.stage}>
      {/* one colour layer per product, cross-faded by the hero timeline */}
      {items.map((item) => (
        <div
          key={item.id}
          aria-hidden
          data-bg
          className={styles.bg}
          style={{ backgroundColor: item.bg }}
        />
      ))}
      <div aria-hidden className={styles.spot} />
      {/* the category name, very large and very faint, behind the product */}
      <div aria-hidden className={styles.ghosts}>
        {items.map((item) => (
          <span
            key={item.id}
            data-ghost
            className={styles.ghost}
            style={{ "--chars": item.category.length } as CSSProperties}
          >
            {item.category}
          </span>
        ))}
      </div>
      <div aria-hidden className={styles.floor} />
      <div aria-hidden data-shadow className={styles.shadow} />

      <div className={styles.camera}>
        {/* rig: pointer parallax · track: drag follow */}
        <div data-rig className={styles.rig}>
          <div data-track className={styles.rig}>
            {items.map((item, i) => (
              <ProductScene
                key={item.id}
                item={item}
                mounted={mounted.has(i)}
                preload={i === 0}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
