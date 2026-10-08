import { Icon, type IconName } from "@/components/ui/icon";

/** One glyph per department, shared by the departments menu, mobile drawer and homepage directory. */
export const CATEGORY_ICON: Record<string, IconName> = {
  "audio-tech": "headphones",
  "home-living": "armchair",
  kitchen: "coffee",
  fashion: "hanger",
  beauty: "serum",
  office: "chair",
  supplies: "box",
  safety: "helmet",
};

export function CategoryIcon({
  slug,
  size = 18,
  className,
}: {
  slug: string;
  size?: number;
  className?: string;
}) {
  return <Icon name={CATEGORY_ICON[slug] ?? "grid"} size={size} className={className} />;
}
