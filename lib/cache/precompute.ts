import { Product, ProductCategory, Color, Style } from '@/types/product';
import { getColorPairScore } from '@/lib/scoring/color-harmony';
import { getStylePairScore } from '@/lib/scoring/style-compatibility';

export interface PrecomputedData {
  productById: Map<string, Product>;
  productsByCategory: Map<ProductCategory, Product[]>;
  productsByColor: Map<Color, Product[]>;
  productsByStyle: Map<Style, Product[]>;
  colorCompatibilityCache: Map<string, number>;
  styleCompatibilityCache: Map<string, number>;
}

export function precomputeData(products: Product[]): PrecomputedData {
  const data: PrecomputedData = {
    productById: new Map(),
    productsByCategory: new Map(),
    productsByColor: new Map(),
    productsByStyle: new Map(),
    colorCompatibilityCache: new Map(),
    styleCompatibilityCache: new Map(),
  };

  // Build product indices
  for (const product of products) {
    // ID index
    data.productById.set(product.id, product);

    // Category index
    const catList = data.productsByCategory.get(product.category) || [];
    catList.push(product);
    data.productsByCategory.set(product.category, catList);

    // Color indices
    for (const color of product.colors) {
      const colorList = data.productsByColor.get(color) || [];
      colorList.push(product);
      data.productsByColor.set(color, colorList);
    }

    // Style index
    const styleList = data.productsByStyle.get(product.style) || [];
    styleList.push(product);
    data.productsByStyle.set(product.style, styleList);
  }

  // Pre-compute color compatibility pairs
  const colors: Color[] = [
    'black', 'white', 'grey', 'navy', 'blue', 'red', 'green',
    'yellow', 'orange', 'pink', 'purple', 'brown', 'beige',
    'cream', 'tan', 'olive', 'gold', 'silver', 'multicolor',
  ];

  for (const color1 of colors) {
    for (const color2 of colors) {
      const key = `${color1}-${color2}`;
      data.colorCompatibilityCache.set(key, getColorPairScore(color1, color2));
    }
  }

  // Pre-compute style compatibility pairs
  const styles: Style[] = [
    'streetwear', 'casual', 'athletic', 'formal', 'luxury', 'vintage', 'minimal',
  ];

  for (const style1 of styles) {
    for (const style2 of styles) {
      const key = `${style1}-${style2}`;
      data.styleCompatibilityCache.set(key, getStylePairScore(style1, style2));
    }
  }

  return data;
}

export function getCachedColorScore(
  cache: Map<string, number>,
  color1: Color,
  color2: Color
): number {
  const key = `${color1}-${color2}`;
  return cache.get(key) ?? 0.5;
}

export function getCachedStyleScore(
  cache: Map<string, number>,
  style1: Style,
  style2: Style
): number {
  const key = `${style1}-${style2}`;
  return cache.get(key) ?? 0.5;
}
