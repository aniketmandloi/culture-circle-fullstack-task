import { Style, Product } from '@/types/product';

// Style compatibility matrix (row style with column style)
const STYLE_MATRIX: Record<Style, Record<Style, number>> = {
  streetwear: {
    streetwear: 1.0,
    casual: 0.85,
    athletic: 0.75,
    vintage: 0.7,
    luxury: 0.65,
    minimal: 0.6,
    formal: 0.3,
  },
  casual: {
    streetwear: 0.85,
    casual: 1.0,
    athletic: 0.7,
    vintage: 0.75,
    luxury: 0.5,
    minimal: 0.85,
    formal: 0.45,
  },
  athletic: {
    streetwear: 0.75,
    casual: 0.7,
    athletic: 1.0,
    vintage: 0.4,
    luxury: 0.3,
    minimal: 0.6,
    formal: 0.15,
  },
  vintage: {
    streetwear: 0.7,
    casual: 0.75,
    athletic: 0.4,
    vintage: 1.0,
    luxury: 0.55,
    minimal: 0.65,
    formal: 0.5,
  },
  luxury: {
    streetwear: 0.65,
    casual: 0.5,
    athletic: 0.3,
    vintage: 0.55,
    luxury: 1.0,
    minimal: 0.75,
    formal: 0.8,
  },
  minimal: {
    streetwear: 0.6,
    casual: 0.85,
    athletic: 0.6,
    vintage: 0.65,
    luxury: 0.75,
    minimal: 1.0,
    formal: 0.7,
  },
  formal: {
    streetwear: 0.3,
    casual: 0.45,
    athletic: 0.15,
    vintage: 0.5,
    luxury: 0.8,
    minimal: 0.7,
    formal: 1.0,
  },
};

export function calculateStyleCompatibility(items: Product[]): number {
  if (items.length <= 1) return 1;

  let totalScore = 0;
  let comparisons = 0;

  for (let i = 0; i < items.length - 1; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const style1 = items[i].style;
      const style2 = items[j].style;
      totalScore += STYLE_MATRIX[style1]?.[style2] ?? 0.5;
      comparisons++;
    }
  }

  return comparisons > 0 ? totalScore / comparisons : 0.5;
}

export function getStylePairScore(style1: Style, style2: Style): number {
  return STYLE_MATRIX[style1]?.[style2] ?? 0.5;
}

export function getDominantStyle(items: Product[]): Style {
  const styleCounts = items.reduce(
    (acc, item) => {
      acc[item.style] = (acc[item.style] || 0) + 1;
      return acc;
    },
    {} as Record<Style, number>
  );

  let dominant: Style = 'casual';
  let maxCount = 0;

  for (const [style, count] of Object.entries(styleCounts)) {
    if (count > maxCount) {
      maxCount = count;
      dominant = style as Style;
    }
  }

  return dominant;
}
