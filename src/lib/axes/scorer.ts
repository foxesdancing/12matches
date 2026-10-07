import type { AxesValues } from "./types";

const CENTER = 50;
const AXIS_SPREAD = 50;

const AXIS_WEIGHT = 0.42;
const DIRECTION_WEIGHT = 0.33;
const MAGNITUDE_WEIGHT = 0.18;
const OUTLIER_WEIGHT = 0.07;

const OPPOSITE_SIDE_MAX_PENALTY = 0.45;
const OPPOSITE_SIDE_SPREAD = 25;

const OUTLIER_FULL_SPREAD = 100;
const OUTLIER_EXPONENT = 2.5;

const DIRECTION_AUGMENT_RADIUS = 8;

const AXIS_NAMES: (keyof AxesValues)[] = [
  "est",
  "rep",
  "pod",
  "imi",
  "dip",
  "int",
  "eco",
  "con",
  "com",
  "rel",
  "mor",
  "tec",
];

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

/**
 * Similarity based on the distance between the two values
 * on each individual axis.
 *
 * The original algorithm additionally penalizes profiles
 * that are on opposite sides of the center of an axis.
 */
function axisSimilarity(user: AxesValues, target: AxesValues): number {
  let totalSimilarity = 0;

  for (const axis of AXIS_NAMES) {
    const userValue = user[axis];
    const targetValue = target[axis];

    const diff = Math.abs(userValue - targetValue);

    let similarity = Math.max(0, 1 - Math.pow(diff / AXIS_SPREAD, 2));

    // Opposite sides of the 50-point center.
    if ((userValue - CENTER) * (targetValue - CENTER) < 0) {
      const userSide = Math.abs(userValue - CENTER);
      const targetSide = Math.abs(targetValue - CENTER);

      const penalty =
        OPPOSITE_SIDE_MAX_PENALTY *
        Math.tanh(userSide / OPPOSITE_SIDE_SPREAD) *
        Math.tanh(targetSide / OPPOSITE_SIDE_SPREAD);

      similarity *= 1 - penalty;
    }

    totalSimilarity += similarity;
  }

  return (100 * totalSimilarity) / AXIS_NAMES.length;
}

/**
 * Compares the overall direction of the two profiles
 * relative to the center of the axes.
 *
 * This is an augmented cosine similarity. The small
 * constant component prevents profiles close to the
 * center from being dominated by meaningless direction.
 */
function directionSimilarity(user: AxesValues, target: AxesValues): number {
  let dotProduct = 0;
  let userNormSquared = 0;
  let targetNormSquared = 0;

  for (const axis of AXIS_NAMES) {
    const centeredUserValue = user[axis] - CENTER;
    const centeredTargetValue = target[axis] - CENTER;

    dotProduct += centeredUserValue * centeredTargetValue;
    userNormSquared += centeredUserValue ** 2;
    targetNormSquared += centeredTargetValue ** 2;
  }

  const augment = AXIS_NAMES.length * DIRECTION_AUGMENT_RADIUS ** 2;

  const cosine =
    (dotProduct + augment) /
    Math.sqrt((userNormSquared + augment) * (targetNormSquared + augment));

  return CENTER + CENTER * cosine;
}

/**
 * Compares how extreme the two profiles are overall.
 */
function magnitudeSimilarity(user: AxesValues, target: AxesValues): number {
  const userIntensity = averageDistanceFromCenter(user);
  const targetIntensity = averageDistanceFromCenter(target);

  return 100 - 2 * Math.abs(userIntensity - targetIntensity);
}

function averageDistanceFromCenter(values: AxesValues): number {
  const total = AXIS_NAMES.reduce(
    (sum, axis) => sum + Math.abs(values[axis] - CENTER),
    0,
  );

  return total / AXIS_NAMES.length;
}

/**
 * Penalizes a profile if there is one particularly
 * large difference on any individual axis.
 */
function outlierSimilarity(user: AxesValues, target: AxesValues): number {
  let maxDiff = 0;

  for (const axis of AXIS_NAMES) {
    maxDiff = Math.max(maxDiff, Math.abs(user[axis] - target[axis]));
  }

  return (
    100 *
    Math.max(0, 1 - Math.pow(maxDiff / OUTLIER_FULL_SPREAD, OUTLIER_EXPONENT))
  );
}

/**
 * Calculates the same compatibility score used by
 * the original 12 Axes ProfileMatchScorer.
 *
 * Returns a value from 0 to 100.
 */
export function calculateCompatibility(
  user: AxesValues,
  target: AxesValues,
): number {
  const axis = axisSimilarity(user, target);
  const direction = directionSimilarity(user, target);
  const magnitude = magnitudeSimilarity(user, target);
  const outlier = outlierSimilarity(user, target);

  const score =
    AXIS_WEIGHT * axis +
    DIRECTION_WEIGHT * direction +
    MAGNITUDE_WEIGHT * magnitude +
    OUTLIER_WEIGHT * outlier;

  return round1(clamp(score));
}
