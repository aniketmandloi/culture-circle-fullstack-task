# AI-Powered Outfit Recommendation System

An intelligent outfit recommendation system that generates complete outfit combinations using a single base product as input. The system simulates how a fashion stylist thinks, considering style compatibility, color harmony, occasion appropriateness, seasonal relevance, and budget constraints.

## Project Overview

This system takes a base product (e.g., a hoodie) and generates complete outfit recommendations including:
- **Top** (base or matched)
- **Bottom** (pants, jeans, joggers)
- **Footwear** (sneakers, shoes)
- **Accessories** (watches, sunglasses, bags, hats)

Each outfit is scored (0-1) based on multiple compatibility factors.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Data Fetching:** SWR
- **Data Processing:** xlsx

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Frontend (Next.js)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Product     │  │ Outfit      │  │ Filter              │  │
│  │ Selection   │  │ Display     │  │ Controls            │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Routes (/api)                         │
│  ┌─────────────────────┐  ┌─────────────────────────────┐   │
│  │ /recommendations    │  │ /products                    │   │
│  │ POST: Generate      │  │ GET: List products           │   │
│  └─────────────────────┘  └─────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                 Recommendation Engine                        │
│  ┌───────────────┐  ┌───────────────┐  ┌────────────────┐   │
│  │ Scoring       │  │ Caching       │  │ Product        │   │
│  │ Engine        │  │ Layer         │  │ Indices        │   │
│  └───────────────┘  └───────────────┘  └────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Recommendation Logic

### Match Score Formula

```
matchScore =
  colorHarmony × 0.30 +
  styleCompatibility × 0.25 +
  occasionFit × 0.20 +
  seasonMatch × 0.15 +
  budgetAlignment × 0.10
```

### Scoring Components

1. **Color Harmony (30%)**: Uses color wheel theory to evaluate outfit color combinations
   - Monochromatic (same color family): 0.95
   - Complementary (opposite on color wheel): 0.85
   - Analogous (adjacent colors): 0.88
   - Neutral bonus for black/white/grey: +0.15

2. **Style Compatibility (25%)**: Matrix-based scoring for style matching
   - Same style (e.g., streetwear-streetwear): 1.0
   - Compatible styles (e.g., streetwear-casual): 0.85
   - Incompatible styles (e.g., athletic-formal): 0.15

3. **Occasion Fit (20%)**: Matches outfit items to requested occasion
   - All items match occasion: 1.0
   - Partial match: proportional score

4. **Season Match (15%)**: Ensures seasonal appropriateness
   - All-season items always score well
   - Seasonal items must match requested season

5. **Budget Alignment (10%)**: Compares total outfit price to budget
   - Within budget with good utilization: 1.0
   - Significantly under budget: 0.8
   - Over budget: penalized proportionally

## Performance Strategy

The system achieves **sub-100ms response times** through:

1. **Precomputation on Startup**
   - Product indices by category, color, style
   - Color compatibility matrix (19×19)
   - Style compatibility matrix (7×7)

2. **In-Memory Caching**
   - Module-level cache persists across requests
   - Outfit result cache with 5-minute TTL
   - LRU eviction for cache size management

3. **Smart Sampling**
   - Top 30 candidates per category
   - Generate 50 combinations, return top N
   - Early filtering of low-score outfits

## How to Run

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd culture-circle-fullstack-task

# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
pnpm build
pnpm start
```

## API Reference

### POST /api/recommendations

Generate outfit recommendations for a base product.

**Request:**
```json
{
  "baseProductId": "MOCK_BOTTOM_001",
  "filters": {
    "occasion": "casual",
    "season": "winter",
    "maxBudget": 50000,
    "preferredStyle": "streetwear"
  },
  "count": 3
}
```

**Response:**
```json
{
  "baseProduct": { "id": "...", "title": "...", "price": 12500 },
  "outfits": [
    {
      "id": "outfit_1",
      "top": { ... },
      "bottom": { ... },
      "footwear": { ... },
      "accessories": [{ ... }],
      "matchScore": 0.92,
      "scoreBreakdown": {
        "colorHarmony": 0.95,
        "styleCompatibility": 0.90,
        "occasionFit": 0.88,
        "seasonMatch": 0.95,
        "budgetAlignment": 0.85
      },
      "totalPrice": 43998,
      "dominantStyle": "streetwear",
      "suitableOccasions": ["casual"],
      "suitableSeasons": ["fall", "winter"]
    }
  ],
  "generatedAt": "2026-01-17T10:30:00.000Z",
  "processingTimeMs": 77
}
```

### GET /api/products

Get all products or filter by category.

**Query Parameters:**
- `category`: `top` | `bottom` | `footwear` | `accessory` (optional)

**Response:**
```json
{
  "products": [...],
  "total": 85
}
```

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── recommendations/route.ts
│   │   └── products/route.ts
│   ├── page.tsx
│   └── layout.tsx
├── components/
│   ├── ui/                    # shadcn components
│   ├── products/              # Product display components
│   ├── outfits/               # Outfit display components
│   └── filters/               # Filter components
├── lib/
│   ├── cache/                 # Caching and precomputation
│   ├── scoring/               # Scoring algorithms
│   ├── recommendation-engine.ts
│   ├── data-loader.ts
│   └── color-extractor.ts
├── data/
│   ├── Sample Products.xlsx   # Original product data
│   └── mock-products.ts       # Mock bottoms/footwear/accessories
├── types/
│   ├── product.ts
│   └── outfit.ts
└── hooks/
    ├── use-products.ts
    └── use-recommendations.ts
```

## Assumptions & Trade-offs

1. **Mock Data**: The original dataset lacked bottoms and footwear, so mock products were created to demonstrate complete outfit generation.

2. **Rule-Based Scoring**: Used deterministic algorithms instead of ML/LLM for guaranteed sub-1s response times.

3. **In-Memory Cache**: No external cache (Redis) for simplicity - sufficient for demo scale.

4. **Color Extraction**: Keyword-based extraction from product titles instead of image analysis.

5. **No User Authentication**: Focus on recommendation logic, not user management.

## Future Improvements

1. **Image-based Color Analysis**: Use computer vision to extract colors from product images
2. **ML-based Scoring**: Train a model on user preferences for personalized recommendations
3. **Real-time Inventory**: Connect to live inventory system
4. **User Preferences**: Learn and adapt to individual user style preferences
5. **A/B Testing**: Implement experimentation framework for scoring weights
6. **External Caching**: Add Redis for distributed caching at scale

## Performance Metrics

- **Average Response Time**: ~77ms
- **95th Percentile**: <150ms
- **Cache Hit Response**: <20ms
- **Products Loaded**: 85 (including mocks)
- **Outfits Generated per Request**: Up to 50, returning top N
