import { NextRequest, NextResponse } from 'next/server';
import { withExpiryMeta } from '@/lib/tokenUtils';

export async function POST(req: NextRequest) {
  return NextResponse.json({ error: 'Due to Vercel leaks, we are waiting until they restore access. Sorry for the delay. You can use your own credentials to connect.' }, { status: 503 });

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
      // Handle Reddit API error responses safely
      let errorMessage = 'Reddit token refresh failed';
      if (data.error) {
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
        { status: response.status || 400 }
      );
    }

    return NextResponse.json(withExpiryMeta(data));
  } catch (error: unknown) {
    const errorMessage = (error as Error)?.message || String(error);
    console.error('[Reddit Refresh] Token refresh error:', errorMessage);
    return NextResponse.json(
      { error: `Token refresh failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}