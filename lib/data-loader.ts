import * as XLSX from 'xlsx';
import { Product, RawProduct, ProductCategory, Gender, Style, Season, Occasion, PriceRange } from '@/types/product';
import { extractColors } from './color-extractor';
import { mockBottoms, mockFootwear, mockAccessories } from '@/data/mock-products';
import path from 'path';
import fs from 'fs';

let cachedProducts: Product[] | null = null;

export function loadProducts(): Product[] {
  if (cachedProducts) {
    return cachedProducts;
  }

  const excelProducts = loadExcelProducts();
  const normalizedProducts = excelProducts.map(normalizeProduct);

  // Combine with mock products
  cachedProducts = [
    ...normalizedProducts,
    ...mockBottoms,
    ...mockFootwear,
    ...mockAccessories,
  ];

  return cachedProducts;
}

function loadExcelProducts(): RawProduct[] {
  try {
    const filePath = path.join(process.cwd(), 'data', 'Sample Products.xlsx');
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json<RawProduct>(worksheet);
    return jsonData;
  } catch (error) {
    console.error('Error loading Excel file:', error);
    return [];
  }
}

function normalizeProduct(raw: RawProduct): Product {
  const colors = extractColors(raw.title, raw.description);
  const category = inferCategory(raw.category, raw.sub_category, raw.product_type);
  const style = inferStyle(raw.tags, raw.brand_name, raw.category);
  const seasons = inferSeasons(raw.tags, raw.description);
  const occasions = inferOccasions(raw.tags, raw.category, style);
  const priceRange = inferPriceRange(raw.lowest_price);

  return {
    id: raw.sku_id,
    title: raw.title,
    sector: raw.sector,
    price: raw.lowest_price || 0,
    brand: raw.brand_name?.toLowerCase() || 'unknown',
    category,
    subCategory: raw.sub_category || '',
    productType: raw.product_type || '',
    gender: inferGender(raw.gender),
    description: raw.description || '',
    tags: parseTags(raw.tags),
    imageUrl: raw.featured_image || '',
    colors,
    style,
    seasons,
    occasions,
    priceRange,
  };
}

function inferCategory(category: string, subCategory: string, productType: string): ProductCategory {
  const cat = (category || '').toLowerCase();
  const sub = (subCategory || '').toLowerCase();
  const type = (productType || '').toLowerCase();

  // Tops
  if (
    cat.includes('tops') ||
    sub.includes('hoodie') ||
    sub.includes('sweatshirt') ||
    sub.includes('shirt') ||
    sub.includes('t-shirt') ||
    sub.includes('sweater') ||
    sub.includes('jacket') ||
    type.includes('tops')
  ) {
    return 'top';
  }

  // Bottoms
  if (
    cat.includes('bottoms') ||
    sub.includes('pants') ||
    sub.includes('jeans') ||
    sub.includes('shorts') ||
    sub.includes('skirt') ||
    sub.includes('trousers') ||
    type.includes('bottoms')
  ) {
    return 'bottom';
  }

  // Footwear
  if (
    cat.includes('footwear') ||
    cat.includes('sneakers') ||
    cat.includes('shoes') ||
    sub.includes('sneaker') ||
    sub.includes('shoe') ||
    sub.includes('boot') ||
    sub.includes('slide') ||
    type.includes('sneakers') ||
    type.includes('shoes')
  ) {
    return 'footwear';
  }

  // Default to accessory
  return 'accessory';
}

function inferGender(gender: string): Gender | null {
  const g = (gender || '').toLowerCase();
  if (g.includes('male') && !g.includes('female')) return 'male';
  if (g.includes('female')) return 'female';
  if (g.includes('unisex')) return 'unisex';
  return 'unisex'; // Default to unisex
}

function inferStyle(tags: string, brand: string, category: string): Style {
  const text = `${tags} ${brand} ${category}`.toLowerCase();

  if (text.includes('athletic') || text.includes('sport') || text.includes('gym')) {
    return 'athletic';
  }
  if (text.includes('formal') || text.includes('dress') || text.includes('suit')) {
    return 'formal';
  }
  if (text.includes('vintage') || text.includes('retro')) {
    return 'vintage';
  }
  if (text.includes('minimal') || text.includes('simple') || text.includes('clean')) {
    return 'minimal';
  }
  if (
    text.includes('luxury') ||
    text.includes('hermes') ||
    text.includes('louis vuitton') ||
    text.includes('gucci') ||
    text.includes('prada')
  ) {
    return 'luxury';
  }
  if (
    text.includes('streetwear') ||
    text.includes('fear of god') ||
    text.includes('essentials') ||
    text.includes('nike') ||
    text.includes('jordan') ||
    text.includes('yeezy')
  ) {
    return 'streetwear';
  }

  return 'casual';
}

function inferSeasons(tags: string, description: string): Season[] {
  const text = `${tags} ${description}`.toLowerCase();
  const seasons: Season[] = [];

  if (text.includes('winter') || text.includes('cold') || text.includes('fleece') || text.includes('hoodie')) {
    seasons.push('winter');
  }
  if (text.includes('summer') || text.includes('light') || text.includes('breathable')) {
    seasons.push('summer');
  }
  if (text.includes('spring') || text.includes('layering')) {
    seasons.push('spring');
  }
  if (text.includes('fall') || text.includes('autumn')) {
    seasons.push('fall');
  }

  return seasons.length > 0 ? seasons : ['all-season'];
}

function inferOccasions(tags: string, category: string, style: Style): Occasion[] {
  const text = `${tags} ${category}`.toLowerCase();
  const occasions: Occasion[] = [];

  if (text.includes('casual') || style === 'casual' || style === 'streetwear') {
    occasions.push('casual');
  }
  if (text.includes('work') || text.includes('office') || style === 'formal') {
    occasions.push('work');
  }
  if (text.includes('party') || text.includes('night')) {
    occasions.push('party');
  }
  if (text.includes('sport') || text.includes('athletic') || text.includes('gym') || style === 'athletic') {
    occasions.push('sports');
  }
  if (text.includes('formal') || text.includes('dress')) {
    occasions.push('formal');
  }
  if (text.includes('date')) {
    occasions.push('date');
  }

  return occasions.length > 0 ? occasions : ['casual'];
}

function inferPriceRange(price: number): PriceRange {
  if (!price || price === 0) return 'mid';
  if (price < 5000) return 'budget';
  if (price < 15000) return 'mid';
  if (price < 50000) return 'premium';
  return 'luxury';
}

function parseTags(tags: string): string[] {
  if (!tags) return [];

  // Handle array-like strings: "['tag1', 'tag2']"
  if (tags.startsWith('[')) {
    try {
      const parsed = JSON.parse(tags.replace(/'/g, '"'));
      return Array.isArray(parsed) ? parsed : [tags];
    } catch {
      // If parsing fails, treat as comma-separated
    }
  }

  // Handle comma-separated strings
  return tags.split(',').map((t) => t.trim().toLowerCase());
}

export function getProductById(id: string): Product | undefined {
  const products = loadProducts();
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(category: ProductCategory): Product[] {
  const products = loadProducts();
  return products.filter((p) => p.category === category);
}
