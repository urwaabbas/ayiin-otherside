import Image from "next/image";
import type { CSSProperties } from "react";
import type { HeroItem } from "./hero-data";
import styles from "./hero.module.css";

type ProductSceneProps = {
  item: HeroItem;
  /** Only mounted scenes download their asset. */
  mounted: boolean;
  /** Preload in <head> — first product only. */
  preload: boolean;
};

/**
 * One product on the stage.
 *
 * Layering (outer → inner), each with a single owner so nothing fights:
 *   [data-scene]   transition transforms (z, x, y, rotation, scale)
 *   [data-idle]    idle float/sway
 *   [data-visual]  the visual itself: opacity + depth blur
 *
 * To move to real 3D later, add a `type: "model"` asset and render a canvas
 * here in place of <Image>; keep the same three data-* layers and the hero
 * choreography keeps working untouched.
 */
export function ProductScene({ item, mounted, preload }: ProductSceneProps) {
  const { asset, fit, offsetX = 0, offsetY = 0 } = item;

  return (
    <div
      data-scene
      className={styles.scene}
      style={
        {
          "--fit-w": fit.width,
          "--fit-h": fit.height,
          "--offset-x": offsetX,
          "--offset-y": offsetY,
        } as CSSProperties
      }
    >
      <div data-idle className={styles.idle}>
        {mounted && (
          <Image
            data-visual
            className={styles.visual}
            src={asset.src}
            width={asset.width}
            height={asset.height}
            alt={item.alt}
            sizes="(max-width: 640px) 92vw, (max-width: 1280px) 70vw, 900px"
            quality={90}
            preload={preload}
            loading={preload ? undefined : "eager"}
            draggable={false}
          />
        )}
      </div>
    </div>
  );
}
