import { Color } from '@/types/product';

// Color wheel positions (0-360 degrees, -1 for neutrals)
const COLOR_WHEEL: Record<Color, number> = {
  red: 0,
  orange: 30,
  yellow: 60,
  olive: 80,
  green: 120,
  blue: 240,
  navy: 220,
  purple: 280,
  pink: 330,
  brown: 30,
  tan: 35,
  beige: 45,
  cream: 50,
  gold: 50,
  // Neutrals (no position)
  black: -1,
  white: -1,
  grey: -1,
  silver: -1,
  multicolor: -1,
};

const NEUTRAL_COLORS: Color[] = ['black', 'white', 'grey', 'silver', 'cream', 'beige'];

export function calculateColorHarmony(itemColors: Color[][]): number {
  const allColors = itemColors.flat();

  if (allColors.length === 0) return 0.5;

  // Separate neutrals from chromatic colors
  const neutrals = allColors.filter((c) => NEUTRAL_COLORS.includes(c));
  const chromatic = allColors.filter((c) => !NEUTRAL_COLORS.includes(c) && c !== 'multicolor');

  // All neutrals = excellent harmony (monochromatic neutral)
  if (chromatic.length === 0) {
    return 0.95;
  }

  // High neutral ratio = bonus
  const neutralRatio = neutrals.length / allColors.length;
  const neutralBonus = Math.min(neutralRatio * 0.15, 0.12);

  // Calculate chromatic harmony
  let harmonyScore = 0;

  if (chromatic.length === 1) {
    // Single chromatic color with neutrals = great
    harmonyScore = 0.9;
  } else {
    // Multiple chromatic colors - check harmony types
    const uniqueChromatic = [...new Set(chromatic)];
    const positions = uniqueChromatic
      .map((c) => COLOR_WHEEL[c])
      .filter((p) => p >= 0);

    if (positions.length >= 2) {
      const harmonies = [
        checkMonochromatic(uniqueChromatic),
        checkComplementary(positions),
        checkAnalogous(positions),
        checkTriadic(positions),
        checkNeutralHarmony(uniqueChromatic),
      ];
      harmonyScore = Math.max(...harmonies);
    } else if (positions.length === 1) {
      // One chromatic position with others being non-wheel colors
      harmonyScore = 0.75;
    } else {
      harmonyScore = 0.6;
    }
  }

  return Math.min(harmonyScore + neutralBonus, 1);
}

function checkMonochromatic(colors: Color[]): number {
  // All same color family = excellent
  if (colors.length === 1) return 0.95;

  // Check if colors are in same family
  const families: Record<string, Color[]> = {
    blues: ['blue', 'navy'],
    browns: ['brown', 'tan', 'beige'],
    reds: ['red', 'pink'],
    greens: ['green', 'olive'],
  };

  for (const family of Object.values(families)) {
    if (colors.every((c) => family.includes(c))) {
      return 0.9;
    }
  }

  return 0;
}

function checkComplementary(positions: number[]): number {
  // Colors 150-210 degrees apart (complementary)
  for (let i = 0; i < positions.length - 1; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const diff = Math.abs(positions[i] - positions[j]);
      const normalizedDiff = Math.min(diff, 360 - diff);
      if (normalizedDiff >= 150 && normalizedDiff <= 210) {
        return 0.85;
      }
    }
  }
  return 0;
}

function checkAnalogous(positions: number[]): number {
  // All colors within 60 degrees of each other
  if (positions.length < 2) return 0;

  const sortedPositions = [...positions].sort((a, b) => a - b);
  const min = sortedPositions[0];
  const max = sortedPositions[sortedPositions.length - 1];
  const spread = max - min;

  if (spread <= 60) return 0.88;
  if (spread <= 90) return 0.75;
  return 0;
}

function checkTriadic(positions: number[]): number {
  // Three colors 120 degrees apart
  if (positions.length !== 3) return 0;

  const sortedPositions = [...positions].sort((a, b) => a - b);
  const diff1 = sortedPositions[1] - sortedPositions[0];
  const diff2 = sortedPositions[2] - sortedPositions[1];
  const diff3 = 360 - sortedPositions[2] + sortedPositions[0];

  // Check if roughly equal spacing (~120 degrees each)
  const tolerance = 30;
  if (
    Math.abs(diff1 - 120) <= tolerance &&
    Math.abs(diff2 - 120) <= tolerance &&
    Math.abs(diff3 - 120) <= tolerance
  ) {
    return 0.8;
  }

  return 0;
}

function checkNeutralHarmony(colors: Color[]): number {
  // Earth tones work well together
  const earthTones: Color[] = ['brown', 'tan', 'beige', 'cream', 'olive', 'gold'];
  if (colors.every((c) => earthTones.includes(c))) {
    return 0.85;
  }

  // Cool tones work well together
  const coolTones: Color[] = ['blue', 'navy', 'green', 'purple'];
  if (colors.every((c) => coolTones.includes(c))) {
    return 0.82;
  }

  // Warm tones work well together
  const warmTones: Color[] = ['red', 'orange', 'yellow', 'pink', 'gold'];
  if (colors.every((c) => warmTones.includes(c))) {
    return 0.82;
  }

  return 0.5;
}

// Pre-compute color pair compatibility for fast lookup
export function getColorPairScore(color1: Color, color2: Color): number {
  if (color1 === color2) return 1;

  // Neutrals go with everything
  if (NEUTRAL_COLORS.includes(color1) || NEUTRAL_COLORS.includes(color2)) {
    return 0.9;
  }

  const pos1 = COLOR_WHEEL[color1];
  const pos2 = COLOR_WHEEL[color2];

  if (pos1 < 0 || pos2 < 0) return 0.7;

  const diff = Math.abs(pos1 - pos2);
  const normalizedDiff = Math.min(diff, 360 - diff);

  // Analogous (0-60)
  if (normalizedDiff <= 60) return 0.85;
  // Complementary (150-210)
  if (normalizedDiff >= 150 && normalizedDiff <= 210) return 0.8;
  // Triadic-ish (100-140)
  if (normalizedDiff >= 100 && normalizedDiff <= 140) return 0.75;
  // Other
  return 0.6;
}
