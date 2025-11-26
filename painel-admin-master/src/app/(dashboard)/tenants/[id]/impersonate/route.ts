import { NextRequest, NextResponse } from 'next/server';
import { redirect } from 'next/navigation';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // In production:
    // 1. Generate custom token for tenant using Firebase Admin SDK
    // 2. Create impersonate session
    // 3. Log this action in activity_logs

    const tenantId = params.id;
    const clientPanelUrl = process.env.NEXT_PUBLIC_CLIENT_PANEL_URL || 'http://localhost:3001';

    // Redirect to client panel with tenant ID
    // The client panel should handle the impersonate token
    return NextResponse.redirect(`${clientPanelUrl}/?impersonate=${tenantId}`);
  } catch (error) {
    console.error('Error during impersonate:', error);
    return NextResponse.json(
      { error: 'Failed to impersonate tenant' },
      { status: 500 }
    );
  }
}
