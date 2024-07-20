import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const headers = new Headers(request.headers);
    headers.set('Content-Type', 'application/json');
    return NextResponse.rewrite(
        `${process.env.NEXT_PUBLIC_API_PATH}/${request.nextUrl.pathname}${
            request.nextUrl.search ? `?${request.nextUrl.search}` : ''
        }`,
        { request: { headers } },
    );
}

export const config = {
    matcher: '/api/:path*',
};
