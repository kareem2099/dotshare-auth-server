import { NextRequest, NextResponse } from 'next/server';
import { withFbExpiryMeta } from '@/lib/tokenUtils';

export async function POST(req: NextRequest) {
  try {
    const { code, redirectUri, userId } = await req.json();

    // Read credentials from server env — never exposed to client
    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;
    const internalSecret = process.env.INTERNAL_SECRET;
    const dotsuiteUrl = process.env.DOTSUITE_CORE_URL || 'http://localhost:3001';

    if (!code || !redirectUri) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!appId || !appSecret) {
      return NextResponse.json({ error: 'Server misconfiguration: missing Facebook credentials' }, { status: 500 });
    }

    if (!internalSecret) {
      return NextResponse.json({ error: 'Server misconfiguration: missing internal secret' }, { status: 500 });
    }

    const params = new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      redirect_uri: redirectUri,
      code,
    });

    const response = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?${params.toString()}`,
      { method: 'GET' }
    );

    const data = await response.json();

    if (!response.ok || data.error) {
      // Handle Facebook API error responses safely
      let errorMessage = 'Facebook token exchange failed';
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
            platform: 'facebook',
            access_token: data.access_token,
            refresh_token: data.refresh_token || null,
            expires_in: data.expires_in || 5184000, // Facebook default: 60 days
          }),
        });

        if (!syncResponse.ok) {
          const error = await syncResponse.json();
          console.error('[Facebook Auth] Failed to sync to dotsuite-core:', error);
          return NextResponse.json(
            { error: 'Failed to sync credentials. Please try again.' },
            { status: 500 }
          );
        }

        const syncResult = await syncResponse.json();
        console.log('[Facebook Auth] ✅ Token synced to dotsuite-core:', syncResult);
      } catch (syncError) {
        const errorMessage = syncError instanceof Error ? syncError.message : String(syncError);
        console.error('[Facebook Auth] Sync error:', errorMessage);
        return NextResponse.json(
          { error: `Failed to sync credentials to server. ${errorMessage}` },
          { status: 500 }
        );
      }
    }

    // Enrich with normalised expiry metadata so the client can schedule
    // the long-lived token exchange before this short-lived token expires.
    return NextResponse.json(withFbExpiryMeta(data));
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Facebook Auth] Token exchange error:', errorMessage);
    return NextResponse.json(
      { error: `Token exchange failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}