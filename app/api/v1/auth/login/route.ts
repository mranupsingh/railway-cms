import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt, { SignOptions } from 'jsonwebtoken'
import prisma from '@/lib/db/prisma'
import { z } from 'zod'

const loginSchema = z.object({
    email: z.string(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
})

export async function POST(request: NextRequest) {
    try {
        // Parse and validate request body
        const body = await request.json()
        const validationResult = loginSchema.safeParse(body)

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Validation failed',
                    details: validationResult.error.flatten().fieldErrors,
                },
                { status: 400 }
            )
        }

        const { email, password } = validationResult.data

        // Find user by email
        const user = await prisma.users.findUnique({
            where: { email },
        })

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid email or password',
                },
                { status: 401 }
            )
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid email or password',
                },
                { status: 401 }
            )
        }

        // Generate JWT token
        const jwtSecret = process.env.JWT_SECRET
        if (!jwtSecret) {
            throw new Error('JWT_SECRET is not defined')
        }

        const token = jwt.sign(
            {
                userId: user.id,
                loginId: user.login_id,
                email: user.email,
            },
            jwtSecret,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || '7d',
            } as SignOptions
        )

        // Return success response
        return NextResponse.json(
            {
                success: true,
                data: {
                    access_token: token,
                    user: {
                        id: user.id,
                        loginId: user.login_id,
                        username: user.username,
                        email: user.email,
                    },
                },
            },
            { status: 200 }
        )
    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error',
            },
            { status: 500 }
        )
    }
}
