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
      return NextResponse.json(
        { error: data.error_description || data.error || 'X token refresh failed' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}