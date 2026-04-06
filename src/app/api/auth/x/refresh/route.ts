import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { refreshToken } = await req.json();

    const clientId = process.env.X_CLIENT_ID;

    if (!refreshToken) {
      return NextResponse.json({ error: 'Missing refresh_token' }, { status: 400 });
    }

    if (!clientId) {
      return NextResponse.json(
        { error: 'Server misconfiguration: missing X Client ID' },
        { status: 500 }
      );
    }

    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
    });

    // X public client — Basic Auth with clientId only (no secret)
    const basicAuth = Buffer.from(`${clientId}:`).toString('base64');

    const response = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${basicAuth}`,
      },
      body: params.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle X API error responses safely
      let errorMessage = 'X token refresh failed';
      if (data?.error_description && typeof data.error_description === 'string') {
        errorMessage = data.error_description;
      } else if (data?.error) {
        if (typeof data.error === 'string') {
          errorMessage = data.error;
        } else if (typeof data.error === 'object') {
          errorMessage = JSON.stringify(data.error);
        } else {
          errorMessage = String(data.error);
        }
      }
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[X Refresh] Token refresh error:', errorMessage);
    return NextResponse.json(
      { error: `Token refresh failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}