import { getPrefs } from "@/lib/server-prefs";
import { HomePersonal } from "@/components/home/home-personal";
import { HomeBusiness } from "@/components/home/home-business";

export default async function Home() {
  const { mode } = await getPrefs();
  return mode === "business" ? <HomeBusiness /> : <HomePersonal />;
}
