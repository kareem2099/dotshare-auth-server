import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { refreshToken } = await req.json();

    const clientId = process.env.REDDIT_CLIENT_ID;
    const clientSecret = process.env.REDDIT_CLIENT_SECRET;

    if (!refreshToken) {
      return NextResponse.json({ error: 'Missing refresh_token' }, { status: 400 });
    }

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'Server misconfiguration: missing Reddit credentials' },
        { status: 500 }
      );
    }

    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });

    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${basicAuth}`,
        'User-Agent': 'DotShare/1.0',
      },
      body: params.toString(),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      return NextResponse.json(
        { error: data.error || 'Reddit token refresh failed' },
        { status: response.status || 400 }
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}