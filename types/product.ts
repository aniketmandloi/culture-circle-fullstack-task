export type ProductCategory = 'top' | 'bottom' | 'footwear' | 'accessory';

export type Gender = 'male' | 'female' | 'unisex';

export type Color =
  | 'black'
  | 'white'
  | 'grey'
  | 'navy'
  | 'blue'
  | 'red'
  | 'green'
  | 'yellow'
  | 'orange'
  | 'pink'
  | 'purple'
  | 'brown'
  | 'beige'
  | 'cream'
  | 'tan'
  | 'olive'
  | 'gold'
  | 'silver'
  | 'multicolor';

export type Style =
  | 'streetwear'
  | 'casual'
  | 'athletic'
  | 'formal'
  | 'luxury'
  | 'vintage'
  | 'minimal';

export type Season = 'spring' | 'summer' | 'fall' | 'winter' | 'all-season';

export type Occasion =
  | 'casual'
  | 'work'
  | 'party'
  | 'sports'
  | 'formal'
  | 'date';

export type PriceRange = 'budget' | 'mid' | 'premium' | 'luxury';

export interface Product {
  id: string;
  title: string;
  sector: string;
  price: number;
  brand: string;
  category: ProductCategory;
  subCategory: string;
  productType: string;
  gender: Gender | null;
  description: string;
  tags: string[];
  imageUrl: string;
  colors: Color[];
  style: Style;
  seasons: Season[];
  occasions: Occasion[];
  priceRange: PriceRange;
}

export interface RawProduct {
  sku_id: string;
  title: string;
  sector: string;
  lowest_price: number;
  brand_name: string;
  category: string;
  sub_category: string;
  product_type: string;
  gender: string;
  description: string;
  tags: string;
  featured_image: string;
}
