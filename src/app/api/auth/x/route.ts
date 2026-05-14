import { NextRequest, NextResponse } from 'next/server';
import { withExpiryMeta } from '@/lib/tokenUtils';

export async function POST(req: NextRequest) {
  try {
    const { code, codeVerifier, redirectUri, userId } = await req.json();

    // Read client ID from server env — never exposed to client
    const clientId = process.env.X_CLIENT_ID;
    const internalSecret = process.env.INTERNAL_SECRET;
    const dotsuiteUrl = process.env.DOTSUITE_CORE_URL || 'http://localhost:3001';

    if (!code || !codeVerifier || !redirectUri) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!clientId) {
      return NextResponse.json({ error: 'Server misconfiguration: missing X Client ID' }, { status: 500 });
    }

    if (!internalSecret) {
      return NextResponse.json({ error: 'Server misconfiguration: missing internal secret' }, { status: 500 });
    }

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      code_verifier: codeVerifier,
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
      let errorMessage = 'X token exchange failed';
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

    // 🔐 Now sync to dotsuite-core if user is authenticated
    if (userId) {
      try {
        const syncResponse = await fetch(`${dotsuiteUrl}/internal/oauth/save`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Internal-Secret': internalSecret,
            'X-User-Id': userId,
          },
          body: JSON.stringify({
            platform: 'x',
            access_token: data.access_token,
            refresh_token: data.refresh_token || null,
            expires_in: data.expires_in || 7200, // X default: 2 hours
          }),
        });

        if (!syncResponse.ok) {
          const error = await syncResponse.json();
          console.error('[X Auth] Failed to sync to dotsuite-core:', error);
          return NextResponse.json(
            { error: 'Failed to sync credentials. Please try again.' },
            { status: 500 }
          );
        }

        const syncResult = await syncResponse.json();
        console.log('[X Auth] ✅ Token synced to dotsuite-core:', syncResult);
      } catch (syncError) {
        const errorMessage = syncError instanceof Error ? syncError.message : String(syncError);
        console.error('[X Auth] Sync error:', errorMessage);
        return NextResponse.json(
          { error: `Failed to sync credentials to server. ${errorMessage}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(withExpiryMeta(data));
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[X Auth] Token exchange error:', errorMessage);
    return NextResponse.json(
      { error: `Token exchange failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}