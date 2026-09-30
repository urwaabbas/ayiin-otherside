import type { ImageView } from "@/lib/images";

/**
 * THE AYIIN EVENING — Discover Mode's first scene.
 *
 * One apartment at dusk, told in chapters. Each chapter is a real photograph of an
 * actual Ayiin product in context (the product's own listing photography, see
 * lib/catalog/photos.ts), so the object you discover *is* the thing you buy.
 * All chapters share one evening colour grade so they read as a single place.
 *
 * Hotspots are positions of the product inside its photograph, as fractions of the
 * original image (x from the left, y from the top). `aspect` is the photograph's
 * width ÷ height, used to map the hotspot onto a cropped (object-cover) stage.
 *
 * Copy here is scene-setting only. Every product fact (name, price, seller,
 * rating, delivery, availability) is read from the catalogue at render time.
 */
export type SceneChapter = {
  id: string;
  /** Scene-setting copy */
  time: string;
  title: string;
  line: string;
  /** The product this chapter is photographed around */
  slug: string;
  variant: string;
  view: ImageView;
  aspect: number;
  hotspot: { x: number; y: number };
};

export const EVENING: {
  slug: string;
  title: string;
  kicker: string;
  chapters: SceneChapter[];
  /** The Evening Look — the pieces you'd take out tonight, all discovered in the scene */
  look: { slug: string; variant: string; role: string }[];
} = {
  slug: "the-ayiin-evening",
  title: "The Ayiin Evening",
  kicker: "Discover · Scene 01",
  chapters: [
    { id: "living", time: "6:40 pm", title: "The living room", line: "The light goes gold. Somewhere to sink into.", slug: "loom-lounge-chair", variant: "oat", view: "hero", aspect: 3068 / 4602, hotspot: { x: 0.44, y: 0.64 } },
    { id: "console", time: "6:55 pm", title: "The console", line: "One lamp on, the rest of the city still working.", slug: "arc-table-lamp", variant: "travertine", view: "hero", aspect: 4381 / 6571, hotspot: { x: 0.2, y: 0.6 } },
    { id: "candle", time: "7:10 pm", title: "Candlelight", line: "Fig and cedar. The room slows down.", slug: "ember-soy-candle", variant: "amber", view: "hero", aspect: 3000 / 4500, hotspot: { x: 0.55, y: 0.74 } },
    { id: "desk", time: "7:25 pm", title: "The desk", line: "Last email. Lid closed by half past.", slug: "kova-book-14-air", variant: "silver", view: "scene", aspect: 5000 / 3254, hotspot: { x: 0.5, y: 0.57 } },
    { id: "kitchen", time: "7:40 pm", title: "The kitchen window", line: "Water just off the boil. A slow pour.", slug: "pour-gooseneck-kettle", variant: "matte-black", view: "scene", aspect: 5337 / 3652, hotspot: { x: 0.74, y: 0.42 } },
    { id: "vanity", time: "7:55 pm", title: "The vanity", line: "Two drops, and the day comes off.", slug: "night-recovery-oil", variant: "30", view: "hero", aspect: 4640 / 6960, hotspot: { x: 0.5, y: 0.56 } },
    { id: "entrance", time: "8:10 pm", title: "The entrance", line: "Everything you need, by the door.", slug: "transit-daypack-22", variant: "ink", view: "hero", aspect: 3285 / 4380, hotspot: { x: 0.43, y: 0.4 } },
    { id: "out", time: "8:20 pm", title: "Heading out", line: "A last look at the time.", slug: "meridian-automatic-38", variant: "rose", view: "hero", aspect: 4758 / 3456, hotspot: { x: 0.5, y: 0.44 } },
  ],
  look: [
    { slug: "meridian-automatic-38", variant: "rose", role: "Watch" },
    { slug: "solstice-sunglasses", variant: "tortoise", role: "Eyewear" },
    { slug: "transit-daypack-22", variant: "ink", role: "Bag" },
    { slug: "stride-runner-2", variant: "ink", role: "Shoes" },
  ],
};
