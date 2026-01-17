# AI-Powered Outfit Recommendation System - Implementation Plan

## Overview
Build a Next.js 14 application with TypeScript and shadcn/ui that generates complete outfit recommendations from a base product, meeting the **sub-1 second API response time** requirement.

---

## Tech Stack
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Data Fetching:** SWR
- **Data Processing:** xlsx (for parsing Excel data)
- **No Database:** In-memory caching with precomputed indices

---

## Data Challenge & Solution

### Current State
- 49 products in Excel (mostly luxury home goods)
- **Only 5 tops** (Fear of God hoodies)
- **No bottoms** (pants, jeans, shorts)
- **Limited footwear** (1 sneaker)

### Solution: Expand Mock Data
Create 25-30 mock products for bottoms and footwear to enable complete outfit generation:
- **Bottoms:** Joggers, sweatpants, jeans, cargo pants, shorts
- **Footwear:** Nike Dunks, Jordan 1s, New Balance, Yeezy Slides

---

## Core Algorithm

### Outfit Composition
Each outfit includes:
- 1 Top (base product or matched)
- 1 Bottom
- 1 Footwear
- 1-2 Accessories

### Match Score Formula (0-1)
```
matchScore =
  colorHarmony × 0.30 +
  styleCompatibility × 0.25 +
  occasionFit × 0.20 +
  seasonMatch × 0.15 +
  budgetAlignment × 0.10
```

### Scoring Components
1. **Color Harmony (30%):** Color wheel based - complementary, analogous, monochromatic, neutral bonus
2. **Style Compatibility (25%):** Matrix-based scoring (streetwear-streetwear: 1.0, streetwear-casual: 0.85, etc.)
3. **Occasion Fit (20%):** Match product occasions with filter request
4. **Season Match (15%):** Match product seasons with filter request
5. **Budget Alignment (10%):** How well outfit total fits within budget constraints

---

## Performance Strategy (Sub-1s Response)

1. **Precomputation on Startup:**
   - Product indices by category, color, style
   - Color compatibility matrix (12x12)
   - Style compatibility matrix (7x7)

2. **In-Memory Caching:**
   - Module-level cache (persists across requests)
   - Outfit result cache (5-min TTL)
   - Max 1000 cached results with LRU eviction

3. **Smart Sampling:**
   - Get top 30 candidates per category
   - Generate 50 combinations, return top N
   - Early termination for high-score outfits

---

## File Structure

```
/src
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # Product grid selection
│   ├── product/[id]/page.tsx       # Product detail + outfits
│   └── api/recommendations/route.ts # POST endpoint
│
├── components/
│   ├── ui/                         # shadcn components
│   ├── products/
│   │   ├── product-grid.tsx
│   │   └── product-card.tsx
│   ├── outfits/
│   │   ├── outfit-display.tsx
│   │   ├── outfit-card.tsx
│   │   ├── outfit-item.tsx
│   │   └── score-badge.tsx
│   └── filters/
│       └── outfit-filters.tsx
│
├── lib/
│   ├── cache/
│   │   ├── index.ts
│   │   └── precompute.ts
│   ├── scoring/
│   │   ├── index.ts
│   │   ├── color-harmony.ts
│   │   └── style-compatibility.ts
│   ├── recommendation-engine.ts
│   ├── color-extractor.ts
│   └── data-loader.ts
│
├── data/
│   ├── products.json               # Processed from Excel
│   └── mock-products.ts            # Mock bottoms/footwear
│
├── types/
│   ├── product.ts
│   └── outfit.ts
│
└── hooks/
    └── use-recommendations.ts
```

---

## API Design

### POST /api/recommendations

**Request:**
```json
{
  "baseProductId": "APPESPUHOAPLODASLSTLIBL",
  "filters": {
    "occasion": "casual",
    "season": "winter",
    "maxBudget": 50000
  },
  "count": 3
}
```

**Response:**
```json
{
  "baseProduct": { "id": "...", "title": "...", "price": 3876 },
  "outfits": [
    {
      "id": "outfit_001",
      "top": {...},
      "bottom": {...},
      "footwear": {...},
      "accessories": [{...}],
      "matchScore": 0.92,
      "scoreBreakdown": {
        "colorHarmony": 0.95,
        "styleCompatibility": 0.90,
        "occasionFit": 0.88,
        "seasonMatch": 0.95,
        "budgetAlignment": 0.85
      },
      "totalPrice": 43998
    }
  ],
  "processingTimeMs": 245
}
```

---

## Implementation Steps

### Phase 1: Setup (15 min)
1. Initialize Next.js 14 with TypeScript
2. Install shadcn/ui and configure components
3. Add SWR and xlsx dependencies

### Phase 2: Data Layer (1 hour)
1. Define TypeScript types for Product, Outfit, etc.
2. Parse Excel data and normalize
3. Extract colors from titles/descriptions
4. Infer styles, occasions, seasons from tags
5. Create mock bottoms (25) and footwear (20)

### Phase 3: Scoring Engine (1.5 hours)
1. Implement color wheel with harmony detection
2. Build style compatibility matrix
3. Create occasion/season scoring
4. Build composite score calculator

### Phase 4: Recommendation Engine (1.5 hours)
1. Implement precomputation and indexing
2. Build in-memory cache system
3. Create outfit generation algorithm
4. Add deduplication for distinct outfits

### Phase 5: API Route (30 min)
1. Create POST /api/recommendations
2. Add validation and error handling
3. Add performance logging

### Phase 6: UI Components (1.5 hours)
1. ProductGrid and ProductCard
2. OutfitCard (matching sample image layout)
3. ScoreBadge and score breakdown
4. Filter components

### Phase 7: Pages (1 hour)
1. Home page with product selection
2. Product detail page with recommendations
3. Connect filters to API

### Phase 8: Testing & Polish (30 min)
1. Verify sub-1s response times
2. Test edge cases
3. Add loading states

---

## Verification Strategy

1. **Performance Testing:**
   - API response time < 1000ms for all requests
   - Cache hit response < 100ms
   - Test with filters applied

2. **Functional Testing:**
   - Each outfit has top + bottom + footwear + accessory
   - Score is between 0-1
   - Items are compatible (no random mismatches)
   - Distinct outfits (not minor variations)

3. **Manual Testing:**
   - Select different products as base
   - Apply various filter combinations
   - Verify score breakdown makes sense
   - Check UI responsiveness

---

## Critical Files to Modify/Create

| File | Purpose |
|------|---------|
| `/src/lib/recommendation-engine.ts` | Core outfit generation logic |
| `/src/lib/scoring/color-harmony.ts` | Color wheel and harmony scoring |
| `/src/lib/cache/precompute.ts` | Precomputation for performance |
| `/src/app/api/recommendations/route.ts` | API endpoint |
| `/src/data/mock-products.ts` | Mock bottoms/footwear data |
| `/src/components/outfits/outfit-card.tsx` | Main outfit display |

---

## Assumptions & Trade-offs

1. **Mock Data:** Since real bottoms/footwear are missing, using mock data to demonstrate the algorithm
2. **No AI/ML API:** Using rule-based scoring for sub-1s requirement instead of LLM calls
3. **In-Memory Cache:** No external cache (Redis) for simplicity - sufficient for demo
4. **Color Extraction:** Keyword-based extraction from titles (not image analysis)
5. **No User Authentication:** Focus on recommendation logic, not user management
