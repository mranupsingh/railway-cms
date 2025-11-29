import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from './app/(public)/(auth)/actions';
import { AUTH_TOKEN } from './lib/constants';
import { ROUTE, routes, toRoute } from './lib/routes';
import { extractFirstPart } from './lib/utils';

async function validateToken(token: string): Promise<boolean> {

    // return !!token; // Temporary: consider any non-empty token as valid

    try {
        const payload = await decrypt(token)
        return !!payload;
    } catch (error) {
        return false;
    }
}

export async function middleware(request: NextRequest) {
    const authTokenCookie = request.cookies.get(AUTH_TOKEN);
    const authToken = authTokenCookie?.value;

    let isValidToken = false;

    if (authToken) {
        isValidToken = await validateToken(authToken);

        // If token is invalid, delete the cookie
        if (!isValidToken) {
            const response = NextResponse.redirect(new URL(ROUTE.HOME, request.nextUrl.origin));
            response.cookies.delete(AUTH_TOKEN);
            return response;
        }
    }

    const firstSegment = `/${extractFirstPart(request.nextUrl.pathname)}`;
    const route = toRoute(firstSegment);

    // Protected route but no valid token → redirect to home
    if (!isValidToken && route && routes.protected.includes(route)) {
        const absoluteURL = new URL(ROUTE.LOGIN, request.nextUrl.origin);
        return NextResponse.redirect(absoluteURL.toString());
    }

    // Public route but user is logged in → redirect to dashboard
    if (isValidToken && route && routes.public.includes(route)) {
        const absoluteURL = new URL(ROUTE.DASHBOARD, request.nextUrl.origin);
        return NextResponse.redirect(absoluteURL.toString());
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/',
        '/login',

        '/dashboard',
        '/master-record',
        '/history-record',
    ],
};