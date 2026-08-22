import { APPLIANCE_BRANDS } from "./appliance-brands";
import { BEAUTY_BRANDS } from "./beauty-brands";
import { CAR_BRANDS } from "./car-brands";
import { COMPUTER_BRANDS } from "./computer-brands";
import { FASHION_BRANDS } from "./fashion-brands";
import { GAMING_BRANDS } from "./gaming-brands";
import { MOTO_BRANDS } from "./moto-brands";
import { PHONE_BRANDS } from "./phone-brands";
import { TABLET_BRANDS } from "./tablet-brands";
import { TV_AUDIO_BRANDS } from "./tv-audio-brands";

export type BrandSuggestionKey =
  | "cars"
  | "motos"
  | "phones"
  | "computers"
  | "tablets"
  | "tvAudio"
  | "gaming"
  | "appliances"
  | "beauty"
  | "fashion";

const MAP: Record<BrandSuggestionKey, readonly string[]> = {
  cars: CAR_BRANDS,
  motos: MOTO_BRANDS,
  phones: PHONE_BRANDS,
  computers: COMPUTER_BRANDS,
  tablets: TABLET_BRANDS,
  tvAudio: TV_AUDIO_BRANDS,
  gaming: GAMING_BRANDS,
  appliances: APPLIANCE_BRANDS,
  beauty: BEAUTY_BRANDS,
  fashion: FASHION_BRANDS,
};

export function getBrandSuggestions(key: BrandSuggestionKey | undefined): readonly string[] {
  if (!key) return [];
  return MAP[key] ?? [];
}

export {
  APPLIANCE_BRANDS,
  BEAUTY_BRANDS,
  CAR_BRANDS,
  COMPUTER_BRANDS,
  FASHION_BRANDS,
  GAMING_BRANDS,
  MOTO_BRANDS,
  PHONE_BRANDS,
  TABLET_BRANDS,
  TV_AUDIO_BRANDS,
};
