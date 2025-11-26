'use server'

import { AUTH_TOKEN } from "@/lib/constants";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

export async function encrypt(payload: any): Promise<any> {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
        .setIssuedAt()
        .setExpirationTime('1 day from now')
        .sign(new TextEncoder().encode(process.env.JWT_SECRET));
}

export async function decrypt(token: string): Promise<any> {
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
        return false;
    }

    const secret = new TextEncoder().encode(secretKey);
    const { payload } = await jwtVerify(token, secret);

    return payload;
}

export async function getAuthToken(): Promise<string | null> {
    try {
        return cookies().get(AUTH_TOKEN)?.value ?? null
    } catch (error) {
        return null
    }
}