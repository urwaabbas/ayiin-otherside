import Link from "next/link";
import type { HeroItem } from "./hero-data";
import styles from "./hero.module.css";

type CategoryCopyProps = {
  items: HeroItem[];
  active: number;
};

/**
 * All categories share one grid cell, so the block is always as tall as the
 * tallest entry and swapping never shifts the layout. Visibility is animated
 * by the hero timeline; `inert` keeps hidden entries out of the tab order.
 */
export function CategoryCopy({ items, active }: CategoryCopyProps) {
  return (
    <div className={styles.copy}>
      {items.map((item, i) => (
        <div
          key={item.id}
          data-copy
          data-side={item.side}
          className={styles.copyItem}
          inert={i !== active}
        >
          <h2 className={styles.heading}>
            <span className={styles.mask}>
              <Link
                href={item.href}
                data-heading
                className={styles.headingInner}
                title={`Explore ${item.category}`}
              >
                {item.category}
              </Link>
            </span>
          </h2>
          <div data-desc className={styles.desc}>
            <p>{item.description}</p>
            <Link href={item.href} prefetch={false} className={styles.cta}>
              Explore {item.category.toLowerCase()}
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
