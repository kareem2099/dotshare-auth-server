import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { code, redirectUri } = await req.json();

    // Read credentials from server env — never exposed to client
    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;

    if (!code || !redirectUri) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!appId || !appSecret) {
      return NextResponse.json({ error: 'Server misconfiguration: missing Facebook credentials' }, { status: 500 });
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

    return NextResponse.json(data);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Facebook Auth] Token exchange error:', errorMessage);
    return NextResponse.json(
      { error: `Token exchange failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}