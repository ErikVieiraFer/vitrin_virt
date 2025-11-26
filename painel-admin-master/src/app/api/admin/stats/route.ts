import { NextRequest, NextResponse } from 'next/server';
import { getGlobalStats } from '@/lib/firebase/admin-firestore';

export async function GET(request: NextRequest) {
  try {
    // In production, you should verify admin auth here
    // const authHeader = request.headers.get('authorization');
    // Verify token and admin status

    const stats = await getGlobalStats();

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching global stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
