import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const headers = new Headers(request.headers);
    headers.set('Content-Type', 'application/json');
    const path = request.nextUrl.pathname.replace(/\/$/, '');
    return NextResponse.rewrite(
        `${process.env.NEXT_PUBLIC_API_PATH}${path}${request.nextUrl.search ? `?${request.nextUrl.search}` : ''
        }`,
        { request: { headers } },
    );
}

export const config = {
    matcher: ['/api/:path*', '/media/:path*'],
};
