import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tenantId } = await params;
    const clientPanelUrl = process.env.NEXT_PUBLIC_CLIENT_PANEL_URL || 'http://localhost:3001';

    return NextResponse.redirect(`${clientPanelUrl}/?impersonate=${tenantId}`);
  } catch (error) {
    console.error('Error during impersonate:', error);
    return NextResponse.json(
      { error: 'Failed to impersonate tenant' },
      { status: 500 }
    );
  }
}