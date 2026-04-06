import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { ipAddress } from '@vercel/functions/headers';

// Use Vercel KV's REDIS_URL instead of standard Upstash env vars
const redis = new Redis({
  url: process.env.REDIS_URL || '',
  token: process.env.REDIS_URL || '',
});

const authInitLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    analytics: true,
    prefix: 'rl:auth_init',
});

const tokenExchangeLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    analytics: true,
    prefix: 'rl:token_exchange',
});

const tokenRefreshLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    analytics: true,
    prefix: 'rl:token_refresh',
});

function getLimiter(pathname: string) {
    if (/^\/api\/auth\/[^/]+(\/refresh|\/extend)$/.test(pathname)) {
        return tokenRefreshLimiter;
    }
    if (/^\/api\/auth\/[^/]+$/.test(pathname)) {
        return tokenExchangeLimiter;
    }
    if (/^\/auth\/[^/]+$/.test(pathname)) {
        return authInitLimiter;
    }
    return null;
}

export async function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const limiter = getLimiter(pathname);

    if (!limiter) return NextResponse.next();

    const ip =
        ipAddress(request) ??
        request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
        '127.0.0.1';

    const { success, limit, remaining, reset } = await limiter.limit(ip);

    if (!success) {
        if (pathname.startsWith('/auth/')) {
            const url = request.nextUrl.clone();
            url.pathname = '/';
            url.searchParams.set('error', 'Too many requests. Please try again later.');
            return NextResponse.redirect(url);
        }

        return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            {
                status: 429,
                headers: {
                    'X-RateLimit-Limit':     String(limit),
                    'X-RateLimit-Remaining': String(remaining),
                    'X-RateLimit-Reset':     String(reset),
                    'Retry-After':           String(Math.ceil((reset - Date.now()) / 1000)),
                },
            }
        );
    }

    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit',     String(limit));
    response.headers.set('X-RateLimit-Remaining', String(remaining));
    response.headers.set('X-RateLimit-Reset',      String(reset));
    return response;
}

export const config = {
    matcher: [
        '/auth/:path*',
        '/api/auth/:path*',
    ],
};