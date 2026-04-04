import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { accessToken } = await req.json();

    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;

    if (!accessToken) {
      return NextResponse.json({ error: 'Missing access_token' }, { status: 400 });
    }

    if (!appId || !appSecret) {
      return NextResponse.json(
        { error: 'Server misconfiguration: missing Facebook credentials' },
        { status: 500 }
      );
    }

    const params = new URLSearchParams({
      grant_type: 'fb_exchange_token',
      client_id: appId,
      client_secret: appSecret,
      fb_exchange_token: accessToken,
    });

    const response = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?${params.toString()}`,
      { method: 'GET' }
    );

    const data = await response.json();

    if (!response.ok || data.error) {
      return NextResponse.json(
        { error: data.error?.message || 'Facebook token extension failed' },
        { status: response.status || 400 }
      );
    }

    // Facebook returns: access_token, token_type, expires_in (seconds ~5184000 = 60 days)
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}