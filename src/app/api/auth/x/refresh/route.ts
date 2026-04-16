import { NextRequest, NextResponse } from 'next/server';
import { withExpiryMeta } from '@/lib/tokenUtils';

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

    // ── X uses rotating refresh tokens ────────────────────────────────────
    // The OLD refresh_token is burned the moment this request hits Twitter's
    // servers.  If the network drops before the client receives the response,
    // the user must re-authenticate.  We surface a clear warning so the client
    // can handle this edge case rather than silently losing access.
    if (!data.refresh_token) {
      console.error(
        '[X Refresh] CRITICAL: No refresh_token in response — rotating token was consumed but not returned. User must re-authenticate.'
      );
      return NextResponse.json(
        {
          ...withExpiryMeta(data),
          warning: 'refresh_token_missing_reauth_required',
        },
        { status: 200 } // access_token may still be valid; let client decide
      );
    }

    // X access tokens last 2 hours (7200 s); refresh tokens don't expire
    // on their own but are single-use.  withExpiryMeta normalises expires_in
    // and adds expires_at so the client can refresh proactively.
    return NextResponse.json(withExpiryMeta(data));
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[X Refresh] Token refresh error:', errorMessage);
    return NextResponse.json(
      { error: `Token refresh failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}