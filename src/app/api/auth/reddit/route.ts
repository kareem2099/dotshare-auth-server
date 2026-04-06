import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { code, redirectUri } = await req.json();

    // Read credentials from server env — never exposed to client
    const clientId = process.env.REDDIT_CLIENT_ID;
    const clientSecret = process.env.REDDIT_CLIENT_SECRET;

    if (!code || !redirectUri) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: 'Server misconfiguration: missing Reddit credentials' }, { status: 500 });
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
            errorMessage = errObj.message;
          } else if (errObj.reason && typeof errObj.reason === 'string') {
            errorMessage = errObj.reason;
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

    return NextResponse.json(data);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Reddit Auth] Token exchange error:', errorMessage);
    return NextResponse.json(
      { error: `Token exchange failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}