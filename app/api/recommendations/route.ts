import { NextRequest, NextResponse } from 'next/server';
import { generateOutfits } from '@/lib/recommendation-engine';
import { OutfitRequest, OutfitResponse } from '@/types/outfit';

export async function POST(
  request: NextRequest
): Promise<NextResponse<OutfitResponse | { error: string; code: string }>> {
  const startTime = performance.now();

  try {
    const body: OutfitRequest = await request.json();

    // Validation
    if (!body.baseProductId) {
      return NextResponse.json(
        { error: 'baseProductId is required', code: 'INVALID_REQUEST' },
        { status: 400 }
      );
    }

    // Validate count
    if (body.count && (body.count < 1 || body.count > 10)) {
      return NextResponse.json(
        { error: 'count must be between 1 and 10', code: 'INVALID_REQUEST' },
        { status: 400 }
      );
    }

    // Generate recommendations
    const response = await generateOutfits(body);

    // Log performance
    const processingTime = performance.now() - startTime;
    if (processingTime > 1000) {
      console.warn(
        `Slow recommendation: ${processingTime.toFixed(0)}ms for ${body.baseProductId}`
      );
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Recommendation error:', error);

    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: error.message, code: 'PRODUCT_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

export async function GET(): Promise<NextResponse> {
  // Health check / cache warmup endpoint
  try {
    const { getPrecomputedData } = await import('@/lib/cache');
    await getPrecomputedData();
    return NextResponse.json({ status: 'ok', cacheWarmed: true });
  } catch (error) {
    console.error('Cache warmup error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to warm cache' },
      { status: 500 }
    );
  }
}
