import { NextRequest, NextResponse } from 'next/server';
import { withExpiryMeta } from '@/lib/tokenUtils';

export async function POST(req: NextRequest) {
  // 🛑 Kill switch — disabled until Vercel resolves Reddit auth leaks
  const isRedditDisabled = true;

  if (isRedditDisabled) {
    return NextResponse.json(
      { error: 'Due to Vercel leaks, we are waiting until they restore access. Sorry for the delay. You can use your own credentials to connect.' },
      { status: 503 }
    );
  }

  try {
    const { code, redirectUri, userId } = await req.json();

    // Read credentials from server env — never exposed to client
    const clientId = process.env.REDDIT_CLIENT_ID;
    const clientSecret = process.env.REDDIT_CLIENT_SECRET;
    const internalSecret = process.env.INTERNAL_SECRET;
    const dotsuiteUrl = process.env.DOTSUITE_CORE_URL || 'http://localhost:3001';

    if (!code || !redirectUri) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: 'Server misconfiguration: missing Reddit credentials' }, { status: 500 });
    }

    if (!internalSecret) {
      return NextResponse.json({ error: 'Server misconfiguration: missing internal secret' }, { status: 500 });
    }

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    });

    // Reddit uses Basic Auth
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
      // Handle both string errors and error objects
      let errorMessage = 'Reddit token exchange failed';
      if (data.error) {
        if (typeof data.error === 'string') {
          errorMessage = data.error;
        } else if (typeof data.error === 'object' && data.error !== null) {
          const errObj = data.error as Record<string, unknown>;
          if (errObj.message && typeof errObj.message === 'string') {
            errorMessage = errObj.message as string;
          } else if (errObj.reason && typeof errObj.reason === 'string') {
            errorMessage = errObj.reason as string;
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
            'X-Internal-Secret': internalSecret as string,
            'X-User-Id': String(userId),
          } as HeadersInit,
          body: JSON.stringify({
            platform: 'reddit',
            access_token: data.access_token,
            refresh_token: data.refresh_token || null,
            expires_in: data.expires_in || 3600, // Reddit default: 1 hour
          }),
        });

        if (!syncResponse.ok) {
          const error = await syncResponse.json();
          console.error('[Reddit Auth] Failed to sync to dotsuite-core:', error);
          return NextResponse.json(
            { error: 'Failed to sync credentials. Please try again.' },
            { status: 500 }
          );
        }

        const syncResult = await syncResponse.json();
        console.log('[Reddit Auth] ✅ Token synced to dotsuite-core:', syncResult);
      } catch (syncError: unknown) {
        const errorMessage = syncError instanceof Error ? syncError.message : String(syncError);
        console.error('[Reddit Auth] Sync error:', errorMessage);
        return NextResponse.json(
          { error: `Failed to sync credentials to server. ${errorMessage}` },
          { status: 500 }
        );
      }
    }

    // Reddit tokens expire in 1 hour when duration=temporary (the default).
    // If the auth flow used duration=permanent, a refresh_token is included;
    // withExpiryMeta normalises expires_in and adds expires_at either way.
    return NextResponse.json(withExpiryMeta(data));
  } catch (error: unknown) {
    const errorMessage = (error as Error)?.message || String(error);
    console.error('[Reddit Auth] Token exchange error:', errorMessage);
    return NextResponse.json(
      { error: `Token exchange failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}