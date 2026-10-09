import type { MotionProfileName } from "./hero-data";

/**
 * Physical character per category. The choreography is identical for every
 * product; these only nudge weight, speed and how far things turn.
 */
export type MotionProfile = {
  /** Multiplies transition durations (1 = base, higher = slower/heavier). */
  tempo: number;
  /** Seconds the product rests on stage before autoplay advances. */
  hold: number;
  /** Degrees of Y rotation the product carries while travelling. */
  travelTurn: number;
  idle: {
    /** Vertical float in px. */
    float: number;
    /** Y sway in degrees, each side of neutral. */
    sway: number;
    /** Seconds for one float cycle. */
    period: number;
  };
};

export const motionProfiles: Record<MotionProfileName, MotionProfile> = {
  // Energetic but smooth.
  fashion: {
    tempo: 0.94,
    hold: 2.8,
    travelTurn: 26,
    idle: { float: 6, sway: 2.2, period: 5.2 },
  },
  // Precise, engineered: less turn.
  technology: {
    tempo: 0.9,
    hold: 2.8,
    travelTurn: 16,
    idle: { float: 3, sway: 1.3, period: 6.4 },
  },
  // Slower and softer, like something weightless.
  beauty: {
    tempo: 1.12,
    hold: 3,
    travelTurn: 14,
    idle: { float: 6, sway: 1.6, period: 7.4 },
  },
  // Heavy, calm, architectural.
  home: {
    tempo: 1.1,
    hold: 3,
    travelTurn: 10,
    idle: { float: 2, sway: 0.8, period: 9 },
  },
  // Slow turntable.
  accessories: {
    tempo: 1.04,
    hold: 2.9,
    travelTurn: 22,
    idle: { float: 4, sway: 3, period: 8.6 },
  },
};
