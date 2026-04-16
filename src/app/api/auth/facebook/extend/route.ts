import { NextRequest, NextResponse } from 'next/server';
import { withFbExpiryMeta } from '@/lib/tokenUtils';

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
      // Handle Facebook API error responses safely
      let errorMessage = 'Facebook token extension failed';
      if (data.error) {
        if (typeof data.error === 'string') {
          errorMessage = data.error;
        } else if (typeof data.error === 'object' && data.error !== null) {
          const errObj = data.error as Record<string, unknown>;
          if (errObj.message && typeof errObj.message === 'string') {
            errorMessage = errObj.message;
          } else {
            errorMessage = JSON.stringify(errObj);
          }
        } else {
          errorMessage = String(data.error);
        }
      }
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status || 400 }
      );
    }

    // Facebook long-lived tokens expire in ~60 days (5_184_000 s).
    // withFbExpiryMeta normalises the raw expires_in (Meta sometimes returns
    // slightly off values), computes expires_at as a Unix timestamp, and sets
    // should_refresh_soon = true when fewer than 7 days remain.
    // The client must persist expires_at and call this endpoint again before
    // the deadline — Meta does NOT issue refresh tokens for long-lived tokens.
    return NextResponse.json(withFbExpiryMeta(data));
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Facebook Extend] Token extension error:', errorMessage);
    return NextResponse.json(
      { error: `Token extension failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}