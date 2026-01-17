import { Color } from '@/types/product';

const COLOR_KEYWORDS: Record<Color, string[]> = {
  black: ['black', 'noir', 'onyx', 'charcoal', 'jet', 'ebony', 'stretch limo', 'off-black', 'midnight'],
  white: ['white', 'ivory', 'cream', 'snow', 'pearl', 'off-white', 'sail', 'eggshell', 'blanc'],
  grey: ['grey', 'gray', 'silver', 'ash', 'slate', 'heather', 'smoke', 'cement', 'fog'],
  navy: ['navy', 'marine', 'dark blue'],
  blue: ['blue', 'azure', 'cobalt', 'teal', 'denim', 'sky', 'cyan', 'royal', 'indigo'],
  red: ['red', 'crimson', 'scarlet', 'cherry', 'burgundy', 'maroon', 'wine', 'cardinal', 'ruby'],
  green: ['green', 'olive', 'emerald', 'sage', 'forest', 'moss', 'khaki', 'matcha', 'mint', 'lime'],
  yellow: ['yellow', 'gold', 'mustard', 'lemon', 'sunshine', 'butter', 'canary'],
  orange: ['orange', 'rust', 'copper', 'tangerine', 'coral', 'peach', 'amber'],
  pink: ['pink', 'rose', 'blush', 'salmon', 'fuchsia', 'magenta', 'berry'],
  purple: ['purple', 'violet', 'lavender', 'plum', 'grape', 'lilac', 'mauve', 'amethyst'],
  brown: ['brown', 'chocolate', 'coffee', 'mocha', 'tan', 'camel', 'sand', 'fudge', 'chestnut', 'walnut'],
  beige: ['beige', 'nude', 'oatmeal', 'wheat', 'natural', 'ecru', 'khaki'],
  cream: ['cream', 'vanilla', 'bone', 'eggshell', 'champagne'],
  tan: ['tan', 'caramel', 'toffee', 'cinnamon'],
  olive: ['olive', 'army', 'military', 'cargo'],
  gold: ['gold', 'golden', 'metallic gold', 'brass'],
  silver: ['silver', 'metallic', 'chrome', 'platinum'],
  multicolor: ['multicolor', 'multi', 'rainbow', 'tie-dye', 'pattern', 'print'],
};

export function extractColors(title: string, description: string = ''): Color[] {
  const text = `${title} ${description}`.toLowerCase();
  const foundColors: Set<Color> = new Set();

  for (const [color, keywords] of Object.entries(COLOR_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        foundColors.add(color as Color);
        break;
      }
    }
  }

  // If no colors found, try to infer from common patterns
  if (foundColors.size === 0) {
    // Check for color patterns like "Color: X" or specific brand color names
    const colorMatch = text.match(/color[:\s]+(\w+)/i);
    if (colorMatch) {
      const normalizedColor = normalizeColor(colorMatch[1]);
      if (normalizedColor) foundColors.add(normalizedColor);
    }
  }

  return foundColors.size > 0 ? Array.from(foundColors) : ['black']; // Default to black if no color found
}

function normalizeColor(colorName: string): Color | null {
  const lowerColor = colorName.toLowerCase();

  for (const [color, keywords] of Object.entries(COLOR_KEYWORDS)) {
    if (keywords.includes(lowerColor) || lowerColor === color) {
      return color as Color;
    }
  }

  return null;
}

export function getPrimaryColor(colors: Color[]): Color {
  // Return the first non-multicolor, or the first color if all are multicolor
  const primary = colors.find(c => c !== 'multicolor');
  return primary || colors[0] || 'black';
}
